const { Tokens, Services, Counters, AnalyticsLogs, setMemoryStore } = require('../database/store');
const { getSeedData } = require('../seed/seedData');
const estimationEngine = require('../services/estimationEngine');

module.exports = (io) => {
  return {
    getDashboardStats: async (req, res) => {
      try {
        const { department } = req.query;
        const filter = department ? { department } : {};

        const allTokens = await Tokens.find(filter);
        const allServices = await Services.find(filter);
        const allCounters = await Counters.find(filter);
        const logs = await AnalyticsLogs.find(filter);

        const waiting = allTokens.filter(t => t.status === 'WAITING');
        const inProgress = allTokens.filter(t => t.status === 'IN_PROGRESS');
        const completed = allTokens.filter(t => t.status === 'COMPLETED');
        const called = allTokens.filter(t => t.status === 'CALLED');

        // Calculate average wait time (dynamic vs static)
        let totalDynamicWait = 0;
        let totalStaticWait = 0;
        waiting.forEach(t => {
          totalDynamicWait += t.dynamicEstimatedWaitTimeMinutes || 0;
          totalStaticWait += t.staticEstimatedWaitTimeMinutes || 0;
        });

        const avgDynamicWait = waiting.length > 0 ? Math.round((totalDynamicWait / waiting.length) * 10) / 10 : 0;
        const avgStaticWait = waiting.length > 0 ? Math.round((totalStaticWait / waiting.length) * 10) / 10 : 0;

        // Actual completed average service duration
        let totalActualDuration = 0;
        completed.forEach(t => {
          totalActualDuration += t.actualDurationMinutes || 10;
        });
        const avgActualServiceDuration = completed.length > 0 
          ? Math.round((totalActualDuration / completed.length) * 10) / 10 
          : 0;

        // Estimation accuracy variance: |actual - estimated|
        let totalVariance = 0;
        logs.forEach(l => {
          totalVariance += Math.abs(l.varianceMinutes || 0);
        });
        const avgVariance = logs.length > 0 ? Math.round((totalVariance / logs.length) * 10) / 10 : 1.2;

        return res.json({
          success: true,
          stats: {
            totalTokensToday: allTokens.length,
            waitingCount: waiting.length,
            inProgressCount: inProgress.length,
            calledCount: called.length,
            completedCount: completed.length,
            avgDynamicWaitMinutes: avgDynamicWait,
            avgStaticWaitMinutes: avgStaticWait,
            avgActualServiceDurationMinutes: avgActualServiceDuration,
            accuracyDriftMinutes: avgVariance,
            activeCountersCount: allCounters.filter(c => c.status === 'ACTIVE' || c.status === 'BUSY').length,
            totalCountersCount: allCounters.length
          },
          services: allServices,
          counters: allCounters,
          recentLogs: logs.slice(-15).reverse()
        });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    },

    // 1-Click Seed / Reset data to immediately experience real dynamic adaptation
    seedData: async (req, res) => {
      try {
        const seedPayload = getSeedData();
        setMemoryStore(seedPayload);
        
        // Recalculate schedule
        await estimationEngine.recalculateSchedule();

        if (io) {
          io.emit('DATA_RESET', { message: 'Database reset with rich simulation data' });
          io.emit('SCHEDULE_UPDATED', {});
        }

        return res.json({ 
          success: true, 
          message: 'Seed data successfully loaded with realistic hospital, banking, and government office tokens!' 
        });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }
  };
};
