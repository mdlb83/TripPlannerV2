import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function MyTripsScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Your Saved Adventures</Text>
        <Text style={styles.subtitle}>
          Access your planned trips offline and track your camping adventures
        </Text>
        
        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>
            📱 Saved Trips
          </Text>
          <Text style={styles.placeholderSubtext}>
            View, edit, and manage your planned bike camping itineraries
          </Text>
        </View>

        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>
            🧭 Navigation Ready
          </Text>
          <Text style={styles.placeholderSubtext}>
            One-tap navigation to your next campground stop
          </Text>
        </View>

        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>
            📤 Share & Export
          </Text>
          <Text style={styles.placeholderSubtext}>
            Share trip plans with companions or export as PDF
          </Text>
        </View>

        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>
            ✅ Trip Progress
          </Text>
          <Text style={styles.placeholderSubtext}>
            Mark campgrounds as visited and track your journey
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