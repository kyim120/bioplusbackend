const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
exports.generateToken = (payload, expiresIn = process.env.JWT_EXPIRE || '7d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// Generate refresh token
exports.generateRefreshToken = (payload, expiresIn = process.env.JWT_REFRESH_EXPIRE || '30d') => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn });
};

// Verify JWT token
exports.verifyToken = (token, isRefreshToken = false) => {
  try {
    const secret = isRefreshToken ? process.env.JWT_REFRESH_SECRET : process.env.JWT_SECRET;
    return jwt.verify(token, secret);
  } catch (error) {
    throw error;
  }
};

// Authentication middleware
exports.authenticate = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies
    if (!token && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
      // Verify token
      const decoded = exports.verifyToken(token);

      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ error: 'Token is not valid. User not found.' });
      }

      // Check if user is active
      if (user.status !== 'active') {
        return res.status(401).json({ error: 'Account is not active.' });
      }

      req.user = user;
      next();

    } catch (error) {
      return res.status(401).json({ error: 'Token is not valid.' });
    }

  } catch (error) {
    res.status(500).json({ error: 'Server error during authentication' });
  }
};

// Role-based authorization middleware
exports.roleCheck = (...roles) => {
  const allowedRoles = roles.flat();
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};

// Optional authentication (doesn't fail if no token)
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = exports.verifyToken(token);
        const user = await User.findById(decoded.id).select('-password');

        if (user && user.status === 'active') {
          req.user = user;
        }
      } catch (error) {
        // Ignore token errors for optional auth
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Admin or owner check
exports.adminOrOwner = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Access denied. Admin or owner role required.' });
  }

  next();
};

// Owner only check
exports.ownerOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Access denied. Owner role required.' });
  }

  next();
};

// Student or admin check
exports.studentOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'student' && req.user.role !== 'admin' && req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Access denied. Student or admin role required.' });
  }

  next();
};

// Resource ownership check
exports.checkOwnership = (resourceModel) => {
  return async (req, res, next) => {
    try {
      const resource = await resourceModel.findById(req.params.id || req.params.resourceId);

      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      // Allow access if user is admin/owner or resource owner
      if (req.user.role === 'admin' || req.user.role === 'owner' ||
        resource.createdBy.toString() === req.user._id.toString()) {
        req.resource = resource;
        return next();
      }

      return res.status(403).json({ error: 'Access denied. You do not own this resource.' });

    } catch (error) {
      res.status(500).json({ error: 'Server error during ownership check' });
    }
  };
};
