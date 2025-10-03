const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Vendor = require('../models/Vendor');
const Category = require('../models/Category');
const { generateAdminToken, verifyAdminToken } = require('../middleware/adminAuth');

const router = express.Router();

// @route   POST /api/admin/signup
// @desc    Create a new admin account
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, email, password)',
        error: 'Missing required fields'
      });
    }

    // Sanitize and validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
        error: 'Invalid email format'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Admin password must be at least 8 characters long',
        error: 'Password too short'
      });
    }

    // Additional password strength validation for admin
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Admin password must contain at least one lowercase letter, one uppercase letter, and one number',
        error: 'Password strength insufficient'
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: 'Admin with this email already exists',
        error: 'Email already registered'
      });
    }

    // Create new admin
    const admin = new Admin({
      name,
      email,
      password,
      role: 'admin'
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          isActive: admin.isActive,
          createdAt: admin.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Admin signup error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during admin signup',
      error: 'Admin signup failed'
    });
  }
});

// @route   POST /api/admin/login
// @desc    Authenticate admin
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
        error: 'Missing credentials'
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        error: 'Authentication failed'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account is deactivated. Please contact support.',
        error: 'Account deactivated'
      });
    }

    // Compare password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        error: 'Authentication failed'
      });
    }

    // Generate JWT token
    let token;
    try {
      token = generateAdminToken(admin);
    } catch (error) {
      console.error('Token generation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate authentication token',
        error: 'Token generation failed'
      });
    }

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          isActive: admin.isActive
        },
        token: token
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during admin login',
      error: 'Admin login failed'
    });
  }
});

// @route   GET /api/admin/me
// @desc    Get current admin profile
// @access  Private
router.get('/me', verifyAdminToken, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
        error: 'Admin does not exist'
      });
    }

    res.json({
      success: true,
      message: 'Admin profile retrieved successfully',
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          isActive: admin.isActive,
          createdAt: admin.createdAt,
          updatedAt: admin.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching admin profile',
      error: 'Admin profile fetch failed'
    });
  }
});

// @route   POST /api/admin/logout
// @desc    Logout admin (JWT tokens are stateless, this is for client-side cleanup)
// @access  Private
router.post('/logout', verifyAdminToken, (req, res) => {
  try {
    // JWT tokens are stateless, so logout is handled client-side
    // This endpoint confirms the token was valid and can be used for client-side cleanup
    res.json({
      success: true,
      message: 'Admin logout successful. Please remove the token from client storage.'
    });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during admin logout',
      error: 'Admin logout failed'
    });
  }
});

// @route   GET /api/admin/verify
// @desc    Verify admin JWT token
// @access  Public
router.get('/verify', verifyAdminToken, (req, res) => {
  res.json({
    success: true,
    message: 'Admin token is valid',
    data: {
      isLoggedIn: true,
      adminId: req.admin.id,
      role: req.admin.role,
      email: req.admin.email
    }
  });
});

// @route   POST /api/admin/change-password
// @desc    Change admin password
// @access  Private
router.post('/change-password', verifyAdminToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current password and new password',
        error: 'Missing required fields'
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
        error: 'Password validation failed'
      });
    }

    // Find admin with password
    const admin = await Admin.findById(req.admin.id).select('+password');
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
        error: 'Admin does not exist'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
        error: 'Invalid current password'
      });
    }

    // Check if new password is different from current password
    const isSamePassword = await admin.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password',
        error: 'Password unchanged'
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
      data: {
        adminId: admin._id,
        email: admin.email,
        updatedAt: admin.updatedAt
      }
    });

  } catch (error) {
    console.error('Change password error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while changing password',
      error: 'Password change failed'
    });
  }
});

