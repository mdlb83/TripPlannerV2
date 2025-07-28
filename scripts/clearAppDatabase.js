const fs = require('fs');
const path = require('path');

// Script to clear the app's database files so it will reimport real data
function clearAppDatabase() {
  try {
    // Common Expo SQLite database locations
    const possibleDbPaths = [
      // iOS Simulator paths
      path.join(process.env.HOME, 'Library', 'Developer', 'CoreSimulator', 'Devices'),
      // Android Emulator paths  
      path.join(process.env.HOME, '.android', 'avd'),
    ];
    
    console.log('🧹 This script helps force your app to reimport the real campground data.');
    console.log('');
    console.log('To clear the app database and reimport real data:');
    console.log('');
    console.log('📱 EASIEST METHOD:');
    console.log('1. Delete the app from your phone/simulator');
    console.log('2. Reinstall it by scanning the QR code again');
    console.log('3. The app will detect no database and import all 389 real campgrounds');
    console.log('');
    console.log('🔄 ALTERNATIVE METHOD:');
    console.log('1. In your Expo Go app, shake the device');
    console.log('2. Select "Settings" -> "Clear Metro bundler cache"');
    console.log('3. Force close and reopen the app');
    console.log('');
    console.log('📊 Current status:');
    
    // Check if we have the extracted data
    const extractedDataPath = path.join(__dirname, 'extracted_campgrounds_v2.json');
    if (fs.existsSync(extractedDataPath)) {
      const data = JSON.parse(fs.readFileSync(extractedDataPath, 'utf8'));
      console.log(`✅ Real campground data ready: ${data.length} campgrounds`);
    } else {
      console.log('❌ Extracted campground data not found');
    }
    
    console.log('');
    console.log('After clearing the database, your app will show:');
    console.log('📝 "No campgrounds found, importing real campground data..."');
    console.log('✅ "Successfully imported 389 real campgrounds from eBook"');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the script
if (require.main === module) {
  clearAppDatabase();
}

module.exports = { clearAppDatabase }; 