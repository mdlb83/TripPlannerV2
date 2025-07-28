const fs = require('fs');
const path = require('path');

// Import the database service
const { DatabaseService } = require('../src/services/database/index');

async function importCampgroundData() {
  const dataPath = path.join(__dirname, 'extracted_campgrounds_v2.json');
  
  try {
    // Check if extracted data exists
    if (!fs.existsSync(dataPath)) {
      throw new Error(`Extracted data file not found at ${dataPath}`);
    }
    
    console.log('Loading extracted campground data...');
    const campgroundsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log(`Found ${campgroundsData.length} campgrounds to import`);
    
    // Initialize database
    console.log('Initializing database...');
    const db = new DatabaseService();
    await db.initialize();
    
    // Clear existing campgrounds (except sample data if we want to keep some)
    console.log('Clearing existing campgrounds...');
    // Note: We'll let the database handle duplicates with INSERT OR REPLACE
    
    // Import campgrounds in batches for better performance
    const batchSize = 50;
    let imported = 0;
    let skipped = 0;
    
    console.log('Starting import...');
    
    for (let i = 0; i < campgroundsData.length; i += batchSize) {
      const batch = campgroundsData.slice(i, i + batchSize);
      
      for (const campground of batch) {
        try {
          // Validate required fields
          if (!campground.name || !campground.location || !campground.location.state) {
            console.warn(`Skipping invalid campground: ${JSON.stringify(campground, null, 2).substring(0, 100)}...`);
            skipped++;
            continue;
          }
          
          // Add a unique prefix to ID to distinguish from sample data
          campground.id = 'real_' + campground.id;
          
          await db.insertCampground(campground);
          imported++;
          
          if (imported % 50 === 0) {
            console.log(`Imported ${imported} campgrounds...`);
          }
          
        } catch (error) {
          console.error(`Error importing campground ${campground.name}:`, error.message);
          skipped++;
        }
      }
    }
    
    console.log('\n=== Import Complete ===');
    console.log(`Successfully imported: ${imported} campgrounds`);
    console.log(`Skipped: ${skipped} campgrounds`);
    
    // Verify the import
    console.log('\nVerifying import...');
    const allCampgrounds = await db.searchCampgrounds('', '', 10, 0);
    console.log(`Total campgrounds in database: ${allCampgrounds.length}`);
    
    if (allCampgrounds.length > 0) {
      console.log('\nSample imported campgrounds:');
      allCampgrounds.slice(0, 3).forEach((camp, i) => {
        console.log(`${i + 1}. ${camp.name} - ${camp.location.city}, ${camp.location.state}`);
      });
    }
    
    // Close database connection
    await db.close();
    
    console.log('\n🎉 Database import successful!');
    console.log('Your app now has real campground data from the eBook.');
    
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

// Run the import
if (require.main === module) {
  importCampgroundData();
}

module.exports = { importCampgroundData }; 