// @route   POST /api/admin/forgot-password
// @desc    Send password reset token to admin email
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address',
        error: 'Email is required'
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'No admin found with this email address',
        error: 'Admin not found'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account is deactivated. Please contact support.',
        error: 'Account deactivated'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to admin
    admin.resetPasswordToken = resetToken;
    admin.resetPasswordExpires = resetTokenExpiry;
    await admin.save();

    // In a real application, you would send this token via email
    // For now, we'll return it in the response for testing
    res.json({
      success: true,
      message: 'Password reset token generated successfully',
      data: {
        resetToken: resetToken,
        expiresAt: resetTokenExpiry,
        note: 'In production, this token would be sent via email'
      }
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while processing password reset request',
      error: 'Password reset request failed'
    });
  }
});

// @route   POST /api/admin/reset-password
// @desc    Reset admin password using reset token
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Validate input
    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reset token and new password',
        error: 'Missing required fields'
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
        error: 'Password validation failed'
      });
    }

    // Find admin with valid reset token
    const admin = await Admin.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
        error: 'Reset token invalid or expired'
      });
    }

    // Update password
    admin.password = newPassword;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    res.json({
      success: true,
      message: 'Password reset successfully',
      data: {
        adminId: admin._id,
        email: admin.email,
        updatedAt: admin.updatedAt
      }
    });

  } catch (error) {
    console.error('Reset password error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while resetting password',
      error: 'Password reset failed'
    });
  }
});

// @route   POST /api/admin/vendor
// @desc    Admin creates a new vendor
// @access  Private (Admin only)
router.post('/vendor', verifyAdminToken, async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      address 
    } = req.body;

    // Validate input
    if (!name || !email || !password || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, email, password, phone, address)',
        error: 'Missing required fields'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
        error: 'Password validation failed'
      });
    }

    // Validate address object
    const { street, city, state, zipCode, country } = address;
    if (!street || !city || !state || !zipCode || !country) {
      return res.status(400).json({
        success: false,
        message: 'Please provide complete address information (street, city, state, zipCode, country)',
        error: 'Incomplete address information'
      });
    }

    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(409).json({
        success: false,
        message: 'Vendor with this email already exists',
        error: 'Email already registered'
      });
    }

    // Check if shop name already exists (if provided)
    if (req.body.shopName) {
      const existingShop = await Vendor.findOne({ shopName: req.body.shopName });
      if (existingShop) {
        return res.status(409).json({
          success: false,
          message: 'Shop name already exists. Please choose a different shop name.',
          error: 'Shop name already taken'
        });
      }
    }

    // Create new vendor
    const vendor = new Vendor({
      name,
      email,
      password,
      phone,
      address: {
        street,
        city,
        state,
        zipCode,
        country
      },
      shopName: req.body.shopName || `${name}'s Store`,
      role: 'vendor',
      createdBy: req.admin.id
    });

    await vendor.save();

    res.status(201).json({
      success: true,
      message: 'Vendor created successfully by admin',
      data: {
        vendor: {
          id: vendor._id,
          name: vendor.name,
          email: vendor.email,
          shopName: vendor.shopName,
          phone: vendor.phone,
          address: vendor.address,
          role: vendor.role,
          isVerified: vendor.isVerified,
          createdBy: vendor.createdBy,
          createdAt: vendor.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Admin create vendor error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while creating vendor',
      error: 'Vendor creation failed'
    });
  }
});

// @route   GET /api/admin/vendors
// @desc    Admin gets all vendors created by them
// @access  Private (Admin only)
router.get('/vendors', verifyAdminToken, async (req, res) => {
  try {
    const vendors = await Vendor.find({ createdBy: req.admin.id })
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Vendors retrieved successfully',
      data: {
        vendors: vendors,
        count: vendors.length
      }
    });

  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching vendors',
      error: 'Vendors fetch failed'
    });
  }
});

// @route   GET /api/admin/vendor/:id
// @desc    Admin gets specific vendor details
// @access  Private (Admin only)
router.get('/vendor/:id', verifyAdminToken, async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ 
      _id: req.params.id, 
      createdBy: req.admin.id 
    }).select('-password -resetPasswordToken -resetPasswordExpires');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found or you do not have permission to view this vendor',
        error: 'Vendor not found'
      });
    }

    res.json({
      success: true,
      message: 'Vendor details retrieved successfully',
      data: {
        vendor: vendor
      }
    });

  } catch (error) {
    console.error('Get vendor details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching vendor details',
      error: 'Vendor details fetch failed'
    });
  }
});

