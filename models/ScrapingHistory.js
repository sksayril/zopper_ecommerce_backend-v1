const mongoose = require('mongoose');

const scrapingHistorySchema = new mongoose.Schema({
  // Product information
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  
  // Scraping source information
  platform: {
    type: String,
    required: [true, 'Platform is required'],
    trim: true,
    enum: {
      values: ['flipkart', 'amazon', 'myntra', 'nykaa', 'ajio', 'meesho', 'snapdeal', 'paytm', 'other'],
      message: 'Platform must be one of: flipkart, amazon, myntra, nykaa, ajio, meesho, snapdeal, paytm, other'
    }
  },
  
  // URL that was scraped
  scrapedUrl: {
    type: String,
    required: [true, 'Scraped URL is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Scraped URL must be a valid URL starting with http:// or https://'
    }
  },
  
  // Product type/category that was scraped
  productType: {
    type: String,
    required: [true, 'Product type is required'],
    trim: true,
    maxlength: [100, 'Product type cannot exceed 100 characters']
  },
  
  // Category information
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [100, 'Category cannot exceed 100 characters']
  },
  
  // Scraping status
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['pending', 'in_progress', 'completed', 'failed', 'partial'],
      message: 'Status must be one of: pending, in_progress, completed, failed, partial'
    },
    default: 'pending'
  },
  
  // Total number of products scraped
  totalProductsScraped: {
    type: Number,
    required: [true, 'Total products scraped is required'],
    min: [0, 'Total products scraped cannot be negative'],
    default: 0
  },
  
  // Number of successful products scraped
  successfulProducts: {
    type: Number,
    required: [true, 'Successful products count is required'],
    min: [0, 'Successful products count cannot be negative'],
    default: 0
  },
  
  // Number of failed products
  failedProducts: {
    type: Number,
    required: [true, 'Failed products count is required'],
    min: [0, 'Failed products count cannot be negative'],
    default: 0
  },
  
  // Scraping metadata
  scrapingMetadata: {
    startTime: {
      type: Date,
      required: [true, 'Scraping start time is required']
    },
    endTime: {
      type: Date,
      default: null
    },
    duration: {
      type: Number, // Duration in milliseconds
      default: 0
    },
    userAgent: {
      type: String,
      trim: true,
      maxlength: [500, 'User agent cannot exceed 500 characters']
    },
    ipAddress: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true; // Optional field
          // Basic IP validation (IPv4 and IPv6)
          return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(v);
        },
        message: 'IP address must be a valid IPv4 or IPv6 address'
      }
    }
  },
  
  // Error information (if scraping failed)
  errorInfo: {
    hasError: {
      type: Boolean,
      default: false
    },
    errorMessage: {
      type: String,
      trim: true,
      maxlength: [1000, 'Error message cannot exceed 1000 characters']
    },
    errorCode: {
      type: String,
      trim: true,
      maxlength: [50, 'Error code cannot exceed 50 characters']
    },
    errorDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  
  // Scraped data summary
  scrapedData: {
    productTitles: [{
      type: String,
      trim: true,
      maxlength: [200, 'Product title cannot exceed 200 characters']
    }],
    productUrls: [{
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Product URL must be a valid URL'
      }
    }],
    productPrices: [{
      type: Number,
      min: [0, 'Product price cannot be negative']
    }],
    productImages: [{
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Product image URL must be a valid URL'
      }
    }]
  },
  
  // Created by information
  createdBy: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: [true, 'Created by admin ID is required']
    },
    name: {
      type: String,
      required: [true, 'Created by admin name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Created by admin email is required'],
      trim: true,
      lowercase: true
    }
  },
  
  // Additional notes
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
scrapingHistorySchema.index({ productId: 1 });
scrapingHistorySchema.index({ platform: 1 });
scrapingHistorySchema.index({ status: 1 });
scrapingHistorySchema.index({ 'scrapingMetadata.startTime': -1 });
scrapingHistorySchema.index({ 'scrapingMetadata.endTime': -1 });
scrapingHistorySchema.index({ createdAt: -1 });
scrapingHistorySchema.index({ createdBy: 1 });
scrapingHistorySchema.index({ productType: 1 });
scrapingHistorySchema.index({ category: 1 });
scrapingHistorySchema.index({ scrapedUrl: 1 });

// Compound indexes for common queries
scrapingHistorySchema.index({ platform: 1, status: 1 });
scrapingHistorySchema.index({ productType: 1, platform: 1 });
scrapingHistorySchema.index({ status: 1, createdAt: -1 });

// Pre-save middleware to calculate duration
scrapingHistorySchema.pre('save', function(next) {
  if (this.isModified('scrapingMetadata.endTime') && this.scrapingMetadata.endTime) {
    this.scrapingMetadata.duration = this.scrapingMetadata.endTime.getTime() - this.scrapingMetadata.startTime.getTime();
  }
  
  // Ensure total products scraped equals successful + failed
  if (this.isModified('successfulProducts') || this.isModified('failedProducts')) {
    this.totalProductsScraped = this.successfulProducts + this.failedProducts;
  }
  
  next();
});

// Pre-update middleware to ensure updatedAt is set on updates
scrapingHistorySchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate', 'findByIdAndUpdate'], function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Virtual for success rate calculation
scrapingHistorySchema.virtual('successRate').get(function() {
  if (this.totalProductsScraped > 0) {
    return ((this.successfulProducts / this.totalProductsScraped) * 100).toFixed(2);
  }
  return 0;
});

// Virtual for failure rate calculation
scrapingHistorySchema.virtual('failureRate').get(function() {
  if (this.totalProductsScraped > 0) {
    return ((this.failedProducts / this.totalProductsScraped) * 100).toFixed(2);
  }
  return 0;
});

// Virtual for formatted duration
scrapingHistorySchema.virtual('formattedDuration').get(function() {
  if (!this.scrapingMetadata.duration) return '0s';
  
  const duration = this.scrapingMetadata.duration;
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
});

// Ensure virtual fields are serialized
scrapingHistorySchema.set('toJSON', { virtuals: true });

// Static method to get scraping statistics
scrapingHistorySchema.statics.getScrapingStats = async function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: null,
        totalScrapingSessions: { $sum: 1 },
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
        },
        averageDuration: { $avg: '$scrapingMetadata.duration' }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalScrapingSessions: 0,
    totalProductsScraped: 0,
    totalSuccessfulProducts: 0,
    totalFailedProducts: 0,
    averageSuccessRate: 0,
    averageDuration: 0
  };
};

// Instance method to update scraping status
scrapingHistorySchema.methods.updateStatus = function(status, errorInfo = null) {
  this.status = status;
  
  if (status === 'completed' || status === 'failed') {
    this.scrapingMetadata.endTime = new Date();
  }
  
  if (errorInfo) {
    this.errorInfo = {
      hasError: true,
      errorMessage: errorInfo.message || '',
      errorCode: errorInfo.code || '',
      errorDetails: errorInfo.details || null
    };
  }
  
  return this.save();
};

module.exports = mongoose.model('ScrapingHistory', scrapingHistorySchema);
