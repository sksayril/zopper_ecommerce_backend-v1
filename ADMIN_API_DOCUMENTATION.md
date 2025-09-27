# 🔐 Admin Authentication API Documentation

## Overview
Complete Admin Authentication API for E-commerce project using JWT token-based authentication with Express.js, MongoDB Atlas, and bcrypt.

**Base URL:** `http://localhost:5000/api`

---

## 📋 Table of Contents
- [Admin Authentication Endpoints](#admin-authentication-endpoints)
- [Request/Response Examples](#requestresponse-examples)
- [Error Handling](#error-handling)
- [JWT Token Management](#jwt-token-management)
- [Database Schema](#database-schema)
- [Testing Guide](#testing-guide)
- [Security Features](#security-features)

---

## 🔐 Admin Authentication Endpoints

### 1. Admin Signup
Create a new admin account with required information.

**Endpoint:** `POST /api/admin/signup`

**Request Body:**
```json
{
  "name": "string (required, 2-50 characters)",
  "email": "string (required, valid email format, unique)",
  "password": "string (required, min 6 characters)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin account created successfully",
  "data": {
    "admin": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Admin",
      "email": "admin@example.com",
      "role": "admin",
      "isActive": true,
      "createdAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

**Status Codes:**
- `201` - Admin created successfully
- `400` - Missing required fields or validation error
- `409` - Email already exists
- `500` - Internal server error

**Validation Rules:**
- Name: 2-50 characters, required
- Email: Valid email format, unique, required
- Password: Minimum 6 characters, required

---

### 2. Admin Login
Authenticate admin and create JWT session.

**Endpoint:** `POST /api/admin/login`

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "admin": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Admin",
      "email": "admin@example.com",
      "role": "admin",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Status Codes:**
- `200` - Login successful
- `400` - Missing credentials
- `401` - Invalid email/password or account deactivated
- `500` - Internal server error

**Note:** After successful login, a JWT token will be returned. Include this token in the Authorization header for protected routes.

---

### 3. Admin Logout
Logout admin (JWT tokens are stateless, this is for client-side cleanup).

**Endpoint:** `POST /api/admin/logout`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Admin logout successful. Please remove the token from client storage."
}
```

**Status Codes:**
- `200` - Logout successful
- `401` - Admin authentication required
- `500` - Internal server error

---

### 4. Get Current Admin Profile
Get logged-in admin's complete profile information.

**Endpoint:** `GET /api/admin/me`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Admin profile retrieved successfully",
  "data": {
    "admin": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Admin",
      "email": "admin@example.com",
      "role": "admin",
      "isActive": true,
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

**Status Codes:**
- `200` - Profile retrieved successfully
- `401` - Admin authentication required
- `404` - Admin not found
- `500` - Internal server error

---

### 5. Change Admin Password
Change admin password with current password verification.

**Endpoint:** `POST /api/admin/change-password`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "currentPassword": "string (required, current password)",
  "newPassword": "string (required, min 6 characters)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "adminId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "admin@example.com",
    "updatedAt": "2023-09-06T12:00:00.000Z"
  }
}
```

**Status Codes:**
- `200` - Password changed successfully
- `400` - Missing fields, validation error, or same password
- `401` - Invalid current password or authentication required
- `404` - Admin not found
- `500` - Internal server error

**Validation Rules:**
- Current password: Required, must match existing password
- New password: Required, minimum 6 characters, must be different from current password

---

### 6. Forgot Admin Password
Generate a password reset token for admin.

**Endpoint:** `POST /api/admin/forgot-password`

**Request Body:**
```json
{
  "email": "string (required, admin email address)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset token generated successfully",
  "data": {
    "resetToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
    "expiresAt": "2023-09-06T13:00:00.000Z",
    "note": "In production, this token would be sent via email"
  }
}
```

**Status Codes:**
- `200` - Reset token generated successfully
- `400` - Email is required
- `401` - Admin account is deactivated
- `404` - No admin found with this email
- `500` - Internal server error

**Note:** In production, the reset token would be sent via email instead of returned in the response.

---

### 7. Reset Admin Password
Reset admin password using reset token.

**Endpoint:** `POST /api/admin/reset-password`

**Request Body:**
```json
{
  "resetToken": "string (required, reset token from forgot password)",
  "newPassword": "string (required, min 6 characters)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": {
    "adminId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "admin@example.com",
    "updatedAt": "2023-09-06T13:30:00.000Z"
  }
}
```

**Status Codes:**
- `200` - Password reset successfully
- `400` - Missing fields, validation error, or invalid/expired token
- `500` - Internal server error

**Validation Rules:**
- Reset token: Required, must be valid and not expired (1 hour expiry)
- New password: Required, minimum 6 characters

---

### 8. Create Vendor (Admin Only)
Admin creates a new vendor account.

**Endpoint:** `POST /api/admin/vendor`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "string (required, 2-50 characters)",
  "email": "string (required, valid email format, unique)",
  "password": "string (required, min 6 characters)",
  "phone": "string (required, valid phone number)",
  "address": {
    "street": "string (required, max 200 characters)",
    "city": "string (required, max 50 characters)",
    "state": "string (required, max 50 characters)",
    "zipCode": "string (required, valid ZIP code)",
    "country": "string (required, max 50 characters)"
  },
  "shopName": "string (optional, 2-100 characters, unique)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor created successfully by admin",
  "data": {
    "vendor": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Vendor",
      "email": "vendor@example.com",
      "shopName": "John's Electronics",
      "phone": "+1234567890",
      "address": {
        "street": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      },
      "role": "vendor",
      "isVerified": false,
      "createdBy": "64f8a1b2c3d4e5f6a7b8c9d1",
      "createdAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

**Status Codes:**
- `201` - Vendor created successfully
- `400` - Missing required fields or validation error
- `401` - Admin authentication required
- `409` - Email or shop name already exists
- `500` - Internal server error

---

### 9. Get All Vendors (Admin Only)
Admin gets all vendors created by them.

**Endpoint:** `GET /api/admin/vendors`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Vendors retrieved successfully",
  "data": {
    "vendors": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "John Vendor",
        "email": "vendor@example.com",
        "shopName": "John's Electronics",
        "phone": "+1234567890",
        "address": {
          "street": "123 Main Street",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001",
          "country": "USA"
        },
        "role": "vendor",
        "isVerified": false,
        "createdBy": "64f8a1b2c3d4e5f6a7b8c9d1",
        "createdAt": "2023-09-06T10:30:00.000Z"
      }
    ],
    "count": 1
  }
}
```

**Status Codes:**
- `200` - Vendors retrieved successfully
- `401` - Admin authentication required
- `500` - Internal server error

---

### 10. Get Vendor Details (Admin Only)
Admin gets specific vendor details.

**Endpoint:** `GET /api/admin/vendor/:id`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor details retrieved successfully",
  "data": {
    "vendor": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Vendor",
      "email": "vendor@example.com",
      "shopName": "John's Electronics",
      "phone": "+1234567890",
      "address": {
        "street": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      },
      "role": "vendor",
      "isVerified": false,
      "createdBy": "64f8a1b2c3d4e5f6a7b8c9d1",
      "createdAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

**Status Codes:**
- `200` - Vendor details retrieved successfully
- `401` - Admin authentication required
- `404` - Vendor not found or no permission
- `500` - Internal server error

---

### 11. Create Product Category (Admin Only)
Admin creates a new product category.

**Endpoint:** `POST /api/admin/category`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "string (required, 2-100 characters, unique)",
  "description": "string (optional, max 500 characters)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Category created successfully by admin",
  "data": {
    "category": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Electronics",
      "description": "Electronic devices and accessories including smartphones, laptops, and gadgets",
      "slug": "electronics",
      "isActive": true,
      "createdBy": "64f8a1b2c3d4e5f6a7b8c9d1",
      "createdAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

**Status Codes:**
- `201` - Category created successfully
- `400` - Missing required field or validation error
- `401` - Admin authentication required
- `409` - Category name already exists
- `500` - Internal server error

---

### 12. Get All Categories (Admin Only)
Admin gets all product categories with pagination and search.

**Endpoint:** `GET /api/admin/categories`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or description
- `isActive` (optional): Filter by active status (true/false)

**Response:**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": {
    "categories": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "Electronics",
        "description": "Electronic devices and accessories",
        "slug": "electronics",
        "isActive": true,
        "createdBy": {
          "id": "64f8a1b2c3d4e5f6a7b8c9d1",
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "createdAt": "2023-09-06T10:30:00.000Z"
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

**Status Codes:**
- `200` - Categories retrieved successfully
- `401` - Admin authentication required
- `500` - Internal server error

---

### 13. Get Category Details (Admin Only)
Admin gets specific category details.

**Endpoint:** `GET /api/admin/category/:id`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Category details retrieved successfully",
  "data": {
    "category": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Electronics",
      "description": "Electronic devices and accessories including smartphones, laptops, and gadgets",
      "slug": "electronics",
      "isActive": true,
      "createdBy": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

**Status Codes:**
- `200` - Category details retrieved successfully
- `401` - Admin authentication required
- `404` - Category not found
- `500` - Internal server error

---

### 14. Update Category (Admin Only)
Admin updates category information.

**Endpoint:** `PUT /api/admin/category/:id`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "string (optional, 2-100 characters, unique)",
  "description": "string (optional, max 500 characters)",
  "isActive": "boolean (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "category": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Updated Electronics",
      "description": "Updated description for electronic devices",
      "slug": "updated-electronics",
      "isActive": true,
      "createdBy": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T11:30:00.000Z"
    }
  }
}
```

**Status Codes:**
- `200` - Category updated successfully
- `400` - Validation error or no fields to update
- `401` - Admin authentication required
- `404` - Category not found
- `409` - Category name already exists
- `500` - Internal server error

---

### 15. Delete Category (Admin Only)
Admin deletes a category.

**Endpoint:** `DELETE /api/admin/category/:id`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Category deleted successfully",
  "data": {
    "deletedCategory": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Electronics"
    }
  }
}
```

**Status Codes:**
- `200` - Category deleted successfully
- `401` - Admin authentication required
- `404` - Category not found
- `500` - Internal server error

---

### 16. Create Subcategory (Admin Only)
Admin creates a new subcategory under a parent category. Supports unlimited nesting levels - subcategories can be created under main categories or other subcategories.

**Endpoint:** `POST /api/admin/subcategory`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "string (required, 2-100 characters, unique under parent)",
  "description": "string (optional, max 500 characters)",
  "parentCategoryId": "string (required, valid parent category ID - can be main category or subcategory)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subcategory created successfully by admin",
  "data": {
    "subcategory": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Smartphones",
      "description": "Mobile phones and accessories",
      "slug": "smartphones",
      "isSubcategory": true,
      "parentCategory": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "Electronics",
        "slug": "electronics"
      },
      "isActive": true,
      "createdBy": "64f8a1b2c3d4e5f6a7b8c9d2",
      "createdAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

**Status Codes:**
- `201` - Subcategory created successfully
- `400` - Missing required fields or validation error
- `401` - Admin authentication required
- `404` - Parent category not found
- `409` - Subcategory name already exists under parent
- `500` - Internal server error

**Note:** This endpoint supports unlimited nesting levels. You can create subcategories under main categories or under existing subcategories, allowing for complex hierarchical structures like:
- Electronics → Smartphones → iPhone → iPhone 15
- Electronics → Laptops → Gaming Laptops → ASUS Gaming

---

### 17. Get All Subcategories (Admin Only)
Admin gets all subcategories with optional parent filter.

**Endpoint:** `GET /api/admin/subcategories`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or description
- `parentCategoryId` (optional): Filter by parent category
- `isActive` (optional): Filter by active status (true/false)

**Response:**
```json
{
  "success": true,
  "message": "Subcategories retrieved successfully",
  "data": {
    "subcategories": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "Smartphones",
        "description": "Mobile phones and accessories",
        "slug": "smartphones",
        "isSubcategory": true,
        "parentCategory": {
          "id": "64f8a1b2c3d4e5f6a7b8c9d1",
          "name": "Electronics",
          "slug": "electronics"
        },
        "isActive": true,
        "createdBy": {
          "id": "64f8a1b2c3d4e5f6a7b8c9d2",
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "createdAt": "2023-09-06T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalSubcategories": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

**Status Codes:**
- `200` - Subcategories retrieved successfully
- `401` - Admin authentication required
- `500` - Internal server error

---

### 18. Get Subcategory Details (Admin Only)
Admin gets specific subcategory details.

**Endpoint:** `GET /api/admin/subcategory/:id`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Subcategory details retrieved successfully",
  "data": {
    "subcategory": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Smartphones",
      "description": "Mobile phones and accessories including cases, chargers, and screen protectors",
      "slug": "smartphones",
      "isSubcategory": true,
      "parentCategory": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "Electronics",
        "slug": "electronics"
      },
      "isActive": true,
      "createdBy": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

**Status Codes:**
- `200` - Subcategory details retrieved successfully
- `401` - Admin authentication required
- `404` - Subcategory not found
- `500` - Internal server error

---

### 19. Update Subcategory (Admin Only)
Admin updates subcategory information.

**Endpoint:** `PUT /api/admin/subcategory/:id`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "string (optional, 2-100 characters, unique under parent)",
  "description": "string (optional, max 500 characters)",
  "isActive": "boolean (optional)",
  "parentCategoryId": "string (optional, valid parent category ID)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subcategory updated successfully",
  "data": {
    "subcategory": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Updated Smartphones",
      "description": "Updated description for mobile phones",
      "slug": "updated-smartphones",
      "isSubcategory": true,
      "parentCategory": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "Electronics",
        "slug": "electronics"
      },
      "isActive": true,
      "createdBy": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T11:30:00.000Z"
    }
  }
}
```

**Status Codes:**
- `200` - Subcategory updated successfully
- `400` - Validation error or no fields to update
- `401` - Admin authentication required
- `404` - Subcategory not found
- `409` - Subcategory name already exists under parent
- `500` - Internal server error

---

### 20. Delete Subcategory (Admin Only)
Admin deletes a subcategory.

**Endpoint:** `DELETE /api/admin/subcategory/:id`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Subcategory deleted successfully",
  "data": {
    "deletedSubcategory": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Smartphones",
      "parentCategory": "64f8a1b2c3d4e5f6a7b8c9d1"
    }
  }
}
```

**Status Codes:**
- `200` - Subcategory deleted successfully
- `401` - Admin authentication required
- `404` - Subcategory not found
- `500` - Internal server error

---

### 21. Get Category Subcategories (Admin Only)
Admin gets all subcategories of a specific parent category.

**Endpoint:** `GET /api/admin/category/:id/subcategories`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or description
- `isActive` (optional): Filter by active status (true/false)

**Response:**
```json
{
  "success": true,
  "message": "Subcategories retrieved successfully",
  "data": {
    "parentCategory": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "Electronics",
      "slug": "electronics"
    },
    "subcategories": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "Smartphones",
        "description": "Mobile phones and accessories",
        "slug": "smartphones",
        "isSubcategory": true,
        "isActive": true,
        "createdBy": {
          "id": "64f8a1b2c3d4e5f6a7b8c9d2",
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "createdAt": "2023-09-06T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalSubcategories": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

**Status Codes:**
- `200` - Subcategories retrieved successfully
- `401` - Admin authentication required
- `404` - Parent category not found
- `500` - Internal server error

---

### 22. Verify Admin JWT Token
Verify if admin JWT token is valid.

**Endpoint:** `GET /api/admin/verify`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (Valid Token):**
```json
{
  "success": true,
  "message": "Admin token is valid",
  "data": {
    "isLoggedIn": true,
    "adminId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "role": "admin",
    "email": "admin@example.com"
  }
}
```

**Response (Invalid Token):**
```json
{
  "success": false,
  "message": "Access denied. Invalid token.",
  "error": "Invalid token"
}
```

**Status Codes:**
- `200` - Request successful (valid or invalid token)
- `401` - Invalid or expired token

---

## 📝 Request/Response Examples

### Example 1: Admin Signup
```bash
curl -X POST http://localhost:5000/api/admin/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Admin",
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Admin account created successfully",
  "data": {
    "admin": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Admin",
      "email": "admin@example.com",
      "role": "admin",
      "isActive": true,
      "createdAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

### Example 2: Admin Login
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "admin": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Admin",
      "email": "admin@example.com",
      "role": "admin",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Example 3: Get Admin Profile
```bash
curl -X GET http://localhost:5000/api/admin/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Admin profile retrieved successfully",
  "data": {
    "admin": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Admin",
      "email": "admin@example.com",
      "role": "admin",
      "isActive": true,
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

### Example 4: Verify JWT Token
```bash
curl -X GET http://localhost:5000/api/admin/verify \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Admin token is valid",
  "data": {
    "isLoggedIn": true,
    "adminId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "role": "admin",
    "email": "admin@example.com"
  }
}
```

### Example 5: Change Admin Password
```bash
curl -X POST http://localhost:5000/api/admin/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "currentPassword": "admin123",
    "newPassword": "newadmin456"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "adminId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "admin@example.com",
    "updatedAt": "2023-09-06T12:00:00.000Z"
  }
}
```

### Example 6: Forgot Admin Password
```bash
curl -X POST http://localhost:5000/api/admin/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset token generated successfully",
  "data": {
    "resetToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
    "expiresAt": "2023-09-06T13:00:00.000Z",
    "note": "In production, this token would be sent via email"
  }
}
```

### Example 7: Reset Admin Password
```bash
curl -X POST http://localhost:5000/api/admin/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "resetToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
    "newPassword": "newpassword123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": {
    "adminId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "admin@example.com",
    "updatedAt": "2023-09-06T13:30:00.000Z"
  }
}
```

### Example 8: Create Vendor (Admin Only)
```bash
curl -X POST http://localhost:5000/api/admin/vendor \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "name": "John Vendor",
    "email": "vendor@example.com",
    "password": "vendor123",
    "phone": "+1234567890",
    "address": {
      "street": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "shopName": "Johns Electronics Store"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor created successfully by admin",
  "data": {
    "vendor": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Vendor",
      "email": "vendor@example.com",
      "shopName": "Johns Electronics Store",
      "phone": "+1234567890",
      "address": {
        "street": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      },
      "role": "vendor",
      "isVerified": false,
      "createdBy": "64f8a1b2c3d4e5f6a7b8c9d1",
      "createdAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

### Example 9: Get All Vendors (Admin Only)
```bash
curl -X GET http://localhost:5000/api/admin/vendors \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Vendors retrieved successfully",
  "data": {
    "vendors": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "John Vendor",
        "email": "vendor@example.com",
        "shopName": "Johns Electronics Store",
        "phone": "+1234567890",
        "address": {
          "street": "123 Main Street",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001",
          "country": "USA"
        },
        "role": "vendor",
        "isVerified": false,
        "createdBy": "64f8a1b2c3d4e5f6a7b8c9d1",
        "createdAt": "2023-09-06T10:30:00.000Z"
      }
    ],
    "count": 1
  }
}
```

### Example 10: Get Vendor Details (Admin Only)
```bash
curl -X GET http://localhost:5000/api/admin/vendor/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor details retrieved successfully",
  "data": {
    "vendor": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Vendor",
      "email": "vendor@example.com",
      "shopName": "Johns Electronics Store",
      "phone": "+1234567890",
      "address": {
        "street": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      },
      "role": "vendor",
      "isVerified": false,
      "createdBy": "64f8a1b2c3d4e5f6a7b8c9d1",
      "createdAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

### Example 11: Create Product Category (Admin Only)
```bash
curl -X POST http://localhost:5000/api/admin/category \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "name": "Electronics"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Category created successfully by admin",
  "data": {
    "category": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Electronics",
      "description": null,
      "slug": "electronics",
      "isActive": true,
      "createdBy": "64f8a1b2c3d4e5f6a7b8c9d1",
      "createdAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

### Example 12: Get All Categories (Admin Only)
```bash
curl -X GET "http://localhost:5000/api/admin/categories?page=1&limit=10&search=electronics" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": {
    "categories": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "Electronics",
        "description": "Electronic devices and accessories",
        "slug": "electronics",
        "isActive": true,
        "createdBy": {
          "id": "64f8a1b2c3d4e5f6a7b8c9d1",
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "createdAt": "2023-09-06T10:30:00.000Z"
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

### Example 13: Get Category Details (Admin Only)
```bash
curl -X GET http://localhost:5000/api/admin/category/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Category details retrieved successfully",
  "data": {
    "category": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Electronics",
      "description": "Electronic devices and accessories including smartphones, laptops, and gadgets",
      "slug": "electronics",
      "isActive": true,
      "createdBy": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

### Example 14: Update Category (Admin Only)
```bash
curl -X PUT http://localhost:5000/api/admin/category/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "name": "Updated Electronics",
    "description": "Updated description for electronic devices and accessories"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "category": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Updated Electronics",
      "description": "Updated description for electronic devices and accessories",
      "slug": "updated-electronics",
      "isActive": true,
      "createdBy": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T11:30:00.000Z"
    }
  }
}
```

### Example 15: Delete Category (Admin Only)
```bash
curl -X DELETE http://localhost:5000/api/admin/category/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Category deleted successfully",
  "data": {
    "deletedCategory": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Electronics"
    }
  }
}
```

### Example 16: Create Subcategory (Admin Only)
```bash
curl -X POST http://localhost:5000/api/admin/subcategory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "name": "Smartphones",
    "description": "Mobile phones and accessories",
    "parentCategoryId": "64f8a1b2c3d4e5f6a7b8c9d1"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Subcategory created successfully by admin",
  "data": {
    "subcategory": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Smartphones",
      "description": "Mobile phones and accessories",
      "slug": "smartphones",
      "isSubcategory": true,
      "parentCategory": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "Electronics",
        "slug": "electronics"
      },
      "isActive": true,
      "createdBy": "64f8a1b2c3d4e5f6a7b8c9d2",
      "createdAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

### Example 17: Get All Subcategories (Admin Only)
```bash
curl -X GET "http://localhost:5000/api/admin/subcategories?page=1&limit=10&parentCategoryId=64f8a1b2c3d4e5f6a7b8c9d1" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Subcategories retrieved successfully",
  "data": {
    "subcategories": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "Smartphones",
        "description": "Mobile phones and accessories",
        "slug": "smartphones",
        "isSubcategory": true,
        "parentCategory": {
          "id": "64f8a1b2c3d4e5f6a7b8c9d1",
          "name": "Electronics",
          "slug": "electronics"
        },
        "isActive": true,
        "createdBy": {
          "id": "64f8a1b2c3d4e5f6a7b8c9d2",
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "createdAt": "2023-09-06T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalSubcategories": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### Example 18: Get Subcategory Details (Admin Only)
```bash
curl -X GET http://localhost:5000/api/admin/subcategory/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Subcategory details retrieved successfully",
  "data": {
    "subcategory": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Smartphones",
      "description": "Mobile phones and accessories including cases, chargers, and screen protectors",
      "slug": "smartphones",
      "isSubcategory": true,
      "parentCategory": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "Electronics",
        "slug": "electronics"
      },
      "isActive": true,
      "createdBy": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

### Example 19: Update Subcategory (Admin Only)
```bash
curl -X PUT http://localhost:5000/api/admin/subcategory/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "name": "Updated Smartphones",
    "description": "Updated description for mobile phones and accessories"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Subcategory updated successfully",
  "data": {
    "subcategory": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Updated Smartphones",
      "description": "Updated description for mobile phones and accessories",
      "slug": "updated-smartphones",
      "isSubcategory": true,
      "parentCategory": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "Electronics",
        "slug": "electronics"
      },
      "isActive": true,
      "createdBy": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T11:30:00.000Z"
    }
  }
}
```

### Example 20: Delete Subcategory (Admin Only)
```bash
curl -X DELETE http://localhost:5000/api/admin/subcategory/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Subcategory deleted successfully",
  "data": {
    "deletedSubcategory": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Smartphones",
      "parentCategory": "64f8a1b2c3d4e5f6a7b8c9d1"
    }
  }
}
```

### Example 21: Get Category Subcategories (Admin Only)
```bash
curl -X GET "http://localhost:5000/api/admin/category/64f8a1b2c3d4e5f6a7b8c9d1/subcategories?page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Subcategories retrieved successfully",
  "data": {
    "parentCategory": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "Electronics",
      "slug": "electronics"
    },
    "subcategories": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "Smartphones",
        "description": "Mobile phones and accessories",
        "slug": "smartphones",
        "isSubcategory": true,
        "isActive": true,
        "createdBy": {
          "id": "64f8a1b2c3d4e5f6a7b8c9d2",
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "createdAt": "2023-09-06T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalSubcategories": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### Example 22: Admin Logout
```bash
curl -X POST http://localhost:5000/api/admin/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Admin logout successful. Please remove the token from client storage."
}
```

---

## ❌ Error Handling

### Error Response Format
All errors follow this consistent format:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "Error type or technical details"
}
```

### Common Error Types

#### Validation Errors (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Name must be at least 2 characters long, Please enter a valid email"
}
```

#### Authentication Errors (401)
```json
{
  "success": false,
  "message": "Access denied. No token provided.",
  "error": "Token required"
}
```

#### Not Found Errors (404)
```json
{
  "success": false,
  "message": "Admin not found",
  "error": "Admin does not exist"
}
```

#### Conflict Errors (409)
```json
{
  "success": false,
  "message": "Admin with this email already exists",
  "error": "Email already registered"
}
```

#### Server Errors (500)
```json
{
  "success": false,
  "message": "Internal server error during admin signup",
  "error": "Admin signup failed"
}
```

---

## 🔒 JWT Token Management

### JWT Configuration
- **Storage:** Client-side (localStorage, sessionStorage, or memory)
- **Format:** Bearer token in Authorization header
- **Expiration:** 1 hour
- **Data Stored:** adminId, email, role

### JWT Token Structure
```javascript
// Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload
{
  "id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "email": "admin@example.com",
  "role": "admin",
  "iat": 1694000000,
  "exp": 1694003600
}
```

### JWT Security
- Stateless authentication
- Signed with secret key
- Automatic expiration (1 hour)
- Client-side token management
- No server-side session storage

---

## 🗄️ Database Schema

### Admin Collection
```javascript
{
  _id: ObjectId,
  name: String (required, 2-50 chars),
  email: String (required, unique, valid email),
  password: String (required, min 6 chars, hashed),
  role: String (enum: 'admin', default: 'admin'),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Field Descriptions
- **name**: Admin's full name (2-50 characters)
- **email**: Unique email address with validation
- **password**: Hashed password using bcrypt (12 salt rounds)
- **role**: Always 'admin' for admin accounts
- **isActive**: Account status (true/false)
- **createdAt**: Account creation timestamp
- **updatedAt**: Last update timestamp

---

## 🧪 Testing Guide

### Using cURL

#### 1. Create an Admin Account
```bash
curl -X POST http://localhost:5000/api/admin/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Admin",
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

#### 2. Login Admin (Get JWT Token)
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

#### 3. Get Admin Profile (with JWT)
```bash
curl -X GET http://localhost:5000/api/admin/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### 4. Verify JWT Token
```bash
curl -X GET http://localhost:5000/api/admin/verify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### 5. Change Admin Password (with JWT)
```bash
curl -X POST http://localhost:5000/api/admin/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "currentPassword": "admin123",
    "newPassword": "newadmin456"
  }'
