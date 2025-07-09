import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react-native';

export function ThemeToggle() {
  const { theme, colors, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {theme === 'light' ? (
            <Sun size={20} color={colors.textSecondary} />
          ) : (
            <Moon size={20} color={colors.textSecondary} />
          )}
        </View>
        <Text style={[styles.label, { color: colors.text }]}>
          {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
        </Text>
      </View>
      
      <TouchableOpacity
        style={[
          styles.toggle,
          { backgroundColor: theme === 'dark' ? colors.primary : colors.border }
        ]}
        onPress={toggleTheme}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.toggleThumb,
            {
              backgroundColor: colors.surface,
              transform: [{ translateX: theme === 'dark' ? 24 : 2 }],
            }
          ]}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  toggle: {
    width: 52,
    height: 32,
    borderRadius: 16,
    padding: 2,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});