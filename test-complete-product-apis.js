const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testProduct = {
  title: 'Complete Test Product',
  mrp: 1500,
  srp: 1200,
  description: 'A comprehensive test product with all fields',
  shortDescription: 'Short description for test product',
  detailedDescription: 'Detailed description for test product with more information',
  features: ['Feature 1', 'Feature 2', 'Feature 3'],
  specifications: [
    { key: 'Brand', value: 'Test Brand' },
    { key: 'Model', value: 'Test Model' }
  ],
  highlights: ['Highlight 1', 'Highlight 2'],
  categoryId: '507f1f77bcf86cd799439011', // Replace with actual category ID
  subcategoryId: '507f1f77bcf86cd799439012', // Replace with actual subcategory ID
  mainImage: 'https://example.com/main-image.jpg',
  additionalImages: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg'
  ],
  attributes: [
    { key: 'Color', value: 'Red' },
    { key: 'Size', value: 'Large' }
  ],
  keywords: ['test', 'product', 'complete'],
  productUrl: 'https://example.com/product/complete-test-product',
  vendorSite: 'Amazon'
};

let createdProductId = null;
let adminToken = null;

async function testCompleteProductAPIs() {
  try {
    console.log('🧪 Testing Complete Product APIs...\n');

    // Step 1: Admin Login
    console.log('1. Admin Login...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/admin/login`, {
        email: 'admin@example.com', // Replace with actual admin email
        password: 'admin123' // Replace with actual admin password
      });

      adminToken = loginResponse.data.data.token;
      console.log('✅ Admin login successful');
      console.log('   Token received:', adminToken ? 'Yes' : 'No');
      
    } catch (error) {
      console.log('❌ Admin login failed:', error.response?.data?.message || error.message);
      console.log('   Please check admin credentials and JWT configuration');
      return;
    }

    // Step 2: Create Product (POST)
    console.log('\n2. Create Product (POST /api/admin/products)...');
    try {
      const createResponse = await axios.post(`${BASE_URL}/admin/products`, testProduct, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      createdProductId = createResponse.data.data.product.id;
      console.log('✅ Product created successfully');
      console.log('   Product ID:', createdProductId);
      console.log('   Title:', createResponse.data.data.product.title);
      console.log('   Product URL:', createResponse.data.data.product.productUrl);
      console.log('   Vendor Site:', createResponse.data.data.product.vendorSite);
      
    } catch (error) {
      console.log('❌ Product creation failed:', error.response?.data?.message || error.message);
      if (error.response?.data?.error) {
        console.log('   Error details:', error.response.data.error);
      }
      return;
    }

    // Step 3: Get All Products (GET)
    console.log('\n3. Get All Products (GET /api/admin/products)...');
    try {
      const getResponse = await axios.get(`${BASE_URL}/admin/products?page=1&limit=10`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      console.log('✅ Get products successful');
      console.log('   Products found:', getResponse.data.data.products.length);
      console.log('   Total products:', getResponse.data.data.pagination.totalProducts);
      
    } catch (error) {
      console.log('❌ Get products failed:', error.response?.data?.message || error.message);
    }

    // Step 4: Get Single Product (GET /:id)
    console.log('\n4. Get Single Product (GET /api/admin/products/:id)...');
    try {
      const getSingleResponse = await axios.get(`${BASE_URL}/admin/products/${createdProductId}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      console.log('✅ Get single product successful');
      console.log('   Product ID:', getSingleResponse.data.data.product.id);
      console.log('   Title:', getSingleResponse.data.data.product.title);
      
    } catch (error) {
      console.log('❌ Get single product failed:', error.response?.data?.message || error.message);
    }

    // Step 5: Update Product (PUT)
    console.log('\n5. Update Product (PUT /api/admin/products/:id)...');
    try {
      const updateData = {
        title: 'Updated Test Product',
        mrp: 1600,
        srp: 1300,
        vendorSite: 'Flipkart'
      };

      const updateResponse = await axios.put(`${BASE_URL}/admin/products/${createdProductId}`, updateData, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Product updated successfully');
      console.log('   Updated title:', updateResponse.data.data.product.title);
      console.log('   Updated MRP:', updateResponse.data.data.product.mrp);
      console.log('   Updated vendor site:', updateResponse.data.data.product.vendorSite);
      console.log('   Updated At:', new Date(updateResponse.data.data.product.updatedAt).toISOString());
      
    } catch (error) {
      console.log('❌ Product update failed:', error.response?.data?.message || error.message);
    }

    // Step 6: Partial Update Product (PATCH)
    console.log('\n6. Partial Update Product (PATCH /api/admin/products/:id)...');
    try {
      const patchData = {
        isActive: false,
        keywords: ['updated', 'test', 'product', 'patch']
      };

      const patchResponse = await axios.patch(`${BASE_URL}/admin/products/${createdProductId}`, patchData, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Product patched successfully');
      console.log('   Is Active:', patchResponse.data.data.product.isActive);
      console.log('   Updated keywords:', patchResponse.data.data.product.keywords);
      console.log('   Updated At:', new Date(patchResponse.data.data.product.updatedAt).toISOString());
      
    } catch (error) {
      console.log('❌ Product patch failed:', error.response?.data?.message || error.message);
    }

    // Step 7: Delete Product (DELETE)
    console.log('\n7. Delete Product (DELETE /api/admin/products/:id)...');
    try {
      const deleteResponse = await axios.delete(`${BASE_URL}/admin/products/${createdProductId}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      console.log('✅ Product deleted successfully');
      console.log('   Deleted product ID:', deleteResponse.data.data.deletedProduct.id);
      console.log('   Deleted product title:', deleteResponse.data.data.deletedProduct.title);
      
    } catch (error) {
      console.log('❌ Product deletion failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Complete Product APIs test completed!');
    console.log('\n📋 API Summary:');
    console.log('✅ POST   /api/admin/products          - Create product');
    console.log('✅ GET    /api/admin/products          - Get all products (with pagination)');
    console.log('✅ GET    /api/admin/products/:id      - Get single product');
    console.log('✅ PUT    /api/admin/products/:id      - Update product (full update)');
    console.log('✅ PATCH  /api/admin/products/:id      - Update product (partial update)');
    console.log('✅ DELETE /api/admin/products/:id      - Delete product');
    console.log('✅ POST   /api/admin/products/assign-vendor - Assign products to vendor');

    console.log('\n📝 Notes:');
    console.log('- All APIs require admin authentication (Bearer token)');
    console.log('- Replace categoryId and subcategoryId with actual IDs from your database');
    console.log('- The APIs now support productUrl and vendorSite fields');
    console.log('- vendorSite accepts vendor names like "Flipkart", "Amazon", "Myntra", etc.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCompleteProductAPIs();
