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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useCustomAlert } from '@/components/CustomAlert';
import { DatePicker } from '@/components/DatePicker';
import { itineraryService } from '@/services/itineraryService';
import { RaceWeekend, ItineraryDay } from '@/types/user';
import { Plus, Calendar, RefreshCcw, ArrowLeft, Image as ImageIcon, ChevronRight, Trash2, CreditCard as Edit3, Clock } from 'lucide-react-native';

export default function RaceWeekendDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { raceWeekendId } = useLocalSearchParams<{ raceWeekendId: string }>();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [raceWeekend, setRaceWeekend] = useState<RaceWeekend | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDay, setEditingDay] = useState<ItineraryDay | null>(null);
  const [dayForm, setDayForm] = useState({
    title: '',
    description: '',
    date: '',
    imageUrl: ''
  });

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [raceWeekendId])
  );

  const loadData = async () => {
    try {
      if (raceWeekendId) {
        const weekend = await itineraryService.getRaceWeekend(raceWeekendId);
        setRaceWeekend(weekend);
      }
    } catch (error) {
      console.error('Error loading race weekend:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadData();
  };

  const openDayModal = (day?: ItineraryDay) => {
    if (day) {
      setEditingDay(day);
      setDayForm({
        title: day.title,
        description: day.description || '',
        date: day.date,
        imageUrl: day.imageUrl || ''
      });
    } else {
      setEditingDay(null);
      setDayForm({
        title: '',
        description: '',
        date: '',
        imageUrl: ''
      });
    }
    setModalVisible(true);
  };

  const closeDayModal = () => {
    setModalVisible(false);
    setEditingDay(null);
    setDayForm({
      title: '',
      description: '',
      date: '',
      imageUrl: ''
    });
  };

  const saveDay = async () => {
    if (!dayForm.title.trim() || !dayForm.date || !raceWeekendId) {
      showAlert('Error', 'Please fill in all required fields.', [{ text: 'OK' }]);
      return;
    }

    try {
      if (editingDay) {
        await itineraryService.updateDay(raceWeekendId, editingDay.id, {
          title: dayForm.title.trim(),
          description: dayForm.description.trim(),
          date: dayForm.date,
          imageUrl: dayForm.imageUrl.trim() || undefined
        });
      } else {
        await itineraryService.addDayToWeekend(raceWeekendId, {
          title: dayForm.title.trim(),
          description: dayForm.description.trim(),
          date: dayForm.date,
          imageUrl: dayForm.imageUrl.trim() || undefined,
          scheduleItems: []
        });
      }
      
      closeDayModal();
      loadData();
    } catch (error) {
      console.error('Error saving day:', error);
      showAlert('Error', 'Failed to save day. Please try again.', [{ text: 'OK' }]);
    }
  };

  const deleteDay = async (day: ItineraryDay) => {
    if (!raceWeekendId) return;
    
    showAlert(
      'Delete Day',
      `Are you sure you want to delete "${day.title}"? This will permanently delete all schedule items for this day.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await itineraryService.deleteDay(raceWeekendId, day.id);
              if (success) {
                await loadData();
              } else {
                showAlert('Error', 'Failed to delete day.', [{ text: 'OK' }]);
              }
            } catch (error) {
              console.error('Error deleting day:', error);
              showAlert('Error', 'Failed to delete day.', [{ text: 'OK' }]);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading race weekend...</Text>
      </View>
    );
  }

  if (!raceWeekend) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Race weekend not found</Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color={colors.primaryText} />
          <Text style={[styles.backButtonText, { color: colors.primaryText }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Sort days by date
  const sortedDays = [...raceWeekend.days].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => openDayModal()}
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
        
        {raceWeekend.imageUrl && (
          <Image
            source={{ uri: raceWeekend.imageUrl }}
            style={styles.weekendImage}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>{raceWeekend.title}</Text>
          {raceWeekend.description && (
            <Text style={[styles.description, { color: colors.textSecondary }]}>{raceWeekend.description}</Text>
          )}
          <View style={styles.weekendMeta}>
            <View style={styles.metaItem}>
              <Calendar size={16} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {formatDate(raceWeekend.startDate)} - {formatDate(raceWeekend.endDate)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {sortedDays.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Calendar size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Days Scheduled</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Add days to this race weekend to start planning your schedule.
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              onPress={() => openDayModal()}
            >
              <Plus size={20} color={colors.primaryText} />
              <Text style={[styles.emptyButtonText, { color: colors.primaryText }]}>Add First Day</Text>
            </TouchableOpacity>
          </View>
        ) : (
          sortedDays.map((day) => (
            <TouchableOpacity
              key={day.id}
              style={[styles.dayCard, { backgroundColor: colors.surface }]}
              onPress={() => router.push(`/itinerary/${raceWeekendId}/${day.id}`)}
              activeOpacity={0.7}
            >
              {day.imageUrl && (
                <Image
                  source={{ uri: day.imageUrl }}
                  style={styles.dayImage}
                  resizeMode="cover"
                />
              )}
              
              <View style={styles.dayContent}>
                <View style={styles.dayHeader}>
                  <View style={styles.dayInfo}>
                    <Text style={[styles.dayTitle, { color: colors.text }]}>{day.title}</Text>
                    <Text style={[styles.dayDate, { color: colors.textSecondary }]}>
                      {formatDate(day.date)}
                    </Text>
                    {day.description && (
                      <Text style={[styles.dayDescription, { color: colors.textTertiary }]} numberOfLines={2}>
                        {day.description}
                      </Text>
                    )}
                    <View style={styles.dayMeta}>
                      <View style={styles.metaItem}>
                        <Clock size={14} color={colors.textSecondary} />
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                          {day.scheduleItems.length} event{day.scheduleItems.length === 1 ? '' : 's'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.dayActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.surfaceSecondary }]}
                      onPress={(e) => {
                        e.stopPropagation();
                        openDayModal(day);
                      }}
                    >
                      <Edit3 size={16} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.surfaceSecondary }]}
                      onPress={(e) => {
                        e.stopPropagation();
                        deleteDay(day);
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
        onRequestClose={closeDayModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeDayModal}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingDay ? 'Edit Day' : 'New Day'}
            </Text>
            <TouchableOpacity onPress={saveDay}>
              <Text style={[styles.modalSave, { color: colors.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Day Title *</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g., Practice Day, Qualifying Day"
                placeholderTextColor={colors.textTertiary}
                value={dayForm.title}
                onChangeText={(title) => setDayForm({ ...dayForm, title })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Date *</Text>
              <DatePicker
                value={dayForm.date}
                onDateChange={(date) => setDayForm({ ...dayForm, date })}
                placeholder="Select date"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Description</Text>
              <TextInput
                style={[styles.textAreaInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Add details about this day..."
                placeholderTextColor={colors.textTertiary}
                value={dayForm.description}
                onChangeText={(description) => setDayForm({ ...dayForm, description })}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Day Image URL</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="https://example.com/image.jpg"
                placeholderTextColor={colors.textTertiary}
                value={dayForm.imageUrl}
                onChangeText={(imageUrl) => setDayForm({ ...dayForm, imageUrl })}
              />
              <Text style={[styles.helpText, { color: colors.textTertiary }]}>
                Optional: Add a URL to an image for this day
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  addButton: {
    padding: 8,
    borderRadius: 12,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 12,
  },
  weekendImage: {
    width: '100%',
    height: 200,
    marginBottom: 16,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 24,
    marginBottom: 12,
  },
  weekendMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
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
  dayCard: {
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
  dayImage: {
    width: '100%',
    height: 100,
  },
  dayContent: {
    padding: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dayInfo: {
    flex: 1,
    marginRight: 12,
  },
  dayTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 4,
  },
  dayDate: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginBottom: 8,
  },
  dayDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 8,
  },
  dayMeta: {
    gap: 6,
  },
  dayActions: {
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
  helpText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    marginTop: 4,
  },
});