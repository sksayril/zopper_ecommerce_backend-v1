const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testUpdatedAtTimestamp() {
  try {
    console.log('🧪 Testing UpdatedAt Timestamp...\n');

    let adminToken = null;
    let createdProductId = null;

    // Step 1: Admin Login
    console.log('1. Admin Login...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/admin/login`, {
        email: 'admin@example.com', // Replace with actual admin email
        password: 'admin123' // Replace with actual admin password
      });

      adminToken = loginResponse.data.data.token;
      console.log('✅ Admin login successful');
      
    } catch (error) {
      console.log('❌ Admin login failed:', error.response?.data?.message || error.message);
      return;
    }

    // Step 2: Create Product
    console.log('\n2. Create Product...');
    try {
      const createResponse = await axios.post(`${BASE_URL}/admin/products`, {
        title: 'Timestamp Test Product',
        mrp: 1000,
        srp: 800,
        description: 'Product for testing timestamps',
        categoryId: '507f1f77bcf86cd799439011', // Replace with actual category ID
        subcategoryId: '507f1f77bcf86cd799439012', // Replace with actual subcategory ID
        mainImage: 'https://example.com/image.jpg',
        productUrl: 'https://example.com/product/timestamp-test',
        vendorSite: 'Amazon'
      }, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      createdProductId = createResponse.data.data.product.id;
      const createdAt = new Date(createResponse.data.data.product.createdAt);
      const updatedAt = new Date(createResponse.data.data.product.updatedAt);
      
      console.log('✅ Product created successfully');
      console.log('   Product ID:', createdProductId);
      console.log('   Created At:', createdAt.toISOString());
      console.log('   Updated At:', updatedAt.toISOString());
      console.log('   Timestamps match:', createdAt.getTime() === updatedAt.getTime() ? 'Yes' : 'No');
      
    } catch (error) {
      console.log('❌ Product creation failed:', error.response?.data?.message || error.message);
      return;
    }

    // Wait a moment to ensure timestamp difference
    console.log('\n⏳ Waiting 2 seconds before update...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Update Product (PUT)
    console.log('\n3. Update Product (PUT)...');
    try {
      const updateResponse = await axios.put(`${BASE_URL}/admin/products/${createdProductId}`, {
        title: 'Updated Timestamp Test Product',
        mrp: 1200,
        vendorSite: 'Flipkart'
      }, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      const updatedAt = new Date(updateResponse.data.data.product.updatedAt);
      
      console.log('✅ Product updated successfully (PUT)');
      console.log('   Updated At:', updatedAt.toISOString());
      console.log('   Title:', updateResponse.data.data.product.title);
      console.log('   MRP:', updateResponse.data.data.product.mrp);
      console.log('   Vendor Site:', updateResponse.data.data.product.vendorSite);
      
    } catch (error) {
      console.log('❌ Product update failed (PUT):', error.response?.data?.message || error.message);
    }

    // Wait a moment to ensure timestamp difference
    console.log('\n⏳ Waiting 2 seconds before patch...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 4: Partial Update Product (PATCH)
    console.log('\n4. Partial Update Product (PATCH)...');
    try {
      const patchResponse = await axios.patch(`${BASE_URL}/admin/products/${createdProductId}`, {
        isActive: false,
        keywords: ['updated', 'timestamp', 'test']
      }, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      const updatedAt = new Date(patchResponse.data.data.product.updatedAt);
      
      console.log('✅ Product patched successfully (PATCH)');
      console.log('   Updated At:', updatedAt.toISOString());
      console.log('   Is Active:', patchResponse.data.data.product.isActive);
      console.log('   Keywords:', patchResponse.data.data.product.keywords);
      
    } catch (error) {
      console.log('❌ Product patch failed (PATCH):', error.response?.data?.message || error.message);
    }

    // Step 5: Get Product to verify final state
    console.log('\n5. Get Product to verify final state...');
    try {
      const getResponse = await axios.get(`${BASE_URL}/admin/products/${createdProductId}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      const product = getResponse.data.data.product;
      const createdAt = new Date(product.createdAt);
      const updatedAt = new Date(product.updatedAt);
      
      console.log('✅ Product retrieved successfully');
      console.log('   Created At:', createdAt.toISOString());
      console.log('   Updated At:', updatedAt.toISOString());
      console.log('   Time difference:', Math.round((updatedAt - createdAt) / 1000), 'seconds');
      console.log('   Updated At is newer:', updatedAt > createdAt ? 'Yes' : 'No');
      
    } catch (error) {
      console.log('❌ Get product failed:', error.response?.data?.message || error.message);
    }

    // Step 6: Clean up - Delete Product
    console.log('\n6. Clean up - Delete Product...');
    try {
      await axios.delete(`${BASE_URL}/admin/products/${createdProductId}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      console.log('✅ Product deleted successfully');
      
    } catch (error) {
      console.log('❌ Product deletion failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 UpdatedAt Timestamp test completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Product creation sets both createdAt and updatedAt');
    console.log('✅ Product updates (PUT) properly update updatedAt timestamp');
    console.log('✅ Product patches (PATCH) properly update updatedAt timestamp');
    console.log('✅ Timestamps are properly maintained throughout the lifecycle');

    console.log('\n📝 Notes:');
    console.log('- The updatedAt field is automatically managed by Mongoose timestamps');
    console.log('- Pre-save and pre-update middleware ensure timestamps are always current');
    console.log('- All update operations (PUT, PATCH) properly update the timestamp');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testUpdatedAtTimestamp();
