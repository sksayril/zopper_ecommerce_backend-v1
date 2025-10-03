const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    minlength: [2, 'Product title must be at least 2 characters long'],
    maxlength: [200, 'Product title cannot exceed 200 characters']
  },
  mrp: {
    type: Number,
    required: [true, 'MRP (Maximum Retail Price) is required'],
    min: [0, 'MRP cannot be negative'],
    validate: {
      validator: function(v) {
        return v > 0;
      },
      message: 'MRP must be greater than 0'
    }
  },
  srp: {
    type: Number,
    required: [true, 'SRP (Selling Retail Price) is required'],
    min: [0, 'SRP cannot be negative'],
    validate: {
      validator: function(v) {
        return v > 0;
      },
      message: 'SRP must be greater than 0'
    }
  },
  description: {
    type: String,
    required: false,
    trim: true,
    maxlength: [2000, 'Product description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    required: false,
    trim: true,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  detailedDescription: {
    type: String,
    required: false,
    trim: true,
    maxlength: [5000, 'Detailed description cannot exceed 5000 characters']
  },
  features: [{
    type: String,
    trim: true,
    maxlength: [200, 'Feature cannot exceed 200 characters']
  }],
  specifications: [{
    key: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Specification key cannot exceed 50 characters']
    },
    value: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Specification value cannot exceed 200 characters']
    }
  }],
  highlights: [{
    type: String,
    trim: true,
    maxlength: [200, 'Highlight cannot exceed 200 characters']
  }],
  attributes: [{
    key: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Attribute key cannot exceed 50 characters']
    },
    value: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Attribute value cannot exceed 200 characters']
    }
  }],
  keywords: [{
    type: String,
    trim: true,
    maxlength: [50, 'Keyword cannot exceed 50 characters']
  }],
  mainImage: {
    type: String,
    required: [true, 'Main image URL is required'],
    trim: true,
    validate: {
      validator: function(v) {
        // Basic URL validation
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(v);
      },
      message: 'Main image must be a valid image URL (jpg, jpeg, png, gif, webp, svg)'
    }
  },
  additionalImages: [{
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // Basic URL validation for additional images
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(v);
      },
      message: 'Additional image must be a valid image URL (jpg, jpeg, png, gif, webp, svg)'
    }
  }],
  productUrl: {
    type: String,
    required: false,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        // Basic URL validation
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Product URL must be a valid URL starting with http:// or https://'
    }
  },
  vendorSite: {
    type: String,
    required: false,
    trim: true,
    maxlength: [100, 'Vendor site name cannot exceed 100 characters'],
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        // Allow common vendor names like Flipkart, Amazon, etc.
        return v.length >= 2 && v.length <= 100;
      },
      message: 'Vendor site name must be between 2 and 100 characters'
    }
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category ID is required']
  },
  subcategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Subcategory ID is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
productSchema.index({ title: 'text', keywords: 'text' });
productSchema.index({ createdBy: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ mrp: 1 });
productSchema.index({ srp: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ subcategoryId: 1 });
productSchema.index({ mainImage: 1 });
productSchema.index({ productUrl: 1 });
productSchema.index({ vendorSite: 1 });
productSchema.index({ createdAt: -1 });

// Virtual for profit margin calculation
productSchema.virtual('profitMargin').get(function() {
  if (this.mrp && this.srp) {
    return ((this.mrp - this.srp) / this.mrp * 100).toFixed(2);
  }
  return 0;
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
