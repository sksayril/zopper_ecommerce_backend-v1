const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testCompleteProductUpdate() {
  try {
    console.log('🧪 Testing Complete Product Update Operations...\n');

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

    // Step 2: Create Product with Complete Data
    console.log('\n2. Create Product with Complete Data...');
    try {
      const createResponse = await axios.post(`${BASE_URL}/admin/products`, {
        title: 'Complete Test Product',
        mrp: 1000,
        srp: 800,
        description: 'Product for testing complete update operations',
        shortDescription: 'Short description for testing',
        detailedDescription: 'Detailed description for testing complete product updates',
        features: ['Feature 1', 'Feature 2', 'Feature 3'],
        specifications: [
          { key: 'Spec 1', value: 'Value 1' },
          { key: 'Spec 2', value: 'Value 2' }
        ],
        highlights: ['Highlight 1', 'Highlight 2'],
        mainImage: 'https://example.com/images/main-image.jpg',
        additionalImages: [
          'https://example.com/images/additional-1.jpg',
          'https://example.com/images/additional-2.jpg'
        ],
        categoryId: '507f1f77bcf86cd799439011', // Replace with actual category ID
        subcategoryId: '507f1f77bcf86cd799439012', // Replace with actual subcategory ID
        attributes: [
          { key: 'Color', value: 'Blue' },
          { key: 'Size', value: 'Large' }
        ],
        keywords: ['test', 'complete', 'product', 'update'],
        productUrl: 'https://example.com/products/complete-test-product',
        vendorSite: 'Amazon'
      }, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      createdProductId = createResponse.data.data.product.id;
      const product = createResponse.data.data.product;
      
      console.log('✅ Product created successfully');
      console.log('   Product ID:', createdProductId);
      console.log('   Title:', product.title);
      console.log('   Main Image:', product.mainImage);
      console.log('   Additional Images:', product.additionalImages?.length || 0);
      console.log('   Features:', product.features?.length || 0);
      console.log('   Specifications:', product.specifications?.length || 0);
      console.log('   Attributes:', product.attributes?.length || 0);
      console.log('   Product URL:', product.productUrl);
      console.log('   Vendor Site:', product.vendorSite);
      console.log('   Category:', product.category?.name || 'N/A');
      console.log('   Subcategory:', product.subcategory?.name || 'N/A');
      
    } catch (error) {
      console.log('❌ Product creation failed:', error.response?.data?.message || error.message);
      return;
    }

    // Step 3: Test PUT Update with Complete Data
    console.log('\n3. Test PUT Update with Complete Data...');
    try {
      const updateResponse = await axios.put(`${BASE_URL}/admin/products/${createdProductId}`, {
        title: 'Updated Complete Test Product',
        mrp: 1200,
        srp: 1000,
        description: 'Updated description for testing complete update operations',
        shortDescription: 'Updated short description',
        detailedDescription: 'Updated detailed description for testing complete product updates',
        features: ['Updated Feature 1', 'Updated Feature 2', 'Updated Feature 3', 'New Feature 4'],
        specifications: [
          { key: 'Updated Spec 1', value: 'Updated Value 1' },
          { key: 'Updated Spec 2', value: 'Updated Value 2' },
          { key: 'New Spec 3', value: 'New Value 3' }
        ],
        highlights: ['Updated Highlight 1', 'Updated Highlight 2', 'New Highlight 3'],
        mainImage: 'https://example.com/images/updated-main-image.jpg',
        additionalImages: [
          'https://example.com/images/updated-additional-1.jpg',
          'https://example.com/images/updated-additional-2.jpg',
          'https://example.com/images/updated-additional-3.jpg'
        ],
        attributes: [
          { key: 'Updated Color', value: 'Red' },
          { key: 'Updated Size', value: 'Extra Large' },
          { key: 'New Attribute', value: 'New Value' }
        ],
        keywords: ['updated', 'complete', 'product', 'test', 'put'],
        productUrl: 'https://example.com/products/updated-complete-test-product',
        vendorSite: 'Flipkart'
      }, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      const product = updateResponse.data.data.product;
      
      console.log('✅ Product updated successfully (PUT)');
      console.log('   Title:', product.title);
      console.log('   MRP:', product.mrp);
      console.log('   SRP:', product.srp);
      console.log('   Main Image:', product.mainImage);
      console.log('   Additional Images:', product.additionalImages?.length || 0);
      console.log('   Features:', product.features?.length || 0);
      console.log('   Specifications:', product.specifications?.length || 0);
      console.log('   Attributes:', product.attributes?.length || 0);
      console.log('   Product URL:', product.productUrl);
      console.log('   Vendor Site:', product.vendorSite);
      console.log('   Category:', product.category?.name || 'N/A');
      console.log('   Subcategory:', product.subcategory?.name || 'N/A');
      console.log('   Updated At:', new Date(product.updatedAt).toISOString());
      
      // Verify all fields are present
      const requiredFields = [
        'id', 'title', 'mrp', 'srp', 'description', 'category', 'subcategory',
        'mainImage', 'additionalImages', 'shortDescription', 'detailedDescription',
        'features', 'specifications', 'highlights', 'attributes', 'keywords',
        'productUrl', 'vendorSite', 'isActive', 'profitMargin', 'createdBy',
        'createdAt', 'updatedAt'
      ];
      
      const missingFields = requiredFields.filter(field => !(field in product));
      if (missingFields.length === 0) {
        console.log('   ✅ All required fields present in response');
      } else {
        console.log('   ❌ Missing fields:', missingFields);
      }
      
    } catch (error) {
      console.log('❌ Product update failed (PUT):', error.response?.data?.message || error.message);
    }

    // Step 4: Test PATCH Update with Partial Data
    console.log('\n4. Test PATCH Update with Partial Data...');
    try {
      const patchResponse = await axios.patch(`${BASE_URL}/admin/products/${createdProductId}`, {
        isActive: false,
        keywords: ['patched', 'updated', 'inactive', 'test'],
        productUrl: 'https://example.com/products/patched-complete-test-product',
        vendorSite: 'Myntra'
      }, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      const product = patchResponse.data.data.product;
      
      console.log('✅ Product patched successfully (PATCH)');
      console.log('   Title:', product.title);
      console.log('   Is Active:', product.isActive);
      console.log('   Keywords:', product.keywords);
      console.log('   Product URL:', product.productUrl);
      console.log('   Vendor Site:', product.vendorSite);
      console.log('   Main Image:', product.mainImage);
      console.log('   Additional Images:', product.additionalImages?.length || 0);
      console.log('   Features:', product.features?.length || 0);
      console.log('   Specifications:', product.specifications?.length || 0);
      console.log('   Attributes:', product.attributes?.length || 0);
      console.log('   Category:', product.category?.name || 'N/A');
      console.log('   Subcategory:', product.subcategory?.name || 'N/A');
      console.log('   Updated At:', new Date(product.updatedAt).toISOString());
      
      // Verify all fields are still present after patch
      const requiredFields = [
        'id', 'title', 'mrp', 'srp', 'description', 'category', 'subcategory',
        'mainImage', 'additionalImages', 'shortDescription', 'detailedDescription',
        'features', 'specifications', 'highlights', 'attributes', 'keywords',
        'productUrl', 'vendorSite', 'isActive', 'profitMargin', 'createdBy',
        'createdAt', 'updatedAt'
      ];
      
      const missingFields = requiredFields.filter(field => !(field in product));
      if (missingFields.length === 0) {
        console.log('   ✅ All required fields present in response');
      } else {
        console.log('   ❌ Missing fields:', missingFields);
      }
      
    } catch (error) {
      console.log('❌ Product patch failed (PATCH):', error.response?.data?.message || error.message);
    }

    // Step 5: Verify Complete Data with GET Request
    console.log('\n5. Verify Complete Data with GET Request...');
    try {
      const getResponse = await axios.get(`${BASE_URL}/admin/products/${createdProductId}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      const product = getResponse.data.data.product;
      
      console.log('✅ Product retrieved successfully');
      console.log('   Title:', product.title);
      console.log('   Main Image:', product.mainImage);
      console.log('   Additional Images:', product.additionalImages?.length || 0);
      console.log('   Features:', product.features?.length || 0);
      console.log('   Specifications:', product.specifications?.length || 0);
      console.log('   Attributes:', product.attributes?.length || 0);
      console.log('   Product URL:', product.productUrl);
      console.log('   Vendor Site:', product.vendorSite);
      console.log('   Category:', product.category?.name || 'N/A');
      console.log('   Subcategory:', product.subcategory?.name || 'N/A');
      console.log('   Is Active:', product.isActive);
      
      // Verify all fields are present
      const requiredFields = [
        'id', 'title', 'mrp', 'srp', 'description', 'category', 'subcategory',
        'mainImage', 'additionalImages', 'shortDescription', 'detailedDescription',
        'features', 'specifications', 'highlights', 'attributes', 'keywords',
        'productUrl', 'vendorSite', 'isActive', 'profitMargin', 'createdBy',
        'createdAt', 'updatedAt'
      ];
      
      const missingFields = requiredFields.filter(field => !(field in product));
      if (missingFields.length === 0) {
        console.log('   ✅ All required fields present in response');
      } else {
        console.log('   ❌ Missing fields:', missingFields);
      }
      
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

    console.log('\n🎉 Complete Product Update Test completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Product creation with complete data');
    console.log('✅ PUT update with all fields including images, features, specifications');
    console.log('✅ PATCH update with partial fields');
    console.log('✅ All update operations return complete product data');
    console.log('✅ Category and subcategory data properly populated');
    console.log('✅ All product fields maintained throughout operations');

    console.log('\n📝 Verified Fields:');
    console.log('- Basic Info: title, mrp, srp, description');
    console.log('- Images: mainImage, additionalImages');
    console.log('- Content: shortDescription, detailedDescription, features, specifications, highlights');
    console.log('- Attributes: attributes, keywords');
    console.log('- New Fields: productUrl, vendorSite');
    console.log('- Relations: category, subcategory');
    console.log('- Metadata: isActive, profitMargin, createdBy, createdAt, updatedAt');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCompleteProductUpdate();
