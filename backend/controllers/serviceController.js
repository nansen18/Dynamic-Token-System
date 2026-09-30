const { Services } = require('../database/store');
const estimationEngine = require('../services/estimationEngine');

module.exports = (io) => {
  return {
    getServices: async (req, res) => {
      try {
        const { department } = req.query;
        const filter = department ? { department } : {};
        const services = await Services.find(filter);
        return res.json({ success: true, count: services.length, data: services });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    },

    updateServiceBenchmark: async (req, res) => {
      try {
        const { serviceId } = req.params;
        const { baseDurationMinutes } = req.body;

        const service = await Services.findById(serviceId);
        if (!service) {
          return res.status(404).json({ success: false, message: 'Service not found' });
        }

        const base = Number(baseDurationMinutes) || 10;
        await Services.updateOne(
          { id: serviceId },
          { baseDurationMinutes: base }
        );

        await estimationEngine.recalculateSchedule(service.department);

        const updated = await Services.findById(serviceId);
        if (io) {
          io.emit('SERVICE_UPDATED', updated);
          io.emit('SCHEDULE_UPDATED', { department: service.department });
        }

        return res.json({ success: true, data: updated });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }
  };
};
