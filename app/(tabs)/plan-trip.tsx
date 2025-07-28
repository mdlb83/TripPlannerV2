import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function PlanTripScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Plan Your Bike Camping Adventure</Text>
        <Text style={styles.subtitle}>
          Create multi-stop trips with customizable driving times between campgrounds
        </Text>
        
        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>
            📍 Start & End Points
          </Text>
          <Text style={styles.placeholderSubtext}>
            Set your departure and destination locations
          </Text>
        </View>

        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>
            ⏱️ Drive Time Preferences
          </Text>
          <Text style={styles.placeholderSubtext}>
            Choose preferred driving time between stops (30 min - 4 hours)
          </Text>
        </View>

        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>
            🗺️ Route Optimization
          </Text>
          <Text style={styles.placeholderSubtext}>
            Intelligent suggestions based on your preferences
          </Text>
        </View>

        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>
            📅 Trip Details
          </Text>
          <Text style={styles.placeholderSubtext}>
            Set dates, add notes, and finalize your itinerary
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  placeholderBox: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
}); 