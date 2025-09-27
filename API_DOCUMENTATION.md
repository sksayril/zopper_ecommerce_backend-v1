# 🔐 Zopper E-commerce Backend - API Documentation

## Overview
This is a complete User Authentication API for an E-commerce project using session-based authentication with Express.js, MongoDB Atlas, and bcrypt.

**Base URL:** `http://localhost:5000/api`

## 📋 Table of Contents
- [Authentication Endpoints](#authentication-endpoints)
- [Vendor Authentication Endpoints](#vendor-authentication-endpoints)
- [Utility Endpoints](#utility-endpoints)
- [Error Handling](#error-handling)
- [Request/Response Examples](#requestresponse-examples)
- [Session Management](#session-management)
- [Testing Guide](#testing-guide)

---

## 🔐 Authentication Endpoints

### 1. User Registration
Register a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "string (required, 2-50 characters)",
  "email": "string (required, valid email format)",
  "password": "string (required, min 6 characters)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "createdAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

**Status Codes:**
- `201` - User created successfully
- `400` - Missing required fields or validation error
- `409` - Email already exists
- `500` - Internal server error

---

### 2. User Login
Authenticate user and create session.

**Endpoint:** `POST /api/auth/login`

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
  "message": "Login successful",
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    }
  }
}
```

**Status Codes:**
- `200` - Login successful
- `400` - Missing credentials
- `401` - Invalid email/password or account deactivated
- `500` - Internal server error

**Note:** After successful login, a session cookie will be set automatically.

---

### 3. User Logout
Destroy user session and logout.

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Cookie: connect.sid=<session-id>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Status Codes:**
- `200` - Logout successful
- `500` - Internal server error

---

### 4. Get Current User Profile
Get logged-in user's profile information.

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Cookie: connect.sid=<session-id>
```

**Response:**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "isActive": true,
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

**Status Codes:**
- `200` - Profile retrieved successfully
- `401` - Authentication required
- `404` - User not found
- `500` - Internal server error

---

### 5. Check Session Status
Check if user is currently logged in.

**Endpoint:** `GET /api/auth/session`

**Response (Logged In):**
```json
{
  "success": true,
  "message": "User is logged in",
  "data": {
    "isLoggedIn": true,
    "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "role": "customer",
    "email": "john@example.com"
  }
}
```

**Response (Not Logged In):**
```json
{
  "success": true,
  "message": "User is not logged in",
  "data": {
    "isLoggedIn": false
  }
}
```

**Status Codes:**
- `200` - Request successful

---

## 🏪 Vendor Authentication Endpoints

### 1. Vendor Registration
Register a new vendor account.

**Endpoint:** `POST /api/vendor/register`

**Request Body:**
```json
{
  "name": "string (required, 2-50 characters)",
  "email": "string (required, valid email format)",
  "shopName": "string (required, 2-100 characters)",
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
    }
  }
}
```

**Status Codes:**
- `200` - Login successful
- `400` - Missing credentials
- `401` - Invalid email/password or account deactivated
- `500` - Internal server error

**Note:** After successful login, a session cookie will be set automatically.

---

### 3. Vendor Logout
Destroy vendor session and logout.

**Endpoint:** `POST /api/vendor/logout`

**Headers:**
```
Cookie: connect.sid=<session-id>
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor logout successful"
}
```

**Status Codes:**
- `200` - Logout successful
- `500` - Internal server error

---

### 4. Get Current Vendor Profile
Get logged-in vendor's profile information.

**Endpoint:** `GET /api/vendor/me`

**Headers:**
```
Cookie: connect.sid=<session-id>
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
Update vendor profile information.

**Endpoint:** `PUT /api/vendor/profile`

**Headers:**
```
Cookie: connect.sid=<session-id>
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

### 6. Check Vendor Session Status
Check if vendor is currently logged in.

**Endpoint:** `GET /api/vendor/session`

**Response (Logged In):**
```json
{
  "success": true,
  "message": "Vendor is logged in",
  "data": {
    "isLoggedIn": true,
    "vendorId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "role": "vendor",
    "email": "john@example.com"
  }
}
```

**Response (Not Logged In):**
```json
{
  "success": true,
  "message": "Vendor is not logged in",
  "data": {
    "isLoggedIn": false
  }
}
```

**Status Codes:**
- `200` - Request successful

---

## 🛠️ Utility Endpoints

### Health Check
Check server status and connectivity.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2023-09-06T10:30:00.000Z",
  "environment": "development"
}
```

**Status Codes:**
- `200` - Server is healthy

---

### API Information
Get API overview and available endpoints.

**Endpoint:** `GET /`

**Response:**
```json
{
  "success": true,
  "message": "Welcome to Zopper E-commerce Backend API",
  "version": "1.0.0",
  "endpoints": {
    "auth": {
      "register": "POST /api/auth/register",
      "login": "POST /api/auth/login",
      "logout": "POST /api/auth/logout",
      "profile": "GET /api/auth/me",
      "session": "GET /api/auth/session"
    },
    "health": "GET /api/health"
  }
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
  "message": "Access denied. Please login to continue.",
  "error": "Authentication required"
}
```

#### Not Found Errors (404)
```json
{
  "success": false,
  "message": "Route not found",
  "error": "The requested endpoint does not exist"
}
```

#### Conflict Errors (409)
```json
{
  "success": false,
  "message": "User with this email already exists",
  "error": "Email already registered"
}
```

#### Server Errors (500)
```json
{
  "success": false,
  "message": "Internal server error during registration",
  "error": "Registration failed"
}
```

---

## 🔒 Session Management

### Session Configuration
- **Storage:** Server-side session storage
- **Cookie:** HttpOnly, secure in production
- **Expiration:** 24 hours
- **Data Stored:** userId, role, email

### Session Data Structure
```javascript
req.session = {
  userId: "64f8a1b2c3d4e5f6a7b8c9d0",
  role: "customer",
  email: "john@example.com"
}
```

### Session Security
- HttpOnly cookies prevent XSS attacks
- Secure cookies in production
- Session destruction on logout
- Automatic cleanup of expired sessions

---

## 🧪 Testing Guide

### Using cURL

#### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### 2. Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }' \
  -c cookies.txt
```

#### 3. Get User Profile
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -b cookies.txt
```

#### 4. Check Session Status
```bash
curl -X GET http://localhost:5000/api/auth/session \
  -b cookies.txt
```

#### 5. Logout User
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -b cookies.txt
```

### Using Postman

1. **Set Base URL:** `http://localhost:5000/api`
2. **For Login/Register:** Use POST method with JSON body
3. **For Protected Routes:** Include session cookie in headers
4. **Cookie Management:** Enable cookie jar in Postman settings

### Using the Test Scripts
```bash
# Test user authentication API
node test-api.js

# Test vendor authentication API
node test-vendor-api.js
```

---

## 📊 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String (required, 2-50 chars),
  email: String (required, unique, valid email),
  password: String (required, min 6 chars, hashed),
  role: String (enum: 'customer', 'admin', default: 'customer'),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

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

---

## 🔧 Configuration

### Environment Variables
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zopper
SESSION_SECRET=your-super-secret-session-key
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### CORS Configuration
- **Origin:** Configurable via CLIENT_URL
- **Credentials:** Enabled for session cookies
- **Methods:** GET, POST, PUT, DELETE, OPTIONS
- **Headers:** Content-Type, Authorization

---

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   # Create .env file with your MongoDB URI
   echo "MONGODB_URI=mongodb+srv://kabitadas67069_db_user:kabita%4022@cluster0.vongyjy.mongodb.net/zopper" > .env
   ```

3. **Start Server**
   ```bash
   npm start
   ```

4. **Test API**
   ```bash
   node test-api.js
   ```

---

## 📝 Notes

- All timestamps are in ISO 8601 format
- Passwords are never returned in API responses
- Session cookies are automatically managed
- The API supports both customer and admin roles
- Input validation is comprehensive and secure
- Error messages are user-friendly and informative

---

## 🤝 Support

For issues or questions:
1. Check the error response format
2. Verify your request format matches the documentation
3. Ensure session cookies are properly handled
4. Check server logs for detailed error information

---

**API Version:** 1.0.0  
**Last Updated:** September 2024  
**Maintained by:** Zopper E-commerce Team
