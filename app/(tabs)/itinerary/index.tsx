import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal,
  Image
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useCustomAlert } from '@/components/CustomAlert';
import { DatePicker } from '@/components/DatePicker';
import { TrackSearchPicker } from '@/components/TrackSearchPicker';
import { itineraryService } from '@/services/itineraryService';
import { storageService } from '@/services/storageService';
import { RaceWeekend } from '@/types/user';
import { racingTracks } from '@/data/racingTracks';
import { Plus, CalendarDays, RefreshCcw, MapPin, Calendar, Clock, Image as ImageIcon, ChevronRight, Trash2, CreditCard as Edit3 } from 'lucide-react-native';

export default function ItineraryScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [raceWeekends, setRaceWeekends] = useState<RaceWeekend[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWeekend, setEditingWeekend] = useState<RaceWeekend | null>(null);
  const [weekendForm, setWeekendForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    trackId: '',
    imageUrl: ''
  });

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const weekends = await itineraryService.getRaceWeekends();
      setRaceWeekends(weekends);
    } catch (error) {
      console.error('Error loading race weekends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadData();
  };

  const openWeekendModal = (weekend?: RaceWeekend) => {
    if (weekend) {
      setEditingWeekend(weekend);
      setWeekendForm({
        title: weekend.title,
        description: weekend.description || '',
        startDate: weekend.startDate,
        endDate: weekend.endDate,
        trackId: weekend.trackId || '',
        imageUrl: weekend.imageUrl || ''
      });
    } else {
      setEditingWeekend(null);
      setWeekendForm({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        trackId: '',
        imageUrl: ''
      });
    }
    setModalVisible(true);
  };

  const closeWeekendModal = () => {
    setModalVisible(false);
    setEditingWeekend(null);
    setWeekendForm({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      trackId: '',
      imageUrl: ''
    });
  };

  const saveWeekend = async () => {
    if (!weekendForm.title.trim() || !weekendForm.startDate || !weekendForm.endDate) {
      showAlert('Error', 'Please fill in all required fields.', [{ text: 'OK' }]);
      return;
    }

    try {
      if (editingWeekend) {
        await itineraryService.updateRaceWeekend(editingWeekend.id, {
          title: weekendForm.title.trim(),
          description: weekendForm.description.trim(),
          startDate: weekendForm.startDate,
          endDate: weekendForm.endDate,
          trackId: weekendForm.trackId || undefined,
          imageUrl: weekendForm.imageUrl.trim() || undefined
        });
      } else {
        await itineraryService.saveRaceWeekend({
          title: weekendForm.title.trim(),
          description: weekendForm.description.trim(),
          startDate: weekendForm.startDate,
          endDate: weekendForm.endDate,
          trackId: weekendForm.trackId || undefined,
          imageUrl: weekendForm.imageUrl.trim() || undefined,
          days: []
        });
      }
      
      closeWeekendModal();
      loadData();
    } catch (error) {
      console.error('Error saving race weekend:', error);
      showAlert('Error', 'Failed to save race weekend. Please try again.', [{ text: 'OK' }]);
    }
  };

  const deleteWeekend = async (weekend: RaceWeekend) => {
    showAlert(
      'Delete Race Weekend',
      `Are you sure you want to delete "${weekend.title}"? This will permanently delete all days and schedule items.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await itineraryService.deleteRaceWeekend(weekend.id);
              if (success) {
                await loadData();
              } else {
                showAlert('Error', 'Failed to delete race weekend.', [{ text: 'OK' }]);
              }
            } catch (error) {
              console.error('Error deleting race weekend:', error);
              showAlert('Error', 'Failed to delete race weekend.', [{ text: 'OK' }]);
            }
          }
        }
      ]
    );
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (startDate === endDate) {
      return start.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
    
    return `${start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })} - ${end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })}`;
  };

  const getTrackName = (trackId?: string) => {
    if (!trackId) return null;
    const track = racingTracks.find(t => t.id === trackId);
    return track ? `${track.name}, ${track.country}` : null;
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading itinerary...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Race Itinerary</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Manage your race weekend schedules</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => openWeekendModal()}
            >
              <Plus size={20} color={colors.primaryText} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.refreshButton, { backgroundColor: colors.surfaceSecondary }]}
              onPress={handleRefresh}
            >
              <RefreshCcw size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {raceWeekends.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <CalendarDays size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Race Weekends Yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Create your first race weekend to start planning your schedule and track activities.
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              onPress={() => openWeekendModal()}
            >
              <Plus size={20} color={colors.primaryText} />
              <Text style={[styles.emptyButtonText, { color: colors.primaryText }]}>Add Race Weekend</Text>
            </TouchableOpacity>
          </View>
        ) : (
          raceWeekends.map((weekend) => (
            <TouchableOpacity
              key={weekend.id}
              style={[styles.weekendCard, { backgroundColor: colors.surface }]}
              onPress={() => router.push(`/itinerary/${weekend.id}`)}
              activeOpacity={0.7}
            >
              {weekend.imageUrl && (
                <Image
                  source={{ uri: weekend.imageUrl }}
                  style={styles.weekendImage}
                  resizeMode="cover"
                />
              )}
              
              <View style={styles.weekendContent}>
                <View style={styles.weekendHeader}>
                  <View style={styles.weekendInfo}>
                    <Text style={[styles.weekendTitle, { color: colors.text }]}>{weekend.title}</Text>
                    <View style={styles.weekendMeta}>
                      <View style={styles.metaItem}>
                        <Calendar size={14} color={colors.textSecondary} />
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                          {formatDateRange(weekend.startDate, weekend.endDate)}
                        </Text>
                      </View>
                      {getTrackName(weekend.trackId) && (
                        <View style={styles.metaItem}>
                          <MapPin size={14} color={colors.textSecondary} />
                          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                            {getTrackName(weekend.trackId)}
                          </Text>
                        </View>
                      )}
                      <View style={styles.metaItem}>
                        <Clock size={14} color={colors.textSecondary} />
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                          {weekend.days.length} day{weekend.days.length === 1 ? '' : 's'}
                        </Text>
                      </View>
                    </View>
                    {weekend.description && (
                      <Text style={[styles.weekendDescription, { color: colors.textTertiary }]} numberOfLines={2}>
                        {weekend.description}
                      </Text>
                    )}
                  </View>
                  
                  <View style={styles.weekendActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.surfaceSecondary }]}
                      onPress={(e) => {
                        e.stopPropagation();
                        openWeekendModal(weekend);
                      }}
                    >
                      <Edit3 size={16} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.surfaceSecondary }]}
                      onPress={(e) => {
                        e.stopPropagation();
                        deleteWeekend(weekend);
                      }}
                    >
                      <Trash2 size={16} color={colors.error} />
                    </TouchableOpacity>
                    <View style={[styles.chevronContainer, { backgroundColor: colors.primary }]}>
                      <ChevronRight size={16} color={colors.primaryText} />
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeWeekendModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeWeekendModal}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingWeekend ? 'Edit Race Weekend' : 'New Race Weekend'}
            </Text>
            <TouchableOpacity onPress={saveWeekend}>
              <Text style={[styles.modalSave, { color: colors.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Weekend Title *</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g., Monaco Grand Prix Weekend"
                placeholderTextColor={colors.textTertiary}
                value={weekendForm.title}
                onChangeText={(title) => setWeekendForm({ ...weekendForm, title })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Description</Text>
              <TextInput
                style={[styles.textAreaInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Add details about this race weekend..."
                placeholderTextColor={colors.textTertiary}
                value={weekendForm.description}
                onChangeText={(description) => setWeekendForm({ ...weekendForm, description })}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.dateRow}>
              <View style={styles.dateColumn}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Start Date *</Text>
                <DatePicker
                  value={weekendForm.startDate}
                  onDateChange={(startDate) => setWeekendForm({ ...weekendForm, startDate })}
                  placeholder="Select start date"
                />
              </View>
              <View style={styles.dateColumn}>
                <Text style={[styles.formLabel, { color: colors.text }]}>End Date *</Text>
                <DatePicker
                  value={weekendForm.endDate}
                  onDateChange={(endDate) => setWeekendForm({ ...weekendForm, endDate })}
                  placeholder="Select end date"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <TrackSearchPicker
                label="Racing Track"
                value={weekendForm.trackId}
                onTrackChange={(trackId) => setWeekendForm({ ...weekendForm, trackId: trackId || '' })}
                placeholder="Select a racing track (optional)"
                allowNone={true}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Weekend Image URL</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="https://example.com/image.jpg"
                placeholderTextColor={colors.textTertiary}
                value={weekendForm.imageUrl}
                onChangeText={(imageUrl) => setWeekendForm({ ...weekendForm, imageUrl })}
              />
              <Text style={[styles.helpText, { color: colors.textTertiary }]}>
                Optional: Add a URL to an image that represents this race weekend
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <AlertComponent />
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
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  addButton: {
    padding: 8,
    borderRadius: 12,
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
  content: {
    flex: 1,
  },
  emptyState: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  weekendCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weekendImage: {
    width: '100%',
    height: 120,
  },
  weekendContent: {
    padding: 16,
  },
  weekendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  weekendInfo: {
    flex: 1,
    marginRight: 12,
  },
  weekendTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 8,
  },
  weekendMeta: {
    gap: 6,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  weekendDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 20,
  },
  weekendActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
  modalSave: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  textAreaInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    minHeight: 80,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  dateColumn: {
    flex: 1,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  pickerText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  helpText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    marginTop: 4,
  },
});