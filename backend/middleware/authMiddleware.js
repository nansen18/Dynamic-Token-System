const jwt = require('jsonwebtoken');
const { Users } = require('../database/store');

const JWT_SECRET = process.env.JWT_SECRET || 'nexusqueue_jwt_super_secret_key_2025_secure';

// Helper to generate signed JWT tokens
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department || 'ALL',
      counterId: user.counterId || '',
      counterNumber: user.counterNumber || ''
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Middleware: Authenticate Bearer JWT
async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization token format.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await Users.findById(decoded.id);

    if (!user || user.active === false) {
      return res.status(401).json({
        success: false,
        message: 'User session is invalid or user account has been disabled.'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department || 'ALL',
      counterId: user.counterId || '',
      counterNumber: user.counterNumber || ''
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or forged token. Access denied.'
    });
  }
}

// Middleware: Optional authentication (attaches user if token is valid, doesn't block if missing)
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await Users.findById(decoded.id);
        if (user && user.active !== false) {
          req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department || 'ALL',
            counterId: user.counterId || '',
            counterNumber: user.counterNumber || ''
          };
        }
      }
    }
  } catch {
    // Ignore invalid optional tokens
  }
  next();
}

// Middleware: Enforce role-based access control
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires ${allowedRoles.join(' or ')} privileges. Your account role is ${req.user.role}.`
      });
    }

    next();
  };
}

module.exports = {
  JWT_SECRET,
  generateToken,
  authenticateUser,
  optionalAuth,
  requireRole
};
