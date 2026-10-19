const express = require('express');
const authController = require('../controllers/authController');
const { authenticateUser, optionalAuth, requireRole } = require('../middleware/authMiddleware');

module.exports = (io) => {
  const router = express.Router();

  const tokenController = require('../controllers/tokenController')(io);
  const counterController = require('../controllers/counterController')(io);
  const serviceController = require('../controllers/serviceController')(io);
  const analyticsController = require('../controllers/analyticsController')(io);

  // Authentication & Account Endpoints
  router.post('/auth/register', authController.registerCustomer);
  router.post('/auth/login', authController.login);
  router.get('/auth/me', authenticateUser, authController.getMe);
  router.get('/auth/admin-status', authController.getAdminStatus);

  // Staff Account Management (Admin Authorized Only)
  router.post('/auth/staff', authenticateUser, requireRole('ADMIN'), authController.createStaffAccount);
  router.get('/auth/staff', authenticateUser, requireRole('ADMIN'), authController.getStaffAccounts);

  // Token endpoints
  router.get('/tokens', tokenController.getTokens);
  router.get('/tokens/:identifier', tokenController.getTokenByIdOrNumber);
  router.post('/tokens', optionalAuth, tokenController.createToken);
  
  // Officer Desk Operations (Staff or Admin required)
  router.post('/tokens/call', authenticateUser, requireRole('STAFF', 'ADMIN'), tokenController.callNextToken);
  router.post('/tokens/start', authenticateUser, requireRole('STAFF', 'ADMIN'), tokenController.startService);
  router.post('/tokens/complete', authenticateUser, requireRole('STAFF', 'ADMIN'), tokenController.completeService);
  router.post('/tokens/noshow', authenticateUser, requireRole('STAFF', 'ADMIN'), tokenController.markNoShow);
  router.post('/tokens/recalculate', authenticateUser, requireRole('STAFF', 'ADMIN'), tokenController.recalculateAll);

  // Counter endpoints
  router.get('/counters', counterController.getCounters);
  router.put('/counters/:counterId/status', authenticateUser, requireRole('STAFF', 'ADMIN'), counterController.updateCounterStatus);

  // Service endpoints
  router.get('/services', serviceController.getServices);
  router.put('/services/:serviceId/benchmark', authenticateUser, requireRole('ADMIN'), serviceController.updateServiceBenchmark);

  // Analytics & Seeding (Protected for Admin)
  router.get('/analytics/stats', analyticsController.getDashboardStats);
  router.post('/analytics/seed', authenticateUser, requireRole('ADMIN'), analyticsController.seedData);

  return router;
};
