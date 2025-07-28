// App configuration
export const APP_CONFIG = {
  name: 'TripPlannerV2',
  version: '1.0.0',
  description: 'Bike-to-Trail Camping App',
} as const;

// Color scheme
export const COLORS = {
  primary: '#4CAF50',
  primaryDark: '#2E7D32',
  secondary: '#81C784',
  accent: '#FFA726',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: {
    primary: '#212121',
    secondary: '#666666',
    disabled: '#9E9E9E',
  },
  border: '#E0E0E0',
  error: '#D32F2F',
  warning: '#F57C00',
  success: '#388E3C',
  info: '#1976D2',
} as const;

// Typography
export const TYPOGRAPHY = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// Trip planning constants
export const TRIP_CONSTANTS = {
  maxDrivingTime: {
    min: 30, // 30 minutes
    max: 240, // 4 hours
    default: 120, // 2 hours
  },
  maxStops: 10,
  defaultTripDuration: 3, // days
} as const;

// Map configuration
export const MAP_CONFIG = {
  defaultZoom: 10,
  maxZoom: 18,
  minZoom: 3,
  defaultRegion: {
    latitude: 39.8283, // Center of USA
    longitude: -98.5795,
    latitudeDelta: 20,
    longitudeDelta: 20,
  },
  campgroundMarkerColor: COLORS.primary,
  routeColor: COLORS.accent,
} as const;

// Navigation apps
export const NAVIGATION_APPS = {
  apple_maps: {
    name: 'Apple Maps',
    scheme: 'maps://',
    available: 'ios',
  },
  google_maps: {
    name: 'Google Maps',
    scheme: 'comgooglemaps://',
    webUrl: 'https://maps.google.com/',
    available: 'both',
  },
  waze: {
    name: 'Waze',
    scheme: 'waze://',
    available: 'both',
  },
} as const;

// Database constants
export const DATABASE_CONFIG = {
  name: 'tripplanner.db',
  version: 1,
  batchSize: 100, // For bulk operations
} as const;

// API endpoints (for future use)
export const API_ENDPOINTS = {
  weather: 'https://api.openweathermap.org/data/2.5/',
  geocoding: 'https://api.opencagedata.com/geocode/v1/',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  database: {
    initFailed: 'Failed to initialize database',
    queryFailed: 'Database query failed',
    insertFailed: 'Failed to save data',
  },
  location: {
    permissionDenied: 'Location permission denied',
    unavailable: 'Location services unavailable',
    timeout: 'Location request timed out',
  },
  network: {
    offline: 'No internet connection',
    timeout: 'Request timed out',
    serverError: 'Server error occurred',
  },
} as const; 