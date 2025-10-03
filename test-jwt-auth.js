const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testJWT() {
  try {
    console.log('🧪 Testing JWT Authentication...\n');

    // Test 1: Admin Login
    console.log('1. Testing Admin Login...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/admin/login`, {
        email: 'admin@example.com', // Replace with actual admin email
        password: 'admin123' // Replace with actual admin password
      });

      console.log('✅ Admin login successful');
      console.log('   Token received:', loginResponse.data.data.token ? 'Yes' : 'No');
      
      if (loginResponse.data.data.token) {
        const token = loginResponse.data.data.token;
        
        // Test 2: Use token to access protected route
        console.log('\n2. Testing Protected Route Access...');
        try {
          const protectedResponse = await axios.get(`${BASE_URL}/admin/products?page=1&limit=5`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          console.log('✅ Protected route access successful');
          console.log('   Products found:', protectedResponse.data.data.products.length);
          
        } catch (error) {
          console.log('❌ Protected route access failed:', error.response?.data?.message || error.message);
        }

        // Test 3: Test token verification endpoint
        console.log('\n3. Testing Token Verification...');
        try {
          const verifyResponse = await axios.get(`${BASE_URL}/admin/verify`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          console.log('✅ Token verification successful');
          console.log('   Admin ID:', verifyResponse.data.data.adminId);
          console.log('   Role:', verifyResponse.data.data.role);
          
        } catch (error) {
          console.log('❌ Token verification failed:', error.response?.data?.message || error.message);
        }
      }

    } catch (error) {
      console.log('❌ Admin login failed:', error.response?.data?.message || error.message);
      if (error.response?.data?.error) {
        console.log('   Error details:', error.response.data.error);
      }
    }

    console.log('\n🎉 JWT Authentication test completed!');
    console.log('\n📝 Notes:');
    console.log('- Make sure you have an admin account created');
    console.log('- Replace email and password with actual admin credentials');
    console.log('- Check that JWT_SECRET is properly configured in .env file');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testJWT();