// @route   POST /api/admin/category
// @desc    Admin creates a new product category
// @access  Private (Admin only)
router.post('/category', verifyAdminToken, async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category name',
        error: 'Missing required field'
      });
    }

    // Validate name length
    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Category name must be between 2 and 100 characters',
        error: 'Invalid name length'
      });
    }

    // Validate description length if provided
    if (description && description.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Category description cannot exceed 500 characters',
        error: 'Invalid description length'
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: 'Category with this name already exists',
        error: 'Category name already taken'
      });
    }

    // Create new category
    const category = new Category({
      name,
      description,
      createdBy: req.admin.id
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully by admin',
      data: {
        category: {
          id: category._id,
          name: category.name,
          description: category.description,
          slug: category.slug,
          isActive: category.isActive,
          createdBy: category.createdBy,
          createdAt: category.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Admin create category error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.join(', ')
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Category with this name already exists',
        error: 'Duplicate category name'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while creating category',
      error: 'Category creation failed'
    });
  }
});

// @route   GET /api/admin/categories
// @desc    Admin gets all categories in hierarchical tree structure
// @access  Private (Admin only)
router.get('/categories', verifyAdminToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', isActive } = req.query;
    
    // Build query for main categories only (for pagination)
    const mainCategoryQuery = { 
      $and: [
        { $or: [{ parent: null }, { parent: { $exists: false } }] },
        { $or: [{ parentCategory: null }, { parentCategory: { $exists: false } }] },
        { isSubcategory: { $ne: true } }
      ]
    };
    
    // Search by name or description
    if (search) {
      mainCategoryQuery.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }
    
    // Filter by active status
    if (isActive !== undefined) {
      mainCategoryQuery.isActive = isActive === 'true';
    }

    // Get main categories with pagination
    const mainCategories = await Category.find(mainCategoryQuery)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get all categories for building the tree (including subcategories)
    const allCategoriesQuery = {};
    if (search) {
      allCategoriesQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (isActive !== undefined) {
      allCategoriesQuery.isActive = isActive === 'true';
    }

    const allCategories = await Category.find(allCategoriesQuery)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Build hierarchical tree structure
    const categoryTree = await Category.buildCategoryTree(allCategories);

    // Count only main categories for pagination
    const totalMainCategories = await Category.countDocuments(mainCategoryQuery);

    res.json({
      success: true,
      message: 'Categories retrieved successfully',
      data: {
        categories: categoryTree,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalMainCategories / limit),
          totalCategories: totalMainCategories,
          hasNext: page < Math.ceil(totalMainCategories / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching categories',
      error: 'Categories fetch failed'
    });
  }
});

// @route   GET /api/admin/category/:id
// @desc    Admin gets specific category details
// @access  Private (Admin only)
router.get('/category/:id', verifyAdminToken, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        error: 'Category does not exist'
      });
    }

    res.json({
      success: true,
      message: 'Category details retrieved successfully',
      data: {
        category: category
      }
    });

  } catch (error) {
    console.error('Get category details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching category details',
      error: 'Category details fetch failed'
    });
  }
});

// @route   PUT /api/admin/category/:id
// @desc    Admin updates category
// @access  Private (Admin only)
router.put('/category/:id', verifyAdminToken, async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    // Validate input
    if (!name && !description && isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one field to update',
        error: 'No fields to update'
      });
    }

    // Validate name length if provided
    if (name && (name.length < 2 || name.length > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Category name must be between 2 and 100 characters',
        error: 'Invalid name length'
      });
    }

    // Validate description length if provided
    if (description && description.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Category description cannot exceed 500 characters',
        error: 'Invalid description length'
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        error: 'Category does not exist'
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: {
        category: category
      }
    });

  } catch (error) {
    console.error('Update category error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.join(', ')
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Category with this name already exists',
        error: 'Duplicate category name'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while updating category',
      error: 'Category update failed'
    });
  }
});

