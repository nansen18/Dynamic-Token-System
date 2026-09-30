const { Counters } = require('../database/store');
const estimationEngine = require('../services/estimationEngine');

module.exports = (io) => {
  return {
    getCounters: async (req, res) => {
      try {
        const { department } = req.query;
        const filter = department ? { department } : {};
        const counters = await Counters.find(filter);
        return res.json({ success: true, count: counters.length, data: counters });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    },

    updateCounterStatus: async (req, res) => {
      try {
        const { counterId } = req.params;
        const { status, throughputMultiplier } = req.body;

        const counter = await Counters.findById(counterId);
        if (!counter) {
          return res.status(404).json({ success: false, message: 'Counter not found' });
        }

        const updates = {};
        if (status) updates.status = status;
        if (throughputMultiplier !== undefined) updates.throughputMultiplier = Number(throughputMultiplier);

        await Counters.updateOne({ id: counterId }, updates);

        // Capacity changed! Recalculate all wait times dynamically
        await estimationEngine.recalculateSchedule(counter.department);

        const updated = await Counters.findById(counterId);

        if (io) {
          io.emit('COUNTER_STATUS_CHANGED', updated);
          io.emit('SCHEDULE_UPDATED', { department: counter.department });
        }

        return res.json({ 
          success: true, 
          data: updated,
          message: `Counter ${counter.counterNumber} status set to ${status}. Wait times recalculated.`
        });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }
  };
};