```

#### 6. Forgot Admin Password
```bash
curl -X POST http://localhost:5000/api/admin/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com"}'
```

#### 7. Reset Admin Password
```bash
curl -X POST http://localhost:5000/api/admin/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "resetToken": "YOUR_RESET_TOKEN_HERE",
    "newPassword": "newpassword123"
  }'
```

#### 8. Create Vendor (Admin Only)
```bash
curl -X POST http://localhost:5000/api/admin/vendor \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "name": "John Vendor",
    "email": "vendor@example.com",
    "password": "vendor123",
    "phone": "+1234567890",
    "address": {
      "street": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "shopName": "Johns Electronics Store"
  }'
```

#### 9. Get All Vendors (Admin Only)
```bash
curl -X GET http://localhost:5000/api/admin/vendors \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### 10. Get Vendor Details (Admin Only)
```bash
curl -X GET http://localhost:5000/api/admin/vendor/VENDOR_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### 11. Create Product Category (Admin Only)
```bash
curl -X POST http://localhost:5000/api/admin/category \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "name": "Electronics"
  }'
```

#### 12. Get All Categories (Admin Only)
```bash
curl -X GET "http://localhost:5000/api/admin/categories?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### 13. Get Category Details (Admin Only)
```bash
curl -X GET http://localhost:5000/api/admin/category/CATEGORY_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### 14. Update Category (Admin Only)
```bash
curl -X PUT http://localhost:5000/api/admin/category/CATEGORY_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "name": "Updated Electronics",
    "description": "Updated description for electronic devices"
  }'
