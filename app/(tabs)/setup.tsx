import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { useCustomAlert } from '@/components/CustomAlert';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DatePicker } from '@/components/DatePicker';
import { userService } from '@/services/userService';
import { storageService } from '@/services/storageService';
import { TrackSetup } from '@/types/user';
import { UserSettings } from '@/types/weather';
import { racingTracks } from '@/data/racingTracks';
import { Plus, CreditCard as Edit3, Trash2, Wrench, Calendar, RefreshCcw, ChevronDown, ChevronRight, MapPin } from 'lucide-react-native';
import { WeatherData } from '@/types/weather';
import { weatherService } from '@/services/weatherService';

export default function SetupScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { newEntry } = useLocalSearchParams();
  const [setups, setSetups] = useState<TrackSetup[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSetup, setEditingSetup] = useState<TrackSetup | null>(null);
  const { showAlert, AlertComponent } = useCustomAlert();
  const [expandedTracks, setExpandedTracks] = useState<Set<string>>(new Set());
  const [sortByTrack, setSortByTrack] = useState(false);
  const [setupForm, setSetupForm] = useState({
    name: '',
    date: '',
    notes: '',
    trackSnapshot: null as TrackSetup['trackSnapshot'] | null,
    setupData: {
      tirePressures: { frontLeft: '', frontRight: '', rearLeft: '', rearRight: '' },
      springRates: { frontLeft: '', frontRight: '', rearLeft: '', rearRight: '' },
      swayBars: { front: '', rear: '' },
      wings: { front: '', rear: '' },
      fuelLevel: ''
    }
  });

  useFocusEffect(
    React.useCallback(() => {
      loadData();
      
      // Handle newEntry parameter
      if (newEntry === 'true') {
        openSetupModal();
        // Clear the parameter to prevent reopening on subsequent focus
        router.replace('/setup');
      }
    }, [])
  );

  const loadData = async () => {
    try {
      console.log('🔧 [Setup] Starting loadData...');
      const userSettings = await storageService.getSettings();
      console.log('🔧 [Setup] Loaded settings:', userSettings);
      setSettings(userSettings);
      
      if (userSettings?.selectedTrack) {
        const track = racingTracks.find(t => t.id === userSettings.selectedTrack) || racingTracks[0];
        console.log('🔧 [Setup] Selected track:', track.name);
        const [trackSetups, weather] = await Promise.all([
          userService.getSetups(), // Get all setups, not just for selected track
          weatherService.getWeatherData(track)
        ]);
        console.log('🔧 [Setup] Loaded setups count:', trackSetups.length);
        console.log('🔧 [Setup] Setups data:', trackSetups);
        // Sort by date descending (most recent first)
        trackSetups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setSetups(trackSetups);
        console.log('🔧 [Setup] Set setups in state:', trackSetups.length);
        setCurrentWeather(weather);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadData();
  };

  const openSetupModal = (setup?: TrackSetup) => {
    if (setup) {
      setEditingSetup(setup);
      setSetupForm({
        name: setup.name,
        date: setup.date,
        notes: setup.notes,
        trackSnapshot: setup.trackSnapshot || null,
        setupData: setup.setupData || {
          tirePressures: { frontLeft: '', frontRight: '', rearLeft: '', rearRight: '' },
          springRates: { frontLeft: '', frontRight: '', rearLeft: '', rearRight: '' },
          swayBars: { front: '', rear: '' },
          wings: { front: '', rear: '' },
          fuelLevel: ''
        }
      });
    } else {
      setEditingSetup(null);
      setSetupForm({
        name: '',
        date: new Date().toISOString().split('T')[0], // Default to today's date
        notes: '',
        trackSnapshot: null,
        setupData: {
          tirePressures: { frontLeft: '', frontRight: '', rearLeft: '', rearRight: '' },
          springRates: { frontLeft: '', frontRight: '', rearLeft: '', rearRight: '' },
          swayBars: { front: '', rear: '' },
          wings: { front: '', rear: '' },
          fuelLevel: ''
        }
      });
    }
    setModalVisible(true);
  };

  const closeSetupModal = () => {
    setModalVisible(false);
    setEditingSetup(null);
    setSetupForm({
      name: '',
      date: '',
      notes: '',
      trackSnapshot: null,
      setupData: {
        tirePressures: { frontLeft: '', frontRight: '', rearLeft: '', rearRight: '' },
        springRates: { frontLeft: '', frontRight: '', rearLeft: '', rearRight: '' },
        swayBars: { front: '', rear: '' },
        wings: { front: '', rear: '' },
        fuelLevel: ''
      }
    });
  };

  const saveSetup = async () => {
    if (!setupForm.name.trim() || !setupForm.date || !settings?.selectedTrack) return;

    try {
      if (editingSetup) {
        await userService.updateSetup(editingSetup.id, {
          name: setupForm.name.trim(),
          date: setupForm.date,
          notes: setupForm.notes.trim(),
          trackSnapshot: setupForm.trackSnapshot,
          setupData: setupForm.setupData
        });
      } else {
        await userService.saveSetup({
          trackId: settings.selectedTrack,
          name: setupForm.name.trim(),
          date: setupForm.date,
          notes: setupForm.notes.trim(),
          trackSnapshot: setupForm.trackSnapshot,
          setupData: setupForm.setupData
        });
      }
      
      closeSetupModal();
      loadData();
    } catch (error) {
      console.error('Error saving setup:', error);
      showAlert('Error', 'Failed to save setup. Please try again.', [{ text: 'OK' }]);
    }
  };

  const deleteSetup = async (setupId: string) => {
    showAlert(
      'Delete Setup',
      'Are you sure you want to delete this setup?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await userService.deleteSetup(setupId);
              if (success) {
                // Add a small delay to ensure AsyncStorage write completes before reloading
                setTimeout(async () => {
                  await loadData();
                }, 100); // 100ms delay
              } else {
                showAlert('Error', 'Setup not found or could not be deleted.', [{ text: 'OK' }]);
              }
            } catch (error) {
              console.error('Error deleting setup:', error);
              showAlert('Error', 'Failed to delete setup. Please try again.', [{ text: 'OK' }]);
            }
          }
        }
      ]
    );
  };

  const captureCurrentWeather = () => {
    if (!currentWeather) return;
    
    const weatherSnapshot = {
      temperature: currentWeather.current.temperature,
      humidity: currentWeather.current.humidity,
      windSpeed: currentWeather.current.windSpeed,
      windDirection: currentWeather.current.windDirection,
      condition: currentWeather.current.condition,
      pressure: currentWeather.current.pressure,
      capturedAt: new Date().toISOString()
    };
    
    setSetupForm(prev => ({
      ...prev,
      notes: prev.notes + (prev.notes ? '\n\n' : '') + 
        `Weather Conditions (${new Date().toLocaleString()}):\n` +
        `Temperature: ${weatherSnapshot.temperature}°C\n` +
        `Humidity: ${weatherSnapshot.humidity}%\n` +
        `Wind: ${weatherSnapshot.windSpeed} km/h\n` +
        `Condition: ${weatherSnapshot.condition}\n` +
        `Pressure: ${weatherSnapshot.pressure} hPa`
    }));
  };

  const captureCurrentTrack = () => {
    if (!settings?.selectedTrack) return;
    
    const track = racingTracks.find(t => t.id === settings.selectedTrack);
    if (!track) return;
    
    const trackSnapshot = {
      id: track.id,
      name: track.name,
      country: track.country,
      coordinates: track.coordinates,
      capturedAt: new Date().toISOString()
    };
    
    setSetupForm(prev => ({
      ...prev,
      trackSnapshot
    }));
  };

  const toggleTrackExpansion = (trackKey: string) => {
    setExpandedTracks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trackKey)) {
        newSet.delete(trackKey);
      } else {
        newSet.add(trackKey);
      }
      return newSet;
    });
  };

  const groupSetupsByTrack = (setups: TrackSetup[]) => {
    const grouped: { [key: string]: { track: any; setups: TrackSetup[] } } = {};
    
    setups.forEach(setup => {
      let trackKey;
      let trackInfo;
      
      if (setup.trackSnapshot) {
        trackKey = setup.trackSnapshot.id;
        trackInfo = setup.trackSnapshot;
      } else {
        trackKey = 'uncategorized';
        trackInfo = null;
      }
      
      if (!grouped[trackKey]) {
        grouped[trackKey] = {
          track: trackInfo,
          setups: []
        };
      }
      grouped[trackKey].setups.push(setup);
    });
    
    // Sort tracks: current track first, then alphabetically, uncategorized last
    return Object.entries(grouped).sort(([keyA, groupA], [keyB, groupB]) => {
      if (keyA === 'uncategorized') return 1;
      if (keyB === 'uncategorized') return -1;
      if (keyA === settings?.selectedTrack) return -1;
      if (keyB === settings?.selectedTrack) return 1;
      
      const nameA = groupA.track?.name || '';
      const nameB = groupB.track?.name || '';
      return nameA.localeCompare(nameB);
    });
  };

  const updateSetupData = (category: string, field: string, value: string) => {
    setSetupForm(prev => ({
      ...prev,
      setupData: {
        ...prev.setupData,
        [category]: {
          ...prev.setupData[category as keyof typeof prev.setupData],
          [field]: value
        }
      }
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading setups...</Text>
      </View>
    );
  }

  const selectedTrack = racingTracks.find(t => t.id === settings?.selectedTrack) || racingTracks[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Track Setups</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{selectedTrack.name}</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => openSetupModal()}
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
        {/* Sort Toggle */}
        <View style={styles.sortContainer}>
          <TouchableOpacity
            style={[
              styles.sortButton,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
              sortByTrack && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}
            onPress={() => setSortByTrack(!sortByTrack)}
          >
            <Text style={[
              styles.sortButtonText,
              { color: colors.textSecondary },
              sortByTrack && { color: colors.primaryText }
            ]}>
              {sortByTrack ? 'Sort by Date' : 'Sort by Track'}
            </Text>
          </TouchableOpacity>
        </View>

        {setups.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Wrench size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Setups Yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Start tracking your car setups for different track conditions and sessions.
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              onPress={() => openSetupModal()}
            >
              <Plus size={20} color={colors.primaryText} />
              <Text style={[styles.emptyButtonText, { color: colors.primaryText }]}>Add First Setup</Text>
            </TouchableOpacity>
          </View>
        ) : sortByTrack ? (
          groupSetupsByTrack(setups).map(([trackKey, { track, setups: trackSetups }]) => {
            const isTrackExpanded = expandedTracks.has(trackKey);
            const isUncategorized = trackKey === 'uncategorized';
            const isCurrentTrack = trackKey === settings?.selectedTrack;
            
            return (
              <View key={trackKey} style={[styles.trackGroup, { backgroundColor: colors.surface }]}>
                <TouchableOpacity
                  style={styles.trackHeader}
                  onPress={() => toggleTrackExpansion(trackKey)}
                >
                  <View style={styles.trackHeaderLeft}>
                    {isTrackExpanded ? (
                      <ChevronDown size={20} color={colors.textSecondary} />
                    ) : (
                      <ChevronRight size={20} color={colors.textSecondary} />
                    )}
                    <MapPin size={20} color={isCurrentTrack ? colors.primary : colors.textSecondary} />
                    <View style={styles.trackInfo}>
                      <Text style={[styles.trackName, { color: colors.text }]}>
                        {isUncategorized ? 'Uncategorized Setups' : String(track?.name || 'Unknown Track')}
                        {isCurrentTrack && ' (Current)'}
                      </Text>
                      {!isUncategorized && track && (
                        <Text style={[styles.trackCountry, { color: colors.textSecondary }]}>
                          {String(track.country || 'Unknown Country')}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text style={[styles.trackSetupCount, { color: colors.textTertiary }]}>
                    {trackSetups.length} setup{trackSetups.length === 1 ? '' : 's'}
                  </Text>
                </TouchableOpacity>
                
                {isTrackExpanded && (
                  <View style={styles.trackContent}>
                    {trackSetups.map((setup) => (
                      <View key={setup.id} style={[styles.setupCard, { backgroundColor: colors.surfaceSecondary }]}>
                        <View style={styles.setupHeader}>
                          <View style={styles.setupTitle}>
                            <View style={[styles.setupIcon, { backgroundColor: colors.primary }]}>
                              <Wrench size={20} color={colors.primaryText} />
                            </View>
                            <View style={styles.setupTitleText}>
                              <Text style={[styles.setupCardTitle, { color: colors.text }]}>{String(setup.name || 'Unnamed Setup')}</Text>
                              <View style={styles.setupDate}>
                                <Calendar size={14} color={colors.textSecondary} />
                                <Text style={[styles.setupDateText, { color: colors.textSecondary }]}>
                                  {formatDate(setup.date)}
                                </Text>
                              </View>
                            </View>
                          </View>
                          <View style={styles.setupActions}>
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={() => openSetupModal(setup)}
                            >
                              <Edit3 size={16} color={colors.textSecondary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={() => deleteSetup(setup.id)}
                            >
                              <Trash2 size={16} color={colors.error} />
                            </TouchableOpacity>
                          </View>
                        </View>
                        {setup.notes && (
                          <Text style={[styles.setupNotes, { color: colors.textSecondary }]}>{String(setup.notes)}</Text>
                        )}
                        {setup.setupData && (
                          <View style={styles.setupDataPreview}>
                            <Text style={[styles.setupDataTitle, { color: colors.text }]}>Setup Data:</Text>
                            <View style={styles.setupDataRow}>
                              <Text style={[styles.setupDataLabel, { color: colors.textSecondary }]}>Tire Pressures:</Text>
                              <Text style={[styles.setupDataText, { color: colors.textTertiary }]}>
                                FL: {String(setup.setupData.tirePressures?.frontLeft || 'N/A')} | FR: {String(setup.setupData.tirePressures?.frontRight || 'N/A')} | RL: {String(setup.setupData.tirePressures?.rearLeft || 'N/A')} | RR: {String(setup.setupData.tirePressures?.rearRight || 'N/A')}
                              </Text>
                            </View>
                            {setup.setupData.fuelLevel && String(setup.setupData.fuelLevel).trim() && (
                              <View style={styles.setupDataRow}>
                                <Text style={[styles.setupDataLabel, { color: colors.textSecondary }]}>Fuel:</Text>
                                <Text style={[styles.setupDataText, { color: colors.textTertiary }]}>
                                  {String(setup.setupData.fuelLevel)}
                                </Text>
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })
        ) : (
          setups.map((setup) => (
            <View key={setup.id} style={[styles.setupCard, { backgroundColor: colors.surface }]}>
              <View style={styles.setupHeader}>
                <View style={styles.setupTitle}>
                  <View style={[styles.setupIcon, { backgroundColor: colors.primary }]}>
                    <Wrench size={20} color={colors.primaryText} />
                  </View>
                  <View style={styles.setupTitleText}>
                    <Text style={[styles.setupCardTitle, { color: colors.text }]}>{String(setup.name || 'Unnamed Setup')}</Text>
                    <View style={styles.setupDate}>
                      <Calendar size={14} color={colors.textSecondary} />
                      <Text style={[styles.setupDateText, { color: colors.textSecondary }]}>
                        {formatDate(setup.date)}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.setupActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openSetupModal(setup)}
                  >
                    <Edit3 size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => deleteSetup(setup.id)}
                  >
                    <Trash2 size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              {setup.notes && (
                <Text style={[styles.setupNotes, { color: colors.textSecondary }]}>{String(setup.notes)}</Text>
              )}
              {setup.setupData && (
                <View style={styles.setupDataPreview}>
                  <Text style={[styles.setupDataTitle, { color: colors.text }]}>Setup Data:</Text>
                  <View style={styles.setupDataRow}>
                    <Text style={[styles.setupDataLabel, { color: colors.textSecondary }]}>Tire Pressures:</Text>
                    <Text style={[styles.setupDataText, { color: colors.textTertiary }]}>
                      FL: {String(setup.setupData.tirePressures?.frontLeft || 'N/A')} | FR: {String(setup.setupData.tirePressures?.frontRight || 'N/A')} | RL: {String(setup.setupData.tirePressures?.rearLeft || 'N/A')} | RR: {String(setup.setupData.tirePressures?.rearRight || 'N/A')}
                    </Text>
                  </View>
                  {setup.setupData.fuelLevel && String(setup.setupData.fuelLevel).trim() && (
                    <View style={styles.setupDataRow}>
                      <Text style={[styles.setupDataLabel, { color: colors.textSecondary }]}>Fuel:</Text>
                      <Text style={[styles.setupDataText, { color: colors.textTertiary }]}>
                        {String(setup.setupData.fuelLevel)}
                      </Text>
                    </View>
                  )}
                </View>
              )}
              
              {setup.trackSnapshot && (
                <View style={styles.setupDataRow}>
                  <Text style={[styles.setupDataLabel, { color: colors.textSecondary }]}>Track:</Text>
                  <Text style={[styles.setupDataText, { color: colors.textTertiary }]}>
                    {String(setup.trackSnapshot.name || 'Unknown Track')} ({String(setup.trackSnapshot.country || 'Unknown Country')})
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeSetupModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeSetupModal}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingSetup ? 'Edit Setup' : 'New Setup'}
            </Text>
            <TouchableOpacity onPress={saveSetup}>
              <Text style={[styles.modalSave, { color: colors.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Setup Name</Text>
              <TextInput
                style={[styles.nameInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g., Qualifying Setup, Race Setup..."
                placeholderTextColor={colors.textTertiary}
                value={setupForm.name}
                onChangeText={(name) => setSetupForm({ ...setupForm, name })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Date</Text>
              <DatePicker
                value={setupForm.date}
                onDateChange={(date) => setSetupForm({ ...setupForm, date })}
                placeholder="Select setup date"
              />
            </View>

            {/* Tire Pressures Section */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Tire Pressures (PSI)</Text>
              <View style={styles.setupGrid}>
                <View style={styles.setupRow}>
                  <View style={styles.setupInputContainer}>
                    <Text style={[styles.setupInputLabel, { color: colors.textSecondary }]}>Front Left</Text>
                    <TextInput
                      style={[styles.setupInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                      placeholder="32.0"
                      placeholderTextColor={colors.textTertiary}
                      value={setupForm.setupData.tirePressures.frontLeft}
                      onChangeText={(value) => updateSetupData('tirePressures', 'frontLeft', value)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.setupInputContainer}>
                    <Text style={[styles.setupInputLabel, { color: colors.textSecondary }]}>Front Right</Text>
                    <TextInput
                      style={[styles.setupInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                      placeholder="32.0"
                      placeholderTextColor={colors.textTertiary}
                      value={setupForm.setupData.tirePressures.frontRight}
                      onChangeText={(value) => updateSetupData('tirePressures', 'frontRight', value)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <View style={styles.setupRow}>
                  <View style={styles.setupInputContainer}>
                    <Text style={[styles.setupInputLabel, { color: colors.textSecondary }]}>Rear Left</Text>
                    <TextInput
                      style={[styles.setupInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                      placeholder="30.0"
                      placeholderTextColor={colors.textTertiary}
                      value={setupForm.setupData.tirePressures.rearLeft}
                      onChangeText={(value) => updateSetupData('tirePressures', 'rearLeft', value)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.setupInputContainer}>
                    <Text style={[styles.setupInputLabel, { color: colors.textSecondary }]}>Rear Right</Text>
                    <TextInput
                      style={[styles.setupInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                      placeholder="30.0"
                      placeholderTextColor={colors.textTertiary}
                      value={setupForm.setupData.tirePressures.rearRight}
                      onChangeText={(value) => updateSetupData('tirePressures', 'rearRight', value)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Spring Rates Section */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Spring Rates (N/mm)</Text>
              <View style={styles.setupGrid}>
                <View style={styles.setupRow}>
                  <View style={styles.setupInputContainer}>
                    <Text style={[styles.setupInputLabel, { color: colors.textSecondary }]}>Front Left</Text>
                    <TextInput
                      style={[styles.setupInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                      placeholder="65"
                      placeholderTextColor={colors.textTertiary}
                      value={setupForm.setupData.springRates.frontLeft}
                      onChangeText={(value) => updateSetupData('springRates', 'frontLeft', value)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.setupInputContainer}>
                    <Text style={[styles.setupInputLabel, { color: colors.textSecondary }]}>Front Right</Text>
                    <TextInput
                      style={[styles.setupInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                      placeholder="65"
                      placeholderTextColor={colors.textTertiary}
                      value={setupForm.setupData.springRates.frontRight}
                      onChangeText={(value) => updateSetupData('springRates', 'frontRight', value)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <View style={styles.setupRow}>
                  <View style={styles.setupInputContainer}>
                    <Text style={[styles.setupInputLabel, { color: colors.textSecondary }]}>Rear Left</Text>
                    <TextInput
                      style={[styles.setupInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                      placeholder="85"
                      placeholderTextColor={colors.textTertiary}
                      value={setupForm.setupData.springRates.rearLeft}
                      onChangeText={(value) => updateSetupData('springRates', 'rearLeft', value)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.setupInputContainer}>
                    <Text style={[styles.setupInputLabel, { color: colors.textSecondary }]}>Rear Right</Text>
                    <TextInput
                      style={[styles.setupInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                      placeholder="85"
                      placeholderTextColor={colors.textTertiary}
                      value={setupForm.setupData.springRates.rearRight}
                      onChangeText={(value) => updateSetupData('springRates', 'rearRight', value)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Sway Bar Settings */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Sway Bar Settings</Text>
              <View style={styles.setupRow}>
                <View style={styles.setupInputContainer}>
                  <Text style={[styles.setupInputLabel, { color: colors.textSecondary }]}>Front</Text>
                  <TextInput
                    style={[styles.setupInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    placeholder="3"
                    placeholderTextColor={colors.textTertiary}
                    value={setupForm.setupData.swayBars.front}
                    onChangeText={(value) => updateSetupData('swayBars', 'front', value)}
                  />
                </View>
                <View style={styles.setupInputContainer}>
                  <Text style={[styles.setupInputLabel, { color: colors.textSecondary }]}>Rear</Text>
                  <TextInput
                    style={[styles.setupInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    placeholder="5"
                    placeholderTextColor={colors.textTertiary}
                    value={setupForm.setupData.swayBars.rear}
                    onChangeText={(value) => updateSetupData('swayBars', 'rear', value)}
                  />
                </View>
              </View>
            </View>

            {/* Wing Settings */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Wing Settings</Text>
              <View style={styles.setupRow}>
                <View style={styles.setupInputContainer}>
                  <Text style={[styles.setupInputLabel, { color: colors.textSecondary }]}>Front Wing</Text>
                  <TextInput
                    style={[styles.setupInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    placeholder="7"
                    placeholderTextColor={colors.textTertiary}
                    value={setupForm.setupData.wings.front}
                    onChangeText={(value) => updateSetupData('wings', 'front', value)}
                  />
                </View>
                <View style={styles.setupInputContainer}>
                  <Text style={[styles.setupInputLabel, { color: colors.textSecondary }]}>Rear Wing</Text>
                  <TextInput
                    style={[styles.setupInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    placeholder="5"
                    placeholderTextColor={colors.textTertiary}
                    value={setupForm.setupData.wings.rear}
                    onChangeText={(value) => updateSetupData('wings', 'rear', value)}
                  />
                </View>
              </View>
            </View>

            {/* Fuel Level */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Fuel Level</Text>
              <TextInput
                style={[styles.setupInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g., 50L, Full Tank, 75%"
                placeholderTextColor={colors.textTertiary}
                value={setupForm.setupData.fuelLevel}
                onChangeText={(value) => setSetupForm(prev => ({
                  ...prev,
                  setupData: {
                    ...prev.setupData,
                    fuelLevel: value
                  }
                }))}
              />
            </View>

            {/* Weather Capture Button */}
            {currentWeather && (
              <View style={styles.formGroup}>
                <TouchableOpacity
                  style={[styles.weatherCaptureButton, { backgroundColor: colors.primary }]}
                  onPress={captureCurrentWeather}
                >
                  <Text style={[styles.weatherCaptureButtonText, { color: colors.primaryText }]}>
                    Capture Current Weather Conditions
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Track Capture Button */}
            {settings?.selectedTrack && (
              <View style={styles.formGroup}>
                <TouchableOpacity
                  style={[styles.trackCaptureButton, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
                  onPress={captureCurrentTrack}
                >
                  <Text style={[styles.trackCaptureButtonText, { color: colors.text }]}>
                    Capture Current Track
                  </Text>
                </TouchableOpacity>
                {setupForm.trackSnapshot && (
                  <View style={[styles.capturedTrackDisplay, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.capturedTrackText, { color: colors.textSecondary }]}>
                      Captured: {String(setupForm.trackSnapshot.name || 'Unknown Track')} ({String(setupForm.trackSnapshot.country || 'Unknown Country')})
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Setup Notes</Text>
              <TextInput
                style={[styles.notesInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Additional notes, observations, or comments..."
                placeholderTextColor={colors.textTertiary}
                value={setupForm.notes}
                onChangeText={(notes) => setSetupForm({ ...setupForm, notes })}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
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
  sortContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sortButton: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  sortButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  trackGroup: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  trackHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  trackCountry: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginTop: 2,
  },
  trackSetupCount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  trackContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
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
  setupCard: {
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
  setupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  setupTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  setupIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setupTitleText: {
    flex: 1,
  },
  setupCardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  setupDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  setupDateText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  setupActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  setupNotes: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 20,
    marginTop: 8,
  },
  setupDataPreview: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  setupDataTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 4,
  },
  setupDataRow: {
    marginBottom: 2,
  },
  setupDataLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 2,
  },
  setupDataText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 16,
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
  nameInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    minHeight: 200,
  },
  setupGrid: {
    gap: 12,
  },
  setupRow: {
    flexDirection: 'row',
    gap: 12,
  },
  setupInputContainer: {
    flex: 1,
  },
  setupInputLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginBottom: 4,
  },
  setupInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
  },
  weatherCaptureButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  weatherCaptureButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  trackCaptureButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  trackCaptureButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  capturedTrackDisplay: {
    marginTop: 8,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  capturedTrackText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    textAlign: 'center',
  },
});