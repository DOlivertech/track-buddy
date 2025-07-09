import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { WeatherData, UserSettings } from '@/types/weather';
import { TrackNote, SessionMetadata } from '@/types/user';
import { weatherService } from '@/services/weatherService';
import { storageService } from '@/services/storageService';
import { userService } from '@/services/userService';
import { sessionService } from '@/services/sessionService';
import { racingTracks } from '@/data/racingTracks';
import { useTheme } from '@/contexts/ThemeContext';
import { WeatherIcon } from '@/components/WeatherIcon';
import { WeatherMetric } from '@/components/WeatherMetric';
import { RaceConditionBadge } from '@/components/RaceConditionBadge';
import { TimeOfDayBadge } from '@/components/TimeOfDayBadge';
import { 
  getRaceCondition, 
  convertTemperature, 
  convertWindSpeed,
  getCardinalDirection,
  convertPrecipitation,
  getPrecipitationUnit,
  getTemperatureUnit,
  getWindSpeedUnit 
} from '@/utils/raceConditions';
import { getTimeOfDay, getTimeOfDayDescription } from '@/utils/timeOfDay';
import { getTrackLocalTime } from '@/utils/timeZone';
import { 
  Droplets, 
  Wind, 
  Gauge, 
  Eye, 
  Sun, 
  Cloud,
  RefreshCcw,
  StickyNote,
  Plus,
  X,
  Wrench,
  Users,
  ChevronRight
} from 'lucide-react-native';

export default function CurrentWeatherScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [notes, setNotes] = useState<TrackNote[]>([]);
  const [activeSession, setActiveSession] = useState<SessionMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dismissedNotes, setDismissedNotes] = useState<Set<string>>(new Set());

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      console.log('🏠 [Current Weather] Starting loadData...');
      
      // Load active session info
      const activeSessionId = await sessionService.getActiveSessionId();
      if (activeSessionId) {
        const sessions = await sessionService.getAllSessions();
        const session = sessions.find(s => s.id === activeSessionId);
        setActiveSession(session || null);
        console.log('🏠 [Current Weather] Active session:', session?.name || 'None');
      } else {
        setActiveSession(null);
        console.log('🏠 [Current Weather] No active session');
      }
      
      const userSettings = await storageService.getSettings();
      console.log('🏠 [Current Weather] Loaded settings:', userSettings);
      setSettings(userSettings);
      
      const track = racingTracks.find(t => t.id === userSettings.selectedTrack) || racingTracks[0];
      console.log('🏠 [Current Weather] Selected track:', track.name);
      const [weather, trackNotes] = await Promise.all([
        weatherService.getWeatherData(track),
        userService.getNotes(userSettings.selectedTrack)
      ]);
      console.log('🏠 [Current Weather] Loaded notes count:', trackNotes.length);
      console.log('🏠 [Current Weather] Notes data:', trackNotes);
      setWeatherData(weather);
      setNotes(trackNotes.slice(0, 3)); // Show only first 3 notes
      console.log('🏠 [Current Weather] Set notes in state (first 3):', trackNotes.slice(0, 3).length);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const dismissNote = (noteId: string) => {
    setDismissedNotes(prev => new Set([...prev, noteId]));
  };

  const showDismissedNotes = () => {
    setDismissedNotes(new Set());
  };

  if (loading || !weatherData || !settings) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading weather data...</Text>
      </View>
    );
  }

  const raceCondition = getRaceCondition(weatherData);
  const temperature = convertTemperature(weatherData.current.temperature, settings.temperatureUnit);
  const feelsLike = convertTemperature(weatherData.current.feelsLike, settings.temperatureUnit);
  const windSpeed = convertWindSpeed(weatherData.current.windSpeed, settings.windSpeedUnit);
  const windDirection = getCardinalDirection(weatherData.current.windDirection);
  const precipitation = convertPrecipitation(weatherData.current.precipitation, settings.precipitationUnit);
  const tempUnit = getTemperatureUnit(settings.temperatureUnit);
  const windUnit = getWindSpeedUnit(settings.windSpeedUnit);
  const precipitationUnit = getPrecipitationUnit(settings.precipitationUnit);

  const timeOfDay = getTimeOfDay();
  const visibleNotes = notes.filter(note => !dismissedNotes.has(note.id));
  const hasDismissedNotes = dismissedNotes.size > 0;
  
  // Get the selected track for local time calculation
  const selectedTrack = racingTracks.find(t => t.id === settings.selectedTrack) || racingTracks[0];
  const trackLocalTime = getTrackLocalTime(selectedTrack);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        {/* Session Display - Moved to top */}
        {activeSession && (
          <TouchableOpacity
            style={[styles.sessionContainer, { backgroundColor: colors.surface }]}
            onPress={() => router.push('/sessions')}
            activeOpacity={0.7}
          >
            <View style={styles.sessionInfo}>
              {activeSession.emoji ? (
                <Text style={styles.sessionEmoji}>{activeSession.emoji}</Text>
              ) : (
                <Users size={16} color={colors.primary} />
              )}
              <Text style={[styles.sessionName, { color: colors.text }]}>{activeSession.name}</Text>
            </View>
            <ChevronRight size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        
        <View style={styles.headerContent}>
          <View style={styles.locationInfo}>
            <Text style={[styles.location, { color: colors.text }]}>{weatherData.location}</Text>
            <Text style={[styles.country, { color: colors.textSecondary }]}>{weatherData.country}</Text>
          </View>
          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCcw 
              size={24} 
              color={refreshing ? colors.textTertiary : colors.primary} 
            />
          </TouchableOpacity>
        </View>
        <View style={styles.badgesContainer}>
          <RaceConditionBadge condition={raceCondition} size="large" />
          <View style={styles.timeContainer}>
            <TimeOfDayBadge timeOfDay={timeOfDay} size="large" />
            <View style={[styles.localTimeContainer, { backgroundColor: colors.text }]}>
              <Text style={[styles.localTime, { color: colors.background }]}>
                {trackLocalTime}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.currentWeather, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
        <View style={styles.mainTemp}>
          <WeatherIcon 
            icon={weatherData.current.conditionIcon} 
            size={64} 
            color={colors.primary} 
          />
          <Text style={[styles.temperature, { color: colors.text }]}>{temperature}{tempUnit}</Text>
        </View>
        
        <View style={styles.condition}>
          <Text style={[styles.conditionText, { color: colors.textSecondary }]}>{weatherData.current.condition}</Text>
          <Text style={[styles.feelsLike, { color: colors.textTertiary }]}>Feels like {feelsLike}{tempUnit}</Text>
        </View>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metricsRow}>
          <WeatherMetric
            label="Humidity"
            value={`${weatherData.current.humidity}%`}
            icon={<Droplets size={16} color={colors.textSecondary} />}
          />
          <WeatherMetric
            label="Wind"
            value={`${windSpeed} ${windUnit} ${windDirection}`}
            icon={<Wind size={16} color={colors.textSecondary} />}
          />
        </View>
        
        <View style={styles.metricsRow}>
          <WeatherMetric
            label="Pressure"
            value={`${weatherData.current.pressure} hPa`}
            icon={<Gauge size={16} color={colors.textSecondary} />}
          />
          <WeatherMetric
            label="Visibility"
            value={`${weatherData.current.visibility} km`}
            icon={<Eye size={16} color={colors.textSecondary} />}
          />
        </View>
        
        <View style={styles.metricsRow}>
          <WeatherMetric
            label="UV Index"
            value={`${weatherData.current.uvIndex}`}
            icon={<Sun size={16} color={colors.textSecondary} />}
          />
          <WeatherMetric
            label="Cloud Cover"
            value={`${weatherData.current.cloudCover}%`}
            icon={<Cloud size={16} color={colors.textSecondary} />}
          />
        </View>
        
        <View style={styles.metricsRow}>
          <WeatherMetric
            label="Precipitation"
            value={`${precipitation} ${precipitationUnit}`}
            icon={<Droplets size={16} color={colors.textSecondary} />}
          />
        </View>
      </View>

      {(visibleNotes.length > 0 || hasDismissedNotes) && (
        <View style={[styles.notesSection, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <View style={styles.notesSectionHeader}>
            <View style={styles.notesSectionTitle}>
              <StickyNote size={20} color={colors.primary} />
              <Text style={[styles.notesSectionTitleText, { color: colors.text }]}>Recent Notes</Text>
            </View>
            <View style={styles.notesHeaderActions}>
              <TouchableOpacity
                style={[styles.quickActionButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/notes?newEntry=true')}
              >
                <Plus size={16} color={colors.primaryText} />
              </TouchableOpacity>
              {hasDismissedNotes && (
                <TouchableOpacity
                  style={[styles.showDismissedButton, { backgroundColor: colors.surfaceSecondary }]}
                  onPress={showDismissedNotes}
                >
                  <Text style={[styles.showDismissedText, { color: colors.primary }]}>
                    Show {dismissedNotes.size}
                  </Text>
                </TouchableOpacity>
              )}
              <Text style={[styles.notesCount, { color: colors.textSecondary }]}>
                {notes.length}{notes.length === 3 ? '+' : ''} notes
              </Text>
            </View>
          </View>
          
          {visibleNotes.length === 0 && hasDismissedNotes ? (
            <View style={styles.dismissedNotesMessage}>
              <Text style={[styles.dismissedNotesText, { color: colors.textSecondary }]}>
                All notes have been dismissed
              </Text>
            </View>
          ) : (
            visibleNotes.map((note) => (
            <View key={note.id} style={[styles.notePreview, { borderLeftColor: getTypeColor(note.type) }]}>
              <View style={styles.notePreviewContent}>
                <View style={styles.notePreviewMain}>
                  <Text style={[styles.notePreviewTitle, { color: colors.text }]} numberOfLines={1}>
                    {note.title}
                  </Text>
                  <Text style={[styles.notePreviewType, { color: colors.textSecondary }]}>
                    {note.type.charAt(0).toUpperCase() + note.type.slice(1)} • {new Date(note.createdAt).toLocaleDateString()}
                  </Text>
                  {note.content && (
                    <Text style={[styles.notePreviewText, { color: colors.textTertiary }]} numberOfLines={2}>
                      {note.content}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.dismissButton}
                  onPress={() => dismissNote(note.id)}
                >
                  <X size={16} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </View>
          ))
          )}
          
          {visibleNotes.length > 0 && hasDismissedNotes && (
            <View style={styles.dismissedNotesFooter}>
              <Text style={[styles.dismissedNotesFooterText, { color: colors.textTertiary }]}>
                {dismissedNotes.size} note{dismissedNotes.size === 1 ? '' : 's'} dismissed
              </Text>
            </View>
          )}
        </View>
      )}

      {notes.length > 0 && visibleNotes.length === 0 && !hasDismissedNotes && (
        <View style={[styles.notesSection, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <View style={styles.notesSectionHeader}>
            <View style={styles.notesSectionTitle}>
              <StickyNote size={20} color={colors.primary} />
              <Text style={[styles.notesSectionTitleText, { color: colors.text }]}>Recent Notes</Text>
            </View>
          </View>
          <View style={styles.dismissedNotesMessage}>
            <Text style={[styles.dismissedNotesText, { color: colors.textSecondary }]}>
              No recent notes to display
            </Text>
          </View>
        </View>
      )}

      {notes.length === 0 && (
        <View style={[styles.notesSection, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <View style={styles.notesSectionHeader}>
            <View style={styles.notesSectionTitle}>
              <StickyNote size={20} color={colors.primary} />
              <Text style={[styles.notesSectionTitleText, { color: colors.text }]}>Recent Notes</Text>
            </View>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/notes?newEntry=true')}
            >
              <Plus size={16} color={colors.primaryText} />
            </TouchableOpacity>
          </View>
          <View style={styles.dismissedNotesMessage}>
            <Text style={[styles.dismissedNotesText, { color: colors.textSecondary }]}>
              No notes available for this track
            </Text>
          </View>
        </View>
      )}

      {false && (
        <View style={[styles.notesSection, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <View style={styles.notesSectionHeader}>
            <View style={styles.notesSectionTitle}>
              <StickyNote size={20} color={colors.primary} />
              <Text style={[styles.notesSectionTitleText, { color: colors.text }]}>Recent Notes</Text>
            </View>
            <View style={styles.notesHeaderActions}>
              {hasDismissedNotes && (
                <TouchableOpacity
                  style={[styles.showDismissedButton, { backgroundColor: colors.surfaceSecondary }]}
                  onPress={showDismissedNotes}
                >
                  <Text style={[styles.showDismissedText, { color: colors.primary }]}>
                    Show {dismissedNotes.size}
                  </Text>
                </TouchableOpacity>
              )}
              <Text style={[styles.notesCount, { color: colors.textSecondary }]}>
                {notes.length}{notes.length === 3 ? '+' : ''} notes
              </Text>
            </View>
          </View>
          
          {visibleNotes.map((note) => (
            <View key={note.id} style={[styles.notePreview, { borderLeftColor: getTypeColor(note.type) }]}>
              <View style={styles.notePreviewContent}>
                <View style={styles.notePreviewMain}>
                  <Text style={[styles.notePreviewTitle, { color: colors.text }]} numberOfLines={1}>
                    {note.title}
                  </Text>
                  <Text style={[styles.notePreviewType, { color: colors.textSecondary }]}>
                    {note.type.charAt(0).toUpperCase() + note.type.slice(1)} • {new Date(note.createdAt).toLocaleDateString()}
                  </Text>
                  {note.content && (
                    <Text style={[styles.notePreviewText, { color: colors.textTertiary }]} numberOfLines={2}>
                      {note.content}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.dismissButton}
                  onPress={() => dismissNote(note.id)}
                >
                  <X size={16} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.raceInfo, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
        <Text style={[styles.raceInfoTitle, { color: colors.text }]}>Race Conditions</Text>
        <Text style={[styles.raceInfoDescription, { color: colors.textSecondary }]}>
          {getRaceConditionDescription(raceCondition)}
        </Text>
        
        <View style={styles.timeOfDayInfo}>
          <Text style={[styles.timeOfDayTitle, { color: colors.text }]}>Time of Day</Text>
          <Text style={[styles.timeOfDayDescription, { color: colors.textSecondary }]}>
            {getTimeOfDayDescription(timeOfDay)}
          </Text>
        </View>
        
        <View style={styles.quickActionsContainer}>
          <Text style={[styles.quickActionsTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.surfaceSecondary }]}
              onPress={() => router.push('/notes?newEntry=true')}
            >
              <StickyNote size={24} color={colors.primary} />
              <Text style={[styles.quickActionText, { color: colors.text }]}>Add Note</Text>
              <Text style={[styles.quickActionSubtext, { color: colors.textSecondary }]}>For today</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.surfaceSecondary }]}
              onPress={() => router.push('/setup?newEntry=true')}
            >
              <Wrench size={24} color={colors.primary} />
              <Text style={[styles.quickActionText, { color: colors.text }]}>Add Setup</Text>
              <Text style={[styles.quickActionSubtext, { color: colors.textSecondary }]}>For today</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function getTypeColor(type: TrackNote['type']) {
  switch (type) {
    case 'condition':
      return '#3B82F6';
    case 'driver':
      return '#16A34A';
    case 'setup':
      return '#F59E0B';
    default:
      return '#64748B';
  }
}

function getRaceConditionDescription(condition: any): string {
  switch (condition.type) {
    case 'OPTIMAL':
      return 'Perfect conditions for racing with clear skies and minimal wind.';
    case 'WET':
      return 'Wet track conditions expected. Drivers should use intermediate or wet tires.';
    case 'WINDY':
      return 'High winds may affect aerodynamics and car handling.';
    case 'POOR_VIS':
      return 'Poor visibility conditions may require extra caution.';
    case 'EXTREME':
      return 'Extreme weather conditions. Consider postponing race activities.';
    default:
      return 'Current weather conditions for racing.';
  }
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
    marginBottom: 16,
  },
  locationInfo: {
    flex: 1,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 12,
  },
  sessionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionEmoji: {
    fontSize: 16,
  },
  sessionName: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  location: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  country: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginTop: 4,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  localTimeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  localTime: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    letterSpacing: 1,
  },
  currentWeather: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mainTemp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  temperature: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  condition: {
    alignItems: 'center',
  },
  conditionText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  feelsLike: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    marginTop: 4,
  },
  metrics: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  notesSection: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 16,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  notesSectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notesSectionTitleText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  notesHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickActionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  showDismissedButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  showDismissedText: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  notesCount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  notePreview: {
    borderLeftWidth: 3,
    marginBottom: 12,
  },
  notePreviewContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 12,
  },
  notePreviewMain: {
    flex: 1,
  },
  notePreviewTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  notePreviewType: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginTop: 2,
  },
  notePreviewText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 16,
    marginTop: 4,
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
  dismissedNotesMessage: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  dismissedNotesText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  dismissedNotesFooter: {
    alignItems: 'center',
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  dismissedNotesFooterText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
  },
  raceInfo: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  raceInfoTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 12,
  },
  raceInfoDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 20,
  },
  timeOfDayInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  timeOfDayTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 8,
  },
  timeOfDayDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 20,
  },
  quickActionsContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  quickActionsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginTop: 8,
  },
  quickActionSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    marginTop: 2,
  },
});