# Setup Guide for Zopper E-commerce Backend

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Environment Variables**
   Create a `.env` file in the root directory with the following content:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zopper_ecommerce
   SESSION_SECRET=your-super-secret-session-key-change-this-in-production
   CLIENT_URL=http://localhost:3000
   ```

3. **Start the Server**
   ```bash
   npm start
   ```

4. **Test the API**
   ```bash
   node test-api.js
   ```

## MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address
5. Get your connection string
6. Replace the MONGODB_URI in your .env file

## API Testing

The server will start on `http://localhost:5000`

### Test Endpoints:
- Health Check: `GET http://localhost:5000/api/health`
- Register: `POST http://localhost:5000/api/auth/register`
- Login: `POST http://localhost:5000/api/auth/login`
- Profile: `GET http://localhost:5000/api/auth/me`
- Logout: `POST http://localhost:5000/api/auth/logout`

### Example Registration:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

### Example Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' \
  -c cookies.txt
```

## Troubleshooting

- Make sure MongoDB Atlas is accessible
- Check that all environment variables are set
- Ensure port 5000 is available
- Check console logs for any errors
