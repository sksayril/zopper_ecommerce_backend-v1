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
const testAdminSignup = async () => {
  console.log('\n🔵 Testing Admin Signup...');
  
  const signupData = {
    name: 'Test Admin',
    email: 'admin@test.com',
    password: 'admin123'
  };

  const result = await apiCall('POST', '/admin/signup', signupData);
  console.log('Signup Result:', JSON.stringify(result, null, 2));
  return result.success;
};

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

const testGetAdminProfile = async () => {
  console.log('\n🔵 Testing Get Admin Profile...');
  
  if (!adminToken) {
    console.log('❌ No admin token available. Please login first.');
    return false;
  }

  const result = await apiCall('GET', '/admin/me', null, adminToken);
  console.log('Profile Result:', JSON.stringify(result, null, 2));
  return result.success;
};

const testVerifyToken = async () => {
  console.log('\n🔵 Testing Verify Token...');
  
  if (!adminToken) {
    console.log('❌ No admin token available. Please login first.');
    return false;
  }

  const result = await apiCall('GET', '/admin/verify', null, adminToken);
  console.log('Verify Result:', JSON.stringify(result, null, 2));
  return result.success;
};

const testAdminLogout = async () => {
  console.log('\n🔵 Testing Admin Logout...');
  
  if (!adminToken) {
    console.log('❌ No admin token available. Please login first.');
    return false;
  }

  const result = await apiCall('POST', '/admin/logout', null, adminToken);
  console.log('Logout Result:', JSON.stringify(result, null, 2));
  return result.success;
};

const testInvalidToken = async () => {
  console.log('\n🔵 Testing Invalid Token...');
  
  const result = await apiCall('GET', '/admin/me', null, 'invalid-token');
  console.log('Invalid Token Result:', JSON.stringify(result, null, 2));
  return !result.success; // Should fail
};

const testDuplicateSignup = async () => {
  console.log('\n🔵 Testing Duplicate Signup...');
  
  const signupData = {
    name: 'Duplicate Admin',
    email: 'admin@test.com', // Same email as before
    password: 'admin123'
  };

  const result = await apiCall('POST', '/admin/signup', signupData);
  console.log('Duplicate Signup Result:', JSON.stringify(result, null, 2));
  return !result.success; // Should fail
};

const testInvalidLogin = async () => {
  console.log('\n🔵 Testing Invalid Login...');
  
  const loginData = {
    email: 'admin@test.com',
    password: 'wrongpassword'
  };

  const result = await apiCall('POST', '/admin/login', loginData);
  console.log('Invalid Login Result:', JSON.stringify(result, null, 2));
  return !result.success; // Should fail
};

const testChangePassword = async () => {
  console.log('\n🔵 Testing Change Password...');
  
  if (!adminToken) {
    console.log('❌ No admin token available. Please login first.');
    return false;
  }

  const changePasswordData = {
    currentPassword: 'admin123',
    newPassword: 'newadmin456'
  };

  const result = await apiCall('POST', '/admin/change-password', changePasswordData, adminToken);
  console.log('Change Password Result:', JSON.stringify(result, null, 2));
  return result.success;
};

const testForgotPassword = async () => {
  console.log('\n🔵 Testing Forgot Password...');
  
  const forgotPasswordData = {
    email: 'admin@test.com'
  };

  const result = await apiCall('POST', '/admin/forgot-password', forgotPasswordData);
  console.log('Forgot Password Result:', JSON.stringify(result, null, 2));
  
  if (result.success && result.data.resetToken) {
    // Store reset token for reset password test
    global.resetToken = result.data.resetToken;
    console.log('✅ Reset token saved for reset password test');
  }
  
  return result.success;
};

const testResetPassword = async () => {
  console.log('\n🔵 Testing Reset Password...');
  
  if (!global.resetToken) {
    console.log('❌ No reset token available. Please run forgot password first.');
    return false;
  }

  const resetPasswordData = {
    resetToken: global.resetToken,
    newPassword: 'resetpassword123'
  };

  const result = await apiCall('POST', '/admin/reset-password', resetPasswordData);
  console.log('Reset Password Result:', JSON.stringify(result, null, 2));
  return result.success;
};

const testCreateVendor = async () => {
  console.log('\n🔵 Testing Create Vendor (Admin Only)...');
  
  if (!adminToken) {
    console.log('❌ No admin token available. Please login first.');
    return false;
  }

  const vendorData = {
    name: 'Test Vendor',
    email: 'vendor@test.com',
    password: 'vendor123',
    phone: '+1234567890',
    address: {
      street: '123 Test Street',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      country: 'Test Country'
    },
    shopName: 'Test Vendor Store'
  };

  const result = await apiCall('POST', '/admin/vendor', vendorData, adminToken);
  console.log('Create Vendor Result:', JSON.stringify(result, null, 2));
  
  if (result.success && result.data.vendor) {
    // Store vendor ID for further tests
    global.createdVendorId = result.data.vendor.id;
    console.log('✅ Vendor created successfully, ID saved for further tests');
  }
  
  return result.success;
};

