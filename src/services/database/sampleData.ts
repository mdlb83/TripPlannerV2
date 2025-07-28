import { Campground } from '../../types';
import { generateId } from '../../utils/helpers';

export const sampleCampgrounds: Campground[] = [
  {
    id: generateId(),
    name: 'Pine Ridge Campground',
    description: 'Scenic campground with direct access to mountain bike trails through pine forests.',
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      address: '123 Pine Ridge Road',
      city: 'Pine Valley',
      state: 'Colorado',
      zipCode: '80424',
    },
    contact: {
      phone: '(555) 123-4567',
      email: 'info@pineridgecampground.com',
      website: 'https://pineridgecampground.com',
    },
    amenities: {
      restrooms: true,
      showers: true,
      drinkingWater: true,
      electricHookups: true,
      wifiAvailable: false,
      petFriendly: true,
      bikeRepair: true,
      laundry: false,
    },
    trailAccess: {
      hasDirectAccess: true,
      trailTypes: ['mountain_biking', 'single_track'],
      difficulty: 'intermediate',
      distanceToTrailhead: 0,
    },
    pricing: {
      basePrice: 35,
      currency: 'USD',
      priceType: 'per_night',
    },
    capacity: {
      maxOccupancy: 6,
      totalSites: 25,
      reservationRequired: true,
    },
    images: [],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Riverside Bike Camp',
    description: 'Peaceful riverside camping with access to paved cycling trails along the river.',
    location: {
      latitude: 39.7392,
      longitude: -104.9903,
      address: '456 River Trail Drive',
      city: 'Riverside',
      state: 'Colorado',
      zipCode: '80212',
    },
    contact: {
      phone: '(555) 987-6543',
      email: 'contact@riversidebikecamp.com',
      website: 'https://riversidebikecamp.com',
    },
    amenities: {
      restrooms: true,
      showers: true,
      drinkingWater: true,
      electricHookups: false,
      wifiAvailable: true,
      petFriendly: true,
      bikeRepair: false,
      laundry: true,
    },
    trailAccess: {
      hasDirectAccess: true,
      trailTypes: ['road_cycling', 'rail_trail'],
      difficulty: 'beginner',
      distanceToTrailhead: 50,
    },
    pricing: {
      basePrice: 25,
      currency: 'USD',
      priceType: 'per_night',
    },
    capacity: {
      maxOccupancy: 4,
      totalSites: 15,
      reservationRequired: false,
    },
    images: [],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Mountain Vista Trail Camp',
    description: 'High-altitude camping with challenging mountain bike trail access and stunning views.',
    location: {
      latitude: 39.5501,
      longitude: -105.7821,
      address: '789 Summit Trail Road',
      city: 'Breckenridge',
      state: 'Colorado',
      zipCode: '80424',
    },
    contact: {
      phone: '(555) 456-7890',
      email: 'reservations@mountainvistacamp.com',
      website: 'https://mountainvistacamp.com',
    },
    amenities: {
      restrooms: true,
      showers: false,
      drinkingWater: true,
      electricHookups: false,
      wifiAvailable: false,
      petFriendly: false,
      bikeRepair: true,
      laundry: false,
    },
    trailAccess: {
      hasDirectAccess: true,
      trailTypes: ['mountain_biking', 'single_track'],
      difficulty: 'advanced',
      distanceToTrailhead: 0,
    },
    pricing: {
      basePrice: 40,
      currency: 'USD',
      priceType: 'per_night',
    },
    capacity: {
      maxOccupancy: 2,
      totalSites: 10,
      reservationRequired: true,
    },
    images: [],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Desert Trails Campground',
    description: 'Desert camping experience with access to gravel and mixed-use cycling trails.',
    location: {
      latitude: 34.0522,
      longitude: -118.2437,
      address: '321 Desert Trail Lane',
      city: 'Moab',
      state: 'Utah',
      zipCode: '84532',
    },
    contact: {
      phone: '(555) 321-9876',
      email: 'info@deserttrailscamp.com',
    },
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
      trailTypes: ['gravel', 'mixed_use'],
      difficulty: 'intermediate',
      distanceToTrailhead: 100,
    },
    pricing: {
      basePrice: 30,
      currency: 'USD',
      priceType: 'per_night',
    },
    capacity: {
      maxOccupancy: 8,
      totalSites: 30,
      reservationRequired: true,
    },
    images: [],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Forest Loop Bike Camp',
    description: 'Family-friendly forest camping with easy access to beginner mountain bike loops.',
    location: {
      latitude: 44.9778,
      longitude: -93.2650,
      address: '654 Forest Loop Road',
      city: 'Duluth',
      state: 'Minnesota',
      zipCode: '55802',
    },
    contact: {
      phone: '(555) 654-3210',
      email: 'bookings@forestloopcamp.com',
      website: 'https://forestloopcamp.com',
    },
    amenities: {
      restrooms: true,
      showers: true,
      drinkingWater: true,
      electricHookups: true,
      wifiAvailable: true,
      petFriendly: true,
      bikeRepair: true,
      laundry: true,
    },
    trailAccess: {
      hasDirectAccess: true,
      trailTypes: ['mountain_biking', 'mixed_use'],
      difficulty: 'beginner',
      distanceToTrailhead: 0,
    },
    pricing: {
      basePrice: 28,
      currency: 'USD',
      priceType: 'per_night',
    },
    capacity: {
      maxOccupancy: 6,
      totalSites: 20,
      reservationRequired: false,
    },
    images: [],
    lastUpdated: new Date().toISOString(),
  },
];

// Function to populate sample data in the database
export async function populateSampleData(): Promise<void> {
  const { databaseService } = await import('./index');
  
  console.log('Populating sample campground data...');
  
  for (const campground of sampleCampgrounds) {
    try {
      await databaseService.insertCampground(campground);
    } catch (error) {
      console.error(`Failed to insert campground ${campground.name}:`, error);
    }
  }
  
  console.log(`Successfully populated ${sampleCampgrounds.length} sample campgrounds`);
} 