const express = require('express');
const crypto = require('crypto');
const Vendor = require('../models/Vendor');
const { authenticateVendorJWT, generateVendorToken, verifyVendorToken } = require('../middleware/jwtAuth');

const router = express.Router();

// @route   POST /api/vendor/register
// @desc    Register a new vendor
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      shopName, 
      password, 
      phone, 
      address 
    } = req.body;

    // Validate input
    if (!name || !email || !shopName || !password || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, email, shopName, password, phone, address)',
        error: 'Missing required fields'
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

    // Check if shop name already exists
    const existingShop = await Vendor.findOne({ shopName });
    if (existingShop) {
      return res.status(409).json({
        success: false,
        message: 'Shop name already exists. Please choose a different shop name.',
        error: 'Shop name already taken'
      });
    }

    // Create new vendor
    const vendor = new Vendor({
      name,
      email,
      shopName,
      password,
      phone,
      address: {
        street,
        city,
        state,
        zipCode,
        country
      },
      role: 'vendor'
    });

    await vendor.save();

    res.status(201).json({
      success: true,
      message: 'Vendor registered successfully',
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
          createdAt: vendor.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Vendor registration error:', error);
    
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
      message: 'Internal server error during vendor registration',
      error: 'Vendor registration failed'
    });
  }
});

// @route   POST /api/vendor/login
// @desc    Login vendor
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

    // Find vendor by email
    const vendor = await Vendor.findOne({ email }).select('+password');
    if (!vendor) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        error: 'Authentication failed'
      });
    }

    // Check if vendor is active
    if (!vendor.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Vendor account is deactivated. Please contact support.',
        error: 'Account deactivated'
      });
    }

    // Compare password
    const isPasswordValid = await vendor.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        error: 'Authentication failed'
      });
    }

    // Generate JWT token
    const token = generateVendorToken(vendor);

    res.json({
      success: true,
      message: 'Vendor login successful',
      data: {
        vendor: {
          id: vendor._id,
          name: vendor.name,
          email: vendor.email,
          shopName: vendor.shopName,
          phone: vendor.phone,
          role: vendor.role,
          isVerified: vendor.isVerified
        },
        token: token
      }
    });

  } catch (error) {
    console.error('Vendor login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during vendor login',
      error: 'Vendor login failed'
    });
  }
});

// @route   POST /api/vendor/logout
// @desc    Logout vendor (JWT tokens are stateless, this is for client-side cleanup)
// @access  Private
router.post('/logout', authenticateVendorJWT, (req, res) => {
  try {
    // JWT tokens are stateless, so logout is handled client-side
    // This endpoint confirms the token was valid and can be used for client-side cleanup
    res.json({
      success: true,
      message: 'Vendor logout successful. Please remove the token from client storage.'
    });
  } catch (error) {
    console.error('Vendor logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during vendor logout',
      error: 'Vendor logout failed'
    });
  }
});

// @route   GET /api/vendor/me
// @desc    Get current vendor profile
// @access  Private
router.get('/me', authenticateVendorJWT, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor.id);
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
        error: 'Vendor does not exist'
      });
    }

    res.json({
      success: true,
      message: 'Vendor profile retrieved successfully',
      data: {
        vendor: {
          id: vendor._id,
          name: vendor.name,
          email: vendor.email,
          shopName: vendor.shopName,
          phone: vendor.phone,
          address: vendor.address,
          role: vendor.role,
          isActive: vendor.isActive,
          isVerified: vendor.isVerified,
          businessLicense: vendor.businessLicense,
          taxId: vendor.taxId,
          createdAt: vendor.createdAt,
          updatedAt: vendor.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Get vendor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching vendor profile',
      error: 'Vendor profile fetch failed'
    });
  }
});

// @route   GET /api/vendor/verify
// @desc    Verify vendor JWT token
// @access  Public
router.get('/verify', verifyVendorToken, (req, res) => {
  if (req.vendor) {
    res.json({
      success: true,
      message: 'Vendor token is valid',
      data: {
        isLoggedIn: true,
        vendorId: req.vendor.id,
        role: req.vendor.role,
        email: req.vendor.email,
        shopName: req.vendor.shopName
      }
    });
  } else {
    res.json({
      success: true,
      message: 'No valid vendor token provided',
      data: {
        isLoggedIn: false
      }
    });
  }
});

// @route   POST /api/vendor/profile
// @desc    Update vendor profile
// @access  Private
router.post('/profile', authenticateVendorJWT, async (req, res) => {
  try {
    const { name, phone, address, businessLicense, taxId } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (businessLicense !== undefined) updateData.businessLicense = businessLicense;
    if (taxId !== undefined) updateData.taxId = taxId;

    const vendor = await Vendor.findByIdAndUpdate(
      req.vendor.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
        error: 'Vendor does not exist'
      });
    }

    res.json({
      success: true,
      message: 'Vendor profile updated successfully',
      data: {
        vendor: {
          id: vendor._id,
          name: vendor.name,
          email: vendor.email,
          shopName: vendor.shopName,
          phone: vendor.phone,
          address: vendor.address,
          role: vendor.role,
          isActive: vendor.isActive,
          isVerified: vendor.isVerified,
          businessLicense: vendor.businessLicense,
          taxId: vendor.taxId,
          updatedAt: vendor.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Update vendor profile error:', error);
    
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
      message: 'Internal server error while updating vendor profile',
      error: 'Vendor profile update failed'
    });
  }
});

// @route   POST /api/vendor/change-password
// @desc    Change vendor password
// @access  Private
router.post('/change-password', authenticateVendorJWT, async (req, res) => {
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

    // Find vendor with password
    const vendor = await Vendor.findById(req.vendor.id).select('+password');
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
        error: 'Vendor does not exist'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await vendor.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
        error: 'Invalid current password'
      });
    }

    // Check if new password is different from current password
    const isSamePassword = await vendor.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password',
        error: 'Password unchanged'
      });
    }

    // Update password
    vendor.password = newPassword;
    await vendor.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
      data: {
        vendorId: vendor._id,
        email: vendor.email,
        updatedAt: vendor.updatedAt
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

// @route   POST /api/vendor/forgot-password
// @desc    Send password reset token to vendor email
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

    // Find vendor by email
    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'No vendor found with this email address',
        error: 'Vendor not found'
      });
    }

    // Check if vendor is active
    if (!vendor.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Vendor account is deactivated. Please contact support.',
        error: 'Account deactivated'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to vendor
    vendor.resetPasswordToken = resetToken;
    vendor.resetPasswordExpires = resetTokenExpiry;
    await vendor.save();

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

// @route   POST /api/vendor/reset-password
// @desc    Reset vendor password using reset token
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

    // Find vendor with valid reset token
    const vendor = await Vendor.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!vendor) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
        error: 'Reset token invalid or expired'
      });
    }

    // Update password
    vendor.password = newPassword;
    vendor.resetPasswordToken = undefined;
    vendor.resetPasswordExpires = undefined;
    await vendor.save();

    res.json({
      success: true,
      message: 'Password reset successfully',
      data: {
        vendorId: vendor._id,
        email: vendor.email,
        updatedAt: vendor.updatedAt
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

module.exports = router;