const testGetVendors = async () => {
  console.log('\n🔵 Testing Get All Vendors (Admin Only)...');
  
  if (!adminToken) {
    console.log('❌ No admin token available. Please login first.');
    return false;
  }

  const result = await apiCall('GET', '/admin/vendors', null, adminToken);
  console.log('Get Vendors Result:', JSON.stringify(result, null, 2));
  return result.success;
};

const testGetVendorDetails = async () => {
  console.log('\n🔵 Testing Get Vendor Details (Admin Only)...');
  
  if (!adminToken) {
    console.log('❌ No admin token available. Please login first.');
    return false;
  }

  if (!global.createdVendorId) {
    console.log('❌ No vendor ID available. Please create a vendor first.');
    return false;
  }

  const result = await apiCall('GET', `/admin/vendor/${global.createdVendorId}`, null, adminToken);
  console.log('Get Vendor Details Result:', JSON.stringify(result, null, 2));
  return result.success;
};

const testCreateCategory = async () => {
  console.log('\n🔵 Testing Create Category (Admin Only)...');
  
  if (!adminToken) {
    console.log('❌ No admin token available. Please login first.');
    return false;
  }

  const categoryData = {
    name: 'Test Electronics'
  };

  const result = await apiCall('POST', '/admin/category', categoryData, adminToken);
  console.log('Create Category Result:', JSON.stringify(result, null, 2));
  
  if (result.success && result.data.category) {
    // Store category ID for further tests
    global.createdCategoryId = result.data.category.id;
    console.log('✅ Category created successfully, ID saved for further tests');
  }
  
  return result.success;
};

const testGetCategories = async () => {
  console.log('\n🔵 Testing Get All Categories (Admin Only)...');
  
  if (!adminToken) {
    console.log('❌ No admin token available. Please login first.');
    return false;
  }

  const result = await apiCall('GET', '/admin/categories?page=1&limit=10', null, adminToken);
  console.log('Get Categories Result:', JSON.stringify(result, null, 2));
  return result.success;
};

const testGetCategoryDetails = async () => {
  console.log('\n🔵 Testing Get Category Details (Admin Only)...');
  
  if (!adminToken) {
    console.log('❌ No admin token available. Please login first.');
    return false;
  }

  if (!global.createdCategoryId) {
    console.log('❌ No category ID available. Please create a category first.');
    return false;
  }

  const result = await apiCall('GET', `/admin/category/${global.createdCategoryId}`, null, adminToken);
  console.log('Get Category Details Result:', JSON.stringify(result, null, 2));
  return result.success;
};

const testUpdateCategory = async () => {
  console.log('\n🔵 Testing Update Category (Admin Only)...');
  
  if (!adminToken) {
    console.log('❌ No admin token available. Please login first.');
    return false;
  }

  if (!global.createdCategoryId) {
    console.log('❌ No category ID available. Please create a category first.');
    return false;
  }

  const updateData = {
    name: 'Updated Test Electronics'
  };

  const result = await apiCall('PUT', `/admin/category/${global.createdCategoryId}`, updateData, adminToken);
  console.log('Update Category Result:', JSON.stringify(result, null, 2));
  return result.success;
};

const testDeleteCategory = async () => {
  console.log('\n🔵 Testing Delete Category (Admin Only)...');
  
  if (!adminToken) {
    console.log('❌ No admin token available. Please login first.');
    return false;
  }

  if (!global.createdCategoryId) {
    console.log('❌ No category ID available. Please create a category first.');
    return false;
  }

  const result = await apiCall('DELETE', `/admin/category/${global.createdCategoryId}`, null, adminToken);
  console.log('Delete Category Result:', JSON.stringify(result, null, 2));
  return result.success;
};

const testCreateSubcategory = async () => {
  console.log('\n🔵 Testing Create Subcategory (Admin Only)...');
  
  if (!adminToken) {
    console.log('❌ No admin token available. Please login first.');
    return false;
  }

  if (!global.createdCategoryId) {
    console.log('❌ No parent category ID available. Please create a category first.');
    return false;
  }

  const subcategoryData = {
    name: 'Test Smartphones',
    description: 'Test subcategory for mobile phones and accessories',
    parentCategoryId: global.createdCategoryId
  };

  const result = await apiCall('POST', '/admin/subcategory', subcategoryData, adminToken);
  console.log('Create Subcategory Result:', JSON.stringify(result, null, 2));
  
  if (result.success && result.data.subcategory) {
    // Store subcategory ID for further tests
    global.createdSubcategoryId = result.data.subcategory.id;
    console.log('✅ Subcategory created successfully, ID saved for further tests');
  }
  
  return result.success;
};

