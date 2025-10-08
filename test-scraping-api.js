const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
let adminToken = '';
let scrapingSessionId = '';

// Test data
const testAdmin = {
  email: 'admin@example.com',
  password: 'admin123'
};

const testScrapingSession = {
  platform: 'flipkart',
  scrapedUrl: 'https://www.flipkart.com/electronics/mobiles',
  productType: 'Smartphones',
  category: 'Electronics',
  notes: 'Test scraping session for mobile phones',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  ipAddress: '192.168.1.100'
};

const testProduct = {
  productTitle: 'iPhone 15 Pro Max',
  productUrl: 'https://www.flipkart.com/iphone-15-pro-max',
  productPrice: 119999,
  productImage: 'https://img.flipkart.com/iphone15promax.jpg',
  isSuccessful: true
};

// Helper function to make authenticated requests
const makeRequest = async (method, url, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error in ${method} ${url}:`, error.response?.data || error.message);
    throw error;
  }
};

// Test functions
const testAdminLogin = async () => {
  console.log('\n🔐 Testing Admin Login...');
  try {
    const response = await axios.post(`${BASE_URL}/admin/login`, testAdmin);
    adminToken = response.data.data.token;
    console.log('✅ Admin login successful');
    console.log('Token:', adminToken.substring(0, 20) + '...');
    return true;
  } catch (error) {
    console.error('❌ Admin login failed:', error.response?.data || error.message);
    return false;
  }
};

const testStartScrapingSession = async () => {
  console.log('\n🚀 Testing Start Scraping Session...');
  try {
    const response = await makeRequest('POST', '/admin/scraping/start', testScrapingSession);
    scrapingSessionId = response.data.scrapingSession.id;
    console.log('✅ Scraping session started successfully');
    console.log('Session ID:', scrapingSessionId);
    console.log('Platform:', response.data.scrapingSession.platform);
    console.log('Status:', response.data.scrapingSession.status);
    return true;
  } catch (error) {
    console.error('❌ Start scraping session failed:', error.response?.data || error.message);
    return false;
  }
};

const testAddProductToSession = async () => {
  console.log('\n📦 Testing Add Product to Scraping Session...');
  try {
    const response = await makeRequest('POST', `/admin/scraping/${scrapingSessionId}/add-product`, testProduct);
    console.log('✅ Product added to scraping session successfully');
    console.log('Total Products Scraped:', response.data.scrapingSession.totalProductsScraped);
    console.log('Successful Products:', response.data.scrapingSession.successfulProducts);
    console.log('Success Rate:', response.data.scrapingSession.successRate + '%');
    return true;
  } catch (error) {
    console.error('❌ Add product to session failed:', error.response?.data || error.message);
    return false;
  }
};

const testUpdateScrapingSession = async () => {
  console.log('\n📝 Testing Update Scraping Session...');
  try {
    const updateData = {
      status: 'completed',
      totalProductsScraped: 150,
      successfulProducts: 145,
      failedProducts: 5,
      scrapedData: {
        productTitles: ['iPhone 15', 'Samsung Galaxy S24', 'OnePlus 12'],
        productUrls: ['https://flipkart.com/iphone-15', 'https://flipkart.com/samsung-s24'],
        productPrices: [79999, 89999, 59999],
        productImages: ['https://img.flipkart.com/iphone15.jpg']
      },
      notes: 'Scraping completed successfully with 96.7% success rate'
    };

    const response = await makeRequest('POST', `/admin/scraping/${scrapingSessionId}/update`, updateData);
    console.log('✅ Scraping session updated successfully');
    console.log('Status:', response.data.scrapingSession.status);
    console.log('Total Products:', response.data.scrapingSession.totalProductsScraped);
    console.log('Success Rate:', response.data.scrapingSession.successRate + '%');
    console.log('Duration:', response.data.scrapingSession.duration);
    return true;
  } catch (error) {
    console.error('❌ Update scraping session failed:', error.response?.data || error.message);
    return false;
  }
};

const testGetScrapingSession = async () => {
  console.log('\n📖 Testing Get Single Scraping Session...');
  try {
    const response = await makeRequest('GET', `/admin/scraping/${scrapingSessionId}`);
    console.log('✅ Scraping session retrieved successfully');
    console.log('Session ID:', response.data.scrapingSession.id);
    console.log('Platform:', response.data.scrapingSession.platform);
    console.log('Product Type:', response.data.scrapingSession.productType);
    console.log('Category:', response.data.scrapingSession.category);
    console.log('Status:', response.data.scrapingSession.status);
    console.log('Total Products:', response.data.scrapingSession.totalProductsScraped);
    console.log('Success Rate:', response.data.scrapingSession.successRate + '%');
    console.log('Duration:', response.data.scrapingSession.duration);
    console.log('Start Time:', response.data.scrapingSession.startTime);
    console.log('End Time:', response.data.scrapingSession.endTime);
    return true;
  } catch (error) {
    console.error('❌ Get scraping session failed:', error.response?.data || error.message);
    return false;
  }
};

const testGetAllScrapingSessions = async () => {
  console.log('\n📋 Testing Get All Scraping Sessions...');
  try {
    const response = await makeRequest('GET', '/admin/scraping?page=1&limit=10');
    console.log('✅ Scraping sessions retrieved successfully');
    console.log('Total Sessions:', response.data.pagination.totalSessions);
    console.log('Current Page:', response.data.pagination.currentPage);
    console.log('Total Pages:', response.data.pagination.totalPages);
    console.log('Sessions in this page:', response.data.scrapingSessions.length);
    
    if (response.data.scrapingSessions.length > 0) {
      const session = response.data.scrapingSessions[0];
      console.log('First Session:');
      console.log('  - ID:', session.id);
      console.log('  - Platform:', session.platform);
      console.log('  - Status:', session.status);
      console.log('  - Success Rate:', session.successRate + '%');
    }
    return true;
  } catch (error) {
    console.error('❌ Get all scraping sessions failed:', error.response?.data || error.message);
    return false;
  }
};

const testGetScrapingStats = async () => {
  console.log('\n📊 Testing Get Scraping Statistics...');
  try {
    const response = await makeRequest('GET', '/admin/scraping/stats/overview');
    console.log('✅ Scraping statistics retrieved successfully');
    console.log('Overview:');
    console.log('  - Total Sessions:', response.data.overview.totalScrapingSessions);
    console.log('  - Total Products Scraped:', response.data.overview.totalProductsScraped);
    console.log('  - Total Successful Products:', response.data.overview.totalSuccessfulProducts);
    console.log('  - Average Success Rate:', response.data.overview.averageSuccessRate + '%');
    
    console.log('Platform Stats:');
    response.data.platformStats.forEach(stat => {
      console.log(`  - ${stat.platform}: ${stat.totalSessions} sessions, ${stat.averageSuccessRate}% success rate`);
    });
    
    console.log('Status Stats:');
    response.data.statusStats.forEach(stat => {
      console.log(`  - ${stat.status}: ${stat.count} sessions`);
    });
    
    console.log('Recent Sessions:', response.data.recentSessions.length);
    return true;
  } catch (error) {
    console.error('❌ Get scraping statistics failed:', error.response?.data || error.message);
    return false;
  }
};

const testCreateProductWithScrapingHistory = async () => {
  console.log('\n🛍️ Testing Create Product with Scraping History...');
  try {
    // First, we need to get a category and subcategory ID
    // For this test, we'll use placeholder IDs - in real scenario, you'd get these from the database
    const productData = {
      title: 'iPhone 15 Pro Max - Test Product',
      mrp: 119999,
      srp: 109999,
      description: 'Latest iPhone with advanced features - Test Product',
      mainImage: 'https://img.flipkart.com/iphone15promax.jpg',
      categoryId: '64f8a1b2c3d4e5f6a7b8c9d3', // This should be a valid category ID
      subcategoryId: '64f8a1b2c3d4e5f6a7b8c9d4', // This should be a valid subcategory ID
      productUrl: 'https://www.flipkart.com/iphone-15-pro-max',
      vendorSite: 'flipkart',
      scrapingHistoryId: scrapingSessionId,
      scrapingInfo: {
        wasScraped: true,
        scrapedFrom: {
          platform: 'flipkart',
          url: 'https://www.flipkart.com/iphone-15-pro-max',
          scrapedAt: new Date().toISOString()
        }
      }
    };

    const response = await makeRequest('POST', '/admin/products', productData);
    console.log('✅ Product created with scraping history successfully');
    console.log('Product ID:', response.data.product.id);
    console.log('Product Title:', response.data.product.title);
    console.log('Scraping History ID:', response.data.product.scrapingHistory?.id);
    console.log('Was Scraped:', response.data.product.scrapingInfo.wasScraped);
    console.log('Scraped From Platform:', response.data.product.scrapingInfo.scrapedFrom.platform);
    return true;
  } catch (error) {
    console.error('❌ Create product with scraping history failed:', error.response?.data || error.message);
    return false;
  }
};

const testGetProductsWithScrapingInfo = async () => {
  console.log('\n🔍 Testing Get Products with Scraping Information...');
  try {
    const response = await makeRequest('GET', '/admin/products?page=1&limit=5');
    console.log('✅ Products with scraping info retrieved successfully');
    console.log('Total Products:', response.data.pagination.totalProducts);
    console.log('Products in this page:', response.data.products.length);
    
    if (response.data.products.length > 0) {
      const product = response.data.products[0];
      console.log('First Product:');
      console.log('  - ID:', product.id);
      console.log('  - Title:', product.title);
      console.log('  - Vendor Site:', product.vendorSite);
      console.log('  - Was Scraped:', product.scrapingInfo?.wasScraped || false);
      if (product.scrapingHistory) {
        console.log('  - Scraping Platform:', product.scrapingHistory.platform);
        console.log('  - Scraping Status:', product.scrapingHistory.status);
      }
    }
    return true;
  } catch (error) {
    console.error('❌ Get products with scraping info failed:', error.response?.data || error.message);
    return false;
  }
};

const testDeleteScrapingSession = async () => {
  console.log('\n🗑️ Testing Delete Scraping Session...');
  try {
    const response = await makeRequest('DELETE', `/admin/scraping/${scrapingSessionId}`);
    console.log('✅ Scraping session deleted successfully');
    console.log('Deleted Session ID:', response.data.deletedSession.id);
    console.log('Platform:', response.data.deletedSession.platform);
    console.log('Total Products Scraped:', response.data.deletedSession.totalProductsScraped);
    return true;
  } catch (error) {
    console.error('❌ Delete scraping session failed:', error.response?.data || error.message);
    return false;
  }
};

// Error handling tests
const testErrorHandling = async () => {
  console.log('\n⚠️ Testing Error Handling...');
  
  // Test invalid platform
  try {
    await makeRequest('POST', '/admin/scraping/start', {
      ...testScrapingSession,
      platform: 'invalid_platform'
    });
    console.log('❌ Should have failed with invalid platform');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Invalid platform error handled correctly');
    } else {
      console.log('❌ Unexpected error for invalid platform');
    }
  }

  // Test invalid URL
  try {
    await makeRequest('POST', '/admin/scraping/start', {
      ...testScrapingSession,
      scrapedUrl: 'invalid-url'
    });
    console.log('❌ Should have failed with invalid URL');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Invalid URL error handled correctly');
    } else {
      console.log('❌ Unexpected error for invalid URL');
    }
  }

  // Test missing required fields
  try {
    await makeRequest('POST', '/admin/scraping/start', {
      platform: 'flipkart'
      // Missing other required fields
    });
    console.log('❌ Should have failed with missing required fields');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Missing required fields error handled correctly');
    } else {
      console.log('❌ Unexpected error for missing required fields');
    }
  }

  // Test invalid session ID
  try {
    await makeRequest('GET', '/admin/scraping/invalid_id');
    console.log('❌ Should have failed with invalid session ID');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Invalid session ID error handled correctly');
    } else {
      console.log('❌ Unexpected error for invalid session ID');
    }
  }
};

// Main test runner
const runAllTests = async () => {
  console.log('🧪 Starting Scraping API Tests...');
  console.log('=====================================');

  const tests = [
    { name: 'Admin Login', fn: testAdminLogin },
    { name: 'Start Scraping Session', fn: testStartScrapingSession },
    { name: 'Add Product to Session', fn: testAddProductToSession },
    { name: 'Update Scraping Session', fn: testUpdateScrapingSession },
    { name: 'Get Single Scraping Session', fn: testGetScrapingSession },
    { name: 'Get All Scraping Sessions', fn: testGetAllScrapingSessions },
    { name: 'Get Scraping Statistics', fn: testGetScrapingStats },
    { name: 'Create Product with Scraping History', fn: testCreateProductWithScrapingHistory },
    { name: 'Get Products with Scraping Info', fn: testGetProductsWithScrapingInfo },
    { name: 'Error Handling', fn: testErrorHandling },
    { name: 'Delete Scraping Session', fn: testDeleteScrapingSession }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`❌ Test "${test.name}" failed with error:`, error.message);
      failed++;
    }
  }

  console.log('\n=====================================');
  console.log('📊 Test Results Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Scraping API is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testAdminLogin,
  testStartScrapingSession,
  testAddProductToSession,
  testUpdateScrapingSession,
  testGetScrapingSession,
  testGetAllScrapingSessions,
  testGetScrapingStats,
  testCreateProductWithScrapingHistory,
  testGetProductsWithScrapingInfo,
  testDeleteScrapingSession,
  testErrorHandling
};
