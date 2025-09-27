// Test script to verify the vendor JWT authentication API
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testVendor = {
  name: 'Test Vendor JWT',
  email: 'vendorjwt@example.com',
  shopName: 'Test Shop JWT',
  password: 'password123',
  phone: '+1234567890',
  address: {
    street: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA'
  }
};

let authToken = '';

async function testVendorJWTAPI() {
  console.log('🧪 Testing Zopper E-commerce Vendor JWT Authentication API\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data.message);
    console.log('');

    // Test 2: Register Vendor
    console.log('2. Testing Vendor Registration...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/vendor/register`, testVendor);
      console.log('✅ Vendor Registration Success:', registerResponse.data.message);
      console.log('   Vendor ID:', registerResponse.data.data.vendor.id);
      console.log('   Shop Name:', registerResponse.data.data.vendor.shopName);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('⚠️  Vendor already exists, continuing with login test...');
      } else {
        throw error;
      }
    }
    console.log('');

    // Test 3: Login Vendor (Get JWT Token)
    console.log('3. Testing Vendor Login (JWT Token)...');
    const loginResponse = await axios.post(`${BASE_URL}/vendor/login`, {
      email: testVendor.email,
      password: testVendor.password
    });
    console.log('✅ Vendor Login Success:', loginResponse.data.message);
    console.log('   Vendor Role:', loginResponse.data.data.vendor.role);
    console.log('   Shop Name:', loginResponse.data.data.vendor.shopName);
    console.log('   JWT Token:', loginResponse.data.data.token ? 'Received' : 'Not received');
    
    // Store token for subsequent requests
    authToken = loginResponse.data.data.token;
    console.log('');

    // Test 4: Verify JWT Token
    console.log('4. Testing JWT Token Verification...');
    const verifyResponse = await axios.get(`${BASE_URL}/vendor/verify`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✅ Token Verification:', verifyResponse.data.message);
    console.log('   Is Logged In:', verifyResponse.data.data.isLoggedIn);
    console.log('   Vendor ID:', verifyResponse.data.data.vendorId);
    console.log('');

    // Test 5: Get Vendor Profile (with JWT)
    console.log('5. Testing Get Vendor Profile (JWT)...');
    const profileResponse = await axios.get(`${BASE_URL}/vendor/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✅ Vendor Profile Retrieved:', profileResponse.data.message);
    console.log('   Vendor Name:', profileResponse.data.data.vendor.name);
    console.log('   Shop Name:', profileResponse.data.data.vendor.shopName);
    console.log('   Phone:', profileResponse.data.data.vendor.phone);
    console.log('');

    // Test 6: Update Vendor Profile (with JWT)
    console.log('6. Testing Update Vendor Profile (JWT)...');
    const updateResponse = await axios.put(`${BASE_URL}/vendor/profile`, {
      name: 'Updated Vendor Name JWT',
      phone: '+1987654321',
      businessLicense: 'BL123456789'
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✅ Vendor Profile Updated:', updateResponse.data.message);
    console.log('   Updated Name:', updateResponse.data.data.vendor.name);
    console.log('   Updated Phone:', updateResponse.data.data.vendor.phone);
    console.log('');

    // Test 7: Test Invalid Token
    console.log('7. Testing Invalid JWT Token...');
    try {
      await axios.get(`${BASE_URL}/vendor/me`, {
        headers: {
          'Authorization': 'Bearer invalid-token-123'
        }
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid Token Rejected:', error.response.data.message);
      } else {
        throw error;
      }
    }
    console.log('');

    // Test 8: Test No Token
    console.log('8. Testing No JWT Token...');
    try {
      await axios.get(`${BASE_URL}/vendor/me`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ No Token Rejected:', error.response.data.message);
      } else {
        throw error;
      }
    }
    console.log('');

    // Test 9: Vendor Logout (JWT)
    console.log('9. Testing Vendor Logout (JWT)...');
    const logoutResponse = await axios.post(`${BASE_URL}/vendor/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✅ Vendor Logout Success:', logoutResponse.data.message);
    console.log('');

    console.log('🎉 All JWT vendor tests completed successfully!');
    console.log('📝 Vendor JWT API is working correctly with token-based authentication.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testVendorJWTAPI();
}

module.exports = testVendorJWTAPI;
