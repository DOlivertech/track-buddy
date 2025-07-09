import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, FlatList } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { racingTracks } from '@/data/racingTracks';
import { RacingTrack } from '@/types/weather';
import { MapPin, Search, X, Check } from 'lucide-react-native';

interface TrackSearchPickerProps {
  value?: string; // track ID
  onTrackChange: (trackId: string | undefined) => void;
  placeholder?: string;
  label?: string;
  allowNone?: boolean;
}

export function TrackSearchPicker({ 
  value, 
  onTrackChange, 
  placeholder = "Select a racing track", 
  label,
  allowNone = true 
}: TrackSearchPickerProps) {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTracks, setFilteredTracks] = useState<RacingTrack[]>(racingTracks);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTracks(racingTracks);
    } else {
      const filtered = racingTracks.filter(track =>
        track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTracks(filtered);
    }
  }, [searchQuery]);

  const getSelectedTrack = () => {
    if (!value) return null;
    return racingTracks.find(track => track.id === value) || null;
  };

  const handleTrackSelect = (trackId: string | undefined) => {
    onTrackChange(trackId);
    setModalVisible(false);
    setSearchQuery('');
  };

  const selectedTrack = getSelectedTrack();

  const renderTrackItem = ({ item }: { item: RacingTrack }) => (
    <TouchableOpacity
      style={[
        styles.trackItem,
        { backgroundColor: colors.surfaceSecondary },
        value === item.id && { backgroundColor: colors.primary + '20', borderColor: colors.primary, borderWidth: 1 }
      ]}
      onPress={() => handleTrackSelect(item.id)}
    >
      <View style={styles.trackItemContent}>
        <View style={styles.trackItemInfo}>
          <Text style={[
            styles.trackItemName, 
            { color: colors.text },
            value === item.id && { color: colors.primary, fontFamily: 'Inter-Bold' }
          ]}>
            {item.name}
          </Text>
          <View style={styles.trackItemMeta}>
            <MapPin size={12} color={colors.textSecondary} />
            <Text style={[styles.trackItemCountry, { color: colors.textSecondary }]}>
              {item.country}
            </Text>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
          </View>
        </View>
        {value === item.id && (
          <Check size={20} color={colors.primary} />
        )}
      </View>
    </TouchableOpacity>
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'F1': return '#E11D48';
      case 'MotoGP': return '#7C3AED';
      case 'NASCAR': return '#DC2626';
      case 'IndyCar': return '#2563EB';
      default: return '#64748B';
    }
  };

  return (
    <View>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      <TouchableOpacity
        style={[styles.pickerButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => setModalVisible(true)}
      >
        <MapPin size={20} color={colors.textSecondary} />
        <Text style={[styles.pickerText, { color: selectedTrack ? colors.text : colors.textTertiary }]}>
          {selectedTrack ? `${selectedTrack.name}, ${selectedTrack.country}` : placeholder}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Track</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.searchContainer}>
            <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Search size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search tracks, countries, or series..."
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView style={styles.modalContent}>
            {allowNone && (
              <TouchableOpacity
                style={[
                  styles.trackItem,
                  { backgroundColor: colors.surfaceSecondary },
                  !value && { backgroundColor: colors.primary + '20', borderColor: colors.primary, borderWidth: 1 }
                ]}
                onPress={() => handleTrackSelect(undefined)}
              >
                <View style={styles.trackItemContent}>
                  <View style={styles.trackItemInfo}>
                    <Text style={[
                      styles.trackItemName, 
                      { color: colors.text },
                      !value && { color: colors.primary, fontFamily: 'Inter-Bold' }
                    ]}>
                      No Track Selected
                    </Text>
                    <Text style={[styles.trackItemCountry, { color: colors.textSecondary }]}>
                      Optional selection
                    </Text>
                  </View>
                  {!value && (
                    <Check size={20} color={colors.primary} />
                  )}
                </View>
              </TouchableOpacity>
            )}

            <FlatList
              data={filteredTracks}
              renderItem={renderTrackItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />

            {filteredTracks.length === 0 && searchQuery.length > 0 && (
              <View style={styles.noResults}>
                <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
                  No tracks found for "{searchQuery}"
                </Text>
                <Text style={[styles.noResultsSubtext, { color: colors.textTertiary }]}>
                  Try searching by track name, country, or racing series
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  pickerText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    flex: 1,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  modalCancel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  placeholder: {
    width: 60, // Same width as Cancel button for centering
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  trackItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  trackItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackItemInfo: {
    flex: 1,
  },
  trackItemName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginBottom: 4,
  },
  trackItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trackItemCountry: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    textAlign: 'center',
  },
});