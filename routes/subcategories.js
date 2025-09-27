const express = require('express');
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

const router = express.Router();

// @route   GET /api/subcategories/products-count
// @desc    Get product count by subcategory
// @access  Public
router.get('/products-count', async (req, res) => {
  try {
    // Get all subcategories (categories where isSubcategory is true)
    const subcategories = await Category.find({ 
      isSubcategory: true,
      isActive: true 
    }).select('_id name slug');

    if (!subcategories || subcategories.length === 0) {
      return res.json({
        success: true,
        message: 'No subcategories found',
        data: []
      });
    }

    // Get product counts for each subcategory using aggregation
    const productCounts = await Product.aggregate([
      {
        $match: {
          isActive: true,
          subcategoryId: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$subcategoryId',
          productCount: { $sum: 1 }
        }
      }
    ]);

    // Create a map for quick lookup of product counts
    const countMap = {};
    productCounts.forEach(item => {
      countMap[item._id.toString()] = item.productCount;
    });

    // Format the response
    const result = subcategories.map(subcategory => ({
      subcategory: {
        id: subcategory._id,
        name: subcategory.name,
        slug: subcategory.slug
      },
      productCount: countMap[subcategory._id.toString()] || 0
    }));

    // Sort by product count (descending) and then by name
    result.sort((a, b) => {
      if (b.productCount !== a.productCount) {
        return b.productCount - a.productCount;
      }
      return a.subcategory.name.localeCompare(b.subcategory.name);
    });

    res.json({
      success: true,
      message: 'Product count by subcategory retrieved successfully',
      data: result
    });

  } catch (error) {
    console.error('Get product count by subcategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching product counts',
      error: 'Product count fetch failed'
    });
  }
});

// @route   GET /api/subcategories/products-count/:subcategoryId
// @desc    Get product count for a specific subcategory
// @access  Public
router.get('/products-count/:subcategoryId', async (req, res) => {
  try {
    const { subcategoryId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(subcategoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subcategory ID format',
        error: 'ObjectId must be a 24 character hex string'
      });
    }

    // Check if subcategory exists
    const subcategory = await Category.findOne({
      _id: subcategoryId,
      isSubcategory: true,
      isActive: true
    }).select('_id name slug');

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found',
        error: 'Subcategory does not exist or is inactive'
      });
    }

    // Count active products for this subcategory
    const productCount = await Product.countDocuments({
      subcategoryId: subcategoryId,
      isActive: true
    });

    res.json({
      success: true,
      message: 'Product count for subcategory retrieved successfully',
      data: {
        subcategory: {
          id: subcategory._id,
          name: subcategory.name,
          slug: subcategory.slug
        },
        productCount: productCount
      }
    });

  } catch (error) {
    console.error('Get product count for subcategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching product count',
      error: 'Product count fetch failed'
    });
  }
});

// @route   GET /api/subcategories/:id/products
// @desc    Get all active products by specific category (main category or subcategory)
// @access  Public
router.get('/:id/products', async (req, res) => {
  try {
    const { id: categoryId } = req.params;
    const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format',
        error: 'ObjectId must be a 24 character hex string'
      });
    }

    // Check if category exists and is active (can be main category or subcategory)
    const category = await Category.findOne({
      _id: categoryId,
      isActive: true
    }).select('_id name slug parentCategory isSubcategory').populate('parentCategory', 'name slug');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        error: 'Category does not exist or is inactive'
      });
    }

    // Build search query based on category type
    let searchQuery = { isActive: true };
    
    if (category.isSubcategory) {
      // If it's a subcategory, search by subcategoryId
      searchQuery.subcategoryId = categoryId;
    } else {
      // If it's a main category, search by categoryId
      searchQuery.categoryId = categoryId;
    }

    if (search) {
      searchQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { keywords: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sortObject = {};
    const validSortFields = ['title', 'mrp', 'srp', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    sortObject[sortField] = sortDirection;

    // Get products with pagination and populate category details
    const products = await Product.find(searchQuery)
      .populate('categoryId', 'name slug isActive')
      .populate('subcategoryId', 'name slug isActive')
      .sort(sortObject)
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
        category: {
          id: category._id,
          name: category.name,
          slug: category.slug,
          type: category.isSubcategory ? 'subcategory' : 'main_category',
          parentCategory: category.parentCategory ? {
            id: category.parentCategory._id,
            name: category.parentCategory.name,
            slug: category.parentCategory.slug
          } : null
        },
        products: formattedProducts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalProducts / limit),
          totalProducts: totalProducts,
          hasNext: page < Math.ceil(totalProducts / limit),
          hasPrev: page > 1,
          limit: parseInt(limit)
        },
        filters: {
          search: search || null,
          sortBy: sortField,
          sortOrder: sortOrder
        }
      }
    });

  } catch (error) {
    console.error('Get products by subcategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching products',
      error: 'Products fetch failed'
    });
  }
});

// @route   GET /api/subcategories
// @desc    Get all subcategories with optional product count
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { includeProductCount = 'false' } = req.query;

    // Get all subcategories
    const subcategories = await Category.find({ 
      isSubcategory: true,
      isActive: true 
    }).select('_id name slug parentCategory').populate('parentCategory', 'name slug');

    if (!subcategories || subcategories.length === 0) {
      return res.json({
        success: true,
        message: 'No subcategories found',
        data: []
      });
    }

    let result = subcategories.map(subcategory => ({
      id: subcategory._id,
      name: subcategory.name,
      slug: subcategory.slug,
      parentCategory: subcategory.parentCategory ? {
        id: subcategory.parentCategory._id,
        name: subcategory.parentCategory.name,
        slug: subcategory.parentCategory.slug
      } : null
    }));

    // Include product count if requested
    if (includeProductCount === 'true') {
      const productCounts = await Product.aggregate([
        {
          $match: {
            isActive: true,
            subcategoryId: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: '$subcategoryId',
            productCount: { $sum: 1 }
          }
        }
      ]);

      const countMap = {};
      productCounts.forEach(item => {
        countMap[item._id.toString()] = item.productCount;
      });

      result = result.map(subcategory => ({
        ...subcategory,
        productCount: countMap[subcategory.id.toString()] || 0
      }));

      // Sort by product count (descending) and then by name
      result.sort((a, b) => {
        if (b.productCount !== a.productCount) {
          return b.productCount - a.productCount;
        }
        return a.name.localeCompare(b.name);
      });
    }

    res.json({
      success: true,
      message: 'Subcategories retrieved successfully',
      data: result
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

module.exports = router;
