const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';

// Test data
const testScrapingLog = {
  platform: 'flipkart',
  scrapedUrl: 'https://www.flipkart.com/electronics/mobiles',
  productType: 'Smartphones',
  category: 'Electronics',
  notes: 'Test scraping session',
  totalProducts: 10,
  scrapedProducts: 8,
  failedProducts: 2
};

const testFlipkartProduct = {
  productUrl: 'https://www.flipkart.com/samsung-galaxy-s21/p/itm123456',
  category: 'Electronics',
  productType: 'product',
  notes: 'Test single product scraping'
};

async function testEnhancedScrapingAPIs() {
  console.log('🧪 Testing Enhanced Scraping APIs...\n');

  try {
    // Test 1: GET /api/scrape-logs
    console.log('1️⃣ Testing GET /api/scrape-logs...');
    try {
      const response = await axios.get(`${BASE_URL}/scrape-logs?page=1&limit=20`);
      console.log('✅ GET /api/scrape-logs - Success');
      console.log(`   Status: ${response.status}`);
      console.log(`   Data count: ${response.data.data?.length || 0}`);
      console.log(`   Pagination: Page ${response.data.pagination?.currentPage || 'N/A'} of ${response.data.pagination?.totalPages || 'N/A'}`);
      console.log(`   Category stats: ${response.data.statistics?.categoryStats?.length || 0} categories`);
      console.log(`   Platform stats: ${response.data.statistics?.platformStats?.length || 0} platforms\n`);
    } catch (error) {
      console.log('❌ GET /api/scrape-logs - Failed');
      console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
    }

    // Test 2: POST /api/scrape-logs
    console.log('2️⃣ Testing POST /api/scrape-logs...');
    try {
      const response = await axios.post(`${BASE_URL}/scrape-logs`, testScrapingLog);
      console.log('✅ POST /api/scrape-logs - Success');
      console.log(`   Status: ${response.status}`);
      console.log(`   Created log ID: ${response.data.data?.scrapingLog?.id || 'N/A'}`);
      console.log(`   Platform: ${response.data.data?.scrapingLog?.platform || 'N/A'}`);
      console.log(`   Category: ${response.data.data?.scrapingLog?.category || 'N/A'}`);
      console.log(`   Total products: ${response.data.data?.scrapingLog?.totalProducts || 'N/A'}`);
      console.log(`   Scraped products: ${response.data.data?.scrapingLog?.scrapedProducts || 'N/A'}`);
      console.log(`   Failed products: ${response.data.data?.scrapingLog?.failedProducts || 'N/A'}\n`);
    } catch (error) {
      console.log('❌ POST /api/scrape-logs - Failed');
      console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
    }

    // Test 3: POST /api/flipkart/scrape-product
    console.log('3️⃣ Testing POST /api/flipkart/scrape-product...');
    try {
      const response = await axios.post(`${BASE_URL}/flipkart/scrape-product`, testFlipkartProduct);
      console.log('✅ POST /api/flipkart/scrape-product - Success');
      console.log(`   Status: ${response.status}`);
      console.log(`   Session ID: ${response.data.data?.scrapingSession?.id || 'N/A'}`);
      console.log(`   Platform: ${response.data.data?.scrapingSession?.platform || 'N/A'}`);
      console.log(`   Category: ${response.data.data?.scrapingSession?.category || 'N/A'}`);
      console.log(`   Status: ${response.data.data?.scrapingSession?.status || 'N/A'}`);
      console.log(`   Duration: ${response.data.data?.scrapingSession?.duration || 'N/A'}`);
      console.log(`   Product data: ${JSON.stringify(response.data.data?.productData || {})}\n`);
    } catch (error) {
      console.log('❌ POST /api/flipkart/scrape-product - Failed');
      console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
    }

    // Test 4: GET /api/scrape-logs with filters
    console.log('4️⃣ Testing GET /api/scrape-logs with filters...');
    try {
      const response = await axios.get(`${BASE_URL}/scrape-logs?platform=flipkart&category=Electronics&limit=5`);
      console.log('✅ GET /api/scrape-logs with filters - Success');
      console.log(`   Status: ${response.status}`);
      console.log(`   Filtered data count: ${response.data.data?.length || 0}`);
      console.log(`   Category stats: ${response.data.statistics?.categoryStats?.length || 0} categories`);
      console.log(`   Platform stats: ${response.data.statistics?.platformStats?.length || 0} platforms\n`);
    } catch (error) {
      console.log('❌ GET /api/scrape-logs with filters - Failed');
      console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
    }

    // Test 5: Test error handling - Invalid data
    console.log('5️⃣ Testing error handling with invalid data...');
    try {
      const response = await axios.post(`${BASE_URL}/scrape-logs`, {
        platform: 'invalid_platform',
        scrapedUrl: 'invalid_url',
        // Missing required fields
      });
      console.log('❌ Error handling test - Should have failed but succeeded');
    } catch (error) {
      console.log('✅ Error handling test - Correctly failed');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Error message: ${error.response?.data?.message || 'N/A'}\n`);
    }

    console.log('🎉 Enhanced Scraping APIs testing completed!');

  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
  }
}

// Run the tests
if (require.main === module) {
  testEnhancedScrapingAPIs();
}

module.exports = { testEnhancedScrapingAPIs };

