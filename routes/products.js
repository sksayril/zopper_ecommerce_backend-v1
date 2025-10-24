const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Vendor = require('../models/Vendor');
const ScrapingHistory = require('../models/ScrapingHistory');
const { verifyAdminToken } = require('../middleware/adminAuth');
const multer = require('multer');
const XLSX = require('xlsx');

const router = express.Router();

// Multer in-memory storage for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (allowed.includes(file.mimetype) || file.originalname.endsWith('.csv') || file.originalname.endsWith('.xlsx')) {
      return cb(null, true);
    }
    cb(new Error('Only CSV or XLSX files are allowed'));
  }
});

// @route   POST /api/admin/products/bulk-upload
// @desc    Admin bulk uploads products via CSV or XLSX
// @access  Private (Admin only)
router.post('/bulk-upload', verifyAdminToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required', error: 'No file uploaded' });
    }

    // Parse CSV/XLSX buffer using xlsx (supports CSV and Excel)
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (!rows.length) {
      return res.status(400).json({ success: false, message: 'No data rows found', error: 'Empty file' });
    }

    // Expected columns mapping (case-insensitive)
    const columnMap = {
      title: ['title', 'product title', 'titleproduct title'],
      description: ['product description', 'description'],
      aiDescription: ['ai description for seo', 'ai description', 'aidescription'],
      mrp: ['regular price', 'mrp'],
      srp: ['sale price', 'srp'],
      discount: ['discount percentage', 'discount'],
      keywords: ['product tag (for search functionality)', 'product tag', 'tags', 'keywords'],
      offers: ['bank/card offers', 'offers'],
      vendorSite: ['seller (name of the scrap source)', 'seller', 'scrap source', 'vendor site'],
      brand: ['brand name', 'brand'],
      productUrl: ['product url', 'url'],
      mainImage: ['product image url', 'image url', 'main image'],
      createdAt: ['product created date', 'created at'],
      updatedAt: ['product updated date', 'updated at'],
      externalId: ['product id', 'external id'],
      categoryId: ['product main category'],
      subcategoryId: ['product sub category'],
      subSubcategoryId: ['product sub sub category']
    };

    const normalize = (s) => String(s || '').trim().toLowerCase();

    const mapRow = (row) => {
      const normalizedKeys = Object.keys(row).reduce((acc, key) => {
        acc[normalize(key)] = row[key];
        return acc;
      }, {});

      const pick = (aliases) => {
        for (const alias of aliases) {
          const val = normalizedKeys[normalize(alias)];
          if (val !== undefined) return val;
        }
        return undefined;
      };

      return {
        title: pick(columnMap.title),
        description: pick(columnMap.description),
        aiDescription: pick(columnMap.aiDescription),
        mrp: pick(columnMap.mrp),
        srp: pick(columnMap.srp),
        discount: pick(columnMap.discount),
        keywords: pick(columnMap.keywords),
        offers: pick(columnMap.offers),
        vendorSite: pick(columnMap.vendorSite),
        brand: pick(columnMap.brand),
        productUrl: pick(columnMap.productUrl),
        mainImage: pick(columnMap.mainImage),
        createdAt: pick(columnMap.createdAt),
        updatedAt: pick(columnMap.updatedAt),
        externalId: pick(columnMap.externalId),
        categoryId: pick(columnMap.categoryId),
        subcategoryId: pick(columnMap.subcategoryId),
        subSubcategoryId: pick(columnMap.subSubcategoryId)
      };
    };

    const results = [];
    const docsToInsert = [];

    for (let index = 0; index < rows.length; index++) {
      const row = mapRow(rows[index]);
      const errors = [];

      // Required fields
      if (!row.title) errors.push('title is required');
      if (!row.mrp) errors.push('regular price (mrp) is required');
      if (!row.srp) errors.push('sale price (srp) is required');
      if (!row.mainImage) errors.push('product image url is required');

      // Category IDs: accept as provided IDs; also support new categoryPath using three level IDs if present
      const categoryPath = [];
      if (row.categoryId) categoryPath.push(row.categoryId);
      if (row.subcategoryId) categoryPath.push(row.subcategoryId);
      if (row.subSubcategoryId) categoryPath.push(row.subSubcategoryId);

      if (categoryPath.length === 0) {
        errors.push('at least Product Main/Sub/Sub Sub Category id must be provided');
      } else {
        // Validate ObjectId format for provided IDs
        for (let i = 0; i < categoryPath.length; i++) {
          if (!mongoose.Types.ObjectId.isValid(String(categoryPath[i]))) {
            errors.push(`invalid ObjectId at categoryPath index ${i}`);
          }
        }
      }

      // Numeric validation
      if (row.mrp && isNaN(row.mrp)) errors.push('mrp must be a number');
      if (row.srp && isNaN(row.srp)) errors.push('srp must be a number');
      if (row.mrp && row.srp && parseFloat(row.srp) > parseFloat(row.mrp)) errors.push('srp cannot be greater than mrp');

      // aiDescription cannot be empty string if provided
      if (row.aiDescription !== undefined && String(row.aiDescription).trim().length === 0) errors.push('aiDescription cannot be empty');

      if (errors.length) {
        results.push({ row: index + 2, status: 'failed', errors }); // +2 accounts for header row and 1-indexing
        continue;
      }

      const finalCategoryId = categoryPath[0];
      const finalSubcategoryId = categoryPath[categoryPath.length - 1];

      const doc = {
        title: String(row.title).trim(),
        mrp: parseFloat(row.mrp),
        srp: parseFloat(row.srp),
        description: row.description ? String(row.description) : '',
        shortDescription: '',
        detailedDescription: '',
        aiDescription: row.aiDescription !== undefined ? String(row.aiDescription) : undefined,
        features: [],
        specifications: [],
        highlights: [],
        categoryId: finalCategoryId,
        subcategoryId: finalSubcategoryId,
        categoryPath: categoryPath,
        subcategoryPath: [], // will be built in create route normally; here we can leave empty or let DB hooks handle
        mainImage: String(row.mainImage).trim(),
        additionalImages: [],
        attributes: [],
        keywords: row.keywords ? String(row.keywords).split(',').map(s => s.trim()).filter(Boolean) : [],
        productUrl: row.productUrl ? String(row.productUrl).trim() : '',
        vendorSite: row.vendorSite ? String(row.vendorSite).trim() : '',
        scrapingHistoryId: null,
        scrapingInfo: undefined,
        createdBy: {
          id: req.admin.id,
          name: req.admin.name || 'Admin',
          email: req.admin.email
        }
      };

      docsToInsert.push(doc);
      results.push({ row: index + 2, status: 'queued' });
    }

    // Insert using insertMany with ordered:false to continue on errors at DB validation
    let inserted = [];
    let insertErrors = [];
    if (docsToInsert.length) {
      try {
        inserted = await Product.insertMany(docsToInsert, { ordered: false });
      } catch (e) {
        // e.writeErrors may contain per-document errors
        insertErrors = (e && e.writeErrors) ? e.writeErrors.map(w => ({ index: w.index, message: w.errmsg || w.message })) : [{ message: e.message }];
      }
    }

    // Merge DB errors back into results by position
    if (insertErrors.length) {
      for (const dbErr of insertErrors) {
        const rowNumber = (dbErr.index !== undefined ? dbErr.index : 0) + 2; // map to row
        const existing = results.find(r => r.row === rowNumber);
        if (existing) {
          existing.status = 'failed';
          existing.errors = existing.errors || [];
          existing.errors.push(dbErr.message || 'DB insert error');
        } else {
          results.push({ row: rowNumber, status: 'failed', errors: [dbErr.message || 'DB insert error'] });
        }
      }
    }

    // Mark successful rows
    let successCount = 0;
    for (let i = 0; i < results.length; i++) {
      if (results[i].status === 'queued') {
        results[i].status = 'success';
        successCount++;
      }
    }

    res.json({
      success: true,
      message: 'Bulk upload processed',
      data: {
        totalRows: rows.length,
        queued: docsToInsert.length,
        inserted: inserted.length,
        successes: successCount,
        failures: results.filter(r => r.status === 'failed').length,
        results
      }
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during bulk upload', error: 'Bulk upload failed' });
  }
});

