import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface WeatherMetricProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

export function WeatherMetric({ label, value, icon }: WeatherMetricProps) {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceSecondary }]}>
      <View style={styles.header}>
        {icon}
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    flex: 1,
    alignItems: 'center',
    minWidth: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  value: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
});