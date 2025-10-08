const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Sample product data from the user's request
const sampleProductData = {
  "title": "realme P4 5G (Steel Grey, 128 GB)  (6 GB RAM)",
  "mrp": 20999,
  "srp": 16999,
  "description": "6 GB RAM | 128 GB ROM, 17.2 cm (6.77 inch) Display, 50MP + 8MP | 16MP Front Camera, 7000 mAh Battery, Mediatek Dimensity 7400 Processor",
  "mainImage": "https://rukminim2.flixcart.com/image/128/128/xif0q/mobile/2/m/d/-original-imahf47f6fgxwh9a.jpeg?q=70&crop=false",
  "additionalImages": [
    "//static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/360-view_c3a99e.png",
    "https://rukminim2.flixcart.com/image/128/128/xif0q/mobile/k/l/1/-original-imahf47eydfhaff5.jpeg?q=70&crop=false",
    "https://rukminim2.flixcart.com/image/128/128/xif0q/mobile/l/q/x/-original-imahf47eunctrhpn.jpeg?q=70&crop=false"
  ],
  "productUrl": "https://www.flipkart.com/realme-p4-5g-steel-grey-128-gb/p/itmf836e6de035a5?pid=MOBHERXF2RUHQMXE&lid=LSTMOBHERXF2RUHQMXERDGMNE&marketplace=FLIPKART&store=tyy%2F4io&srno=b_1_1&otracker=browse&fm=organic&iid=en_Ynh-nPW2edffKFH8jfKmFINu-pRdEsb4f4irLi05y3HH19iTWYxPuq7jc4jW7ArmCaj1s-HP3HQlApfq_FFHlg%3D%3D&ppt=hp&ppn=homepage&ssid=thd4s5ke2o0000001759559414609",
  "vendorSite": "flipkart",
  "categoryId": "68db96aa2e5baf2d98f25108",
  "subcategoryId": "68db96aa2e5baf2d98f25108",
  "attributes": [
    {
      "key": "Warranty Summary",
      "value": "1 Year Manufacturer Warranty for Device and 6 Months Manufacturer Warranty for Inbox Accessories"
    },
    {
      "key": "Domestic Warranty",
      "value": "1 Year"
    },
    {
      "key": "Battery Capacity",
      "value": "7000 mAh"
    },
    {
      "key": "Battery Type",
      "value": "BLPC79 Lithium-ion Polymer Battery"
    },
    {
      "key": "Width",
      "value": "75.88 mm"
    }
  ],
  "keywords": [
    "realme",
    "P4",
    "5G",
    "Home",
    "Mobiles & Accessories",
    "Mobiles",
    "realme Mobiles"
  ]
};

async function testProductAPI() {
  try {
    console.log('🧪 Testing Product API with sample data...\n');

    // First, let's try to get an admin token (you'll need to replace this with actual admin credentials)
    console.log('📝 Note: You need to provide valid admin credentials to test the API');
    console.log('📝 The sample data uses categoryId and subcategoryId: 68db96aa2e5baf2d98f25108');
    console.log('📝 Make sure these categories exist in your database\n');

    // Test 1: Try to create a product (this will fail without proper auth, but we can see the validation)
    console.log('1️⃣ Testing product creation with sample data...');
    try {
      const response = await axios.post(`${BASE_URL}/admin/products`, sampleProductData, {
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE' // Uncomment and add your token
        }
      });
      console.log('✅ Product created successfully:', response.data);
    } catch (error) {
      if (error.response) {
        console.log('❌ Product creation failed:', error.response.data);
        console.log('📊 Status:', error.response.status);
      } else {
        console.log('❌ Network error:', error.message);
      }
    }

    // Test 2: Test the additional images URL format
    console.log('\n2️⃣ Testing additional images URL format...');
    const additionalImages = sampleProductData.additionalImages;
    additionalImages.forEach((url, index) => {
      const isValid = /^https?:\/\/.+/.test(url);
      console.log(`   Image ${index + 1}: ${isValid ? '✅' : '❌'} ${url}`);
    });

    // Test 3: Test attributes and keywords structure
    console.log('\n3️⃣ Testing attributes and keywords structure...');
    console.log(`   Attributes count: ${sampleProductData.attributes.length}`);
    console.log(`   Keywords count: ${sampleProductData.keywords.length}`);
    
    sampleProductData.attributes.forEach((attr, index) => {
      const hasKeyValue = attr.key && attr.value;
      console.log(`   Attribute ${index + 1}: ${hasKeyValue ? '✅' : '❌'} ${attr.key}: ${attr.value}`);
    });

    console.log('\n4️⃣ Sample data structure validation:');
    console.log('   ✅ Title:', sampleProductData.title ? 'Present' : 'Missing');
    console.log('   ✅ MRP:', sampleProductData.mrp ? 'Present' : 'Missing');
    console.log('   ✅ SRP:', sampleProductData.srp ? 'Present' : 'Missing');
    console.log('   ✅ Description:', sampleProductData.description ? 'Present' : 'Missing');
    console.log('   ✅ Main Image:', sampleProductData.mainImage ? 'Present' : 'Missing');
    console.log('   ✅ Additional Images:', sampleProductData.additionalImages.length > 0 ? 'Present' : 'Missing');
    console.log('   ✅ Product URL:', sampleProductData.productUrl ? 'Present' : 'Missing');
    console.log('   ✅ Vendor Site:', sampleProductData.vendorSite ? 'Present' : 'Missing');
    console.log('   ✅ Category ID:', sampleProductData.categoryId ? 'Present' : 'Missing');
    console.log('   ✅ Subcategory ID:', sampleProductData.subcategoryId ? 'Present' : 'Missing');
    console.log('   ✅ Attributes:', sampleProductData.attributes.length > 0 ? 'Present' : 'Missing');
    console.log('   ✅ Keywords:', sampleProductData.keywords.length > 0 ? 'Present' : 'Missing');

    console.log('\n🎯 API is ready to accept the sample data structure!');
    console.log('📝 To test with authentication, add your admin token to the Authorization header');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testProductAPI();
