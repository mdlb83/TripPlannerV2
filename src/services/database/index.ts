import * as SQLite from 'expo-sqlite';
import { Campground, Trip, TripStop, UserSettings } from '../../types';

export class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('tripplanner.db');
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Campgrounds table
    await this.db.execAsync(`
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

    // Trips table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS trips (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        total_distance REAL,
        estimated_duration TEXT,
        difficulty TEXT CHECK(difficulty IN ('easy', 'moderate', 'hard')),
        status TEXT CHECK(status IN ('planning', 'booked', 'completed', 'cancelled')) DEFAULT 'planning',
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Trip stops (connecting campgrounds to trips)
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS trip_stops (
        id TEXT PRIMARY KEY,
        trip_id TEXT NOT NULL,
        campground_id TEXT NOT NULL,
        stop_order INTEGER NOT NULL,
        arrival_date TEXT,
        departure_date TEXT,
        driving_time_to_next INTEGER,
        notes TEXT,
        FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE,
        FOREIGN KEY (campground_id) REFERENCES campgrounds (id)
      )
    `);

    // User settings table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        preferred_navigation_app TEXT DEFAULT 'apple_maps',
        units TEXT CHECK(units IN ('metric', 'imperial')) DEFAULT 'imperial',
        notifications_enabled INTEGER DEFAULT 1,
        offline_data_enabled INTEGER DEFAULT 1,
        theme TEXT CHECK(theme IN ('light', 'dark', 'system')) DEFAULT 'system',
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  // Campground operations
  async insertCampground(campground: Campground): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      `INSERT OR REPLACE INTO campgrounds (
        id, name, description, latitude, longitude, address, city, state, zip_code,
        phone, email, website, amenities, trail_access, pricing, capacity, images, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        campground.id,
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
  }

  async deleteCampground(campgroundId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      'DELETE FROM campgrounds WHERE id = ?',
      [campgroundId]
    );
  }

  async getCampgroundById(id: string): Promise<Campground | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync(
      'SELECT * FROM campgrounds WHERE id = ?',
      [id]
    ) as any;

    if (!result) return null;

    return this.mapRowToCampground(result);
  }

  async searchCampgrounds(
    searchQuery: string = '',
    stateFilter: string = '',
    limit: number = 20,
    offset: number = 0
  ): Promise<Campground[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = 'SELECT * FROM campgrounds WHERE 1=1';
    const params: any[] = [];

    if (searchQuery.trim()) {
      query += ' AND (name LIKE ? OR description LIKE ? OR city LIKE ?)';
      const searchPattern = `%${searchQuery.trim()}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (stateFilter.trim()) {
      query += ' AND state = ?';
      params.push(stateFilter.trim());
    }

    query += ' ORDER BY name ASC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const results = await this.db.getAllAsync(query, params) as any[];

    return results.map(row => this.mapRowToCampground(row));
  }

  private mapRowToCampground(row: any): Campground {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      location: {
        latitude: row.latitude,
        longitude: row.longitude,
        address: row.address,
        city: row.city,
        state: row.state,
        zipCode: row.zip_code,
      },
      contact: {
        phone: row.phone,
        email: row.email,
        website: row.website,
      },
      amenities: JSON.parse(row.amenities),
      trailAccess: JSON.parse(row.trail_access),
      pricing: JSON.parse(row.pricing),
      capacity: JSON.parse(row.capacity),
      images: row.images ? JSON.parse(row.images) : [],
      lastUpdated: row.last_updated,
    };
  }

  // Trip operations
  async insertTrip(trip: Trip): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      `INSERT OR REPLACE INTO trips (
        id, name, description, start_date, end_date, total_distance,
        estimated_duration, difficulty, status, notes, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trip.id,
        trip.name,
        trip.description || null,
        trip.startDate,
        trip.endDate,
        trip.totalDistance || null,
        trip.estimatedDrivingTime || null,
        JSON.stringify(trip.preferences),
        trip.status,
        null, // notes - not in current Trip type
        new Date().toISOString(),
      ]
    );

    // Insert trip stops
    for (const stop of trip.stops) {
      await this.insertTripStop(stop);
    }
  }

  async insertTripStop(stop: TripStop): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

          await this.db.runAsync(
        `INSERT OR REPLACE INTO trip_stops (
          id, trip_id, campground_id, stop_order, arrival_date, departure_date,
          driving_time_to_next, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          stop.id,
          stop.tripId,
          stop.campgroundId,
          stop.orderIndex,
          stop.arrivalDate,
          stop.departureDate,
          null, // drivingTimeToNext - not in current TripStop type
          stop.notes || null,
        ]
      );
  }

  async getUserSettings(): Promise<UserSettings | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync(
      'SELECT * FROM user_settings WHERE id = 1'
    ) as any;

    if (!result) return null;

    return {
      preferredNavigationApp: result.preferred_navigation_app,
      units: result.units,
      enableLocationServices: Boolean(result.notifications_enabled), // Using notifications as proxy
      notificationsEnabled: Boolean(result.notifications_enabled),
      offlineDataEnabled: Boolean(result.offline_data_enabled),
      theme: result.theme,
    };
  }

  async updateUserSettings(settings: Partial<UserSettings>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const current = await this.getUserSettings();
    const updated = { ...current, ...settings };

    await this.db.runAsync(
      `INSERT OR REPLACE INTO user_settings (
        id, preferred_navigation_app, units, notifications_enabled,
        offline_data_enabled, theme, updated_at
      ) VALUES (1, ?, ?, ?, ?, ?, ?)`,
             [
         updated.preferredNavigationApp || 'apple_maps',
         updated.units || 'imperial',
         updated.notificationsEnabled ? 1 : 0,
         updated.offlineDataEnabled ? 1 : 0,
         updated.theme || 'system',
         new Date().toISOString(),
       ]
    );
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService(); 