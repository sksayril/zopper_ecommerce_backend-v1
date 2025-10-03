const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let adminToken = '';

// Helper function to make API calls
const apiCall = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      return error.response.data;
    }
    throw error;
  }
};

// Test functions
const testAdminLogin = async () => {
  console.log('\n🔵 Testing Admin Login...');
  
  const loginData = {
    email: 'admin@test.com',
    password: 'admin123'
  };

  const result = await apiCall('POST', '/admin/login', loginData);
  console.log('Login Result:', JSON.stringify(result, null, 2));
  
  if (result.success && result.data.token) {
    adminToken = result.data.token;
    console.log('✅ Admin token saved for further tests');
  }
  
  return result.success;
};

const testCreateTestData = async () => {
  console.log('\n🔵 Creating Test Data (Vendor and Products)...');
  
  if (!adminToken) {
    console.log('❌ No admin token available. Please login first.');
    return { vendorId: null, productIds: [] };
  }

  // Create a test vendor
  const vendorData = {
    name: 'Test Assignment Vendor',
    email: 'assignvendor@test.com',
    password: 'vendor123',
    phone: '+1234567890',
    address: {
      street: '123 Assignment Street',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      country: 'Test Country'
    },
    shopName: 'Assignment Test Store'
  };

  const vendorResult = await apiCall('POST', '/admin/vendor', vendorData, adminToken);
  console.log('Vendor Creation Result:', JSON.stringify(vendorResult, null, 2));

  if (!vendorResult.success) {
    console.log('❌ Failed to create test vendor');
    return { vendorId: null, productIds: [] };
  }

  const vendorId = vendorResult.data.vendor.id;
  console.log('✅ Test vendor created, ID:', vendorId);

  // Create test products (we'll need to create categories first)
  const categoryData = {
    name: 'Test Assignment Electronics'
  };

  const categoryResult = await apiCall('POST', '/admin/category', categoryData, adminToken);
  console.log('Category Creation Result:', JSON.stringify(categoryResult, null, 2));

  if (!categoryResult.success) {
    console.log('❌ Failed to create test category');
    return { vendorId, productIds: [] };
  }

  const categoryId = categoryResult.data.category.id;
  console.log('✅ Test category created, ID:', categoryId);

  // Create subcategory
  const subcategoryData = {
    name: 'Test Assignment Smartphones',
    description: 'Test subcategory for assignment',
    parentCategoryId: categoryId
  };

  const subcategoryResult = await apiCall('POST', '/admin/subcategory', subcategoryData, adminToken);
  console.log('Subcategory Creation Result:', JSON.stringify(subcategoryResult, null, 2));

  if (!subcategoryResult.success) {
    console.log('❌ Failed to create test subcategory');
    return { vendorId, productIds: [] };
  }

  const subcategoryId = subcategoryResult.data.subcategory.id;
  console.log('✅ Test subcategory created, ID:', subcategoryId);

  // Create test products
  const productIds = [];
  const productTitles = ['Test Product 1', 'Test Product 2', 'Test Product 3'];

  for (const title of productTitles) {
    const productData = {
      title: title,
      mrp: 1000,
      srp: 900,
      description: `Test product for assignment: ${title}`,
      categoryId: categoryId,
      subcategoryId: subcategoryId,
      attributes: [
        {
          key: 'Brand',
          value: 'TestBrand'
        }
      ],
      keywords: ['test', 'assignment']
    };

    const productResult = await apiCall('POST', '/admin/products', productData, adminToken);
    console.log(`Product Creation Result (${title}):`, JSON.stringify(productResult, null, 2));

    if (productResult.success) {
      productIds.push(productResult.data.product.id);
      console.log(`✅ Test product created: ${title}, ID: ${productResult.data.product.id}`);
    } else {
      console.log(`❌ Failed to create test product: ${title}`);
    }
  }

  return { vendorId, productIds };
};

const testAssignProductsToVendor = async (vendorId, productIds) => {
  console.log('\n🔵 Testing Assign Products to Vendor...');
  
  if (!adminToken) {
    console.log('❌ No admin token available. Please login first.');
    return false;
  }

  if (!vendorId || productIds.length === 0) {
    console.log('❌ No test data available. Please create test data first.');
    return false;
  }

  const assignData = {
    vendorId: vendorId,
    productIds: productIds
  };

  const result = await apiCall('POST', '/admin/products/assign-vendor', assignData, adminToken);
  console.log('Assign Products Result:', JSON.stringify(result, null, 2));
  return result.success;
};

