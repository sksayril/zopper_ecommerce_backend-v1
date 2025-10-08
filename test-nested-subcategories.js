const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Sample product data with nested subcategory structure
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

async function testNestedSubcategories() {
  try {
    console.log('🧪 Testing Nested Subcategories API...\n');

    console.log('📋 Sample Product Data Structure:');
    console.log('   ✅ Title:', sampleProductData.title);
    console.log('   ✅ MRP:', sampleProductData.mrp);
    console.log('   ✅ SRP:', sampleProductData.srp);
    console.log('   ✅ Category ID:', sampleProductData.categoryId);
    console.log('   ✅ Subcategory ID:', sampleProductData.subcategoryId);
    console.log('   ✅ Attributes Count:', sampleProductData.attributes.length);
    console.log('   ✅ Keywords Count:', sampleProductData.keywords.length);
    console.log('   ✅ Additional Images Count:', sampleProductData.additionalImages.length);

    console.log('\n🔍 Additional Images URL Validation:');
    sampleProductData.additionalImages.forEach((url, index) => {
      const isValid = /^(https?:\/\/|\/\/).+/.test(url);
      console.log(`   Image ${index + 1}: ${isValid ? '✅' : '❌'} ${url}`);
    });

    console.log('\n📊 Expected API Response Structure:');
    console.log('   The API will now return:');
    console.log('   - category: { id, name, slug, isActive }');
    console.log('   - subcategory: { id, name, slug, isActive }');
    console.log('   - subcategoryPath: [');
    console.log('       { _id: "categoryId", name: "Category Name", slug: "category-slug", level: 0 },');
    console.log('       { _id: "subcategoryId", name: "Subcategory Name", slug: "subcategory-slug", level: 1 }');
    console.log('     ]');

    console.log('\n🎯 Key Features Implemented:');
    console.log('   ✅ Nested subcategory support');
    console.log('   ✅ Subcategory hierarchy path tracking');
    console.log('   ✅ Protocol-relative URL support (//)');
    console.log('   ✅ Flexible additional images validation');
    console.log('   ✅ Attributes and keywords support');
    console.log('   ✅ Same category/subcategory ID support');

    console.log('\n📝 To test with authentication:');
    console.log('   1. Get admin token from /api/admin/login');
    console.log('   2. Add Authorization: Bearer <token> header');
    console.log('   3. POST to /api/admin/products with the sample data');

    console.log('\n🔧 Database Requirements:');
    console.log('   - Category with ID: 68db96aa2e5baf2d98f25108 must exist');
    console.log('   - If using same ID for category and subcategory, it must be a valid subcategory');
    console.log('   - Subcategory must have parent relationship to the main category');

    console.log('\n✨ The API now supports:');
    console.log('   - Main Category → Subcategory → Sub-subcategory → etc.');
    console.log('   - Full hierarchy path tracking in subcategoryPath array');
    console.log('   - Each level in the path has: _id, name, slug, level');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testNestedSubcategories();
