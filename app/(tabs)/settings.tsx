import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { UserSettings } from '@/types/weather';
import { storageService } from '@/services/storageService';
import { userService } from '@/services/userService';
import { useTheme } from '@/contexts/ThemeContext';
import { useCustomAlert } from '@/components/CustomAlert';
import { 
  convertWindSpeed, 
  getWindSpeedUnit, 
  convertPrecipitation, 
  getPrecipitationUnit 
} from '@/utils/raceConditions';
import { downloadJsonAsFile, generateExportFilename } from '@/utils/fileUtils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  Settings as SettingsIcon, 
  Thermometer, 
  Wind, 
  Droplets, 
  RefreshCcw, 
  Palette, 
  Download,
  Trash2, 
  TriangleAlert as AlertTriangle,
  Users
} from 'lucide-react-native';
import { sessionService } from '@/services/sessionService';

export default function Settings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  const router = useRouter();
  const { showAlert, AlertComponent } = useCustomAlert();

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

  const handleTemperatureUnitChange = async (unit: 'celsius' | 'fahrenheit') => {
    if (!settings) return;
    
    const updatedSettings = { ...settings, temperatureUnit: unit };
    await storageService.saveSettings(updatedSettings);
    setSettings(updatedSettings);
  };

  const handleWindSpeedUnitChange = async (unit: 'kmh' | 'mph') => {
    if (!settings) return;
    
    const updatedSettings = { ...settings, windSpeedUnit: unit };
    await storageService.saveSettings(updatedSettings);
    setSettings(updatedSettings);
  };

  const handlePrecipitationUnitChange = async (unit: 'mm' | 'inches') => {
    if (!settings) return;
    
    const updatedSettings = { ...settings, precipitationUnit: unit };
    await storageService.saveSettings(updatedSettings);
    setSettings(updatedSettings);
  };

  const handleRefresh = async () => {
    await loadSettings();
  };

  const handleClearAllData = async () => {
    console.log('🚨 handleClearAllData function called!');
    showAlert(
      'Clear All App Data',
      'This will permanently delete all your notes, setups, settings, and favorites. This action cannot be undone.\n\nAre you sure you want to continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.clearAllData();
              showAlert(
                'Data Cleared',
                'All app data has been successfully cleared. The app will now restart.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate to the main tab to trigger data reload
                      console.log('🔄 Navigating to main tab to reload data...');
                      router.replace('/(tabs)/');
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Error clearing data:', error);
              showAlert(
                'Error',
                'Failed to clear app data. Please try again.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

  const handleClearAllSessions = async () => {
    console.log('🚨 handleClearAllSessions function called!');
    showAlert(
      'Reset Entire Application',
      'This will permanently delete ALL sessions and their data including:\n\n• All racing sessions\n• All notes and setups\n• All settings and preferences\n• All favorites\n\nThis action cannot be undone.\n\nAre you sure you want to continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              await sessionService.clearAllSessions();
              showAlert(
                'Application Reset',
                'All sessions and data have been cleared. You will now be taken to create a new session.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      console.log('🔄 Navigating to sessions screen...');
                      router.replace('/sessions');
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Error clearing all sessions:', error);
              showAlert(
                'Error',
                'Failed to reset application. Please try again.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const data = await userService.exportData();
      const filename = generateExportFilename();
      
      downloadJsonAsFile(data, filename);
      
      showAlert(
        'Data Exported',
        `Your racing data has been exported as "${filename}". The file contains all your sessions, notes, setups, and settings.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error exporting data:', error);
      showAlert(
        'Export Failed', 
        'Failed to export data. This feature is only available on web browsers.', 
        [{ text: 'OK' }]
      );
    }
  };

  const getConditionDescriptions = () => {
    if (!settings) return {};
    
    const windUnit = getWindSpeedUnit(settings.windSpeedUnit);
    const precipUnit = getPrecipitationUnit(settings.precipitationUnit);
    
    const optimalWindSpeed = convertWindSpeed(25, settings.windSpeedUnit);
    const windyWindSpeed = convertWindSpeed(25, settings.windSpeedUnit);
    const extremeWindSpeed = convertWindSpeed(40, settings.windSpeedUnit);
    const extremePrecipitation = convertPrecipitation(50, settings.precipitationUnit);
    
    return {
      optimal: `• No precipitation\n• Wind speed ≤ ${optimalWindSpeed} ${windUnit}\n• Visibility ≥ 5 km\n• Cloud cover ≤ 80%\n• Humidity ≤ 85%`,
      wet: `• Any precipitation detected\n• OR humidity > 85%\n• Requires intermediate or wet tires\n• Reduced grip and visibility`,
      windy: `• Wind speed > ${windyWindSpeed} ${windUnit}\n• Affects aerodynamics\n• May impact car handling\n• Requires setup adjustments`,
      poorVis: `• Visibility < 5 km\n• OR cloud cover > 80%\n• Reduced sight lines\n• Extra caution required`,
      extreme: `• Wind speed > ${extremeWindSpeed} ${windUnit}\n• OR precipitation > ${extremePrecipitation} ${precipUnit}\n• Dangerous racing conditions\n• Consider postponing activities`
    };
  };

  if (loading || !settings) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading settings...</Text>
      </View>
    );
  }

  const descriptions = getConditionDescriptions();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <>
        <ScrollView>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Customize your weather experience</Text>
          </View>
          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={handleRefresh}
          >
            <RefreshCcw size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        <ThemeToggle />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Units</Text>
        
        <View style={[styles.settingItem, { backgroundColor: colors.surface }]}>
          <View style={styles.settingHeader}>
            <Thermometer size={20} color={colors.textSecondary} />
            <Text style={[styles.settingLabel, { color: colors.text }]}>Temperature Unit</Text>
          </View>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[
                styles.unitButton,
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                settings.temperatureUnit === 'celsius' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => handleTemperatureUnitChange('celsius')}
            >
              <Text style={[
                styles.unitButtonText,
                { color: colors.textSecondary },
                settings.temperatureUnit === 'celsius' && { color: colors.primaryText }
              ]}>
                °C
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.unitButton,
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                settings.temperatureUnit === 'fahrenheit' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => handleTemperatureUnitChange('fahrenheit')}
            >
              <Text style={[
                styles.unitButtonText,
                { color: colors.textSecondary },
                settings.temperatureUnit === 'fahrenheit' && { color: colors.primaryText }
              ]}>
                °F
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.settingItem, { backgroundColor: colors.surface }]}>
          <View style={styles.settingHeader}>
            <Wind size={20} color={colors.textSecondary} />
            <Text style={[styles.settingLabel, { color: colors.text }]}>Wind Speed Unit</Text>
          </View>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[
                styles.unitButton,
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                settings.windSpeedUnit === 'kmh' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => handleWindSpeedUnitChange('kmh')}
            >
              <Text style={[
                styles.unitButtonText,
                { color: colors.textSecondary },
                settings.windSpeedUnit === 'kmh' && { color: colors.primaryText }
              ]}>
                km/h
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.unitButton,
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                settings.windSpeedUnit === 'mph' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => handleWindSpeedUnitChange('mph')}
            >
              <Text style={[
                styles.unitButtonText,
                { color: colors.textSecondary },
                settings.windSpeedUnit === 'mph' && { color: colors.primaryText }
              ]}>
                mph
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.settingItem, { backgroundColor: colors.surface }]}>
          <View style={styles.settingHeader}>
            <Droplets size={20} color={colors.textSecondary} />
            <Text style={[styles.settingLabel, { color: colors.text }]}>Precipitation Unit</Text>
          </View>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[
                styles.unitButton,
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                settings.precipitationUnit === 'mm' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => handlePrecipitationUnitChange('mm')}
            >
              <Text style={[
                styles.unitButtonText,
                { color: colors.textSecondary },
                settings.precipitationUnit === 'mm' && { color: colors.primaryText }
              ]}>
                mm
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.unitButton,
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                settings.precipitationUnit === 'inches' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => handlePrecipitationUnitChange('inches')}
            >
              <Text style={[
                styles.unitButtonText,
                { color: colors.textSecondary },
                settings.precipitationUnit === 'inches' && { color: colors.primaryText }
              ]}>
                inches
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Race Conditions Legend</Text>
        <View style={[styles.legendContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.legendTitle, { color: colors.text }]}>Track Condition States</Text>
          <Text style={[styles.legendDescription, { color: colors.textSecondary }]}>
            The app automatically determines track conditions based on current weather data:
          </Text>
          
          <View style={styles.conditionItem}>
            <View style={[styles.conditionBadge, { backgroundColor: '#16A34A' }]}>
              <Text style={styles.conditionBadgeText}>OPTIMAL</Text>
            </View>
            <View style={styles.conditionDetails}>
              <Text style={[styles.conditionName, { color: colors.text }]}>Optimal Conditions</Text>
              <Text style={[styles.conditionCriteria, { color: colors.textSecondary }]}>
                {descriptions.optimal}
              </Text>
            </View>
          </View>

          <View style={styles.conditionItem}>
            <View style={[styles.conditionBadge, { backgroundColor: '#2563EB' }]}>
              <Text style={styles.conditionBadgeText}>WET</Text>
            </View>
            <View style={styles.conditionDetails}>
              <Text style={[styles.conditionName, { color: colors.text }]}>Wet Conditions</Text>
              <Text style={[styles.conditionCriteria, { color: colors.textSecondary }]}>
                {descriptions.wet}
              </Text>
            </View>
          </View>

          <View style={styles.conditionItem}>
            <View style={[styles.conditionBadge, { backgroundColor: '#D97706' }]}>
              <Text style={styles.conditionBadgeText}>WINDY</Text>
            </View>
            <View style={styles.conditionDetails}>
              <Text style={[styles.conditionName, { color: colors.text }]}>Windy Conditions</Text>
              <Text style={[styles.conditionCriteria, { color: colors.textSecondary }]}>
                {descriptions.windy}
              </Text>
            </View>
          </View>

          <View style={styles.conditionItem}>
            <View style={[styles.conditionBadge, { backgroundColor: '#9333EA' }]}>
              <Text style={styles.conditionBadgeText}>POOR VIS</Text>
            </View>
            <View style={styles.conditionDetails}>
              <Text style={[styles.conditionName, { color: colors.text }]}>Poor Visibility</Text>
              <Text style={[styles.conditionCriteria, { color: colors.textSecondary }]}>
                {descriptions.poorVis}
              </Text>
            </View>
          </View>

          <View style={styles.conditionItem}>
            <View style={[styles.conditionBadge, { backgroundColor: '#DC2626' }]}>
              <Text style={styles.conditionBadgeText}>EXTREME</Text>
            </View>
            <View style={styles.conditionDetails}>
              <Text style={[styles.conditionName, { color: colors.text }]}>Extreme Conditions</Text>
              <Text style={[styles.conditionCriteria, { color: colors.textSecondary }]}>
                {descriptions.extreme}
              </Text>
            </View>
          </View>

          <View style={styles.legendFooter}>
            <Text style={[styles.legendFooterText, { color: colors.textTertiary }]}>
              Conditions are evaluated in priority order: Extreme → Wet → Windy → Poor Visibility → Optimal
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Weather Data</Text>
        <View style={[styles.aboutContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
            Weather data is provided by Open-Meteo, a free weather API service. 
            All weather information including current conditions, forecasts, and historical data 
            is available without requiring an API key.
          </Text>
          <Text style={[styles.aboutSubtext, { color: colors.textTertiary }]}>
            Open-Meteo provides accurate meteorological data from national weather services worldwide.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Export & Import</Text>
        <View style={[styles.dataExportContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.dataExportDescription, { color: colors.textSecondary }]}>
            Export your racing data as a downloadable file for backup or sharing with your team. To import data, use the "Import Session" feature on the sessions management screen.
          </Text>
          
          <TouchableOpacity
            style={[styles.exportButton, { backgroundColor: colors.primary }]}
            onPress={handleExportData}
          >
            <Download size={20} color={colors.primaryText} />
            <Text style={[styles.exportButtonText, { color: colors.primaryText }]}>Export All Data</Text>
          </TouchableOpacity>
          
          <Text style={[styles.dataWarningText, { color: colors.textTertiary }]}>
            💡 Exported file includes all sessions, notes, setups, settings, and favorites
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Management</Text>
        <View style={[styles.dataManagementContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.dataManagementHeader}>
            <AlertTriangle size={20} color={colors.warning} />
            <Text style={[styles.dataManagementTitle, { color: colors.text }]}>Session Management</Text>
          </View>
          <Text style={[styles.dataManagementDescription, { color: colors.textSecondary }]}>
            Manage your racing sessions or reset the entire application. This will clear all sessions and stored data.
          </Text>
          <TouchableOpacity
            style={[styles.manageSessionsButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/sessions')}
          >
            <Users size={20} color={colors.primaryText} />
            <Text style={[styles.manageSessionsButtonText, { color: colors.primaryText }]}>Manage Sessions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.clearDataButton, { backgroundColor: colors.error }]}
            onPress={handleClearAllSessions}
          >
            <Trash2 size={20} color="#FFFFFF" />
            <Text style={styles.clearDataButtonText}>Reset Entire App</Text>
          </TouchableOpacity>
          <Text style={[styles.warningText, { color: colors.textTertiary }]}>
            ⚠️ Reset will permanently delete ALL sessions, notes, setups, and preferences
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacy & Data</Text>
        <View style={[styles.privacyContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.privacyHeader}>
            <View style={[styles.privacyIcon, { backgroundColor: colors.success + '20' }]}>
              <Text style={styles.privacyEmoji}>🔒</Text>
            </View>
            <Text style={[styles.privacyTitle, { color: colors.text }]}>Your Privacy Matters</Text>
          </View>
          
          <Text style={[styles.privacyDescription, { color: colors.textSecondary }]}>
            Track Buddy is designed with privacy as a core principle:
          </Text>
          
          <View style={styles.privacyPoints}>
            <View style={styles.privacyPoint}>
              <Text style={styles.privacyBullet}>•</Text>
              <Text style={[styles.privacyPointText, { color: colors.textSecondary }]}>
                <Text style={[styles.privacyBold, { color: colors.text }]}>No data collection:</Text> We don't collect, store, or transmit any personal data
              </Text>
            </View>
            
            <View style={styles.privacyPoint}>
              <Text style={styles.privacyBullet}>•</Text>
              <Text style={[styles.privacyPointText, { color: colors.textSecondary }]}>
                <Text style={[styles.privacyBold, { color: colors.text }]}>Local storage only:</Text> All your notes, setups, and settings stay on your device
              </Text>
            </View>
            
            <View style={styles.privacyPoint}>
              <Text style={styles.privacyBullet}>•</Text>
              <Text style={[styles.privacyPointText, { color: colors.textSecondary }]}>
                <Text style={[styles.privacyBold, { color: colors.text }]}>No tracking:</Text> No analytics, cookies, or user behavior monitoring
              </Text>
            </View>
            
            <View style={styles.privacyPoint}>
              <Text style={styles.privacyBullet}>•</Text>
              <Text style={[styles.privacyPointText, { color: colors.textSecondary }]}>
                <Text style={[styles.privacyBold, { color: colors.text }]}>Weather data only:</Text> Only weather information is fetched from Open-Meteo API
              </Text>
            </View>
            
            <View style={styles.privacyPoint}>
              <Text style={styles.privacyBullet}>•</Text>
              <Text style={[styles.privacyPointText, { color: colors.textSecondary }]}>
                <Text style={[styles.privacyBold, { color: colors.text }]}>You control your data:</Text> Export, import, or delete your data anytime
              </Text>
            </View>
          </View>
          
          <View style={[styles.privacyFooter, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.privacyFooterText, { color: colors.textTertiary }]}>
              Your racing data belongs to you and stays with you.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
        <View style={[styles.aboutContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
            Track Buddy provides real-time weather data for racing tracks worldwide. 
            Perfect for drivers, teams, and fans who need accurate weather information for racing conditions.
          </Text>
          <Text style={[styles.licenseText, { color: colors.textTertiary }]}>
            This software is provided under a license that prohibits commercial distribution or monetization. 
            It is intended for personal and educational use only.
          </Text>
          <Text style={[styles.versionText, { color: colors.textTertiary }]}>Version 1.0.0</Text>
        </View>
      </View>
        </ScrollView>
        <AlertComponent />
      </>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  settingItem: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  unitButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  unitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  legendContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 8,
  },
  legendDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 20,
  },
  conditionItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  conditionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
    height: 28,
  },
  conditionBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  conditionDetails: {
    flex: 1,
  },
  conditionName: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 4,
  },
  conditionCriteria: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 16,
  },
  legendFooter: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendFooterText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  aboutContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aboutText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 16,
  },
  licenseText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 18,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  aboutSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 18,
  },
  versionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  privacyContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  privacyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyEmoji: {
    fontSize: 20,
  },
  privacyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  privacyDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 16,
  },
  privacyPoints: {
    gap: 12,
    marginBottom: 16,
  },
  privacyPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  privacyBullet: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: '#16A34A',
    marginTop: 2,
  },
  privacyPointText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 20,
    flex: 1,
  },
  privacyBold: {
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  privacyFooter: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  privacyFooterText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  dataManagementContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dataManagementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  dataManagementTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  dataManagementDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 20,
  },
  manageSessionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  manageSessionsButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  clearDataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  clearDataButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  warningText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  dataExportContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dataExportDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 20,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  exportButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  dataWarningText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 16,
    fontStyle: 'italic',
  },
});