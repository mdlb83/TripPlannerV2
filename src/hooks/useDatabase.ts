import { useEffect, useState } from 'react';
import { databaseService } from '../services/database';
import { loadAllPDFCampgrounds } from '../services/database/loadPDFData';
import { loadRealCampgroundData } from '../services/database/loadRealData';

export interface DatabaseState {
  isInitialized: boolean;
  isInitializing: boolean;
  error: string | null;
}

export function useDatabase(): DatabaseState {
  const [state, setState] = useState<DatabaseState>({
    isInitialized: false,
    isInitializing: false,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const initializeDatabase = async () => {
      setState(prev => ({ ...prev, isInitializing: true, error: null }));

      try {
        await databaseService.initialize();
        
        // Check what campgrounds we have
        const existingCampgrounds = await databaseService.searchCampgrounds('', '', 50, 0);
        
        if (existingCampgrounds.length === 0) {
          // No campgrounds - import real campground data from PDF
          console.log('No campgrounds found, importing campground data from PDF...');
          
          try {
            // First try to load all 389 campgrounds from the extracted PDF data
            const importedCount = await loadAllPDFCampgrounds();
            console.log(`✅ Successfully imported ${importedCount} campgrounds from PDF extraction on initial load`);
          } catch (pdfError) {
            console.warn('Failed to import full PDF data, trying manual real data:', pdfError);
            
            try {
              // Fall back to manual real campground data (5 campgrounds)
              const manualCount = await loadRealCampgroundData();
              console.log(`✅ Successfully imported ${manualCount} manual real campgrounds as fallback`);
            } catch (manualError) {
              console.warn('Failed to import manual real data, falling back to sample data:', manualError);
              
              try {
                // Final fallback to sample data
                const { populateSampleData } = require('../services/database/sampleData');
                await populateSampleData();
                console.log('✅ Successfully populated sample campgrounds as final fallback');
              } catch (sampleError) {
                console.error('Failed to import sample data:', sampleError);
              }
            }
          }
        } else {
          // Check if we have real data or just sample data
          const realDataCount = existingCampgrounds.filter(camp => 
            camp.id.startsWith('real_') || camp.id.startsWith('pdf_')
          ).length;
          const sampleDataCount = existingCampgrounds.filter(camp => 
            !camp.id.startsWith('real_') && !camp.id.startsWith('pdf_')
          ).length;
          
          if (realDataCount > 0) {
            console.log(`✅ Real campground data loaded: ${realDataCount} campgrounds from PDF/eBook`);
            if (sampleDataCount > 0) {
              console.log(`Also found ${sampleDataCount} sample campgrounds (mixed data)`);
            }
          } else {
            console.log(`📝 Using sample data: ${existingCampgrounds.length} sample campgrounds`);
          }
        }
        
        if (isMounted) {
          setState({
            isInitialized: true,
            isInitializing: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Database initialization failed:', error);
        
        if (isMounted) {
          setState({
            isInitialized: false,
            isInitializing: false,
            error: error instanceof Error ? error.message : 'Database initialization failed',
          });
        }
      }
    };

    initializeDatabase();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
} 