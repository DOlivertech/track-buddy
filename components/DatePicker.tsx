import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react-native';

interface DatePickerProps {
  value: string; // YYYY-MM-DD format
  onDateChange: (date: string) => void;
  placeholder?: string;
  label?: string;
}

export function DatePicker({ value, onDateChange, placeholder = "Select date", label }: DatePickerProps) {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : new Date());

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return placeholder;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateToString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onDateChange(formatDateToString(date));
    setModalVisible(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const today = new Date();
    const selectedDateString = value;
    
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.toDateString() === today.toDateString();
      const isSelected = formatDateToString(currentDate) === selectedDateString;
      
      days.push({
        date: currentDate,
        day: currentDate.getDate(),
        isCurrentMonth,
        isToday,
        isSelected
      });
    }
    
    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      <TouchableOpacity
        style={[styles.dateButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => setModalVisible(true)}
      >
        <Calendar size={20} color={colors.textSecondary} />
        <Text style={[styles.dateText, { color: value ? colors.text : colors.textTertiary }]}>
          {formatDisplayDate(value)}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.calendarContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.calendarHeader}>
              <View style={styles.monthNavigation}>
                <TouchableOpacity
                  style={[styles.navButton, { backgroundColor: colors.surfaceSecondary }]}
                  onPress={() => navigateMonth('prev')}
                >
                  <ChevronLeft size={20} color={colors.text} />
                </TouchableOpacity>
                
                <Text style={[styles.monthYear, { color: colors.text }]}>
                  {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </Text>
                
                <TouchableOpacity
                  style={[styles.navButton, { backgroundColor: colors.surfaceSecondary }]}
                  onPress={() => navigateMonth('next')}
                >
                  <ChevronRight size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekDaysContainer}>
              {weekDays.map((day) => (
                <Text key={day} style={[styles.weekDay, { color: colors.textSecondary }]}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.daysContainer}>
              {generateCalendarDays().map((dayInfo, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayButton,
                    !dayInfo.isCurrentMonth && styles.dayButtonInactive,
                    dayInfo.isToday && { backgroundColor: colors.primary + '20' },
                    dayInfo.isSelected && { backgroundColor: colors.primary }
                  ]}
                  onPress={() => handleDateSelect(dayInfo.date)}
                  disabled={!dayInfo.isCurrentMonth}
                >
                  <Text style={[
                    styles.dayText,
                    { color: colors.text },
                    !dayInfo.isCurrentMonth && { color: colors.textTertiary },
                    dayInfo.isSelected && { color: colors.primaryText, fontFamily: 'Inter-Bold' }
                  ]}>
                    {dayInfo.day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[styles.quickActionButton, { backgroundColor: colors.surfaceSecondary }]}
                onPress={() => handleDateSelect(new Date())}
              >
                <Text style={[styles.quickActionText, { color: colors.text }]}>Today</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.quickActionButton, { backgroundColor: colors.surfaceSecondary }]}
                onPress={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  handleDateSelect(tomorrow);
                }}
              >
                <Text style={[styles.quickActionText, { color: colors.text }]}>Tomorrow</Text>
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  dateText: {
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
  calendarContainer: {
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthYear: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    paddingVertical: 8,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayButton: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  dayButtonInactive: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
});