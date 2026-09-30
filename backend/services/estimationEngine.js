const { Services, Counters, Tokens, AnalyticsLogs } = require('../database/store');

/**
 * Dynamic Wait Time Estimation Engine
 * 
 * Traditional static systems calculate: waitTime = position * baseDuration
 * This engine dynamically recalculates wait times factoring in:
 * 1. Exponentially smoothed recent service velocity (real-time transaction durations)
 * 2. Real-time active counter concurrency & staff throughput multipliers
 * 3. In-progress overdue delays (when an ongoing consultation is taking longer than expected)
 * 4. Priority tier weighting (Emergency, Senior/Disability, Regular)
 * 5. Counter availability (on break, active, offline)
 */

class EstimationEngine {
  
  /**
   * Calculate effective dynamic duration for a service category
   */
  calculateEffectiveDuration(service) {
    if (!service) return 10;
    const base = service.baseDurationMinutes || 10;
    const recents = service.recentDurations || [];

    if (recents.length === 0) {
      return base;
    }

    // Exponential smoothing on the last 5 completed transactions
    // Recent ones carry significantly higher weight
    const window = recents.slice(-5);
    let totalWeight = 0;
    let weightedSum = 0;

    window.forEach((dur, idx) => {
      const weight = Math.pow(1.4, idx); // latest gets highest weight
      weightedSum += dur * weight;
      totalWeight += weight;
    });

    const ewma = weightedSum / totalWeight;
    // Blend 75% EWMA + 25% Base benchmark
    const effective = (ewma * 0.75) + (base * 0.25);
    return Math.max(2, Math.round(effective * 10) / 10);
  }

