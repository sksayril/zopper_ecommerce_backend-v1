# 👤 User Authentication API Documentation

## Overview
Complete User Authentication API for E-commerce project using session-based authentication with Express.js, MongoDB Atlas, and bcrypt.

**Base URL:** `http://localhost:5000/api`

---

## 📋 Table of Contents
- [User Authentication Endpoints](#user-authentication-endpoints)
- [Request/Response Examples](#requestresponse-examples)
- [Error Handling](#error-handling)
- [Session Management](#session-management)
- [Database Schema](#database-schema)
- [Testing Guide](#testing-guide)
- [Security Features](#security-features)

---

## 🔐 User Authentication Endpoints

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

**Validation Rules:**
- Name: 2-50 characters, required
- Email: Valid email format, unique, required
- Password: Minimum 6 characters, required

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

### 5. Check User Session Status
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

## 📝 Request/Response Examples

### Example 1: User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
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

### Example 2: User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }' \
  -c cookies.txt
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

### Example 3: Get User Profile
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -b cookies.txt
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

### Example 4: User Logout
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -b cookies.txt
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
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
  "message": "User not found",
  "error": "User does not exist"
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

## 🗄️ Database Schema

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

### Field Descriptions
- **name**: User's full name (2-50 characters)
- **email**: Unique email address with validation
- **password**: Hashed password using bcrypt (12 salt rounds)
- **role**: User role (customer or admin)
- **isActive**: Account status (true/false)
- **createdAt**: Account creation timestamp
- **updatedAt**: Last update timestamp

---

## 🧪 Testing Guide

### Using cURL

#### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

#### 2. Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' \
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

### Using the Test Script
```bash
node test-api.js
```

### Using Postman
1. **Set Base URL:** `http://localhost:5000/api`
2. **For Login/Register:** Use POST method with JSON body
3. **For Protected Routes:** Include session cookie in headers
4. **Cookie Management:** Enable cookie jar in Postman settings

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
- **Password Validation:** Minimum length requirements
- **Sanitization:** Input trimming and cleaning

### Error Security
- **No Information Leakage:** Generic error messages
- **Stack Traces:** Only in development mode
- **Sensitive Data:** Never exposed in error responses

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

### 3. Test the API
```bash
node test-api.js
```

### 4. API Base URL
```
http://localhost:5000/api
```

---

## 📊 API Summary

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/logout` | User logout | Private |
| GET | `/api/auth/me` | Get user profile | Private |
| GET | `/api/auth/session` | Check session status | Public |

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