// @route   POST /api/admin/products/assign-vendor
// @desc    Admin assigns multiple products to a vendor
// @access  Private (Admin only)
router.post('/assign-vendor', verifyAdminToken, async (req, res) => {
  try {
    const { vendorId, productIds } = req.body;

    // Validate input
    if (!vendorId || !productIds || !Array.isArray(productIds)) {
      return res.status(400).json({
        success: false,
        message: 'vendorId and productIds array are required',
        error: 'Missing required fields'
      });
    }

    // Debug logging
    console.log('Received vendorId:', vendorId, 'Type:', typeof vendorId);
    console.log('Received productIds:', productIds);

    // Validate vendorId format
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vendor ID format',
        error: `Vendor ID "${vendorId}" must be a 24 character hex string`
      });
    }

    // Validate productIds array
    if (productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one product ID is required',
        error: 'Empty product IDs array'
      });
    }

    // Validate all productIds format
    for (let i = 0; i < productIds.length; i++) {
      const productId = productIds[i];
      console.log(`Validating productId[${i}]:`, productId, 'Type:', typeof productId);
      
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID format in array',
          error: `Product ID "${productId}" at index ${i} must be a 24 character hex string`
        });
      }
    }

    // Check if vendor exists
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
        error: 'Vendor does not exist'
      });
    }

    // Check if all products exist
    const existingProducts = await Product.find({ _id: { $in: productIds } });
    if (existingProducts.length !== productIds.length) {
      const existingIds = existingProducts.map(p => p._id.toString());
      const invalidIds = productIds.filter(id => !existingIds.includes(id));
      return res.status(404).json({
        success: false,
        message: 'One or more products not found',
        error: `Invalid product IDs: ${invalidIds.join(', ')}`
      });
    }

    // Update all products with vendorId
    const updateResult = await Product.updateMany(
      { _id: { $in: productIds } },
      { vendorId: vendorId }
    );

    // Get updated products with vendor info
    const updatedProducts = await Product.find({ _id: { $in: productIds } })
      .populate('vendorId', 'name shopName email')
      .select('_id title vendorId updatedAt');

    res.json({
      success: true,
      message: 'Products assigned to vendor successfully',
      data: {
        vendor: {
          id: vendor._id,
          name: vendor.name,
          shopName: vendor.shopName,
          email: vendor.email
        },
        assignedProducts: updatedProducts.map(product => ({
          id: product._id,
          title: product.title,
          vendorId: product.vendorId,
          updatedAt: product.updatedAt
        })),
        summary: {
          totalProducts: productIds.length,
          updatedCount: updateResult.modifiedCount,
          vendorId: vendorId
        }
      }
    });

  } catch (error) {
    console.error('Assign products to vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while assigning products to vendor',
      error: 'Product assignment failed'
    });
  }
});