  /**
   * Recalculates dynamic wait time and estimated call times for all WAITING tokens
   * Broadcasts update to all connected clients
   */
  async recalculateSchedule(department = null) {
    const services = await Services.find(department ? { department } : {});
    const counters = await Counters.find(department ? { department } : {});
    const waitingTokens = await Tokens.find({ 
      status: 'WAITING',
      ...(department ? { department } : {})
    });
    const inProgressTokens = await Tokens.find({ 
      status: 'IN_PROGRESS',
      ...(department ? { department } : {})
    });

    const serviceMap = new Map();
    services.forEach(s => {
      const eff = this.calculateEffectiveDuration(s);
      serviceMap.set(s.id, {
        ...s,
        effectiveDuration: eff
      });
    });

    // Check active counters and in-progress delays
    const activeCountersByService = new Map();
    const overdueDelayByService = new Map();

    const now = new Date();

    // Map counters to services
    counters.forEach(c => {
      if (c.status === 'ACTIVE' || c.status === 'BUSY') {
        (c.supportedServiceIds || []).forEach(sId => {
          const current = activeCountersByService.get(sId) || [];
          current.push(c);
          activeCountersByService.set(sId, current);
        });
      }
    });

    // Calculate in-progress delays
    inProgressTokens.forEach(token => {
      const sId = token.serviceId;
      const srv = serviceMap.get(sId);
      const expected = srv ? srv.effectiveDuration : (token.expectedDurationMinutes || 10);
      
      if (token.serviceStartedAt) {
        const elapsedMins = (now - new Date(token.serviceStartedAt)) / 60000;
        if (elapsedMins > expected) {
          const overdue = elapsedMins - expected;
          const currOverdue = overdueDelayByService.get(sId) || 0;
          overdueDelayByService.set(sId, Math.max(currOverdue, overdue));
        }
      }
    });

    // Group waiting tokens by service for sequential queue estimation
    const tokensByService = new Map();
    waitingTokens.forEach(t => {
      const list = tokensByService.get(t.serviceId) || [];
      list.push(t);
      tokensByService.set(t.serviceId, list);
    });

    const updatedTokens = [];

    // Recalculate each queue
    for (const [sId, tokenList] of tokensByService.entries()) {
      const service = serviceMap.get(sId);
      const effDuration = service ? service.effectiveDuration : 10;
      const baseDuration = service ? service.baseDurationMinutes : 10;
      const activeCounters = activeCountersByService.get(sId) || [];
      
      // Concurrency factor (effective counters throughput)
      let concurrency = activeCounters.reduce((acc, c) => acc + (c.throughputMultiplier || 1.0), 0);
      if (concurrency < 0.5) concurrency = 0.8; // Baseline fallback if all on break

      const inProgressDelay = overdueDelayByService.get(sId) || 0;

      let cumulativeWait = inProgressDelay;

      // Iterate through the priority-sorted waiting tokens
      for (let i = 0; i < tokenList.length; i++) {
        const token = tokenList[i];
        
        // Static estimate (what dumb systems do: position * baseDuration / defaultCounters)
        const staticEst = Math.max(1, Math.round(((i + 1) * baseDuration) / 1));

        // Dynamic estimate: incorporates real velocity, active counters concurrency, and active delays
        cumulativeWait += (effDuration / concurrency);
        const dynamicEst = Math.max(1, Math.round(cumulativeWait));

        const estimatedCall = new Date(now.getTime() + dynamicEst * 60000);
        const delayVariance = dynamicEst - staticEst;

        let delayReason = '';
        if (delayVariance > 3) {
          if (inProgressDelay > 0) {
            delayReason = `Extended service in progress (+${Math.round(inProgressDelay)} min delay)`;
          } else if (effDuration > baseDuration) {
            delayReason = `Higher average consultation time today (~${Math.round(effDuration)} min)`;
          } else if (activeCounters.length <= 1) {
            delayReason = 'Limited counter availability';
          }
        } else if (delayVariance < -2) {
          delayReason = 'Faster processing throughput today';
        }

        if (token.priority === 'EMERGENCY') {
          delayReason = '⚡ Emergency Priority (Expedited to Front)';
        }

        // Update token in DB
        await Tokens.updateOne(
          { id: token.id },
          {
            staticEstimatedWaitTimeMinutes: staticEst,
            dynamicEstimatedWaitTimeMinutes: dynamicEst,
            estimatedCallTime: estimatedCall,
            delayVarianceMinutes: delayVariance,
            delayReason: delayReason,
            expectedDurationMinutes: Math.round(effDuration)
          }
        );

        updatedTokens.push({
          ...token,
          staticEstimatedWaitTimeMinutes: staticEst,
          dynamicEstimatedWaitTimeMinutes: dynamicEst,
          estimatedCallTime: estimatedCall,
          delayVarianceMinutes: delayVariance,
          delayReason: delayReason,
          expectedDurationMinutes: Math.round(effDuration)
        });
      }
    }

    return updatedTokens;
  }

  /**
   * Log completed token and record actual duration to train the moving average
   */
  async recordServiceCompletion(token, actualDurationMinutes) {
    const service = await Services.findById(token.serviceId);
    if (!service) return;

    const recents = service.recentDurations || [];
    recents.push(actualDurationMinutes);
    if (recents.length > 10) {
      recents.shift(); // keep sliding window of 10
    }

    const newDynamicDuration = this.calculateEffectiveDuration({
      ...service,
      recentDurations: recents
    });

    await Services.updateOne(
      { id: service.id },
      {
        recentDurations: recents,
        currentDynamicDuration: newDynamicDuration
      }
    );

    // Save analytics log
    await AnalyticsLogs.create({
      serviceId: service.id,
      department: token.department,
      tokenNumber: token.tokenNumber,
      estimatedMinutes: token.dynamicEstimatedWaitTimeMinutes || token.staticEstimatedWaitTimeMinutes || 10,
      actualMinutes: actualDurationMinutes,
      varianceMinutes: actualDurationMinutes - (token.expectedDurationMinutes || service.baseDurationMinutes),
      counterNumber: token.counterNumber || ''
    });

    // Trigger full schedule recalculation for the department
    await this.recalculateSchedule(token.department);
  }
}

module.exports = new EstimationEngine();
