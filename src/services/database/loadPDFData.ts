import { databaseService } from './index';
import { Campground, TrailType, TrailDifficulty } from '../../types';
// Import the extracted campground data statically
import extractedData from '../../../scripts/extracted_campgrounds_v2.json';

// Function to load all campgrounds from the extracted PDF data
export async function loadAllPDFCampgrounds(): Promise<number> {
  try {
    console.log('🔄 Loading all campgrounds from PDF extraction...');
    
    if (!extractedData || extractedData.length === 0) {
      throw new Error('No extracted campground data found');
    }
    
    console.log(`Found ${extractedData.length} campgrounds in extracted PDF data`);
    
    // First, clear any existing data
    console.log('Clearing existing campgrounds...');
    const existing = await databaseService.searchCampgrounds('', '', 1000, 0);
    
    let clearCount = 0;
    for (const camp of existing) {
      await databaseService.deleteCampground(camp.id);
      clearCount++;
    }
    console.log(`Cleared ${clearCount} existing campgrounds`);
    
    // Convert and import campgrounds in batches for better performance
    const batchSize = 25; // Smaller batches for better performance
    let imported = 0;
    let skipped = 0;
    
    for (let i = 0; i < extractedData.length; i += batchSize) {
      const batch = extractedData.slice(i, i + batchSize);
      
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(extractedData.length / batchSize)} (${batch.length} campgrounds)...`);
      
      for (const rawCampground of batch) {
        try {
          // Validate and convert the raw data to our Campground type
          if (!rawCampground.name || !rawCampground.location) {
            console.warn(`Skipping invalid campground: ${rawCampground.name || 'Unknown'}`);
            skipped++;
            continue;
          }
          
          // Helper function to convert null to undefined
          const nullToUndefined = (value: any) => value === null ? undefined : value;
          
          // Helper function to validate trail types
          const validateTrailTypes = (types: any[]): TrailType[] => {
            const validTypes: TrailType[] = ['mountain_biking', 'road_cycling', 'gravel', 'mixed_use', 'single_track', 'rail_trail'];
            return types?.filter(type => validTypes.includes(type as TrailType)) || [];
          };
          
          // Helper function to validate difficulty
          const validateDifficulty = (difficulty: string): TrailDifficulty => {
            const validDifficulties: TrailDifficulty[] = ['beginner', 'intermediate', 'advanced', 'expert'];
            return validDifficulties.includes(difficulty as TrailDifficulty) ? difficulty as TrailDifficulty : 'beginner';
          };
          
          // Helper function to validate price type
          const validatePriceType = (priceType: string): 'per_night' | 'per_person' | 'varies' => {
            const validPriceTypes = ['per_night', 'per_person', 'varies'] as const;
            return validPriceTypes.includes(priceType as any) ? priceType as 'per_night' | 'per_person' | 'varies' : 'per_night';
          };
          
          // Convert to proper Campground format
          const campground: Campground = {
            id: 'pdf_' + rawCampground.id, // Prefix with 'pdf_' to distinguish from sample data
            name: rawCampground.name,
            description: rawCampground.description || '',
            location: {
              latitude: rawCampground.location.latitude,
              longitude: rawCampground.location.longitude,
              address: rawCampground.location.address || `${rawCampground.location.city}, ${rawCampground.location.state}`,
              city: rawCampground.location.city || 'Unknown',
              state: rawCampground.location.state || 'Unknown',
              zipCode: nullToUndefined(rawCampground.location.zipCode),
            },
            contact: {
              phone: nullToUndefined(rawCampground.contact?.phone),
              email: nullToUndefined(rawCampground.contact?.email),
              website: nullToUndefined(rawCampground.contact?.website),
            },
            amenities: {
              restrooms: rawCampground.amenities?.restrooms || false,
              showers: rawCampground.amenities?.showers || false,
              drinkingWater: rawCampground.amenities?.drinkingWater || false,
              electricHookups: rawCampground.amenities?.electricHookups || false,
              wifiAvailable: rawCampground.amenities?.wifiAvailable || false,
              petFriendly: rawCampground.amenities?.petFriendly || false,
              bikeRepair: rawCampground.amenities?.bikeRepair || false,
              laundry: rawCampground.amenities?.laundry || false,
            },
            trailAccess: {
              hasDirectAccess: rawCampground.trailAccess?.hasDirectAccess || false,
              trailTypes: validateTrailTypes(rawCampground.trailAccess?.trailTypes),
              difficulty: validateDifficulty(rawCampground.trailAccess?.difficulty || 'beginner'),
              distanceToTrailhead: nullToUndefined(rawCampground.trailAccess?.distanceToTrailhead),
            },
            pricing: {
              basePrice: nullToUndefined(rawCampground.pricing?.basePrice),
              currency: 'USD',
              priceType: validatePriceType(rawCampground.pricing?.priceType || 'per_night'),
            },
            capacity: {
              maxOccupancy: nullToUndefined(rawCampground.capacity?.maxOccupancy),
              totalSites: nullToUndefined(rawCampground.capacity?.totalSites),
              reservationRequired: rawCampground.capacity?.reservationRequired || false,
            },
            images: rawCampground.images || [],
            lastUpdated: rawCampground.lastUpdated || new Date().toISOString(),
          };
          
          await databaseService.insertCampground(campground);
          imported++;
          
        } catch (error) {
          console.error(`Error importing campground ${rawCampground.name}:`, error);
          skipped++;
        }
      }
      
      // Add a small delay between batches to prevent overwhelming the database
      if (i + batchSize < extractedData.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`✅ Successfully imported ${imported} campgrounds from PDF data`);
    if (skipped > 0) {
      console.log(`⚠️ Skipped ${skipped} invalid campgrounds`);
    }
    
    return imported;
    
  } catch (error) {
    console.error('❌ Failed to load PDF campground data:', error);
    throw error;
  }
} 