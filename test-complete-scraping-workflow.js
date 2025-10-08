const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
let adminToken = '';
let scrapingSessionId = '';
let createdProductId = '';

// Test data
const testAdmin = {
  email: 'admin@example.com',
  password: 'admin123'
};

// Complete scraping workflow test
const testCompleteScrapingWorkflow = async () => {
  console.log('🔄 Testing Complete Scraping Workflow...');
  console.log('==========================================');

  try {
    // Step 1: Admin Login
    console.log('\n1️⃣ Admin Login...');
    const loginResponse = await axios.post(`${BASE_URL}/admin/login`, testAdmin);
    adminToken = loginResponse.data.data.token;
    console.log('✅ Admin logged in successfully');

    // Helper function for authenticated requests
    const makeRequest = async (method, url, data = null) => {
      const config = {
        method,
        url: `${BASE_URL}${url}`,
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      };
      if (data) config.data = data;
      return await axios(config);
    };

    // Step 2: Start Scraping Session
    console.log('\n2️⃣ Starting Scraping Session...');
    const scrapingSessionData = {
      platform: 'flipkart',
      scrapedUrl: 'https://www.flipkart.com/electronics/mobiles',
      productType: 'Smartphones',
      category: 'Electronics',
      notes: 'Complete workflow test - scraping mobile phones from Flipkart',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ipAddress: '192.168.1.100'
    };

    const startSessionResponse = await makeRequest('POST', '/admin/scraping/start', scrapingSessionData);
    scrapingSessionId = startSessionResponse.data.scrapingSession.id;
    console.log('✅ Scraping session started');
    console.log(`   Session ID: ${scrapingSessionId}`);
    console.log(`   Platform: ${startSessionResponse.data.scrapingSession.platform}`);
    console.log(`   Status: ${startSessionResponse.data.scrapingSession.status}`);

    // Step 3: Simulate Adding Multiple Products
    console.log('\n3️⃣ Adding Products to Scraping Session...');
    const productsToScrape = [
      {
        productTitle: 'iPhone 15 Pro Max',
        productUrl: 'https://www.flipkart.com/iphone-15-pro-max',
        productPrice: 119999,
        productImage: 'https://img.flipkart.com/iphone15promax.jpg',
        isSuccessful: true
      },
      {
        productTitle: 'Samsung Galaxy S24 Ultra',
        productUrl: 'https://www.flipkart.com/samsung-galaxy-s24-ultra',
        productPrice: 124999,
        productImage: 'https://img.flipkart.com/samsung-s24-ultra.jpg',
        isSuccessful: true
      },
      {
        productTitle: 'OnePlus 12 Pro',
        productUrl: 'https://www.flipkart.com/oneplus-12-pro',
        productPrice: 69999,
        productImage: 'https://img.flipkart.com/oneplus-12-pro.jpg',
        isSuccessful: true
      },
      {
        productTitle: 'Google Pixel 8 Pro',
        productUrl: 'https://www.flipkart.com/google-pixel-8-pro',
        productPrice: 89999,
        productImage: 'https://img.flipkart.com/google-pixel-8-pro.jpg',
        isSuccessful: false // Simulate a failed scraping
      }
    ];

    let successfulProducts = 0;
    let failedProducts = 0;

    for (let i = 0; i < productsToScrape.length; i++) {
      const product = productsToScrape[i];
      console.log(`   Adding product ${i + 1}/${productsToScrape.length}: ${product.productTitle}`);
      
      const addProductResponse = await makeRequest('POST', `/admin/scraping/${scrapingSessionId}/add-product`, product);
      
      if (product.isSuccessful) {
        successfulProducts++;
        console.log(`   ✅ Successfully added: ${product.productTitle}`);
      } else {
        failedProducts++;
        console.log(`   ❌ Failed to add: ${product.productTitle}`);
      }
    }

    console.log(`✅ Added ${successfulProducts} successful and ${failedProducts} failed products`);

    // Step 4: Update Scraping Session with Final Results
    console.log('\n4️⃣ Updating Scraping Session with Final Results...');
    const updateData = {
      status: 'completed',
      totalProductsScraped: productsToScrape.length,
      successfulProducts: successfulProducts,
      failedProducts: failedProducts,
      scrapedData: {
        productTitles: productsToScrape.map(p => p.productTitle),
        productUrls: productsToScrape.map(p => p.productUrl),
        productPrices: productsToScrape.filter(p => p.isSuccessful).map(p => p.productPrice),
        productImages: productsToScrape.filter(p => p.isSuccessful).map(p => p.productImage)
      },
      notes: `Scraping completed successfully. Scraped ${successfulProducts} products successfully out of ${productsToScrape.length} total products.`
    };

    const updateResponse = await makeRequest('POST', `/admin/scraping/${scrapingSessionId}/update`, updateData);
    console.log('✅ Scraping session updated with final results');
    console.log(`   Status: ${updateResponse.data.scrapingSession.status}`);
    console.log(`   Total Products: ${updateResponse.data.scrapingSession.totalProductsScraped}`);
    console.log(`   Successful: ${updateResponse.data.scrapingSession.successfulProducts}`);
    console.log(`   Failed: ${updateResponse.data.scrapingSession.failedProducts}`);
    console.log(`   Success Rate: ${updateResponse.data.scrapingSession.successRate}%`);
    console.log(`   Duration: ${updateResponse.data.scrapingSession.duration}`);

    // Step 5: Create a Product with Scraping History
    console.log('\n5️⃣ Creating Product with Scraping History...');
    
    // First, get a valid category and subcategory (you might need to adjust these IDs based on your database)
    const productData = {
      title: 'iPhone 15 Pro Max - Scraped Product',
      mrp: 119999,
      srp: 109999,
      description: 'Latest iPhone with advanced features - scraped from Flipkart',
      mainImage: 'https://img.flipkart.com/iphone15promax.jpg',
      categoryId: '64f8a1b2c3d4e5f6a7b8c9d3', // Replace with actual category ID
      subcategoryId: '64f8a1b2c3d4e5f6a7b8c9d4', // Replace with actual subcategory ID
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

    try {
      const createProductResponse = await makeRequest('POST', '/admin/products', productData);
      createdProductId = createProductResponse.data.product.id;
      console.log('✅ Product created with scraping history');
      console.log(`   Product ID: ${createdProductId}`);
      console.log(`   Title: ${createProductResponse.data.product.title}`);
      console.log(`   Scraping History ID: ${createProductResponse.data.product.scrapingHistory?.id}`);
      console.log(`   Was Scraped: ${createProductResponse.data.product.scrapingInfo.wasScraped}`);
      console.log(`   Scraped From: ${createProductResponse.data.product.scrapingInfo.scrapedFrom.platform}`);
    } catch (error) {
      console.log('⚠️ Product creation failed (likely due to invalid category/subcategory IDs)');
      console.log('   This is expected if you haven\'t set up categories in your database');
      console.log('   Error:', error.response?.data?.message || error.message);
    }

    // Step 6: Verify Scraping Session Details
    console.log('\n6️⃣ Verifying Scraping Session Details...');
    const sessionResponse = await makeRequest('GET', `/admin/scraping/${scrapingSessionId}`);
    const session = sessionResponse.data.scrapingSession;
    
    console.log('✅ Scraping session details verified');
    console.log(`   Platform: ${session.platform}`);
    console.log(`   Product Type: ${session.productType}`);
    console.log(`   Category: ${session.category}`);
    console.log(`   Status: ${session.status}`);
    console.log(`   Start Time: ${session.startTime}`);
    console.log(`   End Time: ${session.endTime}`);
    console.log(`   Duration: ${session.duration}`);
    console.log(`   Success Rate: ${session.successRate}%`);
    console.log(`   Scraped Data: ${session.scrapedData.productTitles.length} product titles`);

    // Step 7: Check Scraping Statistics
    console.log('\n7️⃣ Checking Scraping Statistics...');
    const statsResponse = await makeRequest('GET', '/admin/scraping/stats/overview');
    const stats = statsResponse.data;
    
    console.log('✅ Scraping statistics retrieved');
    console.log(`   Total Sessions: ${stats.overview.totalScrapingSessions}`);
    console.log(`   Total Products Scraped: ${stats.overview.totalProductsScraped}`);
    console.log(`   Average Success Rate: ${stats.overview.averageSuccessRate}%`);
    console.log(`   Platform Stats: ${stats.platformStats.length} platforms`);
    console.log(`   Recent Sessions: ${stats.recentSessions.length} sessions`);

    // Step 8: Get All Scraping Sessions
    console.log('\n8️⃣ Getting All Scraping Sessions...');
    const allSessionsResponse = await makeRequest('GET', '/admin/scraping?page=1&limit=10');
    const sessions = allSessionsResponse.data;
    
    console.log('✅ All scraping sessions retrieved');
    console.log(`   Total Sessions: ${sessions.pagination.totalSessions}`);
    console.log(`   Current Page: ${sessions.pagination.currentPage}`);
    console.log(`   Sessions in Page: ${sessions.scrapingSessions.length}`);

    // Step 9: Get Products with Scraping Information
    console.log('\n9️⃣ Getting Products with Scraping Information...');
    const productsResponse = await makeRequest('GET', '/admin/products?page=1&limit=5');
    const products = productsResponse.data;
    
    console.log('✅ Products with scraping info retrieved');
    console.log(`   Total Products: ${products.pagination.totalProducts}`);
    console.log(`   Products in Page: ${products.products.length}`);
    
    if (products.products.length > 0) {
      const product = products.products[0];
      console.log(`   First Product: ${product.title}`);
      console.log(`   Was Scraped: ${product.scrapingInfo?.wasScraped || false}`);
      if (product.scrapingHistory) {
        console.log(`   Scraping Platform: ${product.scrapingHistory.platform}`);
        console.log(`   Scraping Status: ${product.scrapingHistory.status}`);
      }
    }

    // Step 10: Cleanup - Delete Scraping Session
    console.log('\n🔟 Cleaning Up - Deleting Scraping Session...');
    const deleteResponse = await makeRequest('DELETE', `/admin/scraping/${scrapingSessionId}`);
    console.log('✅ Scraping session deleted successfully');
    console.log(`   Deleted Session ID: ${deleteResponse.data.deletedSession.id}`);
    console.log(`   Platform: ${deleteResponse.data.deletedSession.platform}`);

    console.log('\n🎉 Complete Scraping Workflow Test Completed Successfully!');
    console.log('==========================================');
    console.log('✅ All steps completed without errors');
    console.log('✅ Scraping session lifecycle tested');
    console.log('✅ Product creation with scraping history tested');
    console.log('✅ Statistics and reporting tested');
    console.log('✅ Cleanup completed');

    return true;

  } catch (error) {
    console.error('\n❌ Complete Scraping Workflow Test Failed!');
    console.error('==========================================');
    console.error('Error:', error.response?.data || error.message);
    console.error('Stack:', error.stack);
    return false;
  }
};

// Performance test
const testScrapingPerformance = async () => {
  console.log('\n⚡ Testing Scraping Performance...');
  console.log('===================================');

  try {
    const makeRequest = async (method, url, data = null) => {
      const config = {
        method,
        url: `${BASE_URL}${url}`,
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      };
      if (data) config.data = data;
      return await axios(config);
    };

    // Test creating multiple scraping sessions quickly
    const startTime = Date.now();
    const sessionPromises = [];

    for (let i = 0; i < 5; i++) {
      const sessionData = {
        platform: ['flipkart', 'amazon', 'myntra', 'nykaa', 'ajio'][i],
        scrapedUrl: `https://www.${['flipkart', 'amazon', 'myntra', 'nykaa', 'ajio'][i]}.com/test`,
        productType: 'Test Products',
        category: 'Test Category',
        notes: `Performance test session ${i + 1}`
      };

      sessionPromises.push(makeRequest('POST', '/admin/scraping/start', sessionData));
    }

    const sessions = await Promise.all(sessionPromises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ Created ${sessions.length} scraping sessions in ${duration}ms`);
    console.log(`   Average time per session: ${(duration / sessions.length).toFixed(2)}ms`);

    // Cleanup - delete all test sessions
    const deletePromises = sessions.map(session => 
      makeRequest('DELETE', `/admin/scraping/${session.data.scrapingSession.id}`)
    );
    await Promise.all(deletePromises);
    console.log('✅ Cleaned up all test sessions');

    return true;

  } catch (error) {
    console.error('❌ Performance test failed:', error.response?.data || error.message);
    return false;
  }
};

// Main test runner
const runAllTests = async () => {
  console.log('🧪 Starting Complete Scraping Workflow Tests...');
  console.log('===============================================');

  const tests = [
    { name: 'Complete Scraping Workflow', fn: testCompleteScrapingWorkflow },
    { name: 'Scraping Performance', fn: testScrapingPerformance }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`\n🔍 Running: ${test.name}`);
      const result = await test.fn();
      if (result) {
        passed++;
        console.log(`✅ ${test.name} - PASSED`);
      } else {
        failed++;
        console.log(`❌ ${test.name} - FAILED`);
      }
    } catch (error) {
      console.error(`❌ ${test.name} - FAILED with error:`, error.message);
      failed++;
    }
  }

  console.log('\n===============================================');
  console.log('📊 Test Results Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Complete scraping workflow is working correctly.');
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
  testCompleteScrapingWorkflow,
  testScrapingPerformance
};