```

#### 15. Delete Category (Admin Only)
```bash
curl -X DELETE http://localhost:5000/api/admin/category/CATEGORY_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### 16. Create Subcategory (Admin Only)
```bash
curl -X POST http://localhost:5000/api/admin/subcategory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "name": "Smartphones",
    "description": "Mobile phones and accessories",
    "parentCategoryId": "PARENT_CATEGORY_ID_HERE"
  }'
```

#### 17. Get All Subcategories (Admin Only)
```bash
curl -X GET "http://localhost:5000/api/admin/subcategories?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### 18. Get Subcategory Details (Admin Only)
```bash
curl -X GET http://localhost:5000/api/admin/subcategory/SUBCATEGORY_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### 19. Update Subcategory (Admin Only)
```bash
curl -X POST http://localhost:5000/api/admin/subcategory/SUBCATEGORY_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "name": "Updated Smartphones",
    "description": "Updated description for mobile phones"
  }'
```

#### 20. Delete Subcategory (Admin Only)
```bash
curl -X POST http://localhost:5000/api/admin/subcategory/SUBCATEGORY_ID_HERE/delete \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### 21. Get Category Subcategories (Admin Only)
```bash
curl -X GET "http://localhost:5000/api/admin/category/CATEGORY_ID_HERE/subcategories?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### 22. Logout Admin (with JWT)
```bash
curl -X POST http://localhost:5000/api/admin/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Using Postman
1. **Set Base URL:** `http://localhost:5000/api`
2. **For Signup/Login:** Use POST method with JSON body
3. **For Protected Routes:** Include JWT token in Authorization header
4. **Token Management:** Store JWT token from login response
5. **Header Format:** `Authorization: Bearer <your-jwt-token>`

