# 🏪 Vendor Authentication API Documentation

## Overview
Complete Vendor Authentication API for E-commerce project using JWT token-based authentication with Express.js, MongoDB Atlas, and bcrypt.

**Base URL:** `http://localhost:5000/api`

---

## 📋 Table of Contents
- [Vendor Authentication Endpoints](#vendor-authentication-endpoints)
- [Request/Response Examples](#requestresponse-examples)
- [Error Handling](#error-handling)
- [Session Management](#session-management)
- [Database Schema](#database-schema)
- [Testing Guide](#testing-guide)
- [Security Features](#security-features)
- [Business Information](#business-information)

---

## 🔐 Vendor Authentication Endpoints

### 1. Vendor Registration
Register a new vendor account with business information.

**Endpoint:** `POST /api/vendor/register`

**Request Body:**
```json
{
  "name": "string (required, 2-50 characters)",
  "email": "string (required, valid email format)",
  "shopName": "string (required, 2-100 characters, unique)",
  "password": "string (required, min 6 characters)",
  "phone": "string (required, valid phone number)",
  "address": {
    "street": "string (required, max 200 characters)",
    "city": "string (required, max 50 characters)",
    "state": "string (required, max 50 characters)",
    "zipCode": "string (required, valid ZIP code)",
    "country": "string (required, max 50 characters)"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor registered successfully",
  "data": {
    "vendor": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john@example.com",
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
      "createdAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

**Status Codes:**
- `201` - Vendor created successfully
- `400` - Missing required fields or validation error
- `409` - Email or shop name already exists
- `500` - Internal server error

**Validation Rules:**
- Name: 2-50 characters, required
- Email: Valid email format, unique, required
- Shop Name: 2-100 characters, unique, required
- Password: Minimum 6 characters, required
- Phone: Valid phone number format, required
- Address: Complete address object with all fields required

---

### 2. Vendor Login
Authenticate vendor and create session.

**Endpoint:** `POST /api/vendor/login`

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
  "message": "Vendor login successful",
  "data": {
    "vendor": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john@example.com",
      "shopName": "John's Electronics",
      "phone": "+1234567890",
      "role": "vendor",
      "isVerified": false
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

### 3. Vendor Logout
Logout vendor (JWT tokens are stateless, this is for client-side cleanup).

**Endpoint:** `POST /api/vendor/logout`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor logout successful. Please remove the token from client storage."
}
```

**Status Codes:**
- `200` - Logout successful
- `500` - Internal server error

---

### 4. Get Current Vendor Profile
Get logged-in vendor's complete profile information.

**Endpoint:** `GET /api/vendor/me`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor profile retrieved successfully",
  "data": {
    "vendor": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john@example.com",
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
      "isActive": true,
      "isVerified": false,
      "businessLicense": "BL123456789",
      "taxId": "TAX123456789",
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

**Status Codes:**
- `200` - Profile retrieved successfully
- `401` - Vendor authentication required
- `404` - Vendor not found
- `500` - Internal server error

---

### 5. Update Vendor Profile
Update vendor profile information including business details.

**Endpoint:** `POST /api/vendor/profile`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "string (optional)",
  "phone": "string (optional)",
  "address": {
    "street": "string (optional)",
    "city": "string (optional)",
    "state": "string (optional)",
    "zipCode": "string (optional)",
    "country": "string (optional)"
  },
  "businessLicense": "string (optional)",
  "taxId": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor profile updated successfully",
  "data": {
    "vendor": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Updated Name",
      "email": "john@example.com",
      "shopName": "John's Electronics",
      "phone": "+1987654321",
      "address": {
        "street": "456 New Street",
        "city": "Los Angeles",
        "state": "CA",
        "zipCode": "90210",
        "country": "USA"
      },
      "role": "vendor",
      "isActive": true,
      "isVerified": false,
      "businessLicense": "BL987654321",
      "taxId": "TAX987654321",
      "updatedAt": "2023-09-06T11:30:00.000Z"
    }
  }
}
```

**Status Codes:**
- `200` - Profile updated successfully
- `400` - Validation error
- `401` - Vendor authentication required
- `404` - Vendor not found
- `500` - Internal server error

---

### 6. Change Vendor Password
Change vendor password with current password verification.

**Endpoint:** `POST /api/vendor/change-password`

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
    "vendorId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "john@example.com",
    "updatedAt": "2023-09-06T12:00:00.000Z"
  }
}
```

**Status Codes:**
- `200` - Password changed successfully
- `400` - Missing fields, validation error, or same password
- `401` - Invalid current password or authentication required
- `404` - Vendor not found
- `500` - Internal server error

**Validation Rules:**
- Current password: Required, must match existing password
- New password: Required, minimum 6 characters, must be different from current password

---

### 7. Forgot Password
Generate a password reset token for vendor.

**Endpoint:** `POST /api/vendor/forgot-password`

**Request Body:**
```json
{
  "email": "string (required, vendor email address)"
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
- `401` - Vendor account is deactivated
- `404` - No vendor found with this email
- `500` - Internal server error

**Note:** In production, the reset token would be sent via email instead of returned in the response.

---

### 8. Reset Password
Reset vendor password using reset token.

**Endpoint:** `POST /api/vendor/reset-password`

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
    "vendorId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "john@example.com",
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

### 9. Verify Vendor JWT Token
Verify if vendor JWT token is valid.

**Endpoint:** `GET /api/vendor/verify`

**Headers:**
```
Authorization: Bearer <jwt-token> (optional)
```

**Response (Valid Token):**
```json
{
  "success": true,
  "message": "Vendor token is valid",
  "data": {
    "isLoggedIn": true,
    "vendorId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "role": "vendor",
    "email": "john@example.com",
    "shopName": "John's Electronics"
  }
}
```

**Response (No/Invalid Token):**
```json
{
  "success": true,
  "message": "No valid vendor token provided",
  "data": {
    "isLoggedIn": false
  }
}
```

**Status Codes:**
- `200` - Request successful

---

## 📝 Request/Response Examples

### Example 1: Vendor Registration
```bash
curl -X POST http://localhost:5000/api/vendor/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "vendor@example.com",
    "shopName": "Johns Electronics Store",
    "password": "password123",
    "phone": "+1234567890",
    "address": {
      "street": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor registered successfully",
  "data": {
    "vendor": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
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
      "createdAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

### Example 2: Vendor Login
```bash
curl -X POST http://localhost:5000/api/vendor/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor login successful",
  "data": {
    "vendor": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "vendor@example.com",
      "shopName": "Johns Electronics Store",
      "phone": "+1234567890",
      "role": "vendor",
      "isVerified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Example 3: Get Vendor Profile
```bash
curl -X GET http://localhost:5000/api/vendor/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor profile retrieved successfully",
  "data": {
    "vendor": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
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
      "isActive": true,
      "isVerified": false,
      "businessLicense": null,
      "taxId": null,
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

### Example 4: Update Vendor Profile
```bash
curl -X PUT http://localhost:5000/api/vendor/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "name": "John Smith",
    "phone": "+1987654321",
    "businessLicense": "BL123456789",
    "taxId": "TAX123456789"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor profile updated successfully",
  "data": {
    "vendor": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Smith",
      "email": "vendor@example.com",
      "shopName": "Johns Electronics Store",
      "phone": "+1987654321",
      "address": {
        "street": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      },
      "role": "vendor",
      "isActive": true,
      "isVerified": false,
      "businessLicense": "BL123456789",
      "taxId": "TAX123456789",
      "updatedAt": "2023-09-06T11:30:00.000Z"
    }
  }
}
```

### Example 5: Verify JWT Token
```bash
curl -X GET http://localhost:5000/api/vendor/verify \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor token is valid",
  "data": {
    "isLoggedIn": true,
    "vendorId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "role": "vendor",
    "email": "vendor@example.com",
    "shopName": "Johns Electronics Store"
  }
}
```

### Example 6: Change Vendor Password
```bash
curl -X POST http://localhost:5000/api/vendor/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword456"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "vendorId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "vendor@example.com",
    "updatedAt": "2023-09-06T12:00:00.000Z"
  }
}
```

### Example 7: Forgot Password
```bash
curl -X POST http://localhost:5000/api/vendor/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@example.com"
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

### Example 8: Reset Password
```bash
curl -X POST http://localhost:5000/api/vendor/reset-password \
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
    "vendorId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "vendor@example.com",
    "updatedAt": "2023-09-06T13:30:00.000Z"
  }
}
```

### Example 9: Vendor Logout
```bash
curl -X POST http://localhost:5000/api/vendor/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor logout successful. Please remove the token from client storage."
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
  "message": "Access denied. Please login as a vendor to continue.",
  "error": "Vendor authentication required"
}
```

#### Not Found Errors (404)
```json
{
  "success": false,
  "message": "Vendor not found",
  "error": "Vendor does not exist"
}
```

#### Conflict Errors (409)
```json
{
  "success": false,
  "message": "Vendor with this email already exists",
  "error": "Email already registered"
}
```

#### Shop Name Conflict (409)
```json
{
  "success": false,
  "message": "Shop name already exists. Please choose a different shop name.",
  "error": "Shop name already taken"
}
```

#### Server Errors (500)
```json
{
  "success": false,
  "message": "Internal server error during vendor registration",
  "error": "Vendor registration failed"
}
```

---

## 🔒 JWT Token Management

### JWT Configuration
- **Storage:** Client-side (localStorage, sessionStorage, or memory)
- **Format:** Bearer token in Authorization header
- **Expiration:** 24 hours
- **Data Stored:** vendorId, email, role, shopName

### JWT Token Structure
```javascript
// Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload
{
  "vendorId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "email": "vendor@example.com",
  "role": "vendor",
  "shopName": "John's Electronics",
  "iat": 1694000000,
  "exp": 1694086400,
  "iss": "zopper-ecommerce",
  "aud": "vendor"
}
```

### JWT Security
- Stateless authentication
- Signed with secret key
- Automatic expiration
- Client-side token management
- No server-side session storage

---

## 🗄️ Database Schema

### Vendor Collection
```javascript
{
  _id: ObjectId,
  name: String (required, 2-50 chars),
  email: String (required, unique, valid email),
  shopName: String (required, 2-100 chars, unique),
  password: String (required, min 6 chars, hashed),
  phone: String (required, valid phone number),
  address: {
    street: String (required, max 200 chars),
    city: String (required, max 50 chars),
    state: String (required, max 50 chars),
    zipCode: String (required, valid ZIP code),
    country: String (required, max 50 chars)
  },
  role: String (enum: 'vendor', default: 'vendor'),
  isActive: Boolean (default: true),
  isVerified: Boolean (default: false),
  businessLicense: String (optional),
  taxId: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Field Descriptions
- **name**: Vendor's full name (2-50 characters)
- **email**: Unique email address with validation
- **shopName**: Unique shop/business name (2-100 characters)
- **password**: Hashed password using bcrypt (12 salt rounds)
- **phone**: Valid phone number with international format
- **address**: Complete business address object
- **role**: Always 'vendor' for vendor accounts
- **isActive**: Account status (true/false)
- **isVerified**: Business verification status
- **businessLicense**: Optional business license number
- **taxId**: Optional tax identification number
- **createdAt**: Account creation timestamp
- **updatedAt**: Last update timestamp

---

## 🧪 Testing Guide

### Using cURL

#### 1. Register a Vendor
```bash
curl -X POST http://localhost:5000/api/vendor/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "vendor@example.com",
    "shopName": "Johns Electronics Store",
    "password": "password123",
    "phone": "+1234567890",
    "address": {
      "street": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    }
  }'
```

#### 2. Login Vendor (Get JWT Token)
```bash
curl -X POST http://localhost:5000/api/vendor/login \
  -H "Content-Type: application/json" \
  -d '{"email":"vendor@example.com","password":"password123"}'
```

#### 3. Get Vendor Profile (with JWT)
```bash
curl -X GET http://localhost:5000/api/vendor/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### 4. Update Vendor Profile (with JWT)
```bash
curl -X POST http://localhost:5000/api/vendor/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "name": "John Smith",
    "businessLicense": "BL123456789"
  }'
```

#### 5. Change Vendor Password (with JWT)
```bash
curl -X POST http://localhost:5000/api/vendor/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword456"
  }'
```

#### 6. Verify JWT Token
```bash
curl -X GET http://localhost:5000/api/vendor/verify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### 7. Forgot Password
```bash
curl -X POST http://localhost:5000/api/vendor/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"vendor@example.com"}'
```

#### 8. Reset Password
```bash
curl -X POST http://localhost:5000/api/vendor/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "resetToken": "YOUR_RESET_TOKEN_HERE",
    "newPassword": "newpassword123"
  }'
```

#### 9. Logout Vendor (with JWT)
```bash
curl -X POST http://localhost:5000/api/vendor/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Using the Test Scripts
```bash
# Test JWT-based vendor API
node test-vendor-jwt-api.js

# Test session-based vendor API (if still available)
node test-vendor-api.js
```

### Using Postman
1. **Set Base URL:** `http://localhost:5000/api`
2. **For Login/Register:** Use POST method with JSON body
3. **For Protected Routes:** Include JWT token in Authorization header
4. **Token Management:** Store JWT token from login response
5. **Header Format:** `Authorization: Bearer <your-jwt-token>`

---

## 🔐 Security Features

### Password Security
- **Hashing:** bcrypt with 12 salt rounds
- **Never Stored:** Plain text passwords are never stored
- **Never Returned:** Passwords are never returned in API responses

### Session Security
- **HttpOnly Cookies:** Prevent XSS attacks
- **Secure Cookies:** In production environment
- **Session Expiration:** 24-hour automatic expiration
- **Session Destruction:** Complete cleanup on logout

### Input Validation
- **Email Validation:** Regex pattern matching
- **Name Validation:** Length and character restrictions
- **Shop Name Validation:** Length restrictions and uniqueness
- **Phone Validation:** International phone number format
- **Address Validation:** Complete address structure validation
- **ZIP Code Validation:** US ZIP code format validation
- **Sanitization:** Input trimming and cleaning

### Business Security
- **Shop Name Uniqueness:** Prevents duplicate shop names
- **Email Uniqueness:** Prevents duplicate vendor accounts
- **Address Validation:** Ensures complete business address
- **Business Information:** Optional but validated when provided

---

## 🏢 Business Information

### Required Business Details
- **Shop Name:** Unique business identifier
- **Contact Information:** Name, email, phone
- **Business Address:** Complete address with all fields

### Optional Business Details
- **Business License:** License number for verification
- **Tax ID:** Tax identification number
- **Verification Status:** Tracked for business verification

### Address Structure
```json
{
  "street": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA"
}
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

### 3. Test the Vendor API
```bash
node test-vendor-api.js
```

### 4. API Base URL
```
http://localhost:5000/api
```

---

## 📊 API Summary

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/vendor/register` | Register new vendor | Public |
| POST | `/api/vendor/login` | Vendor login (returns JWT) | Public |
| POST | `/api/vendor/logout` | Vendor logout | Private (JWT) |
| GET | `/api/vendor/me` | Get vendor profile | Private (JWT) |
| POST | `/api/vendor/profile` | Update vendor profile | Private (JWT) |
| POST | `/api/vendor/change-password` | Change vendor password | Private (JWT) |
| POST | `/api/vendor/forgot-password` | Generate password reset token | Public |
| POST | `/api/vendor/reset-password` | Reset password with token | Public |
| GET | `/api/vendor/verify` | Verify JWT token | Public |

---

## 🔧 Configuration

### Environment Variables
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zopper
SESSION_SECRET=your-super-secret-session-key
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
- Shop names must be unique across all vendors
- Business information is optional but validated when provided
- Address validation ensures complete business location
- Input validation is comprehensive and secure
- Error messages are user-friendly and informative
- JWT tokens expire after 24 hours
- Include JWT token in Authorization header for protected routes

---

## 🤝 Support

For issues or questions:
1. Check the error response format
2. Verify your request format matches the documentation
3. Ensure JWT tokens are properly included in Authorization header
4. Check server logs for detailed error information
5. Verify shop name uniqueness
6. Ensure complete address information is provided
7. Verify JWT token is not expired
8. Check token format: `Authorization: Bearer <token>`

---

**API Version:** 1.0.0  
**Last Updated:** September 2024  
**Maintained by:** Zopper E-commerce Team