// @route   POST /api/admin/products
// @desc    Admin creates a new product
// @access  Private (Admin only)
router.post('/', verifyAdminToken, async (req, res) => {
  try {
    const { title, mrp, srp, description, shortDescription, detailedDescription, aiDescription, features, specifications, highlights, categoryId, subcategoryId, categoryPath, attributes, keywords, mainImage, additionalImages, productUrl, vendorSite, scrapingHistoryId, scrapingInfo } = req.body;

    // Validate required fields - support both old and new structure
    const hasOldStructure = categoryId && subcategoryId;
    const hasNewStructure = categoryPath && Array.isArray(categoryPath) && categoryPath.length > 0;
    
    if (!title || !mrp || !srp || !mainImage) {
      return res.status(400).json({
        success: false,
        message: 'Title, MRP, SRP, and mainImage are required fields',
        error: 'Missing required fields'
      });
    }

    if (!hasOldStructure && !hasNewStructure) {
      return res.status(400).json({
        success: false,
        message: 'Either (categoryId and subcategoryId) or categoryPath array is required',
        error: 'Missing category information'
      });
    }

    // Determine the category structure to use
    let finalCategoryId, finalSubcategoryId, finalCategoryPath;
    
    if (hasNewStructure) {
      // Use new categoryPath structure
      finalCategoryPath = categoryPath;
      finalCategoryId = categoryPath[0]; // First element is main category
      finalSubcategoryId = categoryPath[categoryPath.length - 1]; // Last element is final subcategory
    } else {
      // Use old structure (backward compatibility)
      finalCategoryId = categoryId;
      finalSubcategoryId = subcategoryId;
      finalCategoryPath = [categoryId, subcategoryId]; // Create path from old structure
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
    if (!mongoose.Types.ObjectId.isValid(finalCategoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format',
        error: 'Category ID must be a 24 character hex string'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(finalSubcategoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subcategory ID format',
        error: 'Subcategory ID must be a 24 character hex string'
      });
    }

    // Validate all categoryPath IDs if using new structure
    if (hasNewStructure) {
      for (let i = 0; i < finalCategoryPath.length; i++) {
        if (!mongoose.Types.ObjectId.isValid(finalCategoryPath[i])) {
          return res.status(400).json({
            success: false,
            message: `Invalid category ID format at index ${i}`,
            error: 'All category IDs in path must be 24 character hex strings'
          });
        }
      }
    }

    // Validate category exists and is active
    const category = await Category.findById(finalCategoryId);
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
    const subcategory = await Category.findById(finalSubcategoryId);
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

    // Check if subcategory belongs to the category (allow nested subcategories)
    const subcategoryParent = subcategory.parent || subcategory.parentCategory;
    if (!subcategoryParent) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory must have a parent category',
        error: 'Invalid subcategory structure'
      });
    }

    // Function to check if subcategory belongs to the category (including nested relationships)
    const isSubcategoryUnderCategory = async (subcategoryId, categoryId) => {
      // If subcategoryId and categoryId are the same, it means we're using the same category as both
      if (subcategoryId.toString() === categoryId.toString()) {
        return true;
      }
      
      const subcategory = await Category.findById(subcategoryId);
      if (!subcategory) return false;
      
      const parent = subcategory.parent || subcategory.parentCategory;
      if (!parent) return false;
      
      // If direct parent matches, return true
      if (parent.toString() === categoryId) return true;
      
      // If parent is also a subcategory, check recursively
      const parentCategory = await Category.findById(parent);
      if (parentCategory && parentCategory.isSubcategory) {
        return await isSubcategoryUnderCategory(parent, categoryId);
      }
      
      return false;
    };

    // Check if subcategory belongs to the category (including nested relationships)
    const isValidRelationship = await isSubcategoryUnderCategory(finalSubcategoryId, finalCategoryId);
    if (!isValidRelationship) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory does not belong to the specified category',
        error: 'Invalid category-subcategory relationship'
      });
    }

    // Build subcategory path (hierarchy from main category to final subcategory)
    const buildSubcategoryPath = async (subcategoryId, categoryId) => {
      const path = [];
      
      // If we have a categoryPath array, use it to build the path
      if (hasNewStructure && finalCategoryPath && finalCategoryPath.length > 0) {
        for (let i = 0; i < finalCategoryPath.length; i++) {
          const category = await Category.findById(finalCategoryPath[i]);
          if (category) {
            path.push({
              _id: category._id,
              name: category.name,
              slug: category.slug,
              level: i
            });
          }
        }
        return path;
      }
      
      // Fallback to the old method for backward compatibility
      let currentId = subcategoryId;
      let level = 1;

      while (currentId && currentId.toString() !== categoryId.toString()) {
        const currentCategory = await Category.findById(currentId);
        if (!currentCategory) break;

        path.unshift({
          _id: currentCategory._id,
          name: currentCategory.name,
          slug: currentCategory.slug,
          level: level
        });

        currentId = currentCategory.parent || currentCategory.parentCategory;
        level++;
      }

      // Add the main category at the beginning
      const mainCategory = await Category.findById(categoryId);
      if (mainCategory) {
        path.unshift({
          _id: mainCategory._id,
          name: mainCategory.name,
          slug: mainCategory.slug,
          level: 0
        });
      }

      return path;
    };

    console.log('Building subcategory path...');
    const subcategoryPath = await buildSubcategoryPath(finalSubcategoryId, finalCategoryId);
    console.log('Subcategory path built:', subcategoryPath);

    // Validate and sanitize main image URL format
    const imageUrlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
    if (!imageUrlRegex.test(mainImage)) {
      return res.status(400).json({
        success: false,
        message: 'Main image must be a valid image URL (jpg, jpeg, png, gif, webp, svg)',
        error: 'Invalid main image URL format'
      });
    }

    // Additional security: Check for malicious URLs
    const maliciousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i
    ];
    
    if (maliciousPatterns.some(pattern => pattern.test(mainImage))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image URL format',
        error: 'Potentially malicious URL detected'
      });
    }

    // Validate additional images if provided
    if (additionalImages && Array.isArray(additionalImages)) {
      // Limit number of additional images
      if (additionalImages.length > 10) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 10 additional images allowed',
          error: 'Too many additional images'
        });
      }

      for (const imageUrl of additionalImages) {
        // More flexible URL validation for additional images (allow protocol-relative URLs and URLs without extensions)
        const flexibleImageUrlRegex = /^(https?:\/\/|\/\/).+/;
        if (!flexibleImageUrlRegex.test(imageUrl)) {
          return res.status(400).json({
            success: false,
            message: 'All additional images must be valid URLs starting with http://, https://, or //',
            error: 'Invalid additional image URL format'
          });
        }

        // Check for malicious URLs in additional images
        if (maliciousPatterns.some(pattern => pattern.test(imageUrl))) {
          return res.status(400).json({
            success: false,
            message: 'Invalid additional image URL format',
            error: 'Potentially malicious URL detected in additional images'
          });
        }
      }
    }

    // Validate specifications format if provided
    if (specifications && Array.isArray(specifications)) {
      for (const spec of specifications) {
        if (!spec.key || !spec.value) {
          return res.status(400).json({
            success: false,
            message: 'Each specification must have both key and value',
            error: 'Invalid specification format'
          });
        }
      }
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

    // Validate productUrl if provided
    if (productUrl) {
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(productUrl)) {
        return res.status(400).json({
          success: false,
          message: 'Product URL must be a valid URL starting with http:// or https://',
          error: 'Invalid product URL format'
        });
      }
    }

    // Validate vendorSite if provided (now accepts vendor names like Flipkart, Amazon, etc.)
    if (vendorSite && (vendorSite.length < 2 || vendorSite.length > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Vendor site name must be between 2 and 100 characters',
        error: 'Invalid vendor site name length'
      });
    }

    // Validate scrapingHistoryId if provided
    if (scrapingHistoryId && !mongoose.Types.ObjectId.isValid(scrapingHistoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scraping history ID format',
        error: 'Scraping history ID must be a 24 character hex string'
      });
    }

    // Check if scraping history exists if provided
    if (scrapingHistoryId) {
      const scrapingHistory = await ScrapingHistory.findById(scrapingHistoryId);
      if (!scrapingHistory) {
        return res.status(404).json({
          success: false,
          message: 'Scraping history not found',
          error: 'Scraping history does not exist'
        });
      }
    }

    // Validate aiDescription if provided (reject empty string)
    if (aiDescription !== undefined && typeof aiDescription === 'string' && aiDescription.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'AI description cannot be an empty string',
        error: 'Invalid aiDescription'
      });
    }

    // Create new product
    console.log('Creating product with data:', {
      title,
      mrp: parseFloat(mrp),
      srp: parseFloat(srp),
      categoryId: finalCategoryId,
      subcategoryId: finalSubcategoryId,
      categoryPath: finalCategoryPath,
      subcategoryPath: subcategoryPath
    });
    
    const product = new Product({
      title,
      mrp: parseFloat(mrp),
      srp: parseFloat(srp),
      description: description || '',
      shortDescription: shortDescription || '',
      detailedDescription: detailedDescription || '',
      aiDescription: aiDescription !== undefined ? aiDescription : undefined,
      features: features || [],
      specifications: specifications || [],
      highlights: highlights || [],
      categoryId: finalCategoryId,
      subcategoryId: finalSubcategoryId,
      categoryPath: finalCategoryPath,
      subcategoryPath: subcategoryPath,
      mainImage,
      additionalImages: additionalImages || [],
      attributes: attributes || [],
      keywords: keywords || [],
      productUrl: productUrl || '',
      vendorSite: vendorSite || '',
      scrapingHistoryId: scrapingHistoryId || null,
      scrapingInfo: scrapingInfo || {
        wasScraped: false,
        scrapedFrom: {
          platform: null,
          url: null,
          scrapedAt: null
        }
      },
      createdBy: {
        id: req.admin.id,
        name: req.admin.name || 'Admin',
        email: req.admin.email
      }
    });

    await product.save();

    // Populate category, subcategory, and scraping history details
    await product.populate([
      { path: 'categoryId', select: 'name slug isActive' },
      { path: 'subcategoryId', select: 'name slug isActive' },
      { path: 'scrapingHistoryId', select: 'platform productType category status totalProductsScraped successfulProducts' }
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
          aiDescription: product.aiDescription,
          category: product.categoryId ? {
            id: product.categoryId._id,
            name: product.categoryId.name,
            slug: product.categoryId.slug,
            isActive: product.categoryId.isActive
          } : null,
          subcategory: product.subcategoryId ? {
            id: product.subcategoryId._id,
            name: product.subcategoryId.name,
            slug: product.subcategoryId.slug,
            isActive: product.subcategoryId.isActive
          } : null,
          subcategoryPath: product.subcategoryPath,
          categoryPath: product.categoryPath,
          mainImage: product.mainImage,
          additionalImages: product.additionalImages,
          shortDescription: product.shortDescription,
          detailedDescription: product.detailedDescription,
          features: product.features,
          aiDescription: product.aiDescription,
          specifications: product.specifications,
          highlights: product.highlights,
          attributes: product.attributes,
          keywords: product.keywords,
          productUrl: product.productUrl,
          vendorSite: product.vendorSite,
          scrapingHistory: product.scrapingHistoryId ? {
            id: product.scrapingHistoryId._id,
            platform: product.scrapingHistoryId.platform,
            productType: product.scrapingHistoryId.productType,
            category: product.scrapingHistoryId.category,
            status: product.scrapingHistoryId.status,
            totalProductsScraped: product.scrapingHistoryId.totalProductsScraped,
            successfulProducts: product.scrapingHistoryId.successfulProducts
          } : null,
          scrapingInfo: product.scrapingInfo,
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
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return more specific error information
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Product validation failed',
        error: error.message,
        details: error.errors
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating product',
      error: error.message || 'Product creation failed'
    });
  }
});

