# Product Management API Documentation

This document provides comprehensive documentation for the Product Management API endpoints in the eCommerce backend.

## Table of Contents
- [Authentication](#authentication)
- [Product Model](#product-model)
- [API Endpoints](#api-endpoints)
  - [Create Product](#1-create-product)
  - [Get All Products](#2-get-all-products)
  - [Get Single Product](#3-get-single-product)
  - [Update Product](#4-update-product)
  - [Delete Product](#5-delete-product)
- [Error Responses](#error-responses)
- [Examples](#examples)

## Authentication

All product endpoints require JWT authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

## Product Model

```javascript
{
  title: String (required, 2-200 chars),
  mrp: Number (required, > 0),
  srp: Number (required, > 0),
  description: String (optional, max 2000 chars),
  categoryId: ObjectId (required, must exist and be active),
  subcategoryId: ObjectId (required, must exist, be active, and belong to category),
  attributes: [{
    key: String (required, max 50 chars),
    value: String (required, max 200 chars)
  }],
  keywords: [String] (optional, max 50 chars each),
  isActive: Boolean (default: true),
  createdBy: {
    id: ObjectId (required),
    name: String (required),
    email: String (required)
  },
  category: {
    id: ObjectId,
    name: String,
    slug: String,
    isActive: Boolean
  },
  subcategory: {
    id: ObjectId,
    name: String,
    slug: String,
    isActive: Boolean
  },
  profitMargin: Number (calculated virtual field),
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### 1. Create Product

**Endpoint:** `POST /api/admin/products`

**Description:** Admin creates a new product

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "iPhone 15 Pro Max",
  "mrp": 129999,
  "srp": 119999,
  "description": "Latest iPhone with advanced features",
  "categoryId": "68d635a655a3f58724e487c3",
  "subcategoryId": "68d635a655a3f58724e487c8",
  "attributes": [
    {
      "key": "Color",
      "value": "Space Black"
    },
    {
      "key": "Storage",
      "value": "256GB"
    },
    {
      "key": "Display",
      "value": "6.7-inch Super Retina XDR"
    }
  ],
  "keywords": ["iPhone", "Apple", "Smartphone", "5G", "Pro Max"]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "product": {
      "id": "68d65bc5c1a0ff45303b7b7e",
      "title": "iPhone 15 Pro Max",
      "mrp": 129999,
      "srp": 119999,
      "description": "Latest iPhone with advanced features",
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
          "value": "Space Black"
        },
        {
          "key": "Storage",
          "value": "256GB"
        },
        {
          "key": "Display",
          "value": "6.7-inch Super Retina XDR"
        }
      ],
      "keywords": ["iPhone", "Apple", "Smartphone", "5G", "Pro Max"],
      "isActive": true,
      "profitMargin": "7.69",
      "createdBy": {
        "id": "68d50f4c091c883d8d53426f",
        "name": "admin",
        "email": "admin@gamil.com"
      },
      "createdAt": "2025-09-26T10:30:00.000Z",
      "updatedAt": "2025-09-26T10:30:00.000Z"
    }
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "title": "iPhone 15 Pro Max",
    "mrp": 129999,
    "srp": 119999,
    "description": "Latest iPhone with advanced features",
    "categoryId": "68d635a655a3f58724e487c3",
    "subcategoryId": "68d635a655a3f58724e487c8",
    "attributes": [
      {
        "key": "Color",
        "value": "Space Black"
      },
      {
        "key": "Storage",
        "value": "256GB"
      }
    ],
    "keywords": ["iPhone", "Apple", "Smartphone", "5G", "Pro Max"]
  }'
```

### 2. Get All Products

**Endpoint:** `GET /api/admin/products`

**Description:** Admin gets all products with pagination and search

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by title or keywords

**Success Response (200):**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "products": [
      {
        "id": "68d65bc5c1a0ff45303b7b7e",
        "title": "iPhone 15 Pro Max",
        "mrp": 129999,
        "srp": 119999,
        "description": "Latest iPhone with advanced features",
        "attributes": [
          {
            "key": "Color",
            "value": "Space Black"
          }
        ],
        "keywords": ["iPhone", "Apple", "Smartphone"],
        "isActive": true,
        "profitMargin": "7.69",
        "createdBy": {
          "id": "68d50f4c091c883d8d53426f",
          "name": "admin",
          "email": "admin@gamil.com"
        },
        "createdAt": "2025-09-26T10:30:00.000Z",
        "updatedAt": "2025-09-26T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalProducts": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

**cURL Examples:**
```bash
# Get all products
curl -X GET http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

# Get products with pagination
curl -X GET "http://localhost:5000/api/admin/products?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

# Search products
curl -X GET "http://localhost:5000/api/admin/products?search=iPhone" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 3. Get Single Product

**Endpoint:** `GET /api/admin/products/:id`

**Description:** Admin gets single product by ID

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**URL Parameters:**
- `id` (required): Product ObjectId (24 characters)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "product": {
      "id": "68d65bc5c1a0ff45303b7b7e",
      "title": "iPhone 15 Pro Max",
      "mrp": 129999,
      "srp": 119999,
      "description": "Latest iPhone with advanced features",
      "attributes": [
        {
          "key": "Color",
          "value": "Space Black"
        }
      ],
      "keywords": ["iPhone", "Apple", "Smartphone"],
      "isActive": true,
      "profitMargin": "7.69",
      "createdBy": {
        "id": "68d50f4c091c883d8d53426f",
        "name": "admin",
        "email": "admin@gamil.com"
      },
      "createdAt": "2025-09-26T10:30:00.000Z",
      "updatedAt": "2025-09-26T10:30:00.000Z"
    }
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:5000/api/admin/products/68d65bc5c1a0ff45303b7b7e \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 4. Update Product

**Endpoint:** `POST /api/admin/products/:id`

**Description:** Admin updates product details

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json
```

**URL Parameters:**
- `id` (required): Product ObjectId (24 characters)

**Request Body (all fields optional):**
```json
{
  "title": "iPhone 15 Pro Max - Updated",
  "mrp": 134999,
  "srp": 124999,
  "description": "Updated description",
  "attributes": [
    {
      "key": "Color",
      "value": "Titanium"
    }
  ],
  "keywords": ["iPhone", "Apple", "Updated"],
  "isActive": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "product": {
      "id": "68d65bc5c1a0ff45303b7b7e",
      "title": "iPhone 15 Pro Max - Updated",
      "mrp": 134999,
      "srp": 124999,
      "description": "Updated description",
      "attributes": [
        {
          "key": "Color",
          "value": "Titanium"
        }
      ],
      "keywords": ["iPhone", "Apple", "Updated"],
      "isActive": true,
      "profitMargin": "7.41",
      "createdBy": {
        "id": "68d50f4c091c883d8d53426f",
        "name": "admin",
        "email": "admin@gamil.com"
      },
      "createdAt": "2025-09-26T10:30:00.000Z",
      "updatedAt": "2025-09-26T10:45:00.000Z"
    }
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/admin/products/68d65bc5c1a0ff45303b7b7e \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "title": "iPhone 15 Pro Max - Updated",
    "mrp": 134999,
    "srp": 124999,
    "description": "Updated description"
  }'
```

### 5. Delete Product

**Endpoint:** `DELETE /api/admin/products/:id`

**Description:** Admin deletes product by ID

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**URL Parameters:**
- `id` (required): Product ObjectId (24 characters)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": {
    "deletedProduct": {
      "id": "68d65bc5c1a0ff45303b7b7e",
      "title": "iPhone 15 Pro Max",
      "mrp": 129999,
      "srp": 119999
    }
  }
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:5000/api/admin/products/68d65bc5c1a0ff45303b7b7e \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 5. Assign Multiple Products to Vendor

**Endpoint:** `POST /api/admin/products/assign-vendor`

**Description:** Admin assigns multiple products to a vendor at once

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json
```

**Request Body:**
```json
{
  "vendorId": "68d65bc5c1a0ff45303b7b7e",
  "productIds": [
    "68d65bc5c1a0ff45303b7b7f",
    "68d65bc5c1a0ff45303b7b80",
    "68d65bc5c1a0ff45303b7b81"
  ]
}
```

**Request Body Fields:**
- `vendorId` (required): Vendor ObjectId (24 characters)
- `productIds` (required): Array of Product ObjectIds (minimum 1 product)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Products assigned to vendor successfully",
  "data": {
    "vendor": {
      "id": "68d65bc5c1a0ff45303b7b7e",
      "name": "John's Electronics Store",
      "shopName": "John Electronics",
      "email": "john@electronics.com"
    },
    "assignedProducts": [
      {
        "id": "68d65bc5c1a0ff45303b7b7f",
        "title": "iPhone 15 Pro Max",
        "vendorId": {
          "id": "68d65bc5c1a0ff45303b7b7e",
          "name": "John's Electronics Store",
          "shopName": "John Electronics",
          "email": "john@electronics.com"
        },
        "updatedAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": "68d65bc5c1a0ff45303b7b80",
        "title": "Samsung Galaxy S24 Ultra",
        "vendorId": {
          "id": "68d65bc5c1a0ff45303b7b7e",
          "name": "John's Electronics Store",
          "shopName": "John Electronics",
          "email": "john@electronics.com"
        },
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "summary": {
      "totalProducts": 3,
      "updatedCount": 3,
      "vendorId": "68d65bc5c1a0ff45303b7b7e"
    }
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/admin/products/assign-vendor \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "vendorId": "68d65bc5c1a0ff45303b7b7e",
    "productIds": [
      "68d65bc5c1a0ff45303b7b7f",
      "68d65bc5c1a0ff45303b7b80",
      "68d65bc5c1a0ff45303b7b81"
    ]
  }'
```

**Error Responses:**

**400 - Missing Required Fields:**
```json
{
  "success": false,
  "message": "vendorId and productIds array are required",
  "error": "Missing required fields"
}
```

**400 - Invalid Vendor ID:**
```json
{
  "success": false,
  "message": "Invalid vendor ID format",
  "error": "Vendor ID must be a 24 character hex string"
}
```

**400 - Empty Product IDs Array:**
```json
{
  "success": false,
  "message": "At least one product ID is required",
  "error": "Empty product IDs array"
}
```

**400 - Invalid Product ID:**
```json
{
  "success": false,
  "message": "Invalid product ID format in array",
  "error": "Product ID 68d65bc5c1a0ff45303b7b7x must be a 24 character hex string"
}
```

**404 - Vendor Not Found:**
```json
{
  "success": false,
  "message": "Vendor not found",
  "error": "Vendor does not exist"
}
```

**404 - Products Not Found:**
```json
{
  "success": false,
  "message": "One or more products not found",
  "error": "Invalid product IDs: 68d65bc5c1a0ff45303b7b7x, 68d65bc5c1a0ff45303b7b7y"
}
```

**401 - Unauthorized:**
```json
{
  "success": false,
  "message": "Access denied. No token provided.",
  "error": "Token required"
}
```

**403 - Forbidden:**
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required.",
  "error": "Insufficient permissions"
}
```

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Title, MRP, and SRP are required fields",
  "error": "Missing required fields"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided.",
  "error": "Token required"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "Access denied. Not an admin.",
  "error": "Unauthorized role"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Product not found",
  "error": "Product does not exist"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error while creating product",
  "error": "Product creation failed"
}
```

## Examples

### Complete Product Creation Flow

1. **Login as Admin:**
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gamil.com",
    "password": "admin123"
  }'
```

2. **Create Product:**
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Samsung Galaxy S24 Ultra",
    "mrp": 124999,
    "srp": 114999,
    "description": "Premium Android smartphone with S Pen",
    "attributes": [
      {
        "key": "Color",
        "value": "Titanium Black"
      },
      {
        "key": "Storage",
        "value": "512GB"
      },
      {
        "key": "RAM",
        "value": "12GB"
      }
    ],
    "keywords": ["Samsung", "Galaxy", "S24", "Ultra", "Android", "S Pen"]
  }'
```

3. **Get All Products:**
```bash
curl -X GET "http://localhost:5000/api/admin/products?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

4. **Update Product:**
```bash
curl -X POST http://localhost:5000/api/admin/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Samsung Galaxy S24 Ultra - Updated",
    "isActive": false
  }'
```

5. **Assign Multiple Products to Vendor:**
```bash
curl -X POST http://localhost:5000/api/admin/products/assign-vendor \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "vendorId": "VENDOR_ID",
    "productIds": ["PRODUCT_ID_1", "PRODUCT_ID_2", "PRODUCT_ID_3"]
  }'
```

6. **Delete Product:**
```bash
curl -X DELETE http://localhost:5000/api/admin/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Features

- ✅ **JWT Authentication** - All endpoints protected
- ✅ **Input Validation** - Comprehensive validation for all fields
- ✅ **Pagination** - Efficient data loading with page/limit
- ✅ **Search** - Search by title and keywords
- ✅ **Profit Margin Calculation** - Automatic calculation of profit margin
- ✅ **Error Handling** - Detailed error messages
- ✅ **ObjectId Validation** - Proper MongoDB ObjectId validation
- ✅ **Flexible Attributes** - Dynamic product attributes
- ✅ **Keywords Support** - SEO-friendly keywords
- ✅ **Status Management** - Active/inactive product status

## Notes

- All prices are stored as numbers (not strings)
- SRP cannot be greater than MRP
- Attributes array can contain multiple key-value pairs
- Keywords array supports multiple search terms
- Profit margin is automatically calculated as: `((MRP - SRP) / MRP) * 100`
- All timestamps are in ISO format
- ObjectId validation ensures 24-character hex strings
