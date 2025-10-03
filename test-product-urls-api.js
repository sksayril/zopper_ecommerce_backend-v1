const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data for creating a product with new URL fields
const testProduct = {
  title: 'Test Product with URLs',
  mrp: 1000,
  srp: 800,
  description: 'A test product with product URL and vendor site',
  categoryId: '507f1f77bcf86cd799439011', // Replace with actual category ID
  subcategoryId: '507f1f77bcf86cd799439012', // Replace with actual subcategory ID
  mainImage: 'https://example.com/image.jpg',
  productUrl: 'https://example.com/product/test-product',
  vendorSite: 'Flipkart',
  keywords: ['test', 'product', 'urls']
};

async function testProductWithUrls() {
  try {
    console.log('🧪 Testing Product API with new URL fields...\n');

    // First, let's test the GET endpoint to see current products
    console.log('1. Testing GET /api/admin/products...');
    try {
      const getResponse = await axios.get(`${BASE_URL}/admin/products?page=1&limit=5`);
      console.log('✅ GET Products successful');
      console.log('   Products found:', getResponse.data.data.products.length);
      
      if (getResponse.data.data.products.length > 0) {
        const firstProduct = getResponse.data.data.products[0];
        console.log('   Sample product fields:');
        console.log('   - ID:', firstProduct.id);
        console.log('   - Title:', firstProduct.title);
        console.log('   - Product URL:', firstProduct.productUrl || 'Not set');
        console.log('   - Vendor Site:', firstProduct.vendorSite || 'Not set');
      }
    } catch (error) {
      console.log('❌ GET Products failed:', error.response?.data?.message || error.message);
    }

    console.log('\n2. Testing POST /api/admin/products with new URL fields...');
    try {
      // Note: You'll need to replace with actual admin token
      const adminToken = 'YOUR_ADMIN_TOKEN_HERE';
      
      const createResponse = await axios.post(`${BASE_URL}/admin/products`, testProduct, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Create Product successful');
      console.log('   Product ID:', createResponse.data.data.product.id);
      console.log('   Product URL:', createResponse.data.data.product.productUrl);
      console.log('   Vendor Site:', createResponse.data.data.product.vendorSite);
      
    } catch (error) {
      console.log('❌ Create Product failed:', error.response?.data?.message || error.message);
      if (error.response?.data?.error) {
        console.log('   Error details:', error.response.data.error);
      }
    }

    console.log('\n3. Testing validation for invalid data...');
    try {
      const invalidProduct = {
        ...testProduct,
        productUrl: 'invalid-url',
        vendorSite: 'A' // Too short vendor name
      };
      
      const adminToken = 'YOUR_ADMIN_TOKEN_HERE';
      
      await axios.post(`${BASE_URL}/admin/products`, invalidProduct, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('❌ Validation failed - should have rejected invalid URLs');
      
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validation working correctly');
        console.log('   Error message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }

    console.log('\n🎉 Test completed!');
    console.log('\n📝 Notes:');
    console.log('- Replace YOUR_ADMIN_TOKEN_HERE with actual admin JWT token');
    console.log('- Replace categoryId and subcategoryId with actual IDs from your database');
    console.log('- The new fields productUrl and vendorSite are now available in all product APIs');
    console.log('- vendorSite now accepts vendor names like "Flipkart", "Amazon", "Myntra", etc.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testProductWithUrls();
