const express = require('express');

module.exports = (io) => {
  const router = express.Router();

  const tokenController = require('../controllers/tokenController')(io);
  const counterController = require('../controllers/counterController')(io);
  const serviceController = require('../controllers/serviceController')(io);
  const analyticsController = require('../controllers/analyticsController')(io);

  // Token endpoints
  router.get('/tokens', tokenController.getTokens);
  router.get('/tokens/:identifier', tokenController.getTokenByIdOrNumber);
  router.post('/tokens', tokenController.createToken);
  router.post('/tokens/call', tokenController.callNextToken);
  router.post('/tokens/start', tokenController.startService);
  router.post('/tokens/complete', tokenController.completeService);
  router.post('/tokens/noshow', tokenController.markNoShow);
  router.post('/tokens/recalculate', tokenController.recalculateAll);

  // Counter endpoints
  router.get('/counters', counterController.getCounters);
  router.put('/counters/:counterId/status', counterController.updateCounterStatus);

  // Service endpoints
  router.get('/services', serviceController.getServices);
  router.put('/services/:serviceId/benchmark', serviceController.updateServiceBenchmark);

  // Analytics & Seeding
  router.get('/analytics/stats', analyticsController.getDashboardStats);
  router.post('/analytics/seed', analyticsController.seedData);

  return router;
};
