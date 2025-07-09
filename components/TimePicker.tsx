import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Clock, X } from 'lucide-react-native';

interface TimePickerProps {
  value: string; // HH:MM format (24-hour)
  onTimeChange: (time: string) => void;
  placeholder?: string;
  label?: string;
}

export function TimePicker({ value, onTimeChange, placeholder = "Select time", label }: TimePickerProps) {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState(value ? parseInt(value.split(':')[0]) : 9);
  const [selectedMinute, setSelectedMinute] = useState(value ? parseInt(value.split(':')[1]) : 0);

  const formatDisplayTime = (timeString: string) => {
    if (!timeString) return placeholder;
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes.padStart(2, '0')} ${ampm}`;
  };

  const formatTimeToString = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const handleTimeSelect = () => {
    const timeString = formatTimeToString(selectedHour, selectedMinute);
    onTimeChange(timeString);
    setModalVisible(false);
  };

  const generateHours = () => {
    return Array.from({ length: 24 }, (_, i) => i);
  };

  const generateMinutes = () => {
    return Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10, 15, ..., 55
  };

  const hours = generateHours();
  const minutes = generateMinutes();

  return (
    <View>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      <TouchableOpacity
        style={[styles.timeButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => setModalVisible(true)}
      >
        <Clock size={20} color={colors.textSecondary} />
        <Text style={[styles.timeText, { color: value ? colors.text : colors.textTertiary }]}>
          {formatDisplayTime(value)}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.timePickerContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.timePickerHeader}>
              <Text style={[styles.timePickerTitle, { color: colors.text }]}>Select Time</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.timePickerContent}>
              <View style={styles.timeColumn}>
                <Text style={[styles.columnTitle, { color: colors.text }]}>Hour</Text>
                <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                  {hours.map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        styles.timeOption,
                        { backgroundColor: colors.surfaceSecondary },
                        selectedHour === hour && { backgroundColor: colors.primary }
                      ]}
                      onPress={() => setSelectedHour(hour)}
                    >
                      <Text style={[
                        styles.timeOptionText,
                        { color: colors.text },
                        selectedHour === hour && { color: colors.primaryText, fontFamily: 'Inter-Bold' }
                      ]}>
                        {hour.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.separator}>
                <Text style={[styles.separatorText, { color: colors.text }]}>:</Text>
              </View>

              <View style={styles.timeColumn}>
                <Text style={[styles.columnTitle, { color: colors.text }]}>Minute</Text>
                <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                  {minutes.map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      style={[
                        styles.timeOption,
                        { backgroundColor: colors.surfaceSecondary },
                        selectedMinute === minute && { backgroundColor: colors.primary }
                      ]}
                      onPress={() => setSelectedMinute(minute)}
                    >
                      <Text style={[
                        styles.timeOptionText,
                        { color: colors.text },
                        selectedMinute === minute && { color: colors.primaryText, fontFamily: 'Inter-Bold' }
                      ]}>
                        {minute.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.timePreview}>
              <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Selected Time:</Text>
              <Text style={[styles.previewTime, { color: colors.primary }]}>
                {formatDisplayTime(formatTimeToString(selectedHour, selectedMinute))}
              </Text>
            </View>

            <View style={styles.timePickerActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.surfaceSecondary }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.actionButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={handleTimeSelect}
              >
                <Text style={[styles.actionButtonText, { color: colors.primaryText }]}>Select</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  timeText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  timePickerContainer: {
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  timePickerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  timePickerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  timeColumn: {
    flex: 1,
    alignItems: 'center',
  },
  columnTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 12,
  },
  scrollContainer: {
    maxHeight: 200,
    width: '100%',
  },
  timeOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
    alignItems: 'center',
  },
  timeOptionText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  separator: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  separatorText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  timePreview: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  previewLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginBottom: 4,
  },
  previewTime: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  timePickerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
});