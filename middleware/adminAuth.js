const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Generate JWT token for admin
const generateAdminToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
      email: admin.email,
      role: admin.role
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  );
};

// Verify admin JWT token
const verifyAdminToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        error: 'Token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Verify admin still exists and is active
    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid or inactive admin account.',
        error: 'Invalid token'
      });
    }

    req.admin = {
      id: admin._id,
      email: admin.email,
      role: admin.role
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.',
        error: 'Invalid token'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token has expired.',
        error: 'Token expired'
      });
    }
    
    console.error('Admin token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during token verification',
      error: 'Token verification failed'
    });
  }
};

// Optional token verification (for routes that can work with or without token)
const verifyAdminTokenOptional = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      req.admin = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const admin = await Admin.findById(decoded.id);
    if (admin && admin.isActive) {
      req.admin = {
        id: admin._id,
        email: admin.email,
        role: admin.role
      };
    } else {
      req.admin = null;
    }
    
    next();
  } catch (error) {
    // For optional verification, we don't throw errors, just set admin to null
    req.admin = null;
    next();
  }
};

module.exports = {
  generateAdminToken,
  verifyAdminToken,
  verifyAdminTokenOptional
};
