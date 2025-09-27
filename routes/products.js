const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { verifyAdminToken } = require('../middleware/adminAuth');

const router = express.Router();

// @route   POST /api/admin/products
// @desc    Admin creates a new product
// @access  Private (Admin only)
router.post('/', verifyAdminToken, async (req, res) => {
  try {
    const { title, mrp, srp, description, categoryId, subcategoryId, attributes, keywords } = req.body;

    // Validate required fields
    if (!title || !mrp || !srp || !categoryId || !subcategoryId) {
      return res.status(400).json({
        success: false,
        message: 'Title, MRP, SRP, categoryId, and subcategoryId are required fields',
        error: 'Missing required fields'
      });
    }

    // Validate MRP and SRP are numbers
    if (isNaN(mrp) || isNaN(srp)) {
      return res.status(400).json({
        success: false,
        message: 'MRP and SRP must be valid numbers',
        error: 'Invalid number format'
      });
    }

    // Validate SRP is not greater than MRP
    if (parseFloat(srp) > parseFloat(mrp)) {
      return res.status(400).json({
        success: false,
        message: 'SRP cannot be greater than MRP',
        error: 'Invalid pricing'
      });
    }

    // Validate ObjectId format for category and subcategory
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format',
        error: 'Category ID must be a 24 character hex string'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(subcategoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subcategory ID format',
        error: 'Subcategory ID must be a 24 character hex string'
      });
    }

    // Validate category exists and is active
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        error: 'Category does not exist'
      });
    }

    if (!category.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Category is not active',
        error: 'Cannot assign inactive category to product'
      });
    }

    // Validate subcategory exists, is active, and belongs to the category
    const subcategory = await Category.findById(subcategoryId);
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found',
        error: 'Subcategory does not exist'
      });
    }

    if (!subcategory.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory is not active',
        error: 'Cannot assign inactive subcategory to product'
      });
    }

    if (!subcategory.isSubcategory) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subcategory',
        error: 'The provided ID is not a subcategory'
      });
    }

    // Check if subcategory belongs to the category
    const subcategoryParent = subcategory.parent || subcategory.parentCategory;
    if (!subcategoryParent || subcategoryParent.toString() !== categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory does not belong to the specified category',
        error: 'Invalid category-subcategory relationship'
      });
    }

    // Validate attributes format if provided
    if (attributes && Array.isArray(attributes)) {
      for (const attr of attributes) {
        if (!attr.key || !attr.value) {
          return res.status(400).json({
            success: false,
            message: 'Each attribute must have both key and value',
            error: 'Invalid attribute format'
          });
        }
      }
    }

    // Create new product
    const product = new Product({
      title,
      mrp: parseFloat(mrp),
      srp: parseFloat(srp),
      description: description || '',
      categoryId,
      subcategoryId,
      attributes: attributes || [],
      keywords: keywords || [],
      createdBy: {
        id: req.admin.id,
        name: req.admin.name || 'Admin',
        email: req.admin.email
      }
    });

    await product.save();

    // Populate category and subcategory details
    await product.populate([
      { path: 'categoryId', select: 'name slug isActive' },
      { path: 'subcategoryId', select: 'name slug isActive' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product: {
          id: product._id,
          title: product.title,
          mrp: product.mrp,
          srp: product.srp,
          description: product.description,
          category: {
            id: product.categoryId._id,
            name: product.categoryId.name,
            slug: product.categoryId.slug,
            isActive: product.categoryId.isActive
          },
          subcategory: {
            id: product.subcategoryId._id,
            name: product.subcategoryId.name,
            slug: product.subcategoryId.slug,
            isActive: product.subcategoryId.isActive
          },
          attributes: product.attributes,
          keywords: product.keywords,
          isActive: product.isActive,
          profitMargin: product.profitMargin,
          createdBy: product.createdBy,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating product',
      error: 'Product creation failed'
    });
  }
});

