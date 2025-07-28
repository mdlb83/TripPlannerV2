import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>App Settings</Text>
        <Text style={styles.subtitle}>
          Customize your bike camping experience and app preferences
        </Text>
        
        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>
            🗺️ Navigation Preferences
          </Text>
          <Text style={styles.placeholderSubtext}>
            Choose your preferred navigation app (Apple Maps, Google Maps, Waze)
          </Text>
        </View>

        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>
            📍 Location Settings
          </Text>
          <Text style={styles.placeholderSubtext}>
            Manage location permissions and nearby campground discovery
          </Text>
        </View>

        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>
            💾 Data Management
          </Text>
          <Text style={styles.placeholderSubtext}>
            Offline maps, database updates, and storage preferences
          </Text>
        </View>

        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>
            🔔 Notifications
          </Text>
          <Text style={styles.placeholderSubtext}>
            Trip reminders and campground database update alerts
          </Text>
        </View>

        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>
            ℹ️ About
          </Text>
          <Text style={styles.placeholderSubtext}>
            App version, privacy policy, and terms of service
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