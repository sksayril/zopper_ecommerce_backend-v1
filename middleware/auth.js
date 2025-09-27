// Authentication middleware to protect routes
const isAuthenticated = (req, res, next) => {
  // Check if user is logged in (session exists and has userId)
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please login to continue.',
      error: 'Authentication required'
    });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.session && req.session.userId && req.session.role === 'admin') {
    return next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
      error: 'Insufficient permissions'
    });
  }
};

// Middleware to check if user is customer
const isCustomer = (req, res, next) => {
  if (req.session && req.session.userId && req.session.role === 'customer') {
    return next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Customer privileges required.',
      error: 'Insufficient permissions'
    });
  }
};

// Middleware to check if vendor is authenticated
const isVendorAuthenticated = (req, res, next) => {
  // Check if vendor is logged in (session exists and has vendorId and role is vendor)
  if (req.session && req.session.vendorId && req.session.role === 'vendor') {
    return next();
  } else {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please login as a vendor to continue.',
      error: 'Vendor authentication required'
    });
  }
};

// Middleware to check if user is vendor (for general vendor checks)
const isVendor = (req, res, next) => {
  if (req.session && req.session.vendorId && req.session.role === 'vendor') {
    return next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Vendor privileges required.',
      error: 'Insufficient permissions'
    });
  }
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isCustomer,
  isVendorAuthenticated,
  isVendor
};