// @route   GET /api/admin/products
// @desc    Admin gets all products with pagination and search
// @access  Private (Admin only)
router.get('/', verifyAdminToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    // Build search query
    const searchQuery = {};
    if (search) {
      searchQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { keywords: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Get products with pagination and populate category/subcategory
    const products = await Product.find(searchQuery)
      .populate('categoryId', 'name slug isActive')
      .populate('subcategoryId', 'name slug isActive')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(searchQuery);

    // Format response
    const formattedProducts = products.map(product => ({
      id: product._id,
      title: product.title,
      mrp: product.mrp,
      srp: product.srp,
      description: product.description,
      category: {
        id: product.categoryId._id,
        name: product.categoryId.name,
        slug: product.categoryId.slug,
        isActive: product.categoryId.isActive
      },
      subcategory: {
        id: product.subcategoryId._id,
        name: product.subcategoryId.name,
        slug: product.subcategoryId.slug,
        isActive: product.subcategoryId.isActive
      },
      attributes: product.attributes,
      keywords: product.keywords,
      isActive: product.isActive,
      profitMargin: product.profitMargin,
      createdBy: product.createdBy,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products: formattedProducts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalProducts / limit),
          totalProducts: totalProducts,
          hasNext: page < Math.ceil(totalProducts / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching products',
      error: 'Products fetch failed'
    });
  }
});

// @route   GET /api/admin/products/:id
// @desc    Admin gets single product by ID
// @access  Private (Admin only)
router.get('/:id', verifyAdminToken, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
        error: 'ObjectId must be a 24 character hex string'
      });
    }

    const product = await Product.findById(req.params.id)
      .populate('categoryId', 'name slug isActive')
      .populate('subcategoryId', 'name slug isActive');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: 'Product does not exist'
      });
    }

    res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: {
        product: {
          id: product._id,
          title: product.title,
          mrp: product.mrp,
          srp: product.srp,
          description: product.description,
          category: {
            id: product.categoryId._id,
            name: product.categoryId.name,
            slug: product.categoryId.slug,
            isActive: product.categoryId.isActive
          },
          subcategory: {
            id: product.subcategoryId._id,
            name: product.subcategoryId.name,
            slug: product.subcategoryId.slug,
            isActive: product.subcategoryId.isActive
          },
          attributes: product.attributes,
          keywords: product.keywords,
          isActive: product.isActive,
          profitMargin: product.profitMargin,
          createdBy: product.createdBy,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching product',
      error: 'Product fetch failed'
    });
  }
});

// @route   PUT /api/admin/products/:id
// @desc    Admin updates product details
// @access  Private (Admin only)
router.put('/:id', verifyAdminToken, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
        error: 'ObjectId must be a 24 character hex string'
      });
    }

    const { title, mrp, srp, description, attributes, keywords, isActive } = req.body;

    // Validate input
    if (!title && !mrp && !srp && !description && !attributes && !keywords && isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one field to update',
        error: 'No fields to update'
      });
    }

    // Validate MRP and SRP are numbers if provided
    if (mrp && isNaN(mrp)) {
      return res.status(400).json({
        success: false,
        message: 'MRP must be a valid number',
        error: 'Invalid MRP format'
      });
    }

    if (srp && isNaN(srp)) {
      return res.status(400).json({
        success: false,
        message: 'SRP must be a valid number',
        error: 'Invalid SRP format'
      });
    }

    // Validate SRP is not greater than MRP
    if (mrp && srp && parseFloat(srp) > parseFloat(mrp)) {
      return res.status(400).json({
        success: false,
        message: 'SRP cannot be greater than MRP',
        error: 'Invalid pricing'
      });
    }

    // Validate attributes format if provided
    if (attributes && Array.isArray(attributes)) {
      for (const attr of attributes) {
        if (!attr.key || !attr.value) {
          return res.status(400).json({
            success: false,
            message: 'Each attribute must have both key and value',
            error: 'Invalid attribute format'
          });
        }
      }
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (mrp !== undefined) updateData.mrp = parseFloat(mrp);
    if (srp !== undefined) updateData.srp = parseFloat(srp);
    if (description !== undefined) updateData.description = description;
    if (attributes) updateData.attributes = attributes;
    if (keywords) updateData.keywords = keywords;
    if (isActive !== undefined) updateData.isActive = isActive;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: 'Product does not exist'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        product: {
          id: product._id,
          title: product.title,
          mrp: product.mrp,
          srp: product.srp,
          description: product.description,
          attributes: product.attributes,
          keywords: product.keywords,
          isActive: product.isActive,
          profitMargin: product.profitMargin,
          createdBy: product.createdBy,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating product',
      error: 'Product update failed'
    });
  }
});

// @route   DELETE /api/admin/products/:id
// @desc    Admin deletes product by ID
// @access  Private (Admin only)
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
        error: 'ObjectId must be a 24 character hex string'
      });
    }

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: 'Product does not exist'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: {
        deletedProduct: {
          id: product._id,
          title: product.title,
          mrp: product.mrp,
          srp: product.srp
        }
      }
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting product',
      error: 'Product deletion failed'
    });
  }
});

module.exports = router;
