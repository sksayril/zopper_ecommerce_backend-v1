const jwt = require('jsonwebtoken');
const config = require('../config');

// JWT Authentication middleware for vendors
const authenticateVendorJWT = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        error: 'JWT token required'
      });
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.',
        error: 'Bearer token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Check if token is for vendor
    if (decoded.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor token required.',
        error: 'Invalid token role'
      });
    }

    // Add vendor info to request
    req.vendor = {
      id: decoded.vendorId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.',
        error: 'Token verification failed'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token expired.',
        error: 'Token has expired'
      });
    }

    console.error('JWT Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
      error: 'Authentication failed'
    });
  }
};

// Generate JWT token for vendor
const generateVendorToken = (vendor) => {
  const payload = {
    vendorId: vendor._id,
    email: vendor.email,
    role: 'vendor',
    shopName: vendor.shopName
  };

  const options = {
    expiresIn: '24h', // Token expires in 24 hours
    issuer: 'zopper-ecommerce',
    audience: 'vendor'
  };

  return jwt.sign(payload, config.JWT_SECRET, options);
};

// Verify JWT token (for optional authentication)
const verifyVendorToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      // No token provided, continue without authentication
      req.vendor = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      req.vendor = null;
      return next();
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    if (decoded.role === 'vendor') {
      req.vendor = {
        id: decoded.vendorId,
        email: decoded.email,
        role: decoded.role,
        shopName: decoded.shopName
      };
    } else {
      req.vendor = null;
    }

    next();
  } catch (error) {
    // Token is invalid, but continue without authentication
    req.vendor = null;
    next();
  }
};

module.exports = {
  authenticateVendorJWT,
  generateVendorToken,
  verifyVendorToken
};