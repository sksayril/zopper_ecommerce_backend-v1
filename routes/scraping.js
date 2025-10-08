const express = require('express');
const mongoose = require('mongoose');
const ScrapingHistory = require('../models/ScrapingHistory');
const Product = require('../models/Product');
const { verifyAdminToken } = require('../middleware/adminAuth');

const router = express.Router();

// @route   POST /api/admin/scraping/start
// @desc    Admin starts a new scraping session
// @access  Private (Admin only)
router.post('/start', verifyAdminToken, async (req, res) => {
  try {
    const { 
      platform, 
      scrapedUrl, 
      productType, 
      category, 
      notes,
      userAgent,
      ipAddress 
    } = req.body;

    // Validate required fields
    if (!platform || !scrapedUrl || !productType || !category) {
      return res.status(400).json({
        success: false,
        message: 'Platform, scraped URL, product type, and category are required',
        error: 'Missing required fields'
      });
    }

    // Validate platform
    const validPlatforms = ['flipkart', 'amazon', 'myntra', 'nykaa', 'ajio', 'meesho', 'snapdeal', 'paytm', 'other'];
    if (!validPlatforms.includes(platform.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid platform',
        error: `Platform must be one of: ${validPlatforms.join(', ')}`
      });
    }

    // Validate URL format
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(scrapedUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scraped URL format',
        error: 'URL must start with http:// or https://'
      });
    }

    // Create new scraping history record
    const scrapingHistory = new ScrapingHistory({
      platform: platform.toLowerCase(),
      scrapedUrl,
      productType,
      category,
      status: 'pending',
      totalProductsScraped: 0,
      successfulProducts: 0,
      failedProducts: 0,
      scrapingMetadata: {
        startTime: new Date(),
        userAgent: userAgent || req.get('User-Agent') || '',
        ipAddress: ipAddress || req.ip || req.connection.remoteAddress || ''
      },
      errorInfo: {
        hasError: false
      },
      scrapedData: {
        productTitles: [],
        productUrls: [],
        productPrices: [],
        productImages: []
      },
      createdBy: {
        id: req.admin.id,
        name: req.admin.name || 'Admin',
        email: req.admin.email
      },
      notes: notes || ''
    });

    await scrapingHistory.save();

    res.status(201).json({
      success: true,
      message: 'Scraping session started successfully',
      data: {
        scrapingSession: {
          id: scrapingHistory._id,
          platform: scrapingHistory.platform,
          scrapedUrl: scrapingHistory.scrapedUrl,
          productType: scrapingHistory.productType,
          category: scrapingHistory.category,
          status: scrapingHistory.status,
          startTime: scrapingHistory.scrapingMetadata.startTime,
          createdBy: scrapingHistory.createdBy,
          notes: scrapingHistory.notes
        }
      }
    });

  } catch (error) {
    console.error('Start scraping session error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while starting scraping session',
      error: 'Scraping session creation failed'
    });
  }
});

// @route   POST /api/admin/scraping/:id/update
// @desc    Admin updates scraping session with results
// @access  Private (Admin only)
router.post('/:id/update', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      status, 
      totalProductsScraped, 
      successfulProducts, 
      failedProducts,
      scrapedData,
      errorInfo,
      notes 
    } = req.body;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scraping session ID format',
        error: 'ObjectId must be a 24 character hex string'
      });
    }

    // Find the scraping session
    const scrapingSession = await ScrapingHistory.findById(id);
    if (!scrapingSession) {
      return res.status(404).json({
        success: false,
        message: 'Scraping session not found',
        error: 'Scraping session does not exist'
      });
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['pending', 'in_progress', 'completed', 'failed', 'partial'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status',
          error: `Status must be one of: ${validStatuses.join(', ')}`
        });
      }
    }

    // Update fields
    const updateData = {};
    if (status) updateData.status = status;
    if (totalProductsScraped !== undefined) updateData.totalProductsScraped = totalProductsScraped;
    if (successfulProducts !== undefined) updateData.successfulProducts = successfulProducts;
    if (failedProducts !== undefined) updateData.failedProducts = failedProducts;
    if (scrapedData) updateData.scrapedData = scrapedData;
    if (errorInfo) updateData.errorInfo = errorInfo;
    if (notes !== undefined) updateData.notes = notes;

    // Set end time if status is completed or failed
    if (status === 'completed' || status === 'failed') {
      updateData['scrapingMetadata.endTime'] = new Date();
    }

    // Update the scraping session
    const updatedSession = await ScrapingHistory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Scraping session updated successfully',
      data: {
        scrapingSession: {
          id: updatedSession._id,
          platform: updatedSession.platform,
          scrapedUrl: updatedSession.scrapedUrl,
          productType: updatedSession.productType,
          category: updatedSession.category,
          status: updatedSession.status,
          totalProductsScraped: updatedSession.totalProductsScraped,
          successfulProducts: updatedSession.successfulProducts,
          failedProducts: updatedSession.failedProducts,
          successRate: updatedSession.successRate,
          failureRate: updatedSession.failureRate,
          startTime: updatedSession.scrapingMetadata.startTime,
          endTime: updatedSession.scrapingMetadata.endTime,
          duration: updatedSession.formattedDuration,
          scrapedData: updatedSession.scrapedData,
          errorInfo: updatedSession.errorInfo,
          createdBy: updatedSession.createdBy,
          notes: updatedSession.notes,
          createdAt: updatedSession.createdAt,
          updatedAt: updatedSession.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Update scraping session error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating scraping session',
      error: 'Scraping session update failed'
    });
  }
});

// @route   POST /api/admin/scraping/:id/add-product
// @desc    Admin adds a scraped product to the session
// @access  Private (Admin only)
router.post('/:id/add-product', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      productId, 
      productTitle, 
      productUrl, 
      productPrice, 
      productImage,
      isSuccessful = true 
    } = req.body;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scraping session ID format',
        error: 'ObjectId must be a 24 character hex string'
      });
    }

    // Find the scraping session
    const scrapingSession = await ScrapingHistory.findById(id);
    if (!scrapingSession) {
      return res.status(404).json({
        success: false,
        message: 'Scraping session not found',
        error: 'Scraping session does not exist'
      });
    }

    // Validate required fields
    if (!productTitle || !productUrl) {
      return res.status(400).json({
        success: false,
        message: 'Product title and URL are required',
        error: 'Missing required fields'
      });
    }

    // Update scraping session with new product data
    const updateData = {
      $push: {
        'scrapedData.productTitles': productTitle,
        'scrapedData.productUrls': productUrl
      },
      $inc: {
        totalProductsScraped: 1
      }
    };

    if (productPrice !== undefined) {
      updateData.$push['scrapedData.productPrices'] = productPrice;
    }

    if (productImage) {
      updateData.$push['scrapedData.productImages'] = productImage;
    }

    if (isSuccessful) {
      updateData.$inc.successfulProducts = 1;
    } else {
      updateData.$inc.failedProducts = 1;
    }

    const updatedSession = await ScrapingHistory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // If productId is provided, update the product with scraping info
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      const productUpdateData = {
        scrapingHistoryId: id,
        'scrapingInfo.wasScraped': true,
        'scrapingInfo.scrapedFrom.platform': scrapingSession.platform,
        'scrapingInfo.scrapedFrom.url': productUrl,
        'scrapingInfo.scrapedFrom.scrapedAt': new Date()
      };

      await Product.findByIdAndUpdate(productId, productUpdateData);
    }

    res.json({
      success: true,
      message: 'Product added to scraping session successfully',
      data: {
        scrapingSession: {
          id: updatedSession._id,
          totalProductsScraped: updatedSession.totalProductsScraped,
          successfulProducts: updatedSession.successfulProducts,
          failedProducts: updatedSession.failedProducts,
          successRate: updatedSession.successRate,
          failureRate: updatedSession.failureRate
        },
        addedProduct: {
          title: productTitle,
          url: productUrl,
          price: productPrice,
          image: productImage,
          isSuccessful
        }
      }
    });

  } catch (error) {
    console.error('Add product to scraping session error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while adding product to scraping session',
      error: 'Product addition failed'
    });
  }
});

// @route   GET /api/admin/scraping
// @desc    Admin gets all scraping sessions with pagination and filters
// @access  Private (Admin only)
router.get('/', verifyAdminToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      platform, 
      status, 
      productType, 
      category,
      startDate,
      endDate,
      search 
    } = req.query;

    // Build filter query
    const filterQuery = {};

    if (platform) {
      filterQuery.platform = platform.toLowerCase();
    }

    if (status) {
      filterQuery.status = status;
    }

    if (productType) {
      filterQuery.productType = { $regex: productType, $options: 'i' };
    }

    if (category) {
      filterQuery.category = { $regex: category, $options: 'i' };
    }

    if (startDate || endDate) {
      filterQuery['scrapingMetadata.startTime'] = {};
      if (startDate) {
        filterQuery['scrapingMetadata.startTime'].$gte = new Date(startDate);
      }
      if (endDate) {
        filterQuery['scrapingMetadata.startTime'].$lte = new Date(endDate);
      }
    }

    if (search) {
      filterQuery.$or = [
        { productType: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { 'scrapedData.productTitles': { $in: [new RegExp(search, 'i')] } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Get scraping sessions with pagination
    const scrapingSessions = await ScrapingHistory.find(filterQuery)
      .sort({ 'scrapingMetadata.startTime': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy.id', 'name email');

    // Get total count for pagination
    const totalSessions = await ScrapingHistory.countDocuments(filterQuery);

    // Format response
    const formattedSessions = scrapingSessions.map(session => ({
      id: session._id,
      platform: session.platform,
      scrapedUrl: session.scrapedUrl,
      productType: session.productType,
      category: session.category,
      status: session.status,
      totalProductsScraped: session.totalProductsScraped,
      successfulProducts: session.successfulProducts,
      failedProducts: session.failedProducts,
      successRate: session.successRate,
      failureRate: session.failureRate,
      startTime: session.scrapingMetadata.startTime,
      endTime: session.scrapingMetadata.endTime,
      duration: session.formattedDuration,
      errorInfo: session.errorInfo,
      createdBy: session.createdBy,
      notes: session.notes,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    }));

    res.json({
      success: true,
      message: 'Scraping sessions retrieved successfully',
      data: {
        scrapingSessions: formattedSessions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalSessions / limit),
          totalSessions: totalSessions,
          hasNext: page < Math.ceil(totalSessions / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get scraping sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching scraping sessions',
      error: 'Scraping sessions fetch failed'
    });
  }
});

// @route   GET /api/admin/scraping/:id
// @desc    Admin gets single scraping session by ID
// @access  Private (Admin only)
router.get('/:id', verifyAdminToken, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scraping session ID format',
        error: 'ObjectId must be a 24 character hex string'
      });
    }

    const scrapingSession = await ScrapingHistory.findById(req.params.id)
      .populate('createdBy.id', 'name email');

    if (!scrapingSession) {
      return res.status(404).json({
        success: false,
        message: 'Scraping session not found',
        error: 'Scraping session does not exist'
      });
    }

    res.json({
      success: true,
      message: 'Scraping session retrieved successfully',
      data: {
        scrapingSession: {
          id: scrapingSession._id,
          platform: scrapingSession.platform,
          scrapedUrl: scrapingSession.scrapedUrl,
          productType: scrapingSession.productType,
          category: scrapingSession.category,
          status: scrapingSession.status,
          totalProductsScraped: scrapingSession.totalProductsScraped,
          successfulProducts: scrapingSession.successfulProducts,
          failedProducts: scrapingSession.failedProducts,
          successRate: scrapingSession.successRate,
          failureRate: scrapingSession.failureRate,
          startTime: scrapingSession.scrapingMetadata.startTime,
          endTime: scrapingSession.scrapingMetadata.endTime,
          duration: scrapingSession.formattedDuration,
          userAgent: scrapingSession.scrapingMetadata.userAgent,
          ipAddress: scrapingSession.scrapingMetadata.ipAddress,
          scrapedData: scrapingSession.scrapedData,
          errorInfo: scrapingSession.errorInfo,
          createdBy: scrapingSession.createdBy,
          notes: scrapingSession.notes,
          createdAt: scrapingSession.createdAt,
          updatedAt: scrapingSession.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Get scraping session error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching scraping session',
      error: 'Scraping session fetch failed'
    });
  }
});

// @route   GET /api/admin/scraping/stats/overview
// @desc    Admin gets scraping statistics overview
// @access  Private (Admin only)
router.get('/stats/overview', verifyAdminToken, async (req, res) => {
  try {
    const { platform, startDate, endDate } = req.query;

    // Build filter query
    const filterQuery = {};
    if (platform) {
      filterQuery.platform = platform.toLowerCase();
    }
    if (startDate || endDate) {
      filterQuery['scrapingMetadata.startTime'] = {};
      if (startDate) {
        filterQuery['scrapingMetadata.startTime'].$gte = new Date(startDate);
      }
      if (endDate) {
        filterQuery['scrapingMetadata.startTime'].$lte = new Date(endDate);
      }
    }

    // Get overall statistics
    const overallStats = await ScrapingHistory.getScrapingStats(filterQuery);

    // Get platform-wise statistics
    const platformStats = await ScrapingHistory.aggregate([
      { $match: filterQuery },
      {
        $group: {
          _id: '$platform',
          totalSessions: { $sum: 1 },
          totalProductsScraped: { $sum: '$totalProductsScraped' },
          totalSuccessfulProducts: { $sum: '$successfulProducts' },
          totalFailedProducts: { $sum: '$failedProducts' },
          averageSuccessRate: {
            $avg: {
              $cond: [
                { $gt: ['$totalProductsScraped', 0] },
                { $multiply: [{ $divide: ['$successfulProducts', '$totalProductsScraped'] }, 100] },
                0
              ]
            }
          }
        }
      },
      { $sort: { totalSessions: -1 } }
    ]);

    // Get status-wise statistics
    const statusStats = await ScrapingHistory.aggregate([
      { $match: filterQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get recent sessions (last 10)
    const recentSessions = await ScrapingHistory.find(filterQuery)
      .sort({ 'scrapingMetadata.startTime': -1 })
      .limit(10)
      .select('platform productType category status totalProductsScraped successfulProducts scrapingMetadata.startTime')
      .populate('createdBy.id', 'name');

    res.json({
      success: true,
      message: 'Scraping statistics retrieved successfully',
      data: {
        overview: {
          totalScrapingSessions: overallStats.totalScrapingSessions,
          totalProductsScraped: overallStats.totalProductsScraped,
          totalSuccessfulProducts: overallStats.totalSuccessfulProducts,
          totalFailedProducts: overallStats.totalFailedProducts,
          averageSuccessRate: parseFloat(overallStats.averageSuccessRate.toFixed(2)),
          averageDuration: overallStats.averageDuration
        },
        platformStats: platformStats.map(stat => ({
          platform: stat._id,
          totalSessions: stat.totalSessions,
          totalProductsScraped: stat.totalProductsScraped,
          totalSuccessfulProducts: stat.totalSuccessfulProducts,
          totalFailedProducts: stat.totalFailedProducts,
          averageSuccessRate: parseFloat(stat.averageSuccessRate.toFixed(2))
        })),
        statusStats: statusStats.map(stat => ({
          status: stat._id,
          count: stat.count
        })),
        recentSessions: recentSessions.map(session => ({
          id: session._id,
          platform: session.platform,
          productType: session.productType,
          category: session.category,
          status: session.status,
          totalProductsScraped: session.totalProductsScraped,
          successfulProducts: session.successfulProducts,
          startTime: session.scrapingMetadata.startTime,
          createdBy: session.createdBy
        }))
      }
    });

  } catch (error) {
    console.error('Get scraping statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching scraping statistics',
      error: 'Scraping statistics fetch failed'
    });
  }
});

// @route   DELETE /api/admin/scraping/:id
// @desc    Admin deletes scraping session by ID
// @access  Private (Admin only)
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scraping session ID format',
        error: 'ObjectId must be a 24 character hex string'
      });
    }

    const scrapingSession = await ScrapingHistory.findByIdAndDelete(req.params.id);

    if (!scrapingSession) {
      return res.status(404).json({
        success: false,
        message: 'Scraping session not found',
        error: 'Scraping session does not exist'
      });
    }

    // Remove scraping history reference from products
    await Product.updateMany(
      { scrapingHistoryId: req.params.id },
      { 
        $unset: { 
          scrapingHistoryId: 1,
          'scrapingInfo.wasScraped': 1,
          'scrapingInfo.scrapedFrom': 1
        }
      }
    );

    res.json({
      success: true,
      message: 'Scraping session deleted successfully',
      data: {
        deletedSession: {
          id: scrapingSession._id,
          platform: scrapingSession.platform,
          productType: scrapingSession.productType,
          category: scrapingSession.category,
          totalProductsScraped: scrapingSession.totalProductsScraped
        }
      }
    });

  } catch (error) {
    console.error('Delete scraping session error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting scraping session',
      error: 'Scraping session deletion failed'
    });
  }
});

module.exports = router;
