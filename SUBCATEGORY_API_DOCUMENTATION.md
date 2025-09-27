# Subcategory API Documentation

This document provides comprehensive documentation for the Subcategory API endpoints in the eCommerce backend.

## Table of Contents
- [API Endpoints](#api-endpoints)
  - [Get Products by Subcategory](#1-get-products-by-subcategory)
  - [Get Product Count by Subcategory](#2-get-product-count-by-subcategory)
  - [Get Product Count for Specific Subcategory](#3-get-product-count-for-specific-subcategory)
  - [Get All Subcategories](#4-get-all-subcategories)
- [Error Responses](#error-responses)
- [Examples](#examples)

## API Endpoints

### 1. Get Products by Subcategory

**Endpoint:** `GET /api/subcategories/:id/products`

**Description:** Get all active products by specific subcategory with pagination, search, and sorting

**Headers:** None required

**URL Parameters:**
- `id` (required): Subcategory ObjectId (24 characters)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by title, description, or keywords
- `sortBy` (optional): Sort field - title, mrp, srp, createdAt, updatedAt (default: createdAt)
- `sortOrder` (optional): Sort order - asc, desc (default: desc)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "subcategory": {
      "id": "68d635a655a3f58724e487c8",
      "name": "Smartphones",
      "slug": "smartphones",
      "parentCategory": {
        "id": "68d635a655a3f58724e487c3",
        "name": "Electronics",
        "slug": "electronics"
      }
    },
    "products": [
      {
        "id": "68d676eee88ddabf99b2e38b",
        "title": "Samsung Galaxy S24 Ultra",
        "mrp": 124999,
        "srp": 114999,
        "description": "Premium Android smartphone with S Pen",
        "category": {
          "id": "68d635a655a3f58724e487c3",
          "name": "Electronics",
          "slug": "electronics",
          "isActive": true
        },
        "subcategory": {
          "id": "68d635a655a3f58724e487c8",
          "name": "Smartphones",
          "slug": "smartphones",
          "isActive": true
        },
        "attributes": [
          {
            "key": "Color",
            "value": "Titanium Black"
          },
          {
            "key": "Storage",
            "value": "512GB"
          }
        ],
        "keywords": ["Samsung", "Galaxy", "S24", "Ultra", "Android"],
        "isActive": true,
        "profitMargin": "8.00",
        "createdBy": {
          "id": "68d50f4c091c883d8d53426f",
          "name": "admin",
          "email": "admin@gamil.com"
        },
        "createdAt": "2025-09-26T11:30:00.000Z",
        "updatedAt": "2025-09-26T11:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalProducts": 1,
      "hasNext": false,
      "hasPrev": false,
      "limit": 10
    },
    "filters": {
      "search": "Samsung",
      "sortBy": "title",
      "sortOrder": "asc"
    }
  }
}
```

**cURL Examples:**
```bash
# Get all products in subcategory
curl -X GET http://localhost:5000/api/subcategories/68d635a655a3f58724e487c8/products

# Get products with pagination
curl -X GET "http://localhost:5000/api/subcategories/68d635a655a3f58724e487c8/products?page=1&limit=5"

# Search products
curl -X GET "http://localhost:5000/api/subcategories/68d635a655a3f58724e487c8/products?search=Samsung"

# Sort products by price
curl -X GET "http://localhost:5000/api/subcategories/68d635a655a3f58724e487c8/products?sortBy=mrp&sortOrder=asc"

# Combined filters
curl -X GET "http://localhost:5000/api/subcategories/68d635a655a3f58724e487c8/products?page=1&limit=10&search=Galaxy&sortBy=title&sortOrder=asc"
```

**Features:**
- ✅ Returns only active products
- ✅ Pagination support (page, limit)
- ✅ Search by title, description, or keywords
- ✅ Multiple sort options (title, mrp, srp, createdAt, updatedAt)
- ✅ Populated category and subcategory details
- ✅ Profit margin calculation
- ✅ Comprehensive error handling
- ✅ No authentication required

### 2. Get Product Count by Subcategory

**Endpoint:** `GET /api/subcategories/products-count`

**Description:** Get product count for all subcategories

**Headers:** None required

**Query Parameters:** None

**Success Response (200):**
```json
{
  "success": true,
  "message": "Product count by subcategory retrieved successfully",
  "data": [
    {
      "subcategory": {
        "id": "68d635a655a3f58724e487c8",
        "name": "Smartphones",
        "slug": "smartphones"
      },
      "productCount": 12
    },
    {
      "subcategory": {
        "id": "68d635a655a3f58724e489f7",
        "name": "Headphones",
        "slug": "headphones"
      },
      "productCount": 7
    },
    {
      "subcategory": {
        "id": "68d631d6f680f7e82f655106",
        "name": "Asus",
        "slug": "asus"
      },
      "productCount": 0
    }
  ]
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:5000/api/subcategories/products-count
```

**Features:**
- ✅ Returns all active subcategories
- ✅ Counts only active products
- ✅ Sorted by product count (descending), then by name
- ✅ Includes subcategory ID, name, and slug
- ✅ Shows 0 for subcategories with no products

### 2. Get Product Count for Specific Subcategory

**Endpoint:** `GET /api/subcategories/products-count/:subcategoryId`

**Description:** Get product count for a specific subcategory

**Headers:** None required

**URL Parameters:**
- `subcategoryId` (required): Subcategory ObjectId (24 characters)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Product count for subcategory retrieved successfully",
  "data": {
    "subcategory": {
      "id": "68d635a655a3f58724e487c8",
      "name": "Smartphones",
      "slug": "smartphones"
    },
    "productCount": 12
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:5000/api/subcategories/products-count/68d635a655a3f58724e487c8
```

**Features:**
- ✅ Validates ObjectId format
- ✅ Checks if subcategory exists and is active
- ✅ Returns detailed subcategory information
- ✅ Counts only active products

### 3. Get All Subcategories

**Endpoint:** `GET /api/subcategories`

**Description:** Get all subcategories with optional product count

**Headers:** None required

**Query Parameters:**
- `includeProductCount` (optional): Include product count in response (default: false)

**Success Response (200) - Without Product Count:**
```json
{
  "success": true,
  "message": "Subcategories retrieved successfully",
  "data": [
    {
      "id": "68d635a655a3f58724e487c8",
      "name": "Smartphones",
      "slug": "smartphones",
      "parentCategory": {
        "id": "68d635a655a3f58724e487c3",
        "name": "Electronics",
        "slug": "electronics"
      }
    },
    {
      "id": "68d631d6f680f7e82f655106",
      "name": "Asus",
      "slug": "asus",
      "parentCategory": {
        "id": "68d62e3fff3ffb88666a8658",
        "name": "Laptop",
        "slug": "laptop"
      }
    }
  ]
}
```

**Success Response (200) - With Product Count:**
```json
{
  "success": true,
  "message": "Subcategories retrieved successfully",
  "data": [
    {
      "id": "68d635a655a3f58724e487c8",
      "name": "Smartphones",
      "slug": "smartphones",
      "parentCategory": {
        "id": "68d635a655a3f58724e487c3",
        "name": "Electronics",
        "slug": "electronics"
      },
      "productCount": 12
    },
    {
      "id": "68d631d6f680f7e82f655106",
      "name": "Asus",
      "slug": "asus",
      "parentCategory": {
        "id": "68d62e3fff3ffb88666a8658",
        "name": "Laptop",
        "slug": "laptop"
      },
      "productCount": 0
    }
  ]
}
```

**cURL Examples:**
```bash
# Get all subcategories
curl -X GET http://localhost:5000/api/subcategories

# Get all subcategories with product count
curl -X GET "http://localhost:5000/api/subcategories?includeProductCount=true"
```

**Features:**
- ✅ Returns all active subcategories
- ✅ Includes parent category information
- ✅ Optional product count inclusion
- ✅ Sorted by product count when included
- ✅ No authentication required

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Invalid subcategory ID format",
  "error": "ObjectId must be a 24 character hex string"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Subcategory not found",
  "error": "Subcategory does not exist or is inactive"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error while fetching product counts",
  "error": "Product count fetch failed"
}
```

## Examples

### Complete Usage Flow

1. **Get Product Count for All Subcategories:**
```bash
curl -X GET http://localhost:5000/api/subcategories/products-count
```

2. **Get Product Count for Specific Subcategory:**
```bash
curl -X GET http://localhost:5000/api/subcategories/products-count/68d635a655a3f58724e487c8
```

3. **Get All Subcategories:**
```bash
curl -X GET http://localhost:5000/api/subcategories
```

4. **Get All Subcategories with Product Count:**
```bash
curl -X GET "http://localhost:5000/api/subcategories?includeProductCount=true"
```

### JavaScript/Axios Examples

```javascript
// Get products by subcategory
const getProductsBySubcategory = async (subcategoryId, options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);
    if (options.search) params.append('search', options.search);
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);
    
    const response = await axios.get(`http://localhost:5000/api/subcategories/${subcategoryId}/products?${params}`);
    console.log('Products:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};

// Get product count by subcategory
const getProductCountBySubcategory = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/subcategories/products-count');
    console.log('Product counts:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};

// Get product count for specific subcategory
const getSubcategoryProductCount = async (subcategoryId) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/subcategories/products-count/${subcategoryId}`);
    console.log('Subcategory product count:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};

// Get all subcategories with product count
const getSubcategoriesWithCount = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/subcategories?includeProductCount=true');
    console.log('Subcategories with count:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};
```

### Node.js Examples

```javascript
const axios = require('axios');

// Example 1: Get all subcategories with product counts
async function getAllSubcategoryProductCounts() {
  try {
    const response = await axios.get('http://localhost:5000/api/subcategories/products-count');
    
    console.log('Product Count by Subcategory:');
    response.data.data.forEach((item, index) => {
      console.log(`${index + 1}. ${item.subcategory.name}: ${item.productCount} products`);
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching product counts:', error.response?.data || error.message);
  }
}

// Example 2: Get specific subcategory product count
async function getSubcategoryProductCount(subcategoryId) {
  try {
    const response = await axios.get(`http://localhost:5000/api/subcategories/products-count/${subcategoryId}`);
    
    console.log(`Subcategory: ${response.data.data.subcategory.name}`);
    console.log(`Product Count: ${response.data.data.productCount}`);
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching subcategory product count:', error.response?.data || error.message);
  }
}

// Example 3: Get products by subcategory with advanced filtering
async function getProductsBySubcategoryAdvanced(subcategoryId) {
  try {
    // Get products with search and sorting
    const response = await axios.get(`http://localhost:5000/api/subcategories/${subcategoryId}/products`, {
      params: {
        page: 1,
        limit: 10,
        search: 'Samsung',
        sortBy: 'mrp',
        sortOrder: 'asc'
      }
    });
    
    console.log(`Products in subcategory: ${response.data.data.subcategory.name}`);
    console.log(`Total products: ${response.data.data.pagination.totalProducts}`);
    console.log(`Current page: ${response.data.data.pagination.currentPage}`);
    
    response.data.data.products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} - MRP: ₹${product.mrp}, SRP: ₹${product.srp}, Profit: ${product.profitMargin}%`);
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching products by subcategory:', error.response?.data || error.message);
  }
}

// Example 4: Find subcategories with most products
async function findTopSubcategories() {
  try {
    const response = await axios.get('http://localhost:5000/api/subcategories/products-count');
    
    const topSubcategories = response.data.data
      .filter(item => item.productCount > 0)
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 5);
    
    console.log('Top 5 Subcategories by Product Count:');
    topSubcategories.forEach((item, index) => {
      console.log(`${index + 1}. ${item.subcategory.name}: ${item.productCount} products`);
    });
    
    return topSubcategories;
  } catch (error) {
    console.error('Error finding top subcategories:', error.response?.data || error.message);
  }
}

// Example 5: Search products across subcategories
async function searchProductsInSubcategory(subcategoryId, searchTerm) {
  try {
    const response = await axios.get(`http://localhost:5000/api/subcategories/${subcategoryId}/products`, {
      params: {
        search: searchTerm,
        sortBy: 'title',
        sortOrder: 'asc'
      }
    });
    
    console.log(`Search results for "${searchTerm}" in subcategory: ${response.data.data.subcategory.name}`);
    console.log(`Found ${response.data.data.pagination.totalProducts} products`);
    
    response.data.data.products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} - ${product.description}`);
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error searching products:', error.response?.data || error.message);
  }
}
```

## Features

- ✅ **No Authentication Required** - Public endpoints
- ✅ **Efficient Aggregation** - Uses MongoDB aggregation for fast counting
- ✅ **Active Records Only** - Only counts active products and subcategories
- ✅ **Comprehensive Error Handling** - Detailed error messages
- ✅ **ObjectId Validation** - Proper validation for MongoDB ObjectIds
- ✅ **Sorting** - Results sorted by product count (descending), then by name
- ✅ **Parent Category Info** - Includes parent category details when available
- ✅ **Flexible Queries** - Optional product count inclusion
- ✅ **Zero Product Handling** - Shows 0 for subcategories with no products

## Database Structure

The API works with the existing Category model structure:

```javascript
// Category Model (used for both categories and subcategories)
{
  _id: ObjectId,
  name: String,
  slug: String,
  isSubcategory: Boolean, // true for subcategories
  isActive: Boolean,
  parentCategory: ObjectId, // reference to parent category
  // ... other fields
}

// Product Model
{
  _id: ObjectId,
  title: String,
  subcategoryId: ObjectId, // reference to subcategory
  isActive: Boolean,
  // ... other fields
}
```

## Performance Notes

- Uses MongoDB aggregation pipeline for efficient counting
- Indexes on `subcategoryId` and `isActive` fields for optimal performance
- Results are sorted in the application layer for flexibility
- Only active records are processed to reduce data volume

## Notes

- All endpoints are public (no authentication required)
- Only active subcategories and products are included in counts
- Results are sorted by product count (descending), then alphabetically by name
- Invalid ObjectIds return 400 Bad Request
- Non-existent subcategories return 404 Not Found
- Empty results return success with empty data array