// @route   DELETE /api/admin/category/:id
// @desc    Admin deletes category
// @access  Private (Admin only)
router.delete('/category/:id', verifyAdminToken, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        error: 'Category does not exist'
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully',
      data: {
        deletedCategory: {
          id: category._id,
          name: category.name
        }
      }
    });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting category',
      error: 'Category deletion failed'
    });
  }
});

// @route   POST /api/admin/subcategory
// @desc    Admin creates a new subcategory
// @access  Private (Admin only)
router.post('/subcategory', verifyAdminToken, async (req, res) => {
  try {
    const { name, description, parentCategoryId } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subcategory name',
        error: 'Missing required field'
      });
    }

    if (!parentCategoryId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide parent category ID',
        error: 'Missing required field'
      });
    }

    // Validate name length
    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory name must be between 2 and 100 characters',
        error: 'Invalid name length'
      });
    }

    // Validate description length if provided
    if (description && description.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory description cannot exceed 500 characters',
        error: 'Invalid description length'
      });
    }

    // Check if parent category exists
    const parentCategory = await Category.findById(parentCategoryId);
    if (!parentCategory) {
      return res.status(404).json({
        success: false,
        message: 'Parent category not found',
        error: 'Parent category does not exist'
      });
    }

    // Allow creating subcategories under any existing category (main or subcategory)
    // This enables unlimited nesting levels

    // Check if subcategory already exists under this parent
    const existingSubcategory = await Category.findOne({ 
      name, 
      parentCategory: parentCategoryId 
    });
    if (existingSubcategory) {
      return res.status(409).json({
        success: false,
        message: 'Subcategory with this name already exists under the parent category',
        error: 'Subcategory name already taken'
      });
    }

    // Create new subcategory
    const subcategory = new Category({
      name,
      description,
      parent: parentCategoryId,
      parentCategory: parentCategoryId, // Keep for backward compatibility
      isSubcategory: true,
      createdBy: req.admin.id
    });

    await subcategory.save();

    // Populate parent category info
    await subcategory.populate('parentCategory', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Subcategory created successfully by admin',
      data: {
        subcategory: {
          id: subcategory._id,
          name: subcategory.name,
          description: subcategory.description,
          slug: subcategory.slug,
          isSubcategory: subcategory.isSubcategory,
          parentCategory: subcategory.parentCategory,
          isActive: subcategory.isActive,
          createdBy: subcategory.createdBy,
          createdAt: subcategory.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Admin create subcategory error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.join(', ')
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Subcategory with this name already exists',
        error: 'Duplicate subcategory name'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while creating subcategory',
      error: 'Subcategory creation failed'
    });
  }
});

// @route   GET /api/admin/subcategories
// @desc    Admin gets all subcategories with optional parent filter
// @access  Private (Admin only)
router.get('/subcategories', verifyAdminToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', parentCategoryId, isActive } = req.query;
    
    // Build query
    const query = { isSubcategory: true };
    
    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by parent category
    if (parentCategoryId) {
      query.parentCategory = parentCategoryId;
    }
    
    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const subcategories = await Category.find(query)
      .populate('parentCategory', 'name slug')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Category.countDocuments(query);

    res.json({
      success: true,
      message: 'Subcategories retrieved successfully',
      data: {
        subcategories: subcategories,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalSubcategories: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching subcategories',
      error: 'Subcategories fetch failed'
    });
  }
});

// @route   GET /api/admin/subcategory/:id
// @desc    Admin gets specific subcategory details
// @access  Private (Admin only)
router.get('/subcategory/:id', verifyAdminToken, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subcategory ID format',
        error: 'ObjectId must be a 24 character hex string'
      });
    }

    const subcategory = await Category.findOne({ 
      _id: req.params.id, 
      isSubcategory: true 
    })
      .populate('parentCategory', 'name slug')
      .populate('createdBy', 'name email');

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found',
        error: 'Subcategory does not exist'
      });
    }

    res.json({
      success: true,
      message: 'Subcategory details retrieved successfully',
      data: {
        subcategory: subcategory
      }
    });

  } catch (error) {
    console.error('Get subcategory details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching subcategory details',
      error: 'Subcategory details fetch failed'
    });
  }
});