// @route   GET /api/admin/products
// @desc    Admin gets all products with pagination, search, and date filtering
// @access  Private (Admin only)
router.get('/', verifyAdminToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '',
      createdFrom,
      createdTo,
      updatedFrom,
      updatedTo
    } = req.query;

    // Build search query
    const searchQuery = {};
    
    // Text search
    if (search) {
      searchQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { keywords: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Date filtering for creation date
    if (createdFrom || createdTo) {
      searchQuery.createdAt = {};
      if (createdFrom) {
        const fromDate = new Date(createdFrom);
        if (isNaN(fromDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid createdFrom date format',
            error: 'createdFrom must be a valid date (YYYY-MM-DD)'
          });
        }
        searchQuery.createdAt.$gte = fromDate;
      }
      if (createdTo) {
        const toDate = new Date(createdTo);
        if (isNaN(toDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid createdTo date format',
            error: 'createdTo must be a valid date (YYYY-MM-DD)'
          });
        }
        // Add one day to include the entire end date
        const endDate = new Date(toDate);
        endDate.setDate(endDate.getDate() + 1);
        searchQuery.createdAt.$lt = endDate;
      }
    }

    // Date filtering for update date
    if (updatedFrom || updatedTo) {
      searchQuery.updatedAt = {};
      if (updatedFrom) {
        const fromDate = new Date(updatedFrom);
        if (isNaN(fromDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid updatedFrom date format',
            error: 'updatedFrom must be a valid date (YYYY-MM-DD)'
          });
        }
        searchQuery.updatedAt.$gte = fromDate;
      }
      if (updatedTo) {
        const toDate = new Date(updatedTo);
        if (isNaN(toDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid updatedTo date format',
            error: 'updatedTo must be a valid date (YYYY-MM-DD)'
          });
        }
        // Add one day to include the entire end date
        const endDate = new Date(toDate);
        endDate.setDate(endDate.getDate() + 1);
        searchQuery.updatedAt.$lt = endDate;
      }
    }

    // Get products with pagination and populate category/subcategory/scraping history
    const products = await Product.find(searchQuery)
      .populate('categoryId', 'name slug isActive')
      .populate('subcategoryId', 'name slug isActive')
      .populate('scrapingHistoryId', 'platform productType category status totalProductsScraped successfulProducts')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(searchQuery);

    // Format response with null safety
    const formattedProducts = products.map(product => ({
      id: product._id,
      title: product.title,
      mrp: product.mrp,
      srp: product.srp,
      description: product.description,
      aiDescription: product.aiDescription,
      category: product.categoryId ? {
        id: product.categoryId._id,
        name: product.categoryId.name,
        slug: product.categoryId.slug,
        isActive: product.categoryId.isActive
      } : null,
      subcategory: product.subcategoryId ? {
        id: product.subcategoryId._id,
        name: product.subcategoryId.name,
        slug: product.subcategoryId.slug,
        isActive: product.subcategoryId.isActive
      } : null,
      subcategoryPath: product.subcategoryPath,
      categoryPath: product.categoryPath,
      mainImage: product.mainImage,
      additionalImages: product.additionalImages,
      shortDescription: product.shortDescription,
      detailedDescription: product.detailedDescription,
      features: product.features,
      specifications: product.specifications,
      highlights: product.highlights,
      attributes: product.attributes,
      keywords: product.keywords,
      productUrl: product.productUrl,
      vendorSite: product.vendorSite,
      scrapingHistory: product.scrapingHistoryId ? {
        id: product.scrapingHistoryId._id,
        platform: product.scrapingHistoryId.platform,
        productType: product.scrapingHistoryId.productType,
        category: product.scrapingHistoryId.category,
        status: product.scrapingHistoryId.status,
        totalProductsScraped: product.scrapingHistoryId.totalProductsScraped,
        successfulProducts: product.scrapingHistoryId.successfulProducts
      } : null,
      scrapingInfo: product.scrapingInfo,
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
        },
        filters: {
          search: search || null,
          createdFrom: createdFrom || null,
          createdTo: createdTo || null,
          updatedFrom: updatedFrom || null,
          updatedTo: updatedTo || null
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
      .populate('subcategoryId', 'name slug isActive')
      .populate('scrapingHistoryId', 'platform productType category status totalProductsScraped successfulProducts');

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
          category: product.categoryId ? {
            id: product.categoryId._id,
            name: product.categoryId.name,
            slug: product.categoryId.slug,
            isActive: product.categoryId.isActive
          } : null,
          subcategory: product.subcategoryId ? {
            id: product.subcategoryId._id,
            name: product.subcategoryId.name,
            slug: product.subcategoryId.slug,
            isActive: product.subcategoryId.isActive
          } : null,
          subcategoryPath: product.subcategoryPath,
          categoryPath: product.categoryPath,
          mainImage: product.mainImage,
          additionalImages: product.additionalImages,
          shortDescription: product.shortDescription,
          detailedDescription: product.detailedDescription,
          aiDescription: product.aiDescription,
          features: product.features,
          specifications: product.specifications,
          highlights: product.highlights,
          attributes: product.attributes,
          keywords: product.keywords,
          productUrl: product.productUrl,
          vendorSite: product.vendorSite,
          scrapingHistory: product.scrapingHistoryId ? {
            id: product.scrapingHistoryId._id,
            platform: product.scrapingHistoryId.platform,
            productType: product.scrapingHistoryId.productType,
            category: product.scrapingHistoryId.category,
            status: product.scrapingHistoryId.status,
            totalProductsScraped: product.scrapingHistoryId.totalProductsScraped,
            successfulProducts: product.scrapingHistoryId.successfulProducts
          } : null,
          scrapingInfo: product.scrapingInfo,
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

    const { title, mrp, srp, description, shortDescription, detailedDescription, aiDescription, features, specifications, highlights, attributes, keywords, isActive, mainImage, additionalImages, productUrl, vendorSite } = req.body;

    // Validate input
    if (!title && !mrp && !srp && !description && !shortDescription && !detailedDescription && !aiDescription && !features && !specifications && !highlights && !attributes && !keywords && isActive === undefined && !mainImage && !additionalImages && !productUrl && !vendorSite) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one field to update',
        error: 'No fields to update'
      });
    }
    // Validate aiDescription if provided (reject empty string)
    if (aiDescription !== undefined && typeof aiDescription === 'string' && aiDescription.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'AI description cannot be an empty string',
        error: 'Invalid aiDescription'
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

    // Validate main image URL format if provided
    if (mainImage) {
      const imageUrlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
      if (!imageUrlRegex.test(mainImage)) {
        return res.status(400).json({
          success: false,
          message: 'Main image must be a valid image URL (jpg, jpeg, png, gif, webp, svg)',
          error: 'Invalid main image URL format'
        });
      }
    }

    // Validate additional images if provided
    if (additionalImages && Array.isArray(additionalImages)) {
      const flexibleImageUrlRegex = /^(https?:\/\/|\/\/).+/;
      for (const imageUrl of additionalImages) {
        if (!flexibleImageUrlRegex.test(imageUrl)) {
          return res.status(400).json({
            success: false,
            message: 'All additional images must be valid URLs starting with http://, https://, or //',
            error: 'Invalid additional image URL format'
          });
        }
      }
    }

    // Validate specifications format if provided
    if (specifications && Array.isArray(specifications)) {
      for (const spec of specifications) {
        if (!spec.key || !spec.value) {
          return res.status(400).json({
            success: false,
            message: 'Each specification must have both key and value',
            error: 'Invalid specification format'
          });
        }
      }
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

    // Validate productUrl if provided
    if (productUrl) {
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(productUrl)) {
        return res.status(400).json({
          success: false,
          message: 'Product URL must be a valid URL starting with http:// or https://',
          error: 'Invalid product URL format'
        });
      }
    }

    // Validate vendorSite if provided (now accepts vendor names like Flipkart, Amazon, etc.)
    if (vendorSite && (vendorSite.length < 2 || vendorSite.length > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Vendor site name must be between 2 and 100 characters',
        error: 'Invalid vendor site name length'
      });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (mrp !== undefined) updateData.mrp = parseFloat(mrp);
    if (srp !== undefined) updateData.srp = parseFloat(srp);
    if (description !== undefined) updateData.description = description;
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription;
    if (detailedDescription !== undefined) updateData.detailedDescription = detailedDescription;
    if (aiDescription !== undefined) updateData.aiDescription = aiDescription;
    if (features) updateData.features = features;
    if (specifications) updateData.specifications = specifications;
    if (highlights) updateData.highlights = highlights;
    if (mainImage) updateData.mainImage = mainImage;
    if (additionalImages) updateData.additionalImages = additionalImages;
    if (attributes) updateData.attributes = attributes;
    if (keywords) updateData.keywords = keywords;
    if (productUrl !== undefined) updateData.productUrl = productUrl;
    if (vendorSite !== undefined) updateData.vendorSite = vendorSite;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Explicitly prevent createdAt from being modified and ensure updatedAt is set
    updateData.updatedAt = new Date();

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: true, 
        timestamps: false, // Disable automatic timestamps since we're handling them manually
        overwrite: false // Prevent overwriting the entire document
      }
    ).populate([
      { path: 'categoryId', select: 'name slug isActive' },
      { path: 'subcategoryId', select: 'name slug isActive' }
    ]);

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
          category: product.categoryId ? {
            id: product.categoryId._id,
            name: product.categoryId.name,
            slug: product.categoryId.slug,
            isActive: product.categoryId.isActive
          } : null,
          subcategory: product.subcategoryId ? {
            id: product.subcategoryId._id,
            name: product.subcategoryId.name,
            slug: product.subcategoryId.slug,
            isActive: product.subcategoryId.isActive
          } : null,
          subcategoryPath: product.subcategoryPath,
          categoryPath: product.categoryPath,
          mainImage: product.mainImage,
          additionalImages: product.additionalImages,
          shortDescription: product.shortDescription,
          detailedDescription: product.detailedDescription,
          features: product.features,
          specifications: product.specifications,
          highlights: product.highlights,
          attributes: product.attributes,
          keywords: product.keywords,
          productUrl: product.productUrl,
          vendorSite: product.vendorSite,
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

