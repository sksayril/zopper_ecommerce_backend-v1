// Debug JWT Secret Configuration
require('dotenv').config();
const config = require('./config');

console.log('🔍 JWT Secret Debug Information:');
console.log('================================');
console.log('Environment Variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('- JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
console.log('- SESSION_SECRET exists:', !!process.env.SESSION_SECRET);

console.log('\nConfig Object:');
console.log('- JWT_SECRET from config:', config.JWT_SECRET ? 'Set' : 'Not set');
console.log('- JWT_SECRET length:', config.JWT_SECRET ? config.JWT_SECRET.length : 0);

console.log('\nTesting JWT Token Generation:');
console.log('=============================');

try {
  const jwt = require('jsonwebtoken');
  const testPayload = { id: 'test', email: 'test@example.com', role: 'admin' };
  
  const token = jwt.sign(testPayload, config.JWT_SECRET, { expiresIn: '1h' });
  console.log('✅ JWT token generation successful');
  console.log('   Token length:', token.length);
  
  // Test verification
  const decoded = jwt.verify(token, config.JWT_SECRET);
  console.log('✅ JWT token verification successful');
  console.log('   Decoded payload:', decoded);
  
} catch (error) {
  console.log('❌ JWT token generation/verification failed:');
  console.log('   Error:', error.message);
}

console.log('\n📝 Recommendations:');
if (!process.env.JWT_SECRET) {
  console.log('- Create a .env file with JWT_SECRET=your-secret-key');
  console.log('- Or set JWT_SECRET environment variable');
} else {
  console.log('- JWT_SECRET is properly configured');
}
