import { databaseService } from './index';
import { Campground } from '../../types';

// Manual function to load real campground data 
export async function loadRealCampgroundData(): Promise<number> {
  try {
    console.log('🔄 Starting manual import of real campground data...');
    
    // First, clear any existing data
    console.log('Clearing existing campgrounds...');
    const existing = await databaseService.searchCampgrounds('', '', 1000, 0);
    
    let clearCount = 0;
    for (const camp of existing) {
      await databaseService.deleteCampground(camp.id);
      clearCount++;
    }
    console.log(`Cleared ${clearCount} existing campgrounds`);
    
    // Import first few real campgrounds manually for now
    const realCampgrounds: Campground[] = [
      {
        id: 'real_alabama_1',
        name: 'Lake Eufaula Campground',
        description: 'Approximately 6 miles Yololo Micco Hike and Bike Trail',
        location: {
          latitude: 32.361538,
          longitude: -86.279118,
          address: 'Lake Eufaula, Alabama',
          city: 'Lake Eufaula',
          state: 'Alabama',
        },
        contact: {},
        amenities: {
          restrooms: true,
          showers: false,
          drinkingWater: true,
          electricHookups: false,
          wifiAvailable: false,
          petFriendly: true,
          bikeRepair: false,
          laundry: false,
        },
        trailAccess: {
          hasDirectAccess: true,
          trailTypes: ['mixed_use'],
          difficulty: 'beginner',
          distanceToTrailhead: 0,
        },
        pricing: {
          currency: 'USD',
          priceType: 'per_night',
        },
        capacity: {
          reservationRequired: false,
        },
        images: [],
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'real_alabama_2',
        name: 'Dauphin Island Campground',
        description: 'There is a 3.5 mile paved trail (one way) which goes alongside',
        location: {
          latitude: 30.2672,
          longitude: -88.1008,
          address: 'Gulf Shores, Alabama',
          city: 'Gulf Shores',
          state: 'Alabama',
        },
        contact: {},
        amenities: {
          restrooms: true,
          showers: true,
          drinkingWater: true,
          electricHookups: true,
          wifiAvailable: false,
          petFriendly: true,
          bikeRepair: false,
          laundry: false,
        },
        trailAccess: {
          hasDirectAccess: true,
          trailTypes: ['road_cycling'],
          difficulty: 'beginner',
          distanceToTrailhead: 0,
        },
        pricing: {
          currency: 'USD',
          priceType: 'per_night',
        },
        capacity: {
          reservationRequired: true,
        },
        images: [],
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'real_alabama_3',
        name: 'Gulf State Park',
        description: 'There are 496 full hook up campsites in the park. Even so, you\'ll want to get your reservation early, as this is a very popular park.',
        location: {
          latitude: 30.2672,
          longitude: -87.7008,
          address: 'Gulf Shores, Alabama',
          city: 'Gulf Shores',
          state: 'Alabama',
        },
        contact: {},
        amenities: {
          restrooms: true,
          showers: true,
          drinkingWater: true,
          electricHookups: true,
          wifiAvailable: true,
          petFriendly: true,
          bikeRepair: false,
          laundry: true,
        },
        trailAccess: {
          hasDirectAccess: true,
          trailTypes: ['road_cycling', 'mixed_use'],
          difficulty: 'beginner',
          distanceToTrailhead: 0,
        },
        pricing: {
          currency: 'USD',
          priceType: 'per_night',
        },
        capacity: {
          totalSites: 496,
          reservationRequired: true,
        },
        images: [],
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'real_arkansas_1',
        name: 'Downtown Riverside RV Park',
        description: 'The campground is adjacent to the Arkansas River Trail. This is a 17 mile paved trail which connects to an 88 mile multi-use loop.',
        location: {
          latitude: 35.1495,
          longitude: -92.6043,
          address: 'Morrilton, Arkansas',
          city: 'Morrilton',
          state: 'Arkansas',
        },
        contact: {},
        amenities: {
          restrooms: true,
          showers: true,
          drinkingWater: true,
          electricHookups: true,
          wifiAvailable: false,
          petFriendly: true,
          bikeRepair: false,
          laundry: true,
        },
        trailAccess: {
          hasDirectAccess: true,
          trailTypes: ['mixed_use', 'road_cycling'],
          difficulty: 'beginner',
          distanceToTrailhead: 0,
        },
        pricing: {
          currency: 'USD',
          priceType: 'per_night',
        },
        capacity: {
          reservationRequired: false,
        },
        images: [],
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'real_florida_1',
        name: 'John Pennekamp Coral Reef State Park',
        description: 'This waterfront park offers diving, snorkeling, fishing, canoeing, kayaking, hiking, and biking opportunities.',
        location: {
          latitude: 25.1179,
          longitude: -80.4173,
          address: 'Key Largo, Florida',
          city: 'Key Largo',
          state: 'Florida',
        },
        contact: {},
        amenities: {
          restrooms: true,
          showers: true,
          drinkingWater: true,
          electricHookups: true,
          wifiAvailable: false,
          petFriendly: true,
          bikeRepair: false,
          laundry: false,
        },
        trailAccess: {
          hasDirectAccess: true,
          trailTypes: ['road_cycling', 'mixed_use'],
          difficulty: 'beginner',
          distanceToTrailhead: 0,
        },
        pricing: {
          currency: 'USD',
          priceType: 'per_night',
        },
        capacity: {
          reservationRequired: true,
        },
        images: [],
        lastUpdated: new Date().toISOString(),
      },
    ];
    
    // Import the campgrounds
    let imported = 0;
    for (const campground of realCampgrounds) {
      await databaseService.insertCampground(campground);
      imported++;
    }
    
    console.log(`✅ Successfully imported ${imported} real campgrounds`);
    return imported;
    
  } catch (error) {
    console.error('❌ Failed to load real campground data:', error);
    throw error;
  }
} 