import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { CampgroundCard } from '../../src/components/ui/CampgroundCard';
import { useCampgrounds } from '../../src/hooks/useCampgrounds';
import { useDatabase } from '../../src/hooks/useDatabase';
import { loadAllPDFCampgrounds } from '../../src/services/database/loadPDFData';
import { loadRealCampgroundData } from '../../src/services/database/loadRealData';
import { COLORS, TYPOGRAPHY } from '../../src/constants';
import { Campground } from '../../src/types';

const US_STATES = [
  'All States', 'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois',
  'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
  'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana',
  'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah',
  'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

export default function DiscoverScreen() {
  const { isInitialized, isInitializing, error: dbError } = useDatabase();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All States');
  const [showStateFilter, setShowStateFilter] = useState(false);
  const [importingData, setImportingData] = useState(false);
  
  const { 
    campgrounds, 
    loading, 
    error, 
    totalCount, 
    hasMore, 
    refresh, 
    loadMore, 
    search 
  } = useCampgrounds({
    searchQuery: searchQuery.trim(),
    stateFilter: selectedState === 'All States' ? '' : selectedState,
    limit: 20
  });

  // Update search when query or state changes
  React.useEffect(() => {
    search(searchQuery.trim(), selectedState === 'All States' ? '' : selectedState);
  }, [searchQuery, selectedState, search]);

  const handleCampgroundPress = (campground: Campground) => {
    Alert.alert(
      campground.name,
      `${campground.location.city}, ${campground.location.state}\n\n${campground.description || 'No description available'}`,
      [{ text: 'OK' }]
    );
  };

  const handleStateSelect = (state: string) => {
    setSelectedState(state);
    setShowStateFilter(false);
  };

  const handleImportRealData = async () => {
    if (importingData) return;
    
    setImportingData(true);
    try {
      let importedCount = 0;
      
      try {
        // First try to load all PDF campgrounds (389 total)
        importedCount = await loadAllPDFCampgrounds();
        Alert.alert(
          'Success!',
          `${importedCount} campgrounds imported from PDF data. Pull down to refresh and see them!`,
          [{ 
            text: 'OK', 
            onPress: () => {
              refresh();
            }
          }]
        );
      } catch (pdfError) {
        console.warn('PDF import failed, trying manual data:', pdfError);
        
        // Fall back to manual real campground data
        importedCount = await loadRealCampgroundData();
        Alert.alert(
          'Partial Success',
          `${importedCount} manual campgrounds imported. Full PDF import failed, but you have real campground data. Pull down to refresh!`,
          [{ 
            text: 'OK', 
            onPress: () => {
              refresh();
            }
          }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Import Failed',
        error instanceof Error ? error.message : 'Failed to import campground data',
        [{ text: 'OK' }]
      );
    } finally {
      setImportingData(false);
    }
  };

  const filteredStates = useMemo(() => {
    return US_STATES.filter(state => 
      state.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const renderCampgroundItem = ({ item }: { item: Campground }) => (
    <CampgroundCard 
      campground={item} 
      onPress={() => handleCampgroundPress(item)}
    />
  );

  const renderStateItem = ({ item }: { item: string }) => (
    <TouchableOpacity 
      style={[
        styles.stateItem,
        selectedState === item && styles.selectedStateItem
      ]} 
      onPress={() => handleStateSelect(item)}
    >
      <Text style={[
        styles.stateText,
        selectedState === item && styles.selectedStateText
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Discover Bike Campgrounds</Text>
      <Text style={styles.subtitle}>
        Find bike-accessible campgrounds for your next adventure
      </Text>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={COLORS.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search campgrounds..."
          placeholderTextColor={COLORS.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <MaterialIcons name="clear" size={20} color={COLORS.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* State Filter */}
      <TouchableOpacity 
        style={styles.stateFilter} 
        onPress={() => setShowStateFilter(!showStateFilter)}
      >
        <MaterialIcons name="location-on" size={20} color={COLORS.primary} />
        <Text style={styles.stateFilterText}>{selectedState}</Text>
        <MaterialIcons 
          name={showStateFilter ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
          size={20} 
          color={COLORS.primary} 
        />
      </TouchableOpacity>

             {/* Results Count */}
       <View style={styles.resultsContainer}>
         <Text style={styles.resultsText}>
           {loading ? 'Loading...' : `${totalCount} campgrounds found`}
         </Text>
         {totalCount > 0 && (
           <Text style={styles.resultsSubtext}>
             {campgrounds.filter(c => c.trailAccess.hasDirectAccess).length} with direct trail access
           </Text>
         )}
       </View>

       {/* Manual import button */}
       <TouchableOpacity 
         style={[styles.importButton, importingData && styles.importButtonDisabled]}
         onPress={handleImportRealData}
         disabled={importingData}
       >
         {importingData && (
           <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
         )}
         <Text style={styles.importButtonText}>
           {importingData ? 'Importing All Campgrounds...' : 'Load All 389 PDF Campgrounds'}
         </Text>
       </TouchableOpacity>

       {/* Results info */}
       {!loading && !error && (
         <View style={styles.resultsInfo}>
           <Text style={styles.resultsText}>
             Showing {campgrounds.length} campground{campgrounds.length !== 1 ? 's' : ''}
             {searchQuery && ` for "${searchQuery}"`}
             {selectedState !== 'All States' && ` in ${selectedState}`}
           </Text>
         </View>
       )}
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading more campgrounds...</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="search-off" size={64} color={COLORS.text.disabled} />
      <Text style={styles.emptyTitle}>No campgrounds found</Text>
      <Text style={styles.emptyText}>
        {searchQuery || selectedState !== 'All States'
          ? 'Try adjusting your search or filter criteria'
          : 'No campgrounds available in the database'
        }
      </Text>
      {(searchQuery || selectedState !== 'All States') && (
        <TouchableOpacity 
          style={styles.clearFiltersButton}
          onPress={() => {
            setSearchQuery('');
            setSelectedState('All States');
          }}
        >
          <Text style={styles.clearFiltersText}>Clear Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Show loading state while database initializes
  if (isInitializing || !isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Initializing campground database...</Text>
      </View>
    );
  }

  // Show error state if database failed
  if (dbError) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={64} color={COLORS.error} />
        <Text style={styles.errorTitle}>Database Error</Text>
        <Text style={styles.errorText}>{dbError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {showStateFilter ? (
        <View style={styles.stateFilterContainer}>
          <View style={styles.stateFilterHeader}>
            <Text style={styles.stateFilterTitle}>Select State</Text>
            <TouchableOpacity onPress={() => setShowStateFilter(false)}>
              <MaterialIcons name="close" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={filteredStates}
            renderItem={renderStateItem}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
          />
        </View>
      ) : (
        <FlatList
          data={campgrounds}
          renderItem={renderCampgroundItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={!loading ? renderEmptyState : null}
          refreshControl={
            <RefreshControl
              refreshing={loading && campgrounds.length === 0}
              onRefresh={refresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={campgrounds.length === 0 ? styles.emptyContainer : undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.error,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.surface,
    marginBottom: 8,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.primary,
  },
  clearButton: {
    padding: 4,
  },
  stateFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stateFilterText: {
    flex: 1,
    marginLeft: 8,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.primary,
  },
  stateFilterContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingTop: 16,
  },
  stateFilterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stateFilterTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
  },
  stateItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  selectedStateItem: {
    backgroundColor: `${COLORS.primary}10`,
  },
  stateText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.primary,
  },
  selectedStateText: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.primary,
  },
  resultsSubtext: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  clearFiltersButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
     clearFiltersText: {
     fontSize: TYPOGRAPHY.fontSize.base,
     color: COLORS.surface,
     fontWeight: TYPOGRAPHY.fontWeight.medium,
   },
   importButton: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     backgroundColor: COLORS.accent,
     paddingHorizontal: 16,
     paddingVertical: 12,
     borderRadius: 8,
     marginTop: 12,
   },
   importButtonDisabled: {
     opacity: 0.6,
   },
   importButtonText: {
     fontSize: TYPOGRAPHY.fontSize.sm,
     color: COLORS.surface,
     fontWeight: TYPOGRAPHY.fontWeight.medium,
     marginLeft: 8,
   },
       resultsInfo: {
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
  }); 