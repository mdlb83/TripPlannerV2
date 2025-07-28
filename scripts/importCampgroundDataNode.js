const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

async function importCampgroundData() {
  const dataPath = path.join(__dirname, 'extracted_campgrounds_v2.json');
  const dbPath = path.join(__dirname, '..', 'tripplanner.db');
  
  try {
    // Check if extracted data exists
    if (!fs.existsSync(dataPath)) {
      throw new Error(`Extracted data file not found at ${dataPath}`);
    }
    
    console.log('Loading extracted campground data...');
    const campgroundsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log(`Found ${campgroundsData.length} campgrounds to import`);
    
    // Open database connection
    console.log('Opening database connection...');
    const db = new sqlite3.Database(dbPath);
    
    // Wrap in promise for async/await
    const runQuery = (query, params = []) => {
      return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
          if (err) reject(err);
          else resolve(this);
        });
      });
    };
    
    const getQuery = (query, params = []) => {
      return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    };
    
    // Create table if it doesn't exist (using same schema as our app)
    console.log('Ensuring database schema...');
    await runQuery(`
      CREATE TABLE IF NOT EXISTS campgrounds (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        zip_code TEXT,
        phone TEXT,
        email TEXT,
        website TEXT,
        amenities TEXT NOT NULL,
        trail_access TEXT NOT NULL,
        pricing TEXT NOT NULL,
        capacity TEXT NOT NULL,
        images TEXT,
        last_updated TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Import campgrounds
    let imported = 0;
    let skipped = 0;
    
    console.log('Starting import...');
    
    for (const campground of campgroundsData) {
      try {
        // Validate required fields
        if (!campground.name || !campground.location || !campground.location.state) {
          console.warn(`Skipping invalid campground: ${campground.name || 'Unknown'}`);
          skipped++;
          continue;
        }
        
        // Add a unique prefix to ID to distinguish from sample data
        const realId = 'real_' + campground.id;
        
        await runQuery(
          `INSERT OR REPLACE INTO campgrounds (
            id, name, description, latitude, longitude, address, city, state, zip_code,
            phone, email, website, amenities, trail_access, pricing, capacity, images, last_updated
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            realId,
            campground.name,
            campground.description || null,
            campground.location.latitude,
            campground.location.longitude,
            campground.location.address,
            campground.location.city,
            campground.location.state,
            campground.location.zipCode || null,
            campground.contact.phone || null,
            campground.contact.email || null,
            campground.contact.website || null,
            JSON.stringify(campground.amenities),
            JSON.stringify(campground.trailAccess),
            JSON.stringify(campground.pricing),
            JSON.stringify(campground.capacity),
            campground.images ? JSON.stringify(campground.images) : null,
            campground.lastUpdated,
          ]
        );
        
        imported++;
        
        if (imported % 50 === 0) {
          console.log(`Imported ${imported} campgrounds...`);
        }
        
      } catch (error) {
        console.error(`Error importing campground ${campground.name}:`, error.message);
        skipped++;
      }
    }
    
    console.log('\n=== Import Complete ===');
    console.log(`Successfully imported: ${imported} campgrounds`);
    console.log(`Skipped: ${skipped} campgrounds`);
    
    // Verify the import
    console.log('\nVerifying import...');
    const allCampgrounds = await getQuery('SELECT COUNT(*) as count FROM campgrounds');
    console.log(`Total campgrounds in database: ${allCampgrounds[0].count}`);
    
    // Show sample of imported campgrounds
    const sampleCampgrounds = await getQuery('SELECT name, city, state FROM campgrounds WHERE id LIKE "real_%" LIMIT 5');
    if (sampleCampgrounds.length > 0) {
      console.log('\nSample imported campgrounds:');
      sampleCampgrounds.forEach((camp, i) => {
        console.log(`${i + 1}. ${camp.name} - ${camp.city}, ${camp.state}`);
      });
    }
    
    // Close database connection
    db.close();
    
    console.log('\n🎉 Database import successful!');
    console.log('Your app now has real campground data from the eBook.');
    console.log('Restart your Expo app to see the new data.');
    
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