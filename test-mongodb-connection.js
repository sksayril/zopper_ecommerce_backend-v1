const mongoose = require('mongoose');
const config = require('./config');

console.log('🔍 Testing MongoDB Atlas Connection...');
console.log('Connection String:', config.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas connection successful!');
    console.log('✅ Database:', mongoose.connection.db.databaseName);
    console.log('✅ Host:', mongoose.connection.host);
    console.log('✅ Port:', mongoose.connection.port);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ MongoDB Atlas connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('IP')) {
      console.log('\n🔧 Solution:');
      console.log('1. Go to https://cloud.mongodb.com/');
      console.log('2. Login to your account');
      console.log('3. Select your project');
      console.log('4. Click "Network Access" in the left sidebar');
      console.log('5. Click "Add IP Address"');
      console.log('6. Add your current IP: 103.42.156.173');
      console.log('7. Click "Confirm"');
      console.log('8. Wait 1-2 minutes for changes to take effect');
    }
    
    process.exit(1);
  });