---

## 🔐 Security Features

### Password Security
- **Hashing:** bcrypt with 12 salt rounds
- **Never Stored:** Plain text passwords are never stored
- **Never Returned:** Passwords are never returned in API responses

### JWT Security
- **Secret Key:** Configurable via environment variable
- **Expiration:** 1 hour automatic expiration
- **Stateless:** No server-side session storage
- **Token Verification:** Real-time token validation

### Input Validation
- **Email Validation:** Regex pattern matching
- **Name Validation:** Length and character restrictions
- **Password Validation:** Minimum length requirements
- **Sanitization:** Input trimming and cleaning

### Account Security
- **Email Uniqueness:** Prevents duplicate admin accounts
- **Account Status:** Active/inactive account management
- **Token Cleanup:** Automatic token invalidation on logout

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
```env
JWT_SECRET=your-super-secret-jwt-key
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zopper
NODE_ENV=development
```

### 3. Start the Server
```bash
npm start
```

### 4. Test the Admin API
```bash
# Create admin account
curl -X POST http://localhost:5000/api/admin/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@test.com","password":"admin123"}'

# Login admin
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

### 5. API Base URL
```
http://localhost:5000/api
```

---

## 📊 API Summary

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/admin/signup` | Create new admin account | Public |
| POST | `/api/admin/login` | Admin login (returns JWT) | Public |
| POST | `/api/admin/logout` | Admin logout | Private (JWT) |
| GET | `/api/admin/me` | Get admin profile | Private (JWT) |
| POST | `/api/admin/change-password` | Change admin password | Private (JWT) |
| POST | `/api/admin/forgot-password` | Generate password reset token | Public |
| POST | `/api/admin/reset-password` | Reset password with token | Public |
| POST | `/api/admin/vendor` | Create vendor (admin only) | Private (JWT) |
| GET | `/api/admin/vendors` | Get all vendors (admin only) | Private (JWT) |
| GET | `/api/admin/vendor/:id` | Get vendor details (admin only) | Private (JWT) |
| POST | `/api/admin/category` | Create product category (admin only) | Private (JWT) |
| GET | `/api/admin/categories` | Get all categories (admin only) | Private (JWT) |
| GET | `/api/admin/category/:id` | Get category details (admin only) | Private (JWT) |
| PUT | `/api/admin/category/:id` | Update category (admin only) | Private (JWT) |
| DELETE | `/api/admin/category/:id` | Delete category (admin only) | Private (JWT) |
| POST | `/api/admin/subcategory` | Create subcategory (admin only) | Private (JWT) |
| GET | `/api/admin/subcategories` | Get all subcategories (admin only) | Private (JWT) |
| GET | `/api/admin/subcategory/:id` | Get subcategory details (admin only) | Private (JWT) |
| POST | `/api/admin/subcategory/:id` | Update subcategory (admin only) | Private (JWT) |
| POST | `/api/admin/subcategory/:id/delete` | Delete subcategory (admin only) | Private (JWT) |
| GET | `/api/admin/category/:id/subcategories` | Get category subcategories (admin only) | Private (JWT) |
| GET | `/api/admin/verify` | Verify JWT token | Public |

---

## 🔧 Configuration

### Environment Variables
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zopper
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### CORS Configuration
- **Origin:** Configurable via CLIENT_URL
- **Credentials:** Enabled for cross-origin requests
- **Methods:** GET, POST, PUT, DELETE, OPTIONS
- **Headers:** Content-Type, Authorization

---

## 📝 Notes

- All timestamps are in ISO 8601 format
- Passwords are never returned in API responses
- JWT tokens are stateless and client-managed
- Admin accounts are unique by email
- JWT tokens expire after 1 hour
- Include JWT token in Authorization header for protected routes
- Token format: `Authorization: Bearer <token>`

---

## 🤝 Support

For issues or questions:
1. Check the error response format
2. Verify your request format matches the documentation
3. Ensure JWT tokens are properly included in Authorization header
4. Check server logs for detailed error information
5. Verify JWT token is not expired
6. Check token format: `Authorization: Bearer <token>`

---

**API Version:** 1.0.0  
**Last Updated:** September 2024  
**Maintained by:** Zopper E-commerce Team
    

    