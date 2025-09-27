const mongoose = require('mongoose');
const config = require('./config');

console.log('🔍 Detailed MongoDB Atlas Connection Test...');
console.log('=====================================');
console.log('Your IP Address: 103.42.156.173');
console.log('Connection String:', config.MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));
console.log('=====================================');

// Set connection timeout

console.log('⏳ Attempting to connect to MongoDB Atlas...');

mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000
})
  .then(() => {
    console.log('✅ SUCCESS! MongoDB Atlas connection established!');
    console.log('✅ Database:', mongoose.connection.db.databaseName);
    console.log('✅ Host:', mongoose.connection.host);
    console.log('✅ Port:', mongoose.connection.port);
    console.log('✅ Ready to use your APIs!');
    process.exit(0);
  })
  .catch((error) => {
    console.log('❌ FAILED! MongoDB Atlas connection failed:');
    console.log('=====================================');
    console.log('Error Type:', error.name);
    console.log('Error Message:', error.message);
    console.log('=====================================');
    
    if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.log('🔧 SOLUTION: Add your IP to MongoDB Atlas Network Access');
      console.log('1. Go to: https://cloud.mongodb.com/');
      console.log('2. Login to your account');
      console.log('3. Select your project');
      console.log('4. Click "Network Access" in left sidebar');
      console.log('5. Click "Add IP Address"');
      console.log('6. Add IP: 103.42.156.173');
      console.log('7. Click "Confirm"');
      console.log('8. Wait 1-2 minutes');
      console.log('=====================================');
    } else if (error.message.includes('authentication')) {
      console.log('🔧 SOLUTION: Check your MongoDB credentials');
      console.log('1. Verify username and password in config.js');
      console.log('2. Check if user has proper permissions');
      console.log('=====================================');
    } else {
      console.log('🔧 SOLUTION: Check your MongoDB Atlas cluster status');
      console.log('1. Verify cluster is running');
      console.log('2. Check connection string format');
      console.log('=====================================');
    }
    
    process.exit(1);
  });