// @route   POST /api/admin/subcategory/:id
// @desc    Admin updates subcategory
// @access  Private (Admin only)
router.post('/subcategory/:id', verifyAdminToken, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subcategory ID format',
        error: 'ObjectId must be a 24 character hex string'
      });
    }

    const { name, description, isActive, parentCategoryId } = req.body;

    // Validate input
    if (!name && !description && isActive === undefined && !parentCategoryId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one field to update',
        error: 'No fields to update'
      });
    }

    // Validate name length if provided
    if (name && (name.length < 2 || name.length > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory name must be between 2 and 100 characters',
        error: 'Invalid name length'
      });
    }

    // Validate description length if provided
    if (description && description.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory description cannot exceed 500 characters',
        error: 'Invalid description length'
      });
    }

    // Check if parent category exists (if changing parent)
    if (parentCategoryId) {
      const parentCategory = await Category.findById(parentCategoryId);
      if (!parentCategory) {
        return res.status(404).json({
          success: false,
          message: 'Parent category not found',
          error: 'Parent category does not exist'
        });
      }

      // Allow setting any existing category as parent (main or subcategory)
      // This enables unlimited nesting levels
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (parentCategoryId) updateData.parentCategory = parentCategoryId;

    const subcategory = await Category.findOneAndUpdate(
      { _id: req.params.id, isSubcategory: true },
      updateData,
      { new: true, runValidators: true }
    ).populate('parentCategory', 'name slug').populate('createdBy', 'name email');

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found',
        error: 'Subcategory does not exist'
      });
    }

    res.json({
      success: true,
      message: 'Subcategory updated successfully',
      data: {
        subcategory: subcategory
      }
    });

  } catch (error) {
    console.error('Update subcategory error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.join(', ')
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Subcategory with this name already exists under the parent category',
        error: 'Duplicate subcategory name'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while updating subcategory',
      error: 'Subcategory update failed'
    });
  }
});

// @route   POST /api/admin/subcategory/:id/delete
// @desc    Admin deletes subcategory
// @access  Private (Admin only)
router.post('/subcategory/:id/delete', verifyAdminToken, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subcategory ID format',
        error: 'ObjectId must be a 24 character hex string'
      });
    }

    const subcategory = await Category.findOneAndDelete({ 
      _id: req.params.id, 
      isSubcategory: true 
    });

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found',
        error: 'Subcategory does not exist'
      });
    }

    res.json({
      success: true,
      message: 'Subcategory deleted successfully',
      data: {
        deletedSubcategory: {
          id: subcategory._id,
          name: subcategory.name,
          parentCategory: subcategory.parentCategory
        }
      }
    });

  } catch (error) {
    console.error('Delete subcategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting subcategory',
      error: 'Subcategory deletion failed'
    });
  }
});

// @route   GET /api/admin/category/:id/subcategories
// @desc    Admin gets all subcategories of a specific parent category
// @access  Private (Admin only)
router.get('/category/:id/subcategories', verifyAdminToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', isActive } = req.query;
    
    // Check if parent category exists
    const parentCategory = await Category.findById(req.params.id);
    if (!parentCategory) {
      return res.status(404).json({
        success: false,
        message: 'Parent category not found',
        error: 'Parent category does not exist'
      });
    }

    // Build query
    const query = { 
      parentCategory: req.params.id,
      isSubcategory: true 
    };
    
    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const subcategories = await Category.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Category.countDocuments(query);

    res.json({
      success: true,
      message: 'Subcategories retrieved successfully',
      data: {
        parentCategory: {
          id: parentCategory._id,
          name: parentCategory.name,
          slug: parentCategory.slug
        },
        subcategories: subcategories,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalSubcategories: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get category subcategories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching category subcategories',
      error: 'Category subcategories fetch failed'
    });
  }
});

module.exports = router;
