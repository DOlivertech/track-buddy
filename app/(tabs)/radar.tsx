import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { UserSettings } from '@/types/weather';
import { storageService } from '@/services/storageService';
import { racingTracks } from '@/data/racingTracks';
import { useTheme } from '@/contexts/ThemeContext';
import { Radar, RefreshCcw } from 'lucide-react-native';

export default function RadarScreen() {
  const { colors } = useTheme();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const userSettings = await storageService.getSettings();
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadSettings();
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading radar...</Text>
      </View>
    );
  }

  const selectedTrack = racingTracks.find(t => t.id === settings?.selectedTrack) || racingTracks[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Weather Radar</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{selectedTrack.name}</Text>
          </View>
          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={handleRefresh}
          >
            <RefreshCcw size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.radarContainer}>
        <View style={[styles.comingSoonOverlay, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <Radar size={80} color={colors.primary} />
          <Text style={[styles.comingSoonText, { color: colors.text }]}>Radar Coming Soon!</Text>
          <Text style={[styles.comingSoonSubtext, { color: colors.textSecondary }]}>
            We're working hard to bring you the best interactive radar experience. 
            Stay tuned for live weather radar data and precipitation tracking.
          </Text>
        </View>
      </View>

      <View style={[styles.infoContainer, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
        <Text style={[styles.infoTitle, { color: colors.text }]}>Radar Information</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <View style={[styles.colorDot, { backgroundColor: '#22C55E' }]} />
            </View>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>Light precipitation</Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <View style={[styles.colorDot, { backgroundColor: '#F59E0B' }]} />
            </View>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>Moderate precipitation</Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <View style={[styles.colorDot, { backgroundColor: '#EF4444' }]} />
            </View>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>Heavy precipitation</Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <View style={[styles.colorDot, { backgroundColor: '#8B5CF6' }]} />
            </View>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>Snow/Ice</Text>
          </View>
        </View>
        <Text style={[styles.infoDescription, { color: colors.textTertiary }]}>
          Interactive weather radar will show live precipitation, clouds, and weather patterns 
          around {selectedTrack.name} once available.
        </Text>
      </View>
    </View>
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
  radarContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  comingSoonOverlay: {
    borderRadius: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  comingSoonText: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  comingSoonSubtext: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  infoContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
  },
  infoIcon: {
    marginRight: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    flex: 1,
  },
  infoDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 18,
  },
});