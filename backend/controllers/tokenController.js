const { Tokens, Services, Counters } = require('../database/store');
const estimationEngine = require('../services/estimationEngine');

module.exports = (io) => {
  return {
    // Get all tokens with optional filters
    getTokens: async (req, res) => {
      try {
        const { department, status, serviceId } = req.query;
        const filter = {};
        if (department) filter.department = department;
        if (status) filter.status = status;
        if (serviceId) filter.serviceId = serviceId;

        const tokens = await Tokens.find(filter);
        return res.json({ success: true, count: tokens.length, data: tokens });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    },

    // Search token by ID or Token Number
    getTokenByIdOrNumber: async (req, res) => {
      try {
        const query = req.params.identifier.toUpperCase().trim();
        const tokens = await Tokens.find({});
        const token = tokens.find(t => 
          t.id === req.params.identifier || 
          t.tokenNumber.toUpperCase() === query
        );

        if (!token) {
          return res.status(404).json({ success: false, message: 'Token not found' });
        }

        // Calculate queue position if WAITING
        let queuePosition = null;
        if (token.status === 'WAITING') {
          const waitingInService = tokens.filter(t => 
            t.department === token.department && 
            t.serviceId === token.serviceId && 
            t.status === 'WAITING'
          );
          queuePosition = waitingInService.findIndex(t => t.id === token.id) + 1;
        }

        return res.json({ 
          success: true, 
          data: { ...token, queuePosition } 
        });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    },

    // Generate new token (Kiosk or Web Portal)
    createToken: async (req, res) => {
      try {
        const { 
          serviceId, 
          customerName, 
          customerPhone, 
          priority = 'REGULAR',
          notes = '' 
        } = req.body;

        const service = await Services.findById(serviceId);
        if (!service) {
          return res.status(404).json({ success: false, message: 'Service not found' });
        }

        // Determine priority score
        let priorityScore = 0;
        if (priority === 'EMERGENCY') priorityScore = 100;
        else if (priority === 'SENIOR_DISABILITY') priorityScore = 50;
        else if (priority === 'VIP') priorityScore = 40;

        // Generate token sequence number (e.g. MED-A101)
        const allTokens = await Tokens.find({});
        const serviceTokensToday = allTokens.filter(t => t.serviceId === serviceId);
        const sequence = (serviceTokensToday.length + 1).toString().padStart(3, '0');
        const tokenNumber = `${service.codePrefix}-${sequence}`;
        const tokenId = 'tok_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

        const newToken = {
          id: tokenId,
          tokenNumber,
          serviceId: service.id,
          serviceName: service.name,
          department: service.department,
          customerName: customerName || `Visitor #${sequence}`,
          customerPhone: customerPhone || '',
          priority,
          priorityScore,
          status: 'WAITING',
          counterId: null,
          counterNumber: null,
          officerName: null,
          createdAt: new Date(),
          staticEstimatedWaitTimeMinutes: 10,
          dynamicEstimatedWaitTimeMinutes: 10,
          estimatedCallTime: new Date(Date.now() + 10 * 60000),
          expectedDurationMinutes: service.currentDynamicDuration || service.baseDurationMinutes || 10,
          notes
        };

        await Tokens.create(newToken);

        // Run dynamic schedule recalculation
        await estimationEngine.recalculateSchedule(service.department);

        const freshlyUpdated = await Tokens.findById(tokenId);

        // Socket emit to all screens
        if (io) {
          io.emit('TOKEN_CREATED', freshlyUpdated || newToken);
          io.emit('SCHEDULE_UPDATED', { department: service.department });
        }

        return res.status(201).json({ success: true, data: freshlyUpdated || newToken });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    },

    // Counter Officer calls the next token
    callNextToken: async (req, res) => {
      try {
        const { counterId, specificTokenId } = req.body;
        const counter = await Counters.findById(counterId);

        if (!counter) {
          return res.status(404).json({ success: false, message: 'Counter not found' });
        }

        let targetToken = null;

        if (specificTokenId) {
          targetToken = await Tokens.findById(specificTokenId);
        } else {
          // Find next waiting token that matches this counter's capabilities
          const waitingTokens = await Tokens.find({
            department: counter.department,
            status: 'WAITING'
          });

          // Filter by counter's supported services if specified
          const eligibleTokens = waitingTokens.filter(t => 
            !counter.supportedServiceIds || 
            counter.supportedServiceIds.length === 0 || 
            counter.supportedServiceIds.includes(t.serviceId)
          );

          if (eligibleTokens.length > 0) {
            targetToken = eligibleTokens[0];
          }
        }

        if (!targetToken) {
          return res.status(400).json({ success: false, message: 'No waiting tokens in queue for this counter' });
        }

        const now = new Date();
        await Tokens.updateOne(
          { id: targetToken.id },
          {
            status: 'CALLED',
            counterId: counter.id,
            counterNumber: counter.counterNumber,
            officerName: counter.officerName,
            calledAt: now
          }
        );

        await Counters.updateOne(
          { id: counter.id },
          {
            status: 'BUSY',
            currentTokenId: targetToken.id,
            serviceStartedAt: now
          }
        );

        const updatedToken = await Tokens.findById(targetToken.id);

        // Recalculate remaining wait times
        await estimationEngine.recalculateSchedule(counter.department);

        // Broadcast to TV Screen & Customer tracker
        if (io) {
          io.emit('TOKEN_CALLED', {
            token: updatedToken,
            counter: counter
          });
          io.emit('SCHEDULE_UPDATED', { department: counter.department });
        }

        return res.json({ success: true, data: updatedToken });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    },

    // Officer starts the service timer
    startService: async (req, res) => {
      try {
        const { tokenId } = req.body;
        const token = await Tokens.findById(tokenId);
        if (!token) return res.status(404).json({ success: false, message: 'Token not found' });

        const now = new Date();
        await Tokens.updateOne(
          { id: tokenId },
          {
            status: 'IN_PROGRESS',
            serviceStartedAt: now
          }
        );

        if (token.counterId) {
          await Counters.updateOne(
            { id: token.counterId },
            { serviceStartedAt: now }
          );
        }

        const updated = await Tokens.findById(tokenId);
        if (io) {
          io.emit('SERVICE_STARTED', updated);
          io.emit('SCHEDULE_UPDATED', { department: token.department });
        }

        return res.json({ success: true, data: updated });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    },

    // Officer completes the service (records actual time & recalibrates algorithm)
    completeService: async (req, res) => {
      try {
        const { tokenId, notes = '', customDurationMinutes } = req.body;
        const token = await Tokens.findById(tokenId);
        if (!token) return res.status(404).json({ success: false, message: 'Token not found' });

        const now = new Date();
        const startTime = token.serviceStartedAt ? new Date(token.serviceStartedAt) : (token.calledAt ? new Date(token.calledAt) : new Date(now.getTime() - 8 * 60000));
        
        let actualMinutes = customDurationMinutes 
          ? Number(customDurationMinutes) 
          : Math.max(1, Math.round(((now - startTime) / 60000) * 10) / 10);

        if (actualMinutes < 1) actualMinutes = 1;

        const expected = token.expectedDurationMinutes || 10;
        const variance = Math.round((actualMinutes - expected) * 10) / 10;

        await Tokens.updateOne(
          { id: tokenId },
          {
            status: 'COMPLETED',
            serviceCompletedAt: now,
            actualDurationMinutes: actualMinutes,
            delayVarianceMinutes: variance,
            notes: notes || token.notes
          }
        );

        // Free up counter
        if (token.counterId) {
          await Counters.updateOne(
            { id: token.counterId },
            {
              status: 'ACTIVE',
              currentTokenId: null,
              serviceStartedAt: null
            }
          );
        }

        // Dynamically feed into estimation engine to adjust future ETAs!
        await estimationEngine.recordServiceCompletion(token, actualMinutes);

        const completedToken = await Tokens.findById(tokenId);

        if (io) {
          io.emit('SERVICE_COMPLETED', {
            token: completedToken,
            actualMinutes,
            variance
          });
          io.emit('SCHEDULE_UPDATED', { department: token.department });
        }

        return res.json({ 
          success: true, 
          data: completedToken,
          message: `Service completed in ${actualMinutes}m (Variance: ${variance >= 0 ? '+' : ''}${variance}m). Dynamic algorithm recalibrated.` 
        });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    },

    // Mark No-Show or Skip
    markNoShow: async (req, res) => {
      try {
        const { tokenId } = req.body;
        const token = await Tokens.findById(tokenId);
        if (!token) return res.status(404).json({ success: false, message: 'Token not found' });

        await Tokens.updateOne(
          { id: tokenId },
          {
            status: 'NO_SHOW',
            serviceCompletedAt: new Date(),
            notes: (token.notes ? token.notes + ' | ' : '') + 'Marked No-Show by Officer'
          }
        );

        if (token.counterId) {
          await Counters.updateOne(
            { id: token.counterId },
            {
              status: 'ACTIVE',
              currentTokenId: null,
              serviceStartedAt: null
            }
          );
        }

        await estimationEngine.recalculateSchedule(token.department);

        if (io) {
          io.emit('TOKEN_NO_SHOW', { tokenId });
          io.emit('SCHEDULE_UPDATED', { department: token.department });
        }

        return res.json({ success: true, message: 'Token marked as No-Show' });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    },

    // Trigger full dynamic recalculation on demand
    recalculateAll: async (req, res) => {
      try {
        const { department } = req.query;
        const updated = await estimationEngine.recalculateSchedule(department);
        if (io) {
          io.emit('SCHEDULE_UPDATED', { department });
        }
        return res.json({ success: true, count: updated.length, data: updated });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }
  };
};
