const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

let adminToken = '';

// Helper function to make authenticated requests
const makeRequest = async (method, url, data = null) => {
  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error ${method} ${url}:`, error.response?.data || error.message);
    throw error;
  }
};

// Test functions
const testAdminLogin = async () => {
  console.log('\n🔐 Testing Admin Login...');
  try {
    const response = await axios.post(`${BASE_URL}/admin/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    adminToken = response.data.data.token;
    console.log('✅ Admin login successful');
    console.log('Token:', adminToken.substring(0, 20) + '...');
    return true;
  } catch (error) {
    console.error('❌ Admin login failed:', error.response?.data || error.message);
    return false;
  }
};

const testCreateProductWithImages = async () => {
  console.log('\n📦 Testing Product Creation with Images...');
  
  const productData = {
    title: 'Test Product with Images',
    mrp: 1000,
    srp: 800,
    description: 'A test product with main image and additional images',
    shortDescription: 'Short description for the test product',
    detailedDescription: 'This is a detailed description of the test product with comprehensive information about its features and specifications.',
    features: [
      'High quality material',
      'Durable construction',
      'Easy to use',
      'Modern design'
    ],
    specifications: [
      { key: 'Weight', value: '500g' },
      { key: 'Dimensions', value: '10x15x5 cm' },
      { key: 'Warranty', value: '1 year' }
    ],
    highlights: [
      'Premium quality',
      'Best seller',
      'Customer favorite'
    ],
    mainImage: 'https://example.com/images/main-product.jpg',
    additionalImages: [
      'https://example.com/images/product-side.jpg',
      'https://example.com/images/product-back.jpg',
      'https://example.com/images/product-detail.jpg'
    ],
    categoryId: '507f1f77bcf86cd799439011', // Replace with actual category ID
    subcategoryId: '507f1f77bcf86cd799439012', // Replace with actual subcategory ID
    attributes: [
      { key: 'Color', value: 'Blue' },
      { key: 'Size', value: 'Large' },
      { key: 'Material', value: 'Cotton' }
    ],
    keywords: ['test', 'product', 'images', 'demo']
  };

  try {
    const response = await makeRequest('POST', '/admin/products', productData);
    console.log('✅ Product created successfully with images');
    console.log('Product ID:', response.data.product.id);
    console.log('Main Image:', response.data.product.mainImage);
    console.log('Additional Images:', response.data.product.additionalImages);
    return response.data.product.id;
  } catch (error) {
    console.error('❌ Product creation failed:', error.response?.data || error.message);
    return null;
  }
};

const testGetProductWithImages = async (productId) => {
  console.log('\n🔍 Testing Get Product with Images...');
  
  try {
    const response = await makeRequest('GET', `/admin/products/${productId}`);
    console.log('✅ Product retrieved successfully');
    console.log('Title:', response.data.product.title);
    console.log('Main Image:', response.data.product.mainImage);
    console.log('Additional Images Count:', response.data.product.additionalImages.length);
    console.log('Additional Images:', response.data.product.additionalImages);
    return true;
  } catch (error) {
    console.error('❌ Get product failed:', error.response?.data || error.message);
    return false;
  }
};

const testUpdateProductImages = async (productId) => {
  console.log('\n🔄 Testing Product Image Update...');
  
  const updateData = {
    mainImage: 'https://example.com/images/updated-main-product.jpg',
    additionalImages: [
      'https://example.com/images/updated-side.jpg',
      'https://example.com/images/updated-back.jpg',
      'https://example.com/images/updated-detail.jpg',
      'https://example.com/images/updated-extra.jpg'
    ]
  };

  try {
    const response = await makeRequest('PUT', `/admin/products/${productId}`, updateData);
    console.log('✅ Product images updated successfully');
    console.log('Updated Main Image:', response.data.product.mainImage);
    console.log('Updated Additional Images Count:', response.data.product.additionalImages.length);
    console.log('Updated Additional Images:', response.data.product.additionalImages);
    return true;
  } catch (error) {
    console.error('❌ Product image update failed:', error.response?.data || error.message);
    return false;
  }
};

const testGetAllProductsWithImages = async () => {
  console.log('\n📋 Testing Get All Products with Images...');
  
  try {
    const response = await makeRequest('GET', '/admin/products');
    console.log('✅ Products retrieved successfully');
    console.log('Total Products:', response.data.data.pagination.totalProducts);
    
    if (response.data.data.products.length > 0) {
      const firstProduct = response.data.data.products[0];
      console.log('First Product Title:', firstProduct.title);
      console.log('First Product Main Image:', firstProduct.mainImage);
      console.log('First Product Additional Images Count:', firstProduct.additionalImages?.length || 0);
    }
    return true;
  } catch (error) {
    console.error('❌ Get all products failed:', error.response?.data || error.message);
    return false;
  }
};

const testInvalidImageUrls = async () => {
  console.log('\n❌ Testing Invalid Image URL Validation...');
  
  const invalidProductData = {
    title: 'Test Product with Invalid Images',
    mrp: 1000,
    srp: 800,
    description: 'A test product with invalid image URLs',
    mainImage: 'invalid-url', // Invalid URL
    additionalImages: [
      'https://example.com/images/valid.jpg',
      'not-a-url', // Invalid URL
      'https://example.com/images/valid2.png'
    ],
    categoryId: '507f1f77bcf86cd799439011',
    subcategoryId: '507f1f77bcf86cd799439012'
  };

  try {
    await makeRequest('POST', '/admin/products', invalidProductData);
    console.log('❌ Validation failed - invalid URLs were accepted');
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Validation working correctly - invalid URLs rejected');
      console.log('Error message:', error.response.data.message);
      return true;
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
      return false;
    }
  }
};

const testMissingMainImage = async () => {
  console.log('\n❌ Testing Missing Main Image Validation...');
  
  const productDataWithoutMainImage = {
    title: 'Test Product without Main Image',
    mrp: 1000,
    srp: 800,
    description: 'A test product without main image',
    // mainImage is missing
    additionalImages: [
      'https://example.com/images/side.jpg',
      'https://example.com/images/back.jpg'
    ],
    categoryId: '507f1f77bcf86cd799439011',
    subcategoryId: '507f1f77bcf86cd799439012'
  };

  try {
    await makeRequest('POST', '/admin/products', productDataWithoutMainImage);
    console.log('❌ Validation failed - missing main image was accepted');
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Validation working correctly - missing main image rejected');
      console.log('Error message:', error.response.data.message);
      return true;
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
      return false;
    }
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Product Images API Tests...');
  console.log('=' .repeat(50));
  
  try {
    // Test admin login
    const loginSuccess = await testAdminLogin();
    if (!loginSuccess) {
      console.log('\n❌ Cannot proceed without admin authentication');
      return;
    }

    // Test product creation with images
    const productId = await testCreateProductWithImages();
    if (!productId) {
      console.log('\n❌ Cannot proceed without a test product');
      return;
    }

    // Test getting product with images
    await testGetProductWithImages(productId);

    // Test updating product images
    await testUpdateProductImages(productId);

    // Test getting all products with images
    await testGetAllProductsWithImages();

    // Test validation - invalid image URLs
    await testInvalidImageUrls();

    // Test validation - missing main image
    await testMissingMainImage();

    console.log('\n' + '=' .repeat(50));
    console.log('🎉 All Product Images API Tests Completed!');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testAdminLogin,
  testCreateProductWithImages,
  testGetProductWithImages,
  testUpdateProductImages,
  testGetAllProductsWithImages,
  testInvalidImageUrls,
  testMissingMainImage,
  runTests
};