const testGetSubcategories = async () => {
  console.log('\n🔵 Testing Get All Subcategories (Admin Only)...');
  
  if (!adminToken) {
    console.log('❌ No admin token available. Please login first.');
    return false;
  }

  const result = await apiCall('GET', '/admin/subcategories?page=1&limit=10', null, adminToken);
  console.log('Get Subcategories Result:', JSON.stringify(result, null, 2));
  return result.success;
};

const testGetSubcategoryDetails = async () => {
  console.log('\n🔵 Testing Get Subcategory Details (Admin Only)...');
  
  if (!adminToken) {
    console.log('❌ No admin token available. Please login first.');
    return false;
  }

  if (!global.createdSubcategoryId) {
    console.log('❌ No subcategory ID available. Please create a subcategory first.');
    return false;
  }

  const result = await apiCall('GET', `/admin/subcategory/${global.createdSubcategoryId}`, null, adminToken);
  console.log('Get Subcategory Details Result:', JSON.stringify(result, null, 2));
  return result.success;
};

const testUpdateSubcategory = async () => {
  console.log('\n🔵 Testing Update Subcategory (Admin Only)...');
  
  if (!adminToken) {
    console.log('❌ No admin token available. Please login first.');
    return false;
  }

  if (!global.createdSubcategoryId) {
    console.log('❌ No subcategory ID available. Please create a subcategory first.');
    return false;
  }

  const updateData = {
    name: 'Updated Test Smartphones'
  };

  const result = await apiCall('POST', `/admin/subcategory/${global.createdSubcategoryId}`, updateData, adminToken);
  console.log('Update Subcategory Result:', JSON.stringify(result, null, 2));
  return result.success;
};

const testDeleteSubcategory = async () => {
  console.log('\n🔵 Testing Delete Subcategory (Admin Only)...');
  
  if (!adminToken) {
    console.log('❌ No admin token available. Please login first.');
    return false;
  }

  if (!global.createdSubcategoryId) {
    console.log('❌ No subcategory ID available. Please create a subcategory first.');
    return false;
  }

  const result = await apiCall('POST', `/admin/subcategory/${global.createdSubcategoryId}/delete`, null, adminToken);
  console.log('Delete Subcategory Result:', JSON.stringify(result, null, 2));
  return result.success;
};

const testGetCategorySubcategories = async () => {
  console.log('\n🔵 Testing Get Category Subcategories (Admin Only)...');
  
  if (!adminToken) {
    console.log('❌ No admin token available. Please login first.');
    return false;
  }

  if (!global.createdCategoryId) {
    console.log('❌ No category ID available. Please create a category first.');
    return false;
  }

  const result = await apiCall('GET', `/admin/category/${global.createdCategoryId}/subcategories?page=1&limit=10`, null, adminToken);
  console.log('Get Category Subcategories Result:', JSON.stringify(result, null, 2));
  return result.success;
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Admin API Tests...\n');
  console.log('=' .repeat(50));

  const tests = [
    { name: 'Admin Signup', fn: testAdminSignup },
    { name: 'Admin Login', fn: testAdminLogin },
    { name: 'Get Admin Profile', fn: testGetAdminProfile },
    { name: 'Verify Token', fn: testVerifyToken },
    { name: 'Change Password', fn: testChangePassword },
    { name: 'Create Vendor', fn: testCreateVendor },
    { name: 'Get All Vendors', fn: testGetVendors },
    { name: 'Get Vendor Details', fn: testGetVendorDetails },
    { name: 'Create Category', fn: testCreateCategory },
    { name: 'Get All Categories', fn: testGetCategories },
    { name: 'Get Category Details', fn: testGetCategoryDetails },
    { name: 'Update Category', fn: testUpdateCategory },
    { name: 'Create Subcategory', fn: testCreateSubcategory },
    { name: 'Get All Subcategories', fn: testGetSubcategories },
    { name: 'Get Subcategory Details', fn: testGetSubcategoryDetails },
    { name: 'Update Subcategory', fn: testUpdateSubcategory },
    { name: 'Get Category Subcategories', fn: testGetCategorySubcategories },
    { name: 'Delete Subcategory', fn: testDeleteSubcategory },
    { name: 'Delete Category', fn: testDeleteCategory },
    { name: 'Forgot Password', fn: testForgotPassword },
    { name: 'Reset Password', fn: testResetPassword },
    { name: 'Admin Logout', fn: testAdminLogout },
    { name: 'Invalid Token Test', fn: testInvalidToken },
    { name: 'Duplicate Signup Test', fn: testDuplicateSignup },
    { name: 'Invalid Login Test', fn: testInvalidLogin }
  ];

  let passed = 0;
  let total = tests.length;

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

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Admin API is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.');
  }
};

// Run tests
runTests().catch(console.error);
