import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TimeOfDay } from '@/utils/timeOfDay';

interface TimeOfDayBadgeProps {
  timeOfDay: TimeOfDay;
  size?: 'small' | 'medium' | 'large';
}

export function TimeOfDayBadge({ timeOfDay, size = 'medium' }: TimeOfDayBadgeProps) {
  const sizeStyle = size === 'small' ? styles.small : size === 'large' ? styles.large : styles.medium;
  
  return (
    <View style={[
      styles.badge,
      sizeStyle,
      { backgroundColor: timeOfDay.color }
    ]}>
      <Text style={[
        styles.text,
        { fontSize: size === 'small' ? 10 : size === 'large' ? 16 : 12 }
      ]}>
        {timeOfDay.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  medium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  large: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  text: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
});