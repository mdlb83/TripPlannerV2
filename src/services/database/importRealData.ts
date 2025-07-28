import { databaseService } from './index';
import { Campground } from '../../types';

// Import real campground data from our extracted JSON file
const REAL_CAMPGROUNDS_DATA = require('../../../scripts/extracted_campgrounds_v2.json') as Campground[];

export async function importRealCampgroundData(): Promise<number> {
  try {
    console.log(`Starting import of ${REAL_CAMPGROUNDS_DATA.length} real campgrounds...`);
    
    let imported = 0;
    let skipped = 0;
    
    for (const campground of REAL_CAMPGROUNDS_DATA) {
      try {
        // Validate required fields
        if (!campground.name || !campground.location || !campground.location.state) {
          console.warn(`Skipping invalid campground: ${campground.name || 'Unknown'}`);
          skipped++;
          continue;
        }
        
        // Add a unique prefix to ID to distinguish from sample data
        const realCampground = {
          ...campground,
          id: 'real_' + campground.id
        };
        
        await databaseService.insertCampground(realCampground);
        imported++;
        
        if (imported % 50 === 0) {
          console.log(`Imported ${imported} real campgrounds...`);
        }
        
      } catch (error) {
        console.error(`Error importing campground ${campground.name}:`, error);
        skipped++;
      }
    }
    
    console.log(`✅ Real data import complete: ${imported} imported, ${skipped} skipped`);
    return imported;
    
  } catch (error) {
    console.error('Failed to import real campground data:', error);
    throw error;
  }
} 