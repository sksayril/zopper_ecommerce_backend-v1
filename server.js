const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const config = require('./config');

// Import routes
const authRoutes = require('./routes/auth');
const vendorRoutes = require('./routes/vendor');
const adminRoutes = require('./routes/admin');
const productRoutes = require('./routes/products');
const subcategoryRoutes = require('./routes/subcategories');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true, // Prevent XSS attacks
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// MongoDB connection
mongoose.connect(config.MONGODB_URI)
.then(() => {
  console.log('✅ Connected to MongoDB Atlas successfully');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/products', productRoutes);
app.use('/api/subcategories', subcategoryRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Zopper E-commerce Backend API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        profile: 'GET /api/auth/me',
        session: 'GET /api/auth/session'
      },
      vendor: {
        register: 'POST /api/vendor/register',
        login: 'POST /api/vendor/login',
        logout: 'POST /api/vendor/logout',
        profile: 'GET /api/vendor/me',
        updateProfile: 'POST /api/vendor/profile',
        changePassword: 'POST /api/vendor/change-password',
        forgotPassword: 'POST /api/vendor/forgot-password',
        resetPassword: 'POST /api/vendor/reset-password',
        verify: 'GET /api/vendor/verify'
      },
      admin: {
        signup: 'POST /api/admin/signup',
        login: 'POST /api/admin/login',
        logout: 'POST /api/admin/logout',
        profile: 'GET /api/admin/me',
        changePassword: 'POST /api/admin/change-password',
        forgotPassword: 'POST /api/admin/forgot-password',
        resetPassword: 'POST /api/admin/reset-password',
        createVendor: 'POST /api/admin/vendor',
        getVendors: 'GET /api/admin/vendors',
        getVendor: 'GET /api/admin/vendor/:id',
        createCategory: 'POST /api/admin/category',
        getCategories: 'GET /api/admin/categories',
        getCategory: 'GET /api/admin/category/:id',
        updateCategory: 'PUT /api/admin/category/:id',
        deleteCategory: 'DELETE /api/admin/category/:id',
        createSubcategory: 'POST /api/admin/subcategory',
        getSubcategories: 'GET /api/admin/subcategories',
        getSubcategory: 'GET /api/admin/subcategory/:id',
        updateSubcategory: 'POST /api/admin/subcategory/:id',
        deleteSubcategory: 'POST /api/admin/subcategory/:id/delete',
        getCategorySubcategories: 'GET /api/admin/category/:id/subcategories',
        verify: 'GET /api/admin/verify',
        createProduct: 'POST /api/admin/products',
        getProducts: 'GET /api/admin/products',
        getProduct: 'GET /api/admin/products/:id',
        updateProduct: 'POST /api/admin/products/:id',
        deleteProduct: 'DELETE /api/admin/products/:id',
        assignProductsToVendor: 'POST /api/admin/products/assign-vendor'
      },
      subcategories: {
        getSubcategories: 'GET /api/subcategories',
        getProductCount: 'GET /api/subcategories/products-count',
        getSubcategoryProductCount: 'GET /api/subcategories/products-count/:id',
        getProductsBySubcategory: 'GET /api/subcategories/:id/products'
      },
      health: 'GET /api/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: 'The requested endpoint does not exist'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    error: config.NODE_ENV === 'development' ? error.stack : 'Something went wrong'
  });
});

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${config.NODE_ENV}`);
  console.log(`📱 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