const testAssignProductsInvalidVendor = async () => {
  console.log('\n🔵 Testing Assign Products with Invalid Vendor...');
  
  if (!adminToken) {
    console.log('❌ No admin token available. Please login first.');
    return false;
  }

  const assignData = {
    vendorId: '68d65bc5c1a0ff45303b7b7x', // Invalid ObjectId
    productIds: ['68d65bc5c1a0ff45303b7b7f']
  };

  const result = await apiCall('POST', '/admin/products/assign-vendor', assignData, adminToken);
  console.log('Invalid Vendor Result:', JSON.stringify(result, null, 2));
  return !result.success; // Should fail
};

const testAssignProductsInvalidProducts = async () => {
  console.log('\n🔵 Testing Assign Products with Invalid Product IDs...');
  
  if (!adminToken) {
    console.log('❌ No admin token available. Please login first.');
    return false;
  }

  const assignData = {
    vendorId: '68d65bc5c1a0ff45303b7b7e',
    productIds: ['68d65bc5c1a0ff45303b7b7x', '68d65bc5c1a0ff45303b7b7y'] // Invalid ObjectIds
  };

  const result = await apiCall('POST', '/admin/products/assign-vendor', assignData, adminToken);
  console.log('Invalid Products Result:', JSON.stringify(result, null, 2));
  return !result.success; // Should fail
};

const testAssignProductsMissingFields = async () => {
  console.log('\n🔵 Testing Assign Products with Missing Fields...');
  
  if (!adminToken) {
    console.log('❌ No admin token available. Please login first.');
    return false;
  }

  const assignData = {
    // Missing vendorId and productIds
  };

  const result = await apiCall('POST', '/admin/products/assign-vendor', assignData, adminToken);
  console.log('Missing Fields Result:', JSON.stringify(result, null, 2));
  return !result.success; // Should fail
};

const testAssignProductsEmptyArray = async () => {
  console.log('\n🔵 Testing Assign Products with Empty Product IDs Array...');
  
  if (!adminToken) {
    console.log('❌ No admin token available. Please login first.');
    return false;
  }

  const assignData = {
    vendorId: '68d65bc5c1a0ff45303b7b7e',
    productIds: [] // Empty array
  };

  const result = await apiCall('POST', '/admin/products/assign-vendor', assignData, adminToken);
  console.log('Empty Array Result:', JSON.stringify(result, null, 2));
  return !result.success; // Should fail
};

const testAssignProductsNoToken = async () => {
  console.log('\n🔵 Testing Assign Products without Token...');

  const assignData = {
    vendorId: '68d65bc5c1a0ff45303b7b7e',
    productIds: ['68d65bc5c1a0ff45303b7b7f']
  };

  const result = await apiCall('POST', '/admin/products/assign-vendor', assignData, null);
  console.log('No Token Result:', JSON.stringify(result, null, 2));
  return !result.success; // Should fail
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Assign Products to Vendor API Tests...\n');
  console.log('=' .repeat(60));

  const tests = [
    { name: 'Admin Login', fn: testAdminLogin },
  ];

  let passed = 0;
  let total = tests.length;
  let testData = { vendorId: null, productIds: [] };

  // Run initial tests
  for (const test of tests) {
    try {
      const success = await test.fn();
      if (success) {
        console.log(`✅ ${test.name}: PASSED`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: FAILED`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
    }
    console.log('-'.repeat(30));
  }

  // Create test data
  console.log('\n🔵 Creating Test Data...');
  try {
    testData = await testCreateTestData();
    if (testData.vendorId && testData.productIds.length > 0) {
      console.log('✅ Test data created successfully');
      passed++;
    } else {
      console.log('❌ Failed to create test data');
    }
  } catch (error) {
    console.log(`❌ Test data creation: ERROR - ${error.message}`);
  }
  console.log('-'.repeat(30));

  // Run main functionality tests
  const mainTests = [
    { name: 'Assign Products to Vendor (Valid)', fn: () => testAssignProductsToVendor(testData.vendorId, testData.productIds) },
    { name: 'Assign Products with Invalid Vendor', fn: testAssignProductsInvalidVendor },
    { name: 'Assign Products with Invalid Product IDs', fn: testAssignProductsInvalidProducts },
    { name: 'Assign Products with Missing Fields', fn: testAssignProductsMissingFields },
    { name: 'Assign Products with Empty Array', fn: testAssignProductsEmptyArray },
    { name: 'Assign Products without Token', fn: testAssignProductsNoToken }
  ];

  total += 1 + mainTests.length; // +1 for test data creation

  for (const test of mainTests) {
    try {
      const success = await test.fn();
      if (success) {
        console.log(`✅ ${test.name}: PASSED`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: FAILED`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
    }
    console.log('-'.repeat(30));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Assign Products to Vendor API is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.');
  }
};

// Run tests
runTests().catch(console.error);
