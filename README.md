# Zopper E-commerce Backend - User Authentication API

A complete User Authentication API for an E-commerce project using session-based authentication with Express.js, MongoDB Atlas, and bcrypt.

## 🚀 Features

- **User Registration** - Create new user accounts with validation
- **User Login** - Secure authentication with session management
- **User Logout** - Proper session cleanup
- **Profile Management** - Get current user information
- **Session-based Authentication** - No JWT tokens, uses express-session
- **Password Hashing** - Secure password storage with bcrypt
- **Input Validation** - Comprehensive validation for all inputs
- **Error Handling** - Proper error responses and logging

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB object modeling
- **bcrypt** - Password hashing
- **express-session** - Session management
- **CORS** - Cross-origin resource sharing

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zopper_ecommerce_backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zopper_ecommerce
   SESSION_SECRET=your-super-secret-session-key-change-this-in-production
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   npm start
   ```

The server will start on `http://localhost:5000`

## 📚 API Endpoints

### Authentication Routes

#### 1. Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
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

#### 2. Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
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

#### 3. Logout User
```http
POST /api/auth/logout
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### 4. Get Current User Profile
```http
GET /api/auth/me
```

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

#### 5. Check Session Status
```http
GET /api/auth/session
```

**Response:**
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

### Utility Routes

#### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2023-09-06T10:30:00.000Z",
  "environment": "development"
}
```

## 🔒 Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with salt rounds of 12
- **Session Security**: Sessions are configured with httpOnly cookies and secure settings
- **Input Validation**: Comprehensive validation for all user inputs
- **CORS Protection**: Configured CORS for cross-origin requests
- **Error Handling**: Secure error responses that don't leak sensitive information

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String (required, 2-50 characters)
  email: String (required, unique, valid email format)
  password: String (required, min 6 characters, hashed)
  role: String (enum: 'customer', 'admin', default: 'customer')
  isActive: Boolean (default: true)
  createdAt: Date
  updatedAt: Date
}
```

## 🧪 Testing the API

You can test the API using tools like Postman, Insomnia, or curl:

### Example curl commands:

1. **Register a new user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

2. **Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' \
  -c cookies.txt
```

3. **Get profile (with session cookie):**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -b cookies.txt
```

4. **Logout:**
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -b cookies.txt
```

## 📁 Project Structure

```
zopper_ecommerce_backend/
├── config.js              # Environment configuration
├── server.js              # Main server file
├── models/
│   └── User.js            # User model with Mongoose schema
├── middleware/
│   └── auth.js            # Authentication middleware
├── routes/
│   └── auth.js            # Authentication routes
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Error type or details"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## 🔧 Development

- The server uses `nodemon` for automatic restarts during development
- All routes are prefixed with `/api`
- CORS is configured for frontend integration
- Session cookies are configured for secure authentication

## 📝 Notes

- Passwords are never returned in API responses
- Sessions are stored server-side and managed by express-session
- The API is designed to work with a React frontend
- All timestamps are in ISO 8601 format
- The system supports both customer and admin roles (admin functionality can be extended)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.