// @route   PATCH /api/admin/products/:id
// @desc    Admin partially updates product details (for specific fields)
// @access  Private (Admin only)
router.patch('/:id', verifyAdminToken, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
        error: 'ObjectId must be a 24 character hex string'
      });
    }

    const updateData = req.body;
    // Validate aiDescription if provided (reject empty string)
    if (updateData.aiDescription !== undefined && typeof updateData.aiDescription === 'string' && updateData.aiDescription.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'AI description cannot be an empty string',
        error: 'Invalid aiDescription'
      });
    }
    
    // Remove any fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt; // Prevent createdAt from being modified
    delete updateData.createdBy; // Prevent createdBy from being modified

    // Validate that at least one field is provided
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one field to update',
        error: 'No fields to update'
      });
    }

    // Explicitly set updatedAt to current date
    updateData.updatedAt = new Date();

    // Validate specific fields if provided
    if (updateData.mrp && isNaN(updateData.mrp)) {
      return res.status(400).json({
        success: false,
        message: 'MRP must be a valid number',
        error: 'Invalid MRP format'
      });
    }

    if (updateData.srp && isNaN(updateData.srp)) {
      return res.status(400).json({
        success: false,
        message: 'SRP must be a valid number',
        error: 'Invalid SRP format'
      });
    }

    if (updateData.mrp && updateData.srp && parseFloat(updateData.srp) > parseFloat(updateData.mrp)) {
      return res.status(400).json({
        success: false,
        message: 'SRP cannot be greater than MRP',
        error: 'Invalid pricing'
      });
    }

    // Validate productUrl if provided
    if (updateData.productUrl) {
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(updateData.productUrl)) {
        return res.status(400).json({
          success: false,
          message: 'Product URL must be a valid URL starting with http:// or https://',
          error: 'Invalid product URL format'
        });
      }
    }

    // Validate vendorSite if provided
    if (updateData.vendorSite && (updateData.vendorSite.length < 2 || updateData.vendorSite.length > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Vendor site name must be between 2 and 100 characters',
        error: 'Invalid vendor site name length'
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: true, 
        timestamps: false, // Disable automatic timestamps since we're handling them manually
        overwrite: false // Prevent overwriting the entire document
      }
    ).populate([
      { path: 'categoryId', select: 'name slug isActive' },
      { path: 'subcategoryId', select: 'name slug isActive' }
    ]);

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
          category: product.categoryId ? {
            id: product.categoryId._id,
            name: product.categoryId.name,
            slug: product.categoryId.slug,
            isActive: product.categoryId.isActive
          } : null,
          subcategory: product.subcategoryId ? {
            id: product.subcategoryId._id,
            name: product.subcategoryId.name,
            slug: product.subcategoryId.slug,
            isActive: product.subcategoryId.isActive
          } : null,
          subcategoryPath: product.subcategoryPath,
          categoryPath: product.categoryPath,
          mainImage: product.mainImage,
          additionalImages: product.additionalImages,
          shortDescription: product.shortDescription,
          detailedDescription: product.detailedDescription,
          features: product.features,
          specifications: product.specifications,
          highlights: product.highlights,
          attributes: product.attributes,
          keywords: product.keywords,
          productUrl: product.productUrl,
          vendorSite: product.vendorSite,
          isActive: product.isActive,
          profitMargin: product.profitMargin,
          createdBy: product.createdBy,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Patch product error:', error);
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
