const mongoose = require('mongoose');

const schedulerTaskSchema = new mongoose.Schema({
  taskName: {
    type: String,
    required: [true, 'Task name is required'],
    trim: true,
    maxlength: [150, 'Task name cannot exceed 150 characters']
  },

  taskType: {
    type: String,
    required: [true, 'Task type is required'],
    enum: {
      values: ['product', 'category'],
      message: 'Task type must be one of: product, category'
    }
  },

  platform: {
    type: String,
    required: [true, 'Platform is required'],
    trim: true,
    lowercase: true,
    enum: {
      values: ['flipkart', 'amazon', 'myntra', '1mg', 'nykaa', 'ajio', 'meesho', 'snapdeal', 'paytm', 'other'],
      message: 'Platform must be one of: flipkart, amazon, myntra, 1mg, nykaa, ajio, meesho, snapdeal, paytm, other'
    }
  },

  url: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^https?:\/\/.+/.test(v);
      },
      message: 'URL must be a valid URL starting with http:// or https://'
    }
  },

  // Hierarchical category selections
  mainCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  subSubCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  categoryPath: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],

  // Schedule window
  schedule: {
    startTime: { type: Date },
    endTime: { type: Date }
  },

  // Execution status of the task (lifecycle)
  status: {
    type: String,
    enum: {
      values: ['scheduled', 'running', 'completed', 'cancelled'],
      message: 'Status must be one of: scheduled, running, completed, cancelled'
    },
    default: 'scheduled'
  },

  // Result status of the task (outcome)
  resultStatus: {
    type: String,
    enum: {
      values: ['pending', 'passed', 'failed'],
      message: 'Result status must be one of: pending, passed, failed'
    },
    default: 'pending'
  },

  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },

  createdBy: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: [true, 'Created by admin ID is required'] },
    name: { type: String, required: [true, 'Created by admin name is required'], trim: true },
    email: { type: String, required: [true, 'Created by admin email is required'], trim: true, lowercase: true }
  }
}, { timestamps: true });

// Indexes
schedulerTaskSchema.index({ platform: 1, status: 1 });
schedulerTaskSchema.index({ 'schedule.startTime': 1 });
schedulerTaskSchema.index({ taskType: 1 });
schedulerTaskSchema.index({ createdAt: -1 });

// Ensure endTime is after startTime if both present
schedulerTaskSchema.pre('save', function(next) {
  const start = this.schedule?.startTime;
  const end = this.schedule?.endTime;
  if (start && end && end < start) {
    return next(new Error('End time cannot be earlier than start time'));
  }
  next();
});

module.exports = mongoose.model('SchedulerTask', schedulerTaskSchema);


