import { Linking, Platform } from 'react-native';
import { NavigationApp, GeolocationCoords } from '../types';
import { NAVIGATION_APPS } from '../constants';

// UUID generator for creating unique IDs
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Date formatting utilities
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start.getFullYear() === end.getFullYear()) {
    if (start.getMonth() === end.getMonth()) {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.getDate()}, ${end.getFullYear()}`;
    }
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${end.getFullYear()}`;
  }
  
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

// Distance calculations using Haversine formula
export function calculateDistance(
  coord1: GeolocationCoords,
  coord2: GeolocationCoords
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) * Math.cos(toRadians(coord2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Time formatting
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}m`;
}

// Navigation helpers
export async function openNavigation(
  app: NavigationApp,
  destination: { latitude: number; longitude: number; name?: string }
): Promise<boolean> {
  const navApp = NAVIGATION_APPS[app];
  
  if (!navApp) {
    throw new Error(`Navigation app ${app} not configured`);
  }

  try {
    let url: string;
    
    switch (app) {
      case 'apple_maps':
        if (Platform.OS !== 'ios') {
          throw new Error('Apple Maps only available on iOS');
        }
        url = `${navApp.scheme}?daddr=${destination.latitude},${destination.longitude}`;
        if (destination.name) {
          url += `&q=${encodeURIComponent(destination.name)}`;
        }
        break;
        
      case 'google_maps':
        const canOpenGoogleMaps = await Linking.canOpenURL(navApp.scheme);
        if (canOpenGoogleMaps) {
          url = `${navApp.scheme}?daddr=${destination.latitude},${destination.longitude}`;
        } else {
          // Fallback to web version
          const googleMapsApp = NAVIGATION_APPS.google_maps;
          url = `${googleMapsApp.webUrl}?daddr=${destination.latitude},${destination.longitude}`;
        }
        break;
        
      case 'waze':
        url = `${navApp.scheme}?ll=${destination.latitude},${destination.longitude}&navigate=yes`;
        break;
        
      default:
        throw new Error(`Unsupported navigation app: ${app}`);
    }

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    } else {
      throw new Error(`Cannot open ${navApp.name}`);
    }
  } catch (error) {
    console.error(`Navigation error for ${app}:`, error);
    return false;
  }
}

// Validation helpers
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  // Basic phone validation (US format)
  const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  return phoneRegex.test(phone);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Array helpers
export function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

export function sortBy<T>(array: T[], keyFn: (item: T) => any): T[] {
  return [...array].sort((a, b) => {
    const aKey = keyFn(a);
    const bKey = keyFn(b);
    
    if (aKey < bKey) return -1;
    if (aKey > bKey) return 1;
    return 0;
  });
}

// Debounce function for search
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

// Storage size formatter
export function formatStorageSize(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  
  return `${size.toFixed(1)} ${sizes[i]}`;
} 