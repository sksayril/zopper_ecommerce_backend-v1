// Simple test script to verify the authentication API
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

async function testAPI() {
  console.log('🧪 Testing Zopper E-commerce Authentication API\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data.message);
    console.log('');

    // Test 2: Register User
    console.log('2. Testing User Registration...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
      console.log('✅ Registration Success:', registerResponse.data.message);
      console.log('   User ID:', registerResponse.data.data.user.id);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('⚠️  User already exists, continuing with login test...');
      } else {
        throw error;
      }
    }
    console.log('');

    // Test 3: Login User
    console.log('3. Testing User Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login Success:', loginResponse.data.message);
    console.log('   User Role:', loginResponse.data.data.user.role);
    
    // Extract session cookie
    const cookies = loginResponse.headers['set-cookie'];
    const sessionCookie = cookies ? cookies[0].split(';')[0] : '';
    console.log('');

    // Test 4: Get User Profile
    console.log('4. Testing Get User Profile...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        'Cookie': sessionCookie
      }
    });
    console.log('✅ Profile Retrieved:', profileResponse.data.message);
    console.log('   User Name:', profileResponse.data.data.user.name);
    console.log('');

    // Test 5: Check Session Status
    console.log('5. Testing Session Status...');
    const sessionResponse = await axios.get(`${BASE_URL}/auth/session`, {
      headers: {
        'Cookie': sessionCookie
      }
    });
    console.log('✅ Session Status:', sessionResponse.data.message);
    console.log('   Is Logged In:', sessionResponse.data.data.isLoggedIn);
    console.log('');

    // Test 6: Logout User
    console.log('6. Testing User Logout...');
    const logoutResponse = await axios.post(`${BASE_URL}/auth/logout`, {}, {
      headers: {
        'Cookie': sessionCookie
      }
    });
    console.log('✅ Logout Success:', logoutResponse.data.message);
    console.log('');

    console.log('🎉 All tests completed successfully!');
    console.log('📝 API is working correctly with session-based authentication.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;
