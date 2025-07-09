import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DailyForecast } from '@/types/weather';
import { useTheme } from '@/contexts/ThemeContext';
import { WeatherIcon } from './WeatherIcon';
import { 
  convertTemperature, 
  getTemperatureUnit, 
  convertPrecipitation, 
  getPrecipitationUnit,
  convertWindSpeed,
  getWindSpeedUnit 
} from '@/utils/raceConditions';

interface DailyForecastCardProps {
  forecast: DailyForecast;
  temperatureUnit: 'celsius' | 'fahrenheit';
  windSpeedUnit: 'kmh' | 'mph';
  precipitationUnit: 'mm' | 'inches';
}

export function DailyForecastCard({ forecast, temperatureUnit, windSpeedUnit, precipitationUnit }: DailyForecastCardProps) {
  const { colors } = useTheme();
  const minTemp = convertTemperature(forecast.minTemp, temperatureUnit);
  const maxTemp = convertTemperature(forecast.maxTemp, temperatureUnit);
  const precipitationAmount = convertPrecipitation(forecast.precipitationAmount, precipitationUnit);
  const windSpeed = convertWindSpeed(forecast.windSpeed, windSpeedUnit);
  const unit = getTemperatureUnit(temperatureUnit);
  const precipUnit = getPrecipitationUnit(precipitationUnit);
  const windUnit = getWindSpeedUnit(windSpeedUnit);
  
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
      <View style={styles.header}>
        <Text style={[styles.date, { color: colors.text }]}>{forecast.date}</Text>
        <WeatherIcon icon={forecast.conditionIcon} size={24} color={colors.textSecondary} />
      </View>
      
      <View style={styles.temperature}>
        <Text style={[styles.maxTemp, { color: colors.text }]}>{maxTemp}{unit}</Text>
        <Text style={[styles.minTemp, { color: colors.textSecondary }]}>{minTemp}{unit}</Text>
      </View>
      
      <View style={styles.details}>
        <Text style={[styles.condition, { color: colors.textSecondary }]}>{forecast.condition}</Text>
        <Text style={[styles.precipitation, { color: colors.info }]}>
          Rain: {forecast.precipitationProbability}%
          {precipitationAmount > 0 && ` (${precipitationAmount}${precipUnit})`}
        </Text>
        <Text style={[styles.wind, { color: colors.textTertiary }]}>Wind: {windSpeed} {windUnit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  date: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  temperature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  maxTemp: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  minTemp: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  details: {
    gap: 4,
  },
  condition: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  precipitation: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
  },
  wind: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
  },
});