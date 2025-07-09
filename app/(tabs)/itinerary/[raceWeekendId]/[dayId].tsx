import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal,
  Switch
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useCustomAlert } from '@/components/CustomAlert';
import { TimePicker } from '@/components/TimePicker';
import { itineraryService } from '@/services/itineraryService';
import { ItineraryDay, ScheduleItem } from '@/types/user';
import { Plus, Clock, RefreshCcw, ArrowLeft, Bell, BellOff, Trash2, CreditCard as Edit3 } from 'lucide-react-native';

export default function DayScheduleScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { raceWeekendId, dayId } = useLocalSearchParams<{ raceWeekendId: string; dayId: string }>();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [day, setDay] = useState<ItineraryDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [itemForm, setItemForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    notifications: {
      oneHour: false,
      thirtyMinutes: false,
      tenMinutes: false
    }
  });

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [raceWeekendId, dayId])
  );

  const loadData = async () => {
    try {
      if (raceWeekendId && dayId) {
        const dayData = await itineraryService.getDay(raceWeekendId, dayId);
        setDay(dayData);
      }
    } catch (error) {
      console.error('Error loading day:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadData();
  };

  const openItemModal = (item?: ScheduleItem) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        title: item.title,
        description: item.description || '',
        startTime: item.startTime,
        endTime: item.endTime || '',
        notifications: { ...item.notifications }
      });
    } else {
      setEditingItem(null);
      setItemForm({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        notifications: {
          oneHour: false,
          thirtyMinutes: false,
          tenMinutes: false
        }
      });
    }
    setModalVisible(true);
  };

  const closeItemModal = () => {
    setModalVisible(false);
    setEditingItem(null);
    setItemForm({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      notifications: {
        oneHour: false,
        thirtyMinutes: false,
        tenMinutes: false
      }
    });
  };

  const saveItem = async () => {
    if (!itemForm.title.trim() || !itemForm.startTime || !raceWeekendId || !dayId) {
      showAlert('Error', 'Please fill in the title and start time.', [{ text: 'OK' }]);
      return;
    }

    try {
      if (editingItem) {
        await itineraryService.updateScheduleItem(raceWeekendId, dayId, editingItem.id, {
          title: itemForm.title.trim(),
          description: itemForm.description.trim(),
          startTime: itemForm.startTime,
          endTime: itemForm.endTime || undefined,
          notifications: itemForm.notifications
        });
      } else {
        await itineraryService.addScheduleItem(raceWeekendId, dayId, {
          title: itemForm.title.trim(),
          description: itemForm.description.trim(),
          startTime: itemForm.startTime,
          endTime: itemForm.endTime || undefined,
          notifications: itemForm.notifications
        });
      }
      
      closeItemModal();
      loadData();
    } catch (error) {
      console.error('Error saving schedule item:', error);
      showAlert('Error', 'Failed to save schedule item. Please try again.', [{ text: 'OK' }]);
    }
  };

  const deleteItem = async (item: ScheduleItem) => {
    if (!raceWeekendId || !dayId) return;
    
    showAlert(
      'Delete Schedule Item',
      `Are you sure you want to delete "${item.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await itineraryService.deleteScheduleItem(raceWeekendId, dayId, item.id);
              if (success) {
                await loadData();
              } else {
                showAlert('Error', 'Failed to delete schedule item.', [{ text: 'OK' }]);
              }
            } catch (error) {
              console.error('Error deleting schedule item:', error);
              showAlert('Error', 'Failed to delete schedule item.', [{ text: 'OK' }]);
            }
          }
        }
      ]
    );
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
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

  const getNotificationText = (notifications: ScheduleItem['notifications']) => {
    const active = [];
    if (notifications.oneHour) active.push('1hr');
    if (notifications.thirtyMinutes) active.push('30min');
    if (notifications.tenMinutes) active.push('10min');
    
    if (active.length === 0) return 'No notifications';
    return `Notify: ${active.join(', ')} before`;
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading schedule...</Text>
      </View>
    );
  }

  if (!day) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Day not found</Text>
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

  // Sort schedule items by start time
  const sortedItems = [...day.scheduleItems].sort((a, b) => a.startTime.localeCompare(b.startTime));

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
              onPress={() => openItemModal()}
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
        
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>{day.title}</Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>{formatDate(day.date)}</Text>
          {day.description && (
            <Text style={[styles.description, { color: colors.textSecondary }]}>{day.description}</Text>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {sortedItems.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Clock size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Events Scheduled</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Add events to this day to create your schedule.
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              onPress={() => openItemModal()}
            >
              <Plus size={20} color={colors.primaryText} />
              <Text style={[styles.emptyButtonText, { color: colors.primaryText }]}>Add First Event</Text>
            </TouchableOpacity>
          </View>
        ) : (
          sortedItems.map((item) => (
            <View key={item.id} style={[styles.itemCard, { backgroundColor: colors.surface }]}>
              <View style={styles.itemHeader}>
                <View style={styles.itemTime}>
                  <Text style={[styles.startTime, { color: colors.primary }]}>
                    {formatTime(item.startTime)}
                  </Text>
                  {item.endTime && (
                    <Text style={[styles.endTime, { color: colors.textSecondary }]}>
                      - {formatTime(item.endTime)}
                    </Text>
                  )}
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.surfaceSecondary }]}
                    onPress={() => openItemModal(item)}
                  >
                    <Edit3 size={16} color={colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.surfaceSecondary }]}
                    onPress={() => deleteItem(item)}
                  >
                    <Trash2 size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.itemContent}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
                {item.description && (
                  <Text style={[styles.itemDescription, { color: colors.textSecondary }]}>
                    {item.description}
                  </Text>
                )}
                
                <View style={styles.notificationInfo}>
                  {(item.notifications.oneHour || item.notifications.thirtyMinutes || item.notifications.tenMinutes) ? (
                    <Bell size={14} color={colors.primary} />
                  ) : (
                    <BellOff size={14} color={colors.textTertiary} />
                  )}
                  <Text style={[styles.notificationText, { color: colors.textTertiary }]}>
                    {getNotificationText(item.notifications)}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeItemModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeItemModal}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingItem ? 'Edit Event' : 'New Event'}
            </Text>
            <TouchableOpacity onPress={saveItem}>
              <Text style={[styles.modalSave, { color: colors.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Event Title *</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g., Track Walk, Practice Session"
                placeholderTextColor={colors.textTertiary}
                value={itemForm.title}
                onChangeText={(title) => setItemForm({ ...itemForm, title })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Description</Text>
              <TextInput
                style={[styles.textAreaInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Add details about this event..."
                placeholderTextColor={colors.textTertiary}
                value={itemForm.description}
                onChangeText={(description) => setItemForm({ ...itemForm, description })}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.timeRow}>
              <View style={styles.timeColumn}>
                <TimePicker
                  label="Start Time *"
                  value={itemForm.startTime}
                  onTimeChange={(startTime) => setItemForm({ ...itemForm, startTime })}
                  placeholder="Select start time"
                />
              </View>
              <View style={styles.timeColumn}>
                <TimePicker
                  label="End Time"
                  value={itemForm.endTime}
                  onTimeChange={(endTime) => setItemForm({ ...itemForm, endTime })}
                  placeholder="Select end time"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Notifications</Text>
              <Text style={[styles.helpText, { color: colors.textTertiary }]}>
                Choose when to receive notifications before this event
              </Text>
              
              <View style={styles.notificationOptions}>
                <View style={styles.notificationOption}>
                  <Text style={[styles.notificationLabel, { color: colors.text }]}>1 Hour Before</Text>
                  <Switch
                    value={itemForm.notifications.oneHour}
                    onValueChange={(value) => setItemForm({
                      ...itemForm,
                      notifications: { ...itemForm.notifications, oneHour: value }
                    })}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.surface}
                  />
                </View>
                
                <View style={styles.notificationOption}>
                  <Text style={[styles.notificationLabel, { color: colors.text }]}>30 Minutes Before</Text>
                  <Switch
                    value={itemForm.notifications.thirtyMinutes}
                    onValueChange={(value) => setItemForm({
                      ...itemForm,
                      notifications: { ...itemForm.notifications, thirtyMinutes: value }
                    })}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.surface}
                  />
                </View>
                
                <View style={styles.notificationOption}>
                  <Text style={[styles.notificationLabel, { color: colors.text }]}>10 Minutes Before</Text>
                  <Switch
                    value={itemForm.notifications.tenMinutes}
                    onValueChange={(value) => setItemForm({
                      ...itemForm,
                      notifications: { ...itemForm.notifications, tenMinutes: value }
                    })}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.surface}
                  />
                </View>
              </View>
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
  headerContent: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 24,
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
  itemCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  startTime: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  endTime: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    gap: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  itemDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 20,
  },
  notificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notificationText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
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
  timeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  timeColumn: {
    flex: 1,
  },
  helpText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    marginBottom: 16,
  },
  notificationOptions: {
    gap: 16,
  },
  notificationOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
});