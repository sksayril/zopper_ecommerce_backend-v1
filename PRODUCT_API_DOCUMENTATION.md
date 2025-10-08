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
  - [Partial Update Product](#5-partial-update-product)
  - [Delete Product](#6-delete-product)
  - [Assign Multiple Products to Vendor](#7-assign-multiple-products-to-vendor)
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
  shortDescription: String (optional, max 500 chars),
  detailedDescription: String (optional, max 5000 chars),
  features: [String] (optional, max 200 chars each),
  specifications: [{
    key: String (required, max 100 chars),
    value: String (required, max 2000 chars)
  }],
  highlights: [String] (optional, max 200 chars each),
  mainImage: String (required, valid image URL - jpg, jpeg, png, gif, webp, svg),
  additionalImages: [String] (optional, array of valid image URLs),
  categoryId: ObjectId (required, must exist and be active),
  subcategoryId: ObjectId (required, must exist, be active, and belong to category),
  categoryPath: [ObjectId] (optional, array of category IDs representing full hierarchy path),
  attributes: [{
    key: String (required, max 100 chars),
    value: String (required, max 2000 chars)
  }],
  keywords: [String] (optional, max 50 chars each),
  productUrl: String (optional, valid URL starting with http:// or https://),
  vendorSite: String (optional, 2-100 chars, vendor name like "Flipkart", "Amazon"),
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
  subcategoryPath: [{
    _id: ObjectId,
    name: String,
    slug: String,
    level: Number
  }],
  categoryPath: [ObjectId],
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
  "shortDescription": "Premium smartphone with titanium design",
  "detailedDescription": "The iPhone 15 Pro Max features a titanium design, A17 Pro chip, and advanced camera system with 5x optical zoom.",
  "features": [
    "Titanium design",
    "A17 Pro chip",
    "5x optical zoom",
    "Action Button",
    "USB-C connectivity"
  ],
  "specifications": [
    {
      "key": "Display",
      "value": "6.7-inch Super Retina XDR"
    },
    {
      "key": "Storage",
      "value": "256GB"
    },
    {
      "key": "Camera",
      "value": "48MP Main, 12MP Ultra Wide, 12MP Telephoto"
    },
    {
      "key": "Battery",
      "value": "Up to 29 hours video playback"
    }
  ],
  "highlights": [
    "Most advanced iPhone",
    "Titanium construction",
    "Professional camera system"
  ],
  "mainImage": "https://example.com/images/iphone15-pro-max-main.jpg",
  "additionalImages": [
    "https://example.com/images/iphone15-pro-max-side.jpg",
    "https://example.com/images/iphone15-pro-max-back.jpg",
    "https://example.com/images/iphone15-pro-max-detail.jpg"
  ],
  "categoryId": "68d635a655a3f58724e487c3",
  "subcategoryId": "68d635a655a3f58724e487c8",
  "categoryPath": [
    "68d635a655a3f58724e487c3",
    "68d635a655a3f58724e487c8",
    "68d635a655a3f58724e487c9"
  ],
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
  "productUrl": "https://example.com/products/iphone-15-pro-max",
  "vendorSite": "Amazon"
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
      "subcategoryPath": [
        {
          "_id": "68d635a655a3f58724e487c3",
          "name": "Electronics",
          "slug": "electronics",
          "level": 0
        },
        {
          "_id": "68d635a655a3f58724e487c8",
          "name": "Smartphones",
          "slug": "smartphones",
          "level": 1
        }
      ],
      "categoryPath": [
        "68d635a655a3f58724e487c3",
        "68d635a655a3f58724e487c8",
        "68d635a655a3f58724e487c9"
      ],
      "mainImage": "https://example.com/images/iphone15-pro-max-main.jpg",
      "additionalImages": [
        "https://example.com/images/iphone15-pro-max-side.jpg",
        "https://example.com/images/iphone15-pro-max-back.jpg",
        "https://example.com/images/iphone15-pro-max-detail.jpg"
      ],
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
      "productUrl": "https://example.com/products/iphone-15-pro-max",
      "vendorSite": "Amazon",
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
    "mainImage": "https://example.com/images/iphone15-pro-max-main.jpg",
    "additionalImages": [
      "https://example.com/images/iphone15-pro-max-side.jpg",
      "https://example.com/images/iphone15-pro-max-back.jpg"
    ],
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
    "keywords": ["iPhone", "Apple", "Smartphone", "5G", "Pro Max"],
    "productUrl": "https://example.com/products/iphone-15-pro-max",
    "vendorSite": "Amazon"
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
        "productUrl": "https://example.com/products/iphone-15-pro-max",
        "subcategoryPath": [
          {
            "_id": "68d635a655a3f58724e487c3",
            "name": "Electronics",
            "slug": "electronics",
            "level": 0
          },
          {
            "_id": "68d635a655a3f58724e487c8",
            "name": "Smartphones",
            "slug": "smartphones",
            "level": 1
          }
        ],
        "vendorSite": "Amazon",
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
      "productUrl": "https://example.com/products/iphone-15-pro-max",
      "subcategoryPath": [
        {
          "_id": "68d635a655a3f58724e487c3",
          "name": "Electronics",
          "slug": "electronics",
          "level": 0
        },
        {
          "_id": "68d635a655a3f58724e487c8",
          "name": "Smartphones",
          "slug": "smartphones",
          "level": 1
        }
      ],
      "vendorSite": "Amazon",
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

**Endpoint:** `PUT /api/admin/products/:id`

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
  "description": "Updated description with complete product data",
  "shortDescription": "Updated premium smartphone with titanium design",
  "detailedDescription": "The updated iPhone 15 Pro Max features enhanced titanium design, A17 Pro chip, and advanced camera system with 5x optical zoom.",
  "features": [
    "Enhanced titanium design",
    "A17 Pro chip",
    "5x optical zoom",
    "Action Button",
    "USB-C connectivity",
    "New feature added"
  ],
  "specifications": [
    {
      "key": "Display",
      "value": "6.7-inch Super Retina XDR"
    },
    {
      "key": "Storage",
      "value": "512GB"
    },
    {
      "key": "Camera",
      "value": "48MP Main, 12MP Ultra Wide, 12MP Telephoto"
    }
  ],
  "highlights": [
    "Most advanced iPhone",
    "Enhanced titanium construction",
    "Professional camera system",
    "Updated highlight"
  ],
  "mainImage": "https://example.com/images/iphone15-pro-max-updated-main.jpg",
  "additionalImages": [
    "https://example.com/images/iphone15-pro-max-updated-side.jpg",
    "https://example.com/images/iphone15-pro-max-updated-back.jpg",
    "https://example.com/images/iphone15-pro-max-updated-detail.jpg"
  ],
  "attributes": [
    {
      "key": "Color",
      "value": "Titanium"
    },
    {
      "key": "Storage",
      "value": "512GB"
    }
  ],
  "keywords": ["iPhone", "Apple", "Updated", "Enhanced"],
  "productUrl": "https://example.com/products/iphone-15-pro-max-updated",
  "vendorSite": "Flipkart",
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
      "subcategoryPath": [
        {
          "_id": "68d635a655a3f58724e487c3",
          "name": "Electronics",
          "slug": "electronics",
          "level": 0
        },
        {
          "_id": "68d635a655a3f58724e487c8",
          "name": "Smartphones",
          "slug": "smartphones",
          "level": 1
        }
      ],
      "categoryPath": [
        "68d635a655a3f58724e487c3",
        "68d635a655a3f58724e487c8",
        "68d635a655a3f58724e487c9"
      ],
      "mainImage": "https://example.com/images/iphone15-pro-max-main.jpg",
      "additionalImages": [
        "https://example.com/images/iphone15-pro-max-side.jpg",
        "https://example.com/images/iphone15-pro-max-back.jpg"
      ],
      "shortDescription": "Premium smartphone with titanium design",
      "detailedDescription": "The iPhone 15 Pro Max features a titanium design, A17 Pro chip, and advanced camera system with 5x optical zoom.",
      "features": [
        "Titanium design",
        "A17 Pro chip",
        "5x optical zoom",
        "Action Button",
        "USB-C connectivity"
      ],
      "specifications": [
        {
          "key": "Display",
          "value": "6.7-inch Super Retina XDR"
        },
        {
          "key": "Storage",
          "value": "256GB"
        }
      ],
      "highlights": [
        "Most advanced iPhone",
        "Titanium construction",
        "Professional camera system"
      ],
      "attributes": [
        {
          "key": "Color",
          "value": "Titanium"
        }
      ],
      "keywords": ["iPhone", "Apple", "Updated"],
      "productUrl": "https://example.com/products/iphone-15-pro-max-updated",
      "vendorSite": "Flipkart",
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
curl -X PUT http://localhost:5000/api/admin/products/68d65bc5c1a0ff45303b7b7e \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "title": "iPhone 15 Pro Max - Updated",
    "mrp": 134999,
    "srp": 124999,
    "description": "Updated description with complete product data",
    "mainImage": "https://example.com/images/iphone15-pro-max-updated-main.jpg",
    "additionalImages": [
      "https://example.com/images/iphone15-pro-max-updated-side.jpg",
      "https://example.com/images/iphone15-pro-max-updated-back.jpg"
    ],
    "features": [
      "Enhanced titanium design",
      "A17 Pro chip",
      "5x optical zoom"
    ],
    "specifications": [
      {
        "key": "Display",
        "value": "6.7-inch Super Retina XDR"
      },
      {
        "key": "Storage",
        "value": "512GB"
      }
    ],
    "attributes": [
      {
        "key": "Color",
        "value": "Titanium"
      }
    ],
    "keywords": ["iPhone", "Apple", "Updated", "Enhanced"],
    "productUrl": "https://example.com/products/iphone-15-pro-max-updated",
    "vendorSite": "Flipkart"
  }'
```

### 5. Partial Update Product

**Endpoint:** `PATCH /api/admin/products/:id`

**Description:** Admin partially updates product details (for specific fields)

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
  "isActive": false,
  "keywords": ["iPhone", "Apple", "Updated", "Inactive", "Discontinued"],
  "productUrl": "https://example.com/products/iphone-15-pro-max-discontinued",
  "vendorSite": "Amazon",
  "mainImage": "https://example.com/images/iphone15-pro-max-discontinued-main.jpg",
  "additionalImages": [
    "https://example.com/images/iphone15-pro-max-discontinued-side.jpg"
  ],
  "features": [
    "Titanium design",
    "A17 Pro chip",
    "5x optical zoom",
    "Discontinued model"
  ],
  "highlights": [
    "Most advanced iPhone",
    "Titanium construction",
    "Professional camera system",
    "No longer available"
  ]
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
      "title": "iPhone 15 Pro Max",
      "mrp": 134999,
      "srp": 124999,
      "description": "Updated description",
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
      "subcategoryPath": [
        {
          "_id": "68d635a655a3f58724e487c3",
          "name": "Electronics",
          "slug": "electronics",
          "level": 0
        },
        {
          "_id": "68d635a655a3f58724e487c8",
          "name": "Smartphones",
          "slug": "smartphones",
          "level": 1
        }
      ],
      "categoryPath": [
        "68d635a655a3f58724e487c3",
        "68d635a655a3f58724e487c8",
        "68d635a655a3f58724e487c9"
      ],
      "mainImage": "https://example.com/images/iphone15-pro-max-main.jpg",
      "additionalImages": [
        "https://example.com/images/iphone15-pro-max-side.jpg",
        "https://example.com/images/iphone15-pro-max-back.jpg"
      ],
      "shortDescription": "Premium smartphone with titanium design",
      "detailedDescription": "The iPhone 15 Pro Max features a titanium design, A17 Pro chip, and advanced camera system with 5x optical zoom.",
      "features": [
        "Titanium design",
        "A17 Pro chip",
        "5x optical zoom",
        "Action Button",
        "USB-C connectivity"
      ],
      "specifications": [
        {
          "key": "Display",
          "value": "6.7-inch Super Retina XDR"
        },
        {
          "key": "Storage",
          "value": "256GB"
        }
      ],
      "highlights": [
        "Most advanced iPhone",
        "Titanium construction",
        "Professional camera system"
      ],
      "attributes": [
        {
          "key": "Color",
          "value": "Titanium"
        }
      ],
      "keywords": ["iPhone", "Apple", "Updated", "Inactive"],
      "productUrl": "https://example.com/products/iphone-15-pro-max-discontinued",
      "vendorSite": "Amazon",
      "isActive": false,
      "profitMargin": "7.41",
      "createdBy": {
        "id": "68d50f4c091c883d8d53426f",
        "name": "admin",
        "email": "admin@gamil.com"
      },
      "createdAt": "2025-09-26T10:30:00.000Z",
      "updatedAt": "2025-09-26T10:50:00.000Z"
    }
  }
}
```

**cURL Example:**
```bash
curl -X PATCH http://localhost:5000/api/admin/products/68d65bc5c1a0ff45303b7b7e \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "isActive": false,
    "keywords": ["iPhone", "Apple", "Updated", "Inactive", "Discontinued"],
    "productUrl": "https://example.com/products/iphone-15-pro-max-discontinued",
    "vendorSite": "Amazon",
    "mainImage": "https://example.com/images/iphone15-pro-max-discontinued-main.jpg",
    "features": [
      "Titanium design",
      "A17 Pro chip",
      "5x optical zoom",
      "Discontinued model"
    ]
  }'
```

### 6. Delete Product

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

### 7. Assign Multiple Products to Vendor

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
    "keywords": ["Samsung", "Galaxy", "S24", "Ultra", "Android", "S Pen"],
    "productUrl": "https://example.com/products/samsung-galaxy-s24-ultra",
    "vendorSite": "Flipkart"
  }'
```

3. **Get All Products:**
```bash
curl -X GET "http://localhost:5000/api/admin/products?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

4. **Update Product (PUT) - Complete Update:**
```bash
curl -X PUT http://localhost:5000/api/admin/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Samsung Galaxy S24 Ultra - Updated",
    "mrp": 129999,
    "srp": 119999,
    "description": "Updated premium Android smartphone with S Pen",
    "shortDescription": "Updated premium smartphone with enhanced features",
    "mainImage": "https://example.com/images/samsung-galaxy-s24-ultra-updated-main.jpg",
    "additionalImages": [
      "https://example.com/images/samsung-galaxy-s24-ultra-updated-side.jpg",
      "https://example.com/images/samsung-galaxy-s24-ultra-updated-back.jpg"
    ],
    "features": [
      "Enhanced S Pen",
      "Titanium Black design",
      "Advanced camera system",
      "5G connectivity",
      "Updated feature"
    ],
    "specifications": [
      {
        "key": "Display",
        "value": "6.8-inch Dynamic AMOLED 2X"
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
    "keywords": ["Samsung", "Galaxy", "S24", "Ultra", "Updated", "Enhanced"],
    "productUrl": "https://example.com/products/samsung-galaxy-s24-ultra-updated",
    "vendorSite": "Amazon"
  }'
```

5. **Partial Update Product (PATCH) - Selective Fields:**
```bash
curl -X PATCH http://localhost:5000/api/admin/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "isActive": false,
    "keywords": ["Samsung", "Galaxy", "S24", "Ultra", "Updated", "Discontinued"],
    "productUrl": "https://example.com/products/samsung-galaxy-s24-ultra-discontinued",
    "vendorSite": "Flipkart",
    "mainImage": "https://example.com/images/samsung-galaxy-s24-ultra-discontinued-main.jpg",
    "features": [
      "Enhanced S Pen",
      "Titanium Black design",
      "Advanced camera system",
      "5G connectivity",
      "Discontinued model"
    ]
  }'
```

6. **Assign Multiple Products to Vendor:**
```bash
curl -X POST http://localhost:5000/api/admin/products/assign-vendor \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "vendorId": "VENDOR_ID",
    "productIds": ["PRODUCT_ID_1", "PRODUCT_ID_2", "PRODUCT_ID_3"]
  }'
```

7. **Delete Product:**
```bash
curl -X DELETE http://localhost:5000/api/admin/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Features

- ✅ **JWT Authentication** - All endpoints protected
- ✅ **Input Validation** - Comprehensive validation for all fields
- ✅ **Image Management** - Main image (required) and additional images (optional)
- ✅ **Image URL Validation** - Validates image URLs for supported formats (jpg, jpeg, png, gif, webp, svg)
- ✅ **Protocol-Relative URL Support** - Additional images support URLs starting with `//`
- ✅ **Nested Subcategory Support** - Full hierarchy path tracking with subcategoryPath
- ✅ **Pagination** - Efficient data loading with page/limit
- ✅ **Search** - Search by title and keywords
- ✅ **Profit Margin Calculation** - Automatic calculation of profit margin
- ✅ **Error Handling** - Detailed error messages
- ✅ **ObjectId Validation** - Proper MongoDB ObjectId validation
- ✅ **Flexible Attributes** - Dynamic product attributes
- ✅ **Keywords Support** - SEO-friendly keywords
- ✅ **Product URL Support** - Optional product URL for external links
- ✅ **Vendor Site Support** - Vendor name tracking (Flipkart, Amazon, etc.)
- ✅ **Status Management** - Active/inactive product status
- ✅ **Timestamp Management** - Automatic createdAt and updatedAt tracking

## Notes

- All prices are stored as numbers (not strings)
- SRP cannot be greater than MRP
- **Main image is required** and must be a valid image URL
- **Additional images are optional** and can be an array of valid image URLs
- **Supported image formats**: jpg, jpeg, png, gif, webp, svg
- **Image URLs must start with http:// or https://**
- Attributes array can contain multiple key-value pairs (keys up to 100 chars, values up to 2000 chars)
- Specifications array can contain multiple key-value pairs (keys up to 100 chars, values up to 2000 chars)
- Keywords array supports multiple search terms
- Profit margin is automatically calculated as: `((MRP - SRP) / MRP) * 100`
- All timestamps are in ISO format
- ObjectId validation ensures 24-character hex strings
- **Product URL** is optional and must be a valid URL starting with http:// or https://
- **Vendor Site** is optional and should be a vendor name (2-100 characters) like "Flipkart", "Amazon", "Myntra"
- **UpdatedAt** timestamp is automatically updated on every product modification
- Both PUT and PATCH operations support updating productUrl and vendorSite fields
- **Complete Data Responses**: Both PUT and PATCH update operations return complete product data including category, subcategory, and all fields
- **Image Updates**: Both mainImage and additionalImages can be updated via PUT and PATCH operations
- **Content Updates**: All content fields (features, specifications, highlights, attributes) can be updated
- **Relationship Data**: Update responses include populated category and subcategory information
- **SubcategoryPath**: Automatically generated hierarchy path showing the full category structure from main category to final subcategory
- **Nested Subcategories**: Supports unlimited nesting levels (Category → Subcategory → Sub-subcategory → etc.)
- **Protocol-Relative URLs**: Additional images support URLs starting with `//` for flexible protocol handling
- **Same ID Support**: Allows using the same ID for both categoryId and subcategoryId when appropriate

## CategoryPath Feature

The `categoryPath` field allows you to specify the complete hierarchy path as an array of category IDs. This provides a more flexible way to define nested category structures.

### Request Structure Options

**Option 1: Traditional Structure (Backward Compatible)**
```json
{
  "categoryId": "68d635a655a3f58724e487c3",
  "subcategoryId": "68d635a655a3f58724e487c8"
}
```

**Option 2: New CategoryPath Structure**
```json
{
  "categoryPath": [
    "68d635a655a3f58724e487c3",  // Main Category (Electronics)
    "68d635a655a3f58724e487c8",  // Subcategory (Smartphones)
    "68d635a655a3f58724e487c9"   // Sub-subcategory (Android Phones)
  ]
}
```

### Benefits of CategoryPath
- **Flexible Nesting**: Support for unlimited nesting levels
- **Clear Hierarchy**: Array order represents the category hierarchy
- **Simplified Structure**: Single field instead of multiple category fields
- **Backward Compatible**: Old structure still works

## SubcategoryPath Feature

The `subcategoryPath` field provides a complete hierarchy path from the main category to the final subcategory. This is automatically generated when creating or updating products.

### Structure
```json
"subcategoryPath": [
  {
    "_id": "68d635a655a3f58724e487c3",
    "name": "Electronics",
    "slug": "electronics",
    "level": 0
  },
  {
    "_id": "68d635a655a3f58724e487c8",
    "name": "Smartphones",
    "slug": "smartphones",
    "level": 1
  },
  {
    "_id": "68d635a655a3f58724e487c9",
    "name": "Android Phones",
    "slug": "android-phones",
    "level": 2
  }
]
```

### Benefits
- **Complete Hierarchy**: Shows the full path from main category to final subcategory
- **Level Tracking**: Each item has a `level` field (0 = main category, 1+ = subcategories)
- **Navigation Support**: Enables breadcrumb navigation in frontend applications
- **SEO Friendly**: Provides structured category information for search engines
- **Flexible Nesting**: Supports unlimited nesting levels

### Example Use Cases
1. **Breadcrumb Navigation**: `Electronics > Smartphones > Android Phones`
2. **Category Filtering**: Filter products by any level in the hierarchy
3. **SEO URLs**: Generate clean URLs like `/electronics/smartphones/android-phones`
4. **Analytics**: Track product performance at different category levels
