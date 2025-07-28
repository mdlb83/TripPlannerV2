import { useState, useEffect, useCallback } from 'react';
import { Campground } from '../types';
import { databaseService } from '../services/database';

interface UseCampgroundsOptions {
  searchQuery?: string;
  stateFilter?: string;
  limit?: number;
  offset?: number;
}

interface UseCampgroundsResult {
  campgrounds: Campground[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  search: (query: string, state?: string) => void;
}

export function useCampgrounds(options: UseCampgroundsOptions = {}): UseCampgroundsResult {
  const [campgrounds, setCampgrounds] = useState<Campground[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentOptions, setCurrentOptions] = useState<UseCampgroundsOptions>({
    searchQuery: '',
    stateFilter: '',
    limit: 20,
    offset: 0,
    ...options,
  });

  const loadCampgrounds = useCallback(async (reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const searchOptions = reset ? { ...currentOptions, offset: 0 } : currentOptions;
      
      const results = await databaseService.searchCampgrounds(
        searchOptions.searchQuery || '',
        searchOptions.stateFilter || '',
        searchOptions.limit || 20,
        searchOptions.offset || 0
      );

      if (reset || searchOptions.offset === 0) {
        setCampgrounds(results);
      } else {
        setCampgrounds(prev => [...prev, ...results]);
      }

      // Get total count for pagination
      const allResults = await databaseService.searchCampgrounds(
        searchOptions.searchQuery || '',
        searchOptions.stateFilter || '',
        1000, // Large number to get total count
        0
      );
      setTotalCount(allResults.length);

    } catch (err) {
      console.error('Error loading campgrounds:', err);
      setError(err instanceof Error ? err.message : 'Failed to load campgrounds');
    } finally {
      setLoading(false);
    }
  }, [currentOptions]);

  const refresh = useCallback(async () => {
    setCurrentOptions(prev => ({ ...prev, offset: 0 }));
    await loadCampgrounds(true);
  }, [loadCampgrounds]);

  const loadMore = useCallback(async () => {
    const currentHasMore = campgrounds.length < totalCount;
    if (loading || !currentHasMore) return;
    
    setCurrentOptions(prev => ({
      ...prev,
      offset: (prev.offset || 0) + (prev.limit || 20)
    }));
  }, [loading, campgrounds.length, totalCount]);

  const search = useCallback((query: string, state?: string) => {
    setCurrentOptions(prev => ({
      ...prev,
      searchQuery: query,
      stateFilter: state || '',
      offset: 0,
    }));
  }, []);

  // Load campgrounds when options change
  useEffect(() => {
    loadCampgrounds(currentOptions.offset === 0);
  }, [currentOptions]);

  const hasMore = campgrounds.length < totalCount;

  return {
    campgrounds,
    loading,
    error,
    totalCount,
    hasMore,
    refresh,
    loadMore,
    search,
  };
} 