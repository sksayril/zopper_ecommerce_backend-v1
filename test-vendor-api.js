// Test script to verify the vendor authentication API
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testVendor = {
  name: 'Test Vendor',
  email: 'vendor@example.com',
  shopName: 'Test Shop',
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

async function testVendorAPI() {
  console.log('🧪 Testing Zopper E-commerce Vendor Authentication API\n');

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

    // Test 3: Login Vendor
    console.log('3. Testing Vendor Login...');
    const loginResponse = await axios.post(`${BASE_URL}/vendor/login`, {
      email: testVendor.email,
      password: testVendor.password
    });
    console.log('✅ Vendor Login Success:', loginResponse.data.message);
    console.log('   Vendor Role:', loginResponse.data.data.vendor.role);
    console.log('   Shop Name:', loginResponse.data.data.vendor.shopName);
    
    // Extract session cookie
    const cookies = loginResponse.headers['set-cookie'];
    const sessionCookie = cookies ? cookies[0].split(';')[0] : '';
    console.log('');

    // Test 4: Get Vendor Profile
    console.log('4. Testing Get Vendor Profile...');
    const profileResponse = await axios.get(`${BASE_URL}/vendor/me`, {
      headers: {
        'Cookie': sessionCookie
      }
    });
    console.log('✅ Vendor Profile Retrieved:', profileResponse.data.message);
    console.log('   Vendor Name:', profileResponse.data.data.vendor.name);
    console.log('   Shop Name:', profileResponse.data.data.vendor.shopName);
    console.log('   Phone:', profileResponse.data.data.vendor.phone);
    console.log('');

    // Test 5: Check Vendor Session Status
    console.log('5. Testing Vendor Session Status...');
    const sessionResponse = await axios.get(`${BASE_URL}/vendor/session`, {
      headers: {
        'Cookie': sessionCookie
      }
    });
    console.log('✅ Vendor Session Status:', sessionResponse.data.message);
    console.log('   Is Logged In:', sessionResponse.data.data.isLoggedIn);
    console.log('   Vendor ID:', sessionResponse.data.data.vendorId);
    console.log('');

    // Test 6: Update Vendor Profile
    console.log('6. Testing Update Vendor Profile...');
    const updateResponse = await axios.put(`${BASE_URL}/vendor/profile`, {
      name: 'Updated Vendor Name',
      phone: '+1987654321',
      businessLicense: 'BL123456789'
    }, {
      headers: {
        'Cookie': sessionCookie
      }
    });
    console.log('✅ Vendor Profile Updated:', updateResponse.data.message);
    console.log('   Updated Name:', updateResponse.data.data.vendor.name);
    console.log('   Updated Phone:', updateResponse.data.data.vendor.phone);
    console.log('');

    // Test 7: Logout Vendor
    console.log('7. Testing Vendor Logout...');
    const logoutResponse = await axios.post(`${BASE_URL}/vendor/logout`, {}, {
      headers: {
        'Cookie': sessionCookie
      }
    });
    console.log('✅ Vendor Logout Success:', logoutResponse.data.message);
    console.log('');

    console.log('🎉 All vendor tests completed successfully!');
    console.log('📝 Vendor API is working correctly with session-based authentication.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testVendorAPI();
}

module.exports = testVendorAPI;
