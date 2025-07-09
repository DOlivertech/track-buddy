import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HourlyForecast } from '@/types/weather';
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

interface HourlyForecastCardProps {
  forecast: HourlyForecast;
  temperatureUnit: 'celsius' | 'fahrenheit';
  windSpeedUnit: 'kmh' | 'mph';
  precipitationUnit: 'mm' | 'inches';
}

export function HourlyForecastCard({ forecast, temperatureUnit, windSpeedUnit, precipitationUnit }: HourlyForecastCardProps) {
  const { colors } = useTheme();
  const temperature = convertTemperature(forecast.temperature, temperatureUnit);
  const precipitationAmount = convertPrecipitation(forecast.precipitationAmount, precipitationUnit);
  const windSpeed = convertWindSpeed(forecast.windSpeed, windSpeedUnit);
  const unit = getTemperatureUnit(temperatureUnit);
  const precipUnit = getPrecipitationUnit(precipitationUnit);
  const windUnit = getWindSpeedUnit(windSpeedUnit);
  
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
      <Text style={[styles.time, { color: colors.textSecondary }]}>{forecast.time}</Text>
      <WeatherIcon icon={forecast.conditionIcon} size={32} color={colors.textSecondary} />
      <Text style={[styles.temperature, { color: colors.text }]}>{temperature}{unit}</Text>
      <View style={styles.precipitationContainer}>
        <Text style={[styles.precipitationProb, { color: colors.info }]}>{forecast.precipitationProbability}%</Text>
        {precipitationAmount > 0 && (
          <Text style={[styles.precipitationAmount, { color: colors.info }]}>{precipitationAmount}{precipUnit}</Text>
        )}
      </View>
      <Text style={[styles.wind, { color: colors.textSecondary }]}>{windSpeed} {windUnit}</Text>
      <Text style={[styles.condition, { color: colors.textTertiary }]}>{forecast.condition}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    width: '31%',
    marginBottom: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  time: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginBottom: 8,
  },
  temperature: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginVertical: 8,
  },
  precipitationContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },
  precipitationProb: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  precipitationAmount: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    marginTop: 2,
  },
  wind: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginBottom: 4,
  },
  condition: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    textAlign: 'center',
  },
});