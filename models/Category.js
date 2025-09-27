const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    minlength: [2, 'Category name must be at least 2 characters long'],
    maxlength: [100, 'Category name cannot exceed 100 characters'],
    unique: true
  },
  description: {
    type: String,
    required: false,
    trim: true,
    maxlength: [500, 'Category description cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  isSubcategory: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  }
}, {
  timestamps: true
});

// Generate slug from name before saving
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    let baseSlug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    // If it's a subcategory, we'll make it unique by adding parent context
    if (this.isSubcategory && (this.parent || this.parentCategory)) {
      // We'll handle this in the route to ensure parent exists
      this.slug = baseSlug;
    } else {
      this.slug = baseSlug;
    }
  }
  next();
});

// Static method to build category tree recursively
categorySchema.statics.buildCategoryTree = async function(categories, parentId = null) {
  const tree = [];
  
  for (const category of categories) {
    // Check if this category belongs to the current parent (using either parent or parentCategory field)
    const categoryParent = category.parent || category.parentCategory;
    const isSubcategory = category.isSubcategory;
    
    if (categoryParent && categoryParent.toString() === parentId?.toString()) {
      const subcategories = await this.buildCategoryTree(categories, category._id);
      tree.push({
        id: category._id,
        name: category.name,
        description: category.description,
        slug: category.slug,
        isActive: category.isActive,
        createdBy: category.createdBy,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        subcategory: subcategories
      });
    } else if (!categoryParent && !parentId && !isSubcategory) {
      // This is a main category (no parent and not marked as subcategory)
      const subcategories = await this.buildCategoryTree(categories, category._id);
      tree.push({
        id: category._id,
        name: category.name,
        description: category.description,
        slug: category.slug,
        isActive: category.isActive,
        createdBy: category.createdBy,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        subcategory: subcategories
      });
    }
  }
  
  return tree;
};

// Index for better query performance
// Note: name and slug already have unique indexes from field definitions
categorySchema.index({ createdBy: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ isSubcategory: 1 });
categorySchema.index({ parent: 1, isSubcategory: 1 });
categorySchema.index({ parentCategory: 1, isSubcategory: 1 });

module.exports = mongoose.model('Category', categorySchema);
