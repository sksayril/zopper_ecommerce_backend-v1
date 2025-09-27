# Hierarchical Categories API Documentation

## Overview

This document describes the enhanced hierarchical categories API for the Zopper E-commerce Backend. The API now supports nested category structures with unlimited depth, allowing for main categories, subcategories, and nested subcategories.

## Features

- ✅ **Unlimited Nesting**: Support for unlimited nesting levels (subcategories under subcategories)
- ✅ **JWT Authentication**: Admin-only access with JWT tokens
- ✅ **Pagination**: Pagination applies only to main categories
- ✅ **Search**: Search across category names and descriptions
- ✅ **Filtering**: Filter by active/inactive status
- ✅ **Recursive Tree Building**: Automatic tree structure generation
- ✅ **Backward Compatibility**: Works with existing data structure
- ✅ **Complex Hierarchies**: Create deep category structures like Electronics → Smartphones → iPhone → iPhone 15

## API Endpoint

### GET /api/admin/categories

Retrieves all categories in a hierarchical tree structure.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or description
- `isActive` (optional): Filter by active status (true/false)

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/admin/categories?page=1&limit=10&search=Electronics&isActive=true" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response Format:**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": {
    "categories": [
      {
        "id": "categoryId",
        "name": "Main Category",
        "description": "Category description",
        "slug": "main-category",
        "isActive": true,
        "createdBy": {
          "_id": "adminId",
          "name": "Admin Name",
          "email": "admin@example.com"
        },
        "createdAt": "2023-09-06T10:30:00.000Z",
        "updatedAt": "2023-09-06T10:30:00.000Z",
        "subcategory": [
          {
            "id": "subCategoryId",
            "name": "Subcategory Name",
            "description": "Subcategory description",
            "slug": "subcategory-name",
            "isActive": true,
            "createdBy": {
              "_id": "adminId",
              "name": "Admin Name",
              "email": "admin@example.com"
            },
            "createdAt": "2023-09-06T10:30:00.000Z",
            "updatedAt": "2023-09-06T10:30:00.000Z",
            "subcategory": [
              {
                "id": "nestedSubCategoryId",
                "name": "Nested Subcategory Name",
                "description": "Nested subcategory description",
                "slug": "nested-subcategory-name",
                "isActive": true,
                "createdBy": {
                  "_id": "adminId",
                  "name": "Admin Name",
                  "email": "admin@example.com"
                },
                "createdAt": "2023-09-06T10:30:00.000Z",
                "updatedAt": "2023-09-06T10:30:00.000Z",
                "subcategory": []
              }
            ]
          }
        ]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalCategories": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

## Database Schema

### Enhanced Category Model

```javascript
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
```

### Key Features

1. **Dual Parent Fields**: 
   - `parent`: New field for hierarchical structure
   - `parentCategory`: Existing field for backward compatibility

2. **Recursive Tree Building**: 
   - Static method `buildCategoryTree()` creates nested structure
   - Handles unlimited nesting levels
   - Maintains proper parent-child relationships

3. **Indexes for Performance**:
   - `parent`: For efficient tree queries
   - `parentCategory`: For backward compatibility
   - `isSubcategory`: For filtering subcategories
   - Compound indexes for complex queries

## Implementation Details

### Recursive Tree Building Algorithm

```javascript
categorySchema.statics.buildCategoryTree = async function(categories, parentId = null) {
  const tree = [];
  
  for (const category of categories) {
    // Check if this category belongs to the current parent
    const categoryParent = category.parent || category.parentCategory;
    const isSubcategory = category.isSubcategory;
    
    if (categoryParent && categoryParent.toString() === parentId?.toString()) {
      // This is a child category
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
      // This is a main category
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
```

### Query Optimization

1. **Main Categories Query**: Only fetches main categories for pagination
2. **All Categories Query**: Fetches all categories for tree building
3. **Efficient Filtering**: Uses MongoDB indexes for fast queries
4. **Population**: Populates related admin data efficiently

## Usage Examples

### 1. Get All Categories
```bash
curl -X GET "http://localhost:5000/api/admin/categories" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 2. Get Categories with Pagination
```bash
curl -X GET "http://localhost:5000/api/admin/categories?page=1&limit=5" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 3. Search Categories
```bash
curl -X GET "http://localhost:5000/api/admin/categories?search=Electronics" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 4. Filter Active Categories
```bash
curl -X GET "http://localhost:5000/api/admin/categories?isActive=true" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 5. Combined Filters
```bash
curl -X GET "http://localhost:5000/api/admin/categories?page=1&limit=10&search=Electronics&isActive=true" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 6. Create Subcategory Under Subcategory (Unlimited Nesting)
```bash
# Create subcategory under main category
curl -X POST http://localhost:5000/api/admin/subcategory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "name": "Smartphones",
    "description": "Mobile phones and accessories",
    "parentCategoryId": "MAIN_CATEGORY_ID"
  }'

# Create subcategory under subcategory (second level)
curl -X POST http://localhost:5000/api/admin/subcategory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "name": "iPhone",
    "description": "Apple iPhone models",
    "parentCategoryId": "SMARTPHONES_CATEGORY_ID"
  }'

# Create subcategory under subcategory (third level)
curl -X POST http://localhost:5000/api/admin/subcategory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "name": "iPhone 15",
    "description": "Latest iPhone 15 series",
    "parentCategoryId": "IPHONE_CATEGORY_ID"
  }'
```

## Response Structure

### Main Category Object
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "slug": "string",
  "isActive": "boolean",
  "createdBy": {
    "_id": "string",
    "name": "string",
    "email": "string"
  },
  "createdAt": "string",
  "updatedAt": "string",
  "subcategory": [
    // Array of subcategory objects with same structure
  ]
}
```

### Pagination Object
```json
{
  "currentPage": "number",
  "totalPages": "number",
  "totalCategories": "number",
  "hasNext": "boolean",
  "hasPrev": "boolean"
}
```

## Error Handling

### Common Error Responses

1. **Unauthorized (401)**:
```json
{
  "success": false,
  "message": "Access denied. No token provided.",
  "error": "Token required"
}
```

2. **Invalid Token (401)**:
```json
{
  "success": false,
  "message": "Access denied. Invalid token.",
  "error": "Invalid token"
}
```

3. **Server Error (500)**:
```json
{
  "success": false,
  "message": "Internal server error while fetching categories",
  "error": "Categories fetch failed"
}
```

## Performance Considerations

1. **Indexing**: Proper indexes on parent fields for fast queries
2. **Pagination**: Only main categories are paginated, subcategories are always included
3. **Tree Building**: Efficient recursive algorithm for tree construction
4. **Caching**: Consider implementing Redis caching for frequently accessed trees
5. **Query Optimization**: Uses MongoDB aggregation for complex queries

## Migration Notes

### Existing Data Compatibility
- The API maintains backward compatibility with existing data
- Both `parent` and `parentCategory` fields are supported
- Existing subcategories continue to work without modification

### New Data Structure
- New categories should use the `parent` field for better performance
- The `parentCategory` field is maintained for backward compatibility
- The `isSubcategory` flag helps identify subcategory types

## Testing

### Test Scenarios
1. ✅ Get all categories in hierarchical structure
2. ✅ Pagination with main categories only
3. ✅ Search functionality across names and descriptions
4. ✅ Active/inactive filtering
5. ✅ JWT authentication and authorization
6. ✅ Error handling for invalid requests
7. ✅ Performance with large category trees

### Test Commands
```bash
# Test basic functionality
node -e "const axios = require('axios'); axios.get('http://localhost:5000/api/admin/categories', { headers: { 'Authorization': 'Bearer <token>' } }).then(res => console.log(JSON.stringify(res.data, null, 2)));"

# Test search
node -e "const axios = require('axios'); axios.get('http://localhost:5000/api/admin/categories?search=Electronics', { headers: { 'Authorization': 'Bearer <token>' } }).then(res => console.log(JSON.stringify(res.data, null, 2)));"

# Test pagination
node -e "const axios = require('axios'); axios.get('http://localhost:5000/api/admin/categories?page=1&limit=2', { headers: { 'Authorization': 'Bearer <token>' } }).then(res => console.log(JSON.stringify(res.data, null, 2)));"
```

## Conclusion

The hierarchical categories API provides a robust solution for managing nested category structures in e-commerce applications. It supports unlimited nesting levels, efficient querying, and maintains backward compatibility with existing data structures.

Key benefits:
- **Scalable**: Supports unlimited nesting levels
- **Efficient**: Optimized queries with proper indexing
- **Flexible**: Multiple query parameters for filtering
- **Compatible**: Works with existing data
- **Secure**: JWT-based authentication
- **Maintainable**: Clean, recursive tree building algorithm
