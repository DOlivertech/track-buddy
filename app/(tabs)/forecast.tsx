import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { WeatherData, UserSettings } from '@/types/weather';
import { weatherService } from '@/services/weatherService';
import { storageService } from '@/services/storageService';
import { racingTracks } from '@/data/racingTracks';
import { useTheme } from '@/contexts/ThemeContext';
import { HourlyForecastCard } from '@/components/HourlyForecastCard';
import { DailyForecastCard } from '@/components/DailyForecastCard';
import { RefreshCcw } from 'lucide-react-native';

export default function ForecastScreen() {
  const { colors } = useTheme();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const userSettings = await storageService.getSettings();
      setSettings(userSettings);
      
      const track = racingTracks.find(t => t.id === userSettings.selectedTrack) || racingTracks[0];
      const weather = await weatherService.getWeatherData(track);
      setWeatherData(weather);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading || !weatherData || !settings) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading forecast data...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Weather Forecast</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{weatherData.location}</Text>
          </View>
          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCcw 
              size={24} 
              color={refreshing ? colors.textTertiary : colors.primary} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>6-Hour Forecast</Text>
        <View style={styles.hourlyContainer}>
          {weatherData.hourly.slice(0, 6).map((forecast, index) => (
            <HourlyForecastCard
              key={index}
              forecast={forecast}
              temperatureUnit={settings.temperatureUnit}
              windSpeedUnit={settings.windSpeedUnit}
              precipitationUnit={settings.precipitationUnit}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>5-Day Forecast</Text>
        <View style={styles.dailyContainer}>
          {weatherData.daily.map((forecast, index) => (
            <DailyForecastCard
              key={index}
              forecast={forecast}
              temperatureUnit={settings.temperatureUnit}
              windSpeedUnit={settings.windSpeedUnit}
              precipitationUnit={settings.precipitationUnit}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 12,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  hourlyContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dailyContainer: {
    paddingHorizontal: 20,
  },
});