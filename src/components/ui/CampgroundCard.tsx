import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Campground } from '../../types';
import { COLORS, TYPOGRAPHY } from '../../constants';

interface CampgroundCardProps {
  campground: Campground;
  onPress?: () => void;
}

export function CampgroundCard({ campground, onPress }: CampgroundCardProps) {
  const trailTypes = campground.trailAccess.trailTypes || [];
  const hasElectricHookups = campground.amenities.electricHookups;
  const hasWifi = campground.amenities.wifiAvailable;
  const hasShowers = campground.amenities.showers;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.campgroundName} numberOfLines={1}>
            {campground.name}
          </Text>
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={14} color={COLORS.text.secondary} />
            <Text style={styles.location} numberOfLines={1}>
              {campground.location.city}, {campground.location.state}
            </Text>
          </View>
        </View>
        
        {campground.trailAccess.hasDirectAccess && (
          <View style={styles.directAccessBadge}>
            <FontAwesome5 name="bicycle" size={12} color={COLORS.primary} />
            <Text style={styles.directAccessText}>Direct Access</Text>
          </View>
        )}
      </View>

      {campground.description && (
        <Text style={styles.description} numberOfLines={2}>
          {campground.description}
        </Text>
      )}

      {/* Trail Types */}
      {trailTypes.length > 0 && (
        <View style={styles.trailTypesContainer}>
          <Text style={styles.sectionLabel}>Trail Types:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.trailTypesList}>
              {trailTypes.map((type, index) => (
                <View key={index} style={styles.trailTypeBadge}>
                  <Text style={styles.trailTypeText}>
                    {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Amenities */}
      <View style={styles.amenitiesContainer}>
        <Text style={styles.sectionLabel}>Amenities:</Text>
        <View style={styles.amenitiesList}>
          {hasElectricHookups && (
            <View style={styles.amenityItem}>
              <MaterialIcons name="electrical-services" size={16} color={COLORS.primary} />
              <Text style={styles.amenityText}>Electric</Text>
            </View>
          )}
          {hasWifi && (
            <View style={styles.amenityItem}>
              <MaterialIcons name="wifi" size={16} color={COLORS.primary} />
              <Text style={styles.amenityText}>WiFi</Text>
            </View>
          )}
          {hasShowers && (
            <View style={styles.amenityItem}>
              <FontAwesome5 name="shower" size={14} color={COLORS.primary} />
              <Text style={styles.amenityText}>Showers</Text>
            </View>
          )}
          {campground.amenities.restrooms && (
            <View style={styles.amenityItem}>
              <FontAwesome5 name="restroom" size={14} color={COLORS.primary} />
              <Text style={styles.amenityText}>Restrooms</Text>
            </View>
          )}
        </View>
      </View>

      {/* Distance to Trail */}
      {campground.trailAccess.distanceToTrailhead !== null && 
       campground.trailAccess.distanceToTrailhead !== undefined &&
       campground.trailAccess.distanceToTrailhead > 0 && (
        <View style={styles.distanceContainer}>
          <MaterialIcons name="directions-walk" size={14} color={COLORS.text.secondary} />
          <Text style={styles.distanceText}>
            {(campground.trailAccess.distanceToTrailhead / 1609.34).toFixed(1)} miles to trail
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  campgroundName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginLeft: 4,
    flex: 1,
  },
  directAccessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  directAccessText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginLeft: 4,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  trailTypesContainer: {
    marginBottom: 12,
  },
  trailTypesList: {
    flexDirection: 'row',
    gap: 8,
  },
  trailTypeBadge: {
    backgroundColor: COLORS.secondary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trailTypeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.primaryDark,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  amenitiesContainer: {
    marginBottom: 8,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amenityText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  distanceText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
}); 