import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { racingTracks } from '@/data/racingTracks';
import { storageService } from '@/services/storageService';
import { UserSettings } from '@/types/weather';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  MapPin, 
  Heart, 
  Search, 
  Filter,
  Star,
  Flag,
  RefreshCcw
} from 'lucide-react-native';

export default function TracksScreen() {
  const { colors } = useTheme();
  const [tracks, setTracks] = useState(racingTracks);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'F1', 'MotoGP', 'NASCAR', 'IndyCar', 'Other'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTracks();
  }, [searchQuery, selectedCategory]);

  const loadData = async () => {
    try {
      const userSettings = await storageService.getSettings();
      const userFavorites = await storageService.getFavorites();
      setSettings(userSettings);
      setFavorites(userFavorites);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTracks = () => {
    let filtered = racingTracks;

    if (searchQuery) {
      filtered = filtered.filter(track =>
        track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.country.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(track => track.category === selectedCategory);
    }

    setTracks(filtered);
  };

  const handleTrackSelect = async (trackId: string) => {
    if (!settings) return;

    const updatedSettings = { ...settings, selectedTrack: trackId };
    await storageService.saveSettings(updatedSettings);
    setSettings(updatedSettings);
  };

  const handleFavoriteToggle = async (trackId: string) => {
    try {
      if (favorites.includes(trackId)) {
        const updated = await storageService.removeFromFavorites(trackId);
        setFavorites(updated);
      } else {
        if (favorites.length < 5) {
          const updated = await storageService.addToFavorites(trackId);
          setFavorites(updated);
        }
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const handleRefresh = async () => {
    await loadData();
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading tracks...</Text>
      </View>
    );
  }

  const favoriteTracks = racingTracks.filter(track => favorites.includes(track.id));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Racing Tracks</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Select a track for weather updates</Text>
          </View>
          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={handleRefresh}
          >
            <RefreshCcw size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search tracks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textTertiary}
          />
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
                selectedCategory === category && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                { color: colors.textSecondary },
                selectedCategory === category && { color: colors.primaryText }
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {favoriteTracks.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Favorite Tracks</Text>
            {favoriteTracks.map(track => (
              <TrackCard
                key={track.id}
                track={track}
                colors={colors}
                isSelected={settings?.selectedTrack === track.id}
                isFavorite={favorites.includes(track.id)}
                onSelect={() => handleTrackSelect(track.id)}
                onFavoriteToggle={() => handleFavoriteToggle(track.id)}
              />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {selectedCategory === 'All' ? 'All Tracks' : `${selectedCategory} Tracks`}
          </Text>
          {tracks.map(track => (
            <TrackCard
              key={track.id}
              track={track}
              colors={colors}
              isSelected={settings?.selectedTrack === track.id}
              isFavorite={favorites.includes(track.id)}
              onSelect={() => handleTrackSelect(track.id)}
              onFavoriteToggle={() => handleFavoriteToggle(track.id)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

interface TrackCardProps {
  track: any;
  colors: any;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onFavoriteToggle: () => void;
}

function TrackCard({ track, colors, isSelected, isFavorite, onSelect, onFavoriteToggle }: TrackCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.trackCard,
        { backgroundColor: colors.surface, shadowColor: colors.shadow },
        isSelected && { borderWidth: 2, borderColor: colors.primary }
      ]}
      onPress={onSelect}
    >
      <View style={styles.trackInfo}>
        <View style={styles.trackHeader}>
          <View style={styles.trackTitle}>
            <Text style={[styles.trackName, { color: colors.text }]}>{track.name}</Text>
            <View style={styles.trackCategory}>
              <Flag size={12} color={colors.textSecondary} />
              <Text style={[styles.categoryTag, { color: colors.textSecondary }]}>{track.category}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={onFavoriteToggle}
          >
            <Heart
              size={20}
              color={isFavorite ? '#EF4444' : '#64748B'}
              fill={isFavorite ? '#EF4444' : 'none'}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.trackLocation}>
          <MapPin size={16} color={colors.textSecondary} />
          <Text style={[styles.trackCountry, { color: colors.textSecondary }]}>{track.country}</Text>
        </View>
        
        <View style={styles.trackCoords}>
          <Text style={[styles.coordsText, { color: colors.textTertiary }]}>
            {track.coordinates.lat.toFixed(4)}°, {track.coordinates.lon.toFixed(4)}°
          </Text>
        </View>
      </View>
      
      {isSelected && (
        <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}>
          <Star size={16} color={colors.primaryText} fill={colors.primaryText} />
        </View>
      )}
    </TouchableOpacity>
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryButton: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  trackCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  trackInfo: {
    flex: 1,
  },
  trackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  trackTitle: {
    flex: 1,
  },
  trackName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 4,
  },
  trackCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryTag: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  favoriteButton: {
    padding: 4,
  },
  trackLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  trackCountry: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  trackCoords: {
    marginTop: 4,
  },
  coordsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
  },
  selectedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});