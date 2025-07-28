// Campground data structure based on eBook requirements
export interface Campground {
  id: string;
  name: string;
  description?: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    zipCode?: string;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  amenities: {
    restrooms: boolean;
    showers: boolean;
    drinkingWater: boolean;
    electricHookups: boolean;
    wifiAvailable: boolean;
    petFriendly: boolean;
    bikeRepair: boolean;
    laundry: boolean;
  };
  trailAccess: {
    hasDirectAccess: boolean;
    trailTypes: TrailType[];
    difficulty: TrailDifficulty;
    distanceToTrailhead?: number; // in meters
  };
  pricing: {
    basePrice?: number;
    currency: 'USD';
    priceType: 'per_night' | 'per_person' | 'varies';
  };
  capacity: {
    maxOccupancy?: number;
    totalSites?: number;
    reservationRequired: boolean;
  };
  images?: string[];
  lastUpdated: string; // ISO date string
}

export interface Trip {
  id: string;
  name: string;
  description?: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  preferences: TripPreferences;
  stops: TripStop[];
  status: TripStatus;
  totalDistance?: number; // in kilometers
  estimatedDrivingTime?: number; // in minutes
}

export interface TripStop {
  id: string;
  tripId: string;
  campgroundId: string;
  campground: Campground;
  orderIndex: number;
  arrivalDate: string; // ISO date string
  departureDate: string; // ISO date string
  notes?: string;
  visited: boolean;
  isCurrent: boolean;
}

export interface TripPreferences {
  maxDrivingTime: number; // in minutes (30 min - 4 hours)
  preferredTrailTypes: TrailType[];
  amenityPreferences: {
    requireShowers: boolean;
    requireElectric: boolean;
    requireWifi: boolean;
    petFriendly: boolean;
  };
  budgetConstraints?: {
    maxNightlyRate: number;
    currency: 'USD';
  };
}

export type TrailType = 
  | 'mountain_biking'
  | 'road_cycling' 
  | 'mixed_use'
  | 'gravel'
  | 'single_track'
  | 'rail_trail';

export type TrailDifficulty = 
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert';

export type TripStatus = 
  | 'draft'
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type NavigationApp = 
  | 'apple_maps'
  | 'google_maps'
  | 'waze';

// User preferences and settings
export interface UserSettings {
  preferredNavigationApp: NavigationApp;
  enableLocationServices: boolean;
  offlineDataEnabled: boolean;
  notificationsEnabled: boolean;
  units: 'metric' | 'imperial';
  theme: 'light' | 'dark' | 'system';
}

// Search and filter types
export interface CampgroundFilters {
  location?: {
    latitude: number;
    longitude: number;
    radiusKm: number;
  };
  trailTypes?: TrailType[];
  amenities?: Partial<Campground['amenities']>;
  maxPrice?: number;
  requiresReservation?: boolean;
}

export interface SearchResult {
  campgrounds: Campground[];
  totalCount: number;
  hasMore: boolean;
}

// API and service types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: string;
}

export interface GeolocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
} 