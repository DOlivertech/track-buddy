import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings } from '@/types/weather';
import { Theme } from '@/contexts/ThemeContext';

class StorageService {
  private readonly SETTINGS_KEY = 'weather_app_settings';
  private readonly FAVORITES_KEY = 'weather_app_favorites';
  private readonly THEME_KEY = 'weather_app_theme';
  private readonly HIDDEN_DEMO_SESSION_KEY = 'weather_app_hidden_demo_session';

  async getSettings(): Promise<UserSettings> {
    try {
      const settings = await AsyncStorage.getItem(this.SETTINGS_KEY);
      return settings ? JSON.parse(settings) : {
        temperatureUnit: 'celsius',
        windSpeedUnit: 'kmh',
        precipitationUnit: 'mm',
        visibilityUnit: 'km',
        pressureUnit: 'hpa',
        selectedTrack: 'silverstone'
      };
    } catch (error) {
      console.error('Error loading settings:', error);
      return {
        temperatureUnit: 'celsius',
        windSpeedUnit: 'kmh',
        precipitationUnit: 'mm',
        visibilityUnit: 'km',
        pressureUnit: 'hpa',
        selectedTrack: 'silverstone'
      };
    }
  }

  async saveSettings(settings: UserSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  async getFavorites(): Promise<string[]> {
    try {
      const favorites = await AsyncStorage.getItem(this.FAVORITES_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  }

  async saveFavorites(favorites: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }

  async addToFavorites(trackId: string): Promise<string[]> {
    const favorites = await this.getFavorites();
    if (!favorites.includes(trackId) && favorites.length < 5) {
      favorites.push(trackId);
      await this.saveFavorites(favorites);
    }
    return favorites;
  }

  async removeFromFavorites(trackId: string): Promise<string[]> {
    const favorites = await this.getFavorites();
    const updated = favorites.filter(id => id !== trackId);
    await this.saveFavorites(updated);
    return updated;
  }

  async getTheme(): Promise<Theme> {
    try {
      const theme = await AsyncStorage.getItem(this.THEME_KEY);
      return (theme as Theme) || 'light';
    } catch (error) {
      console.error('Error loading theme:', error);
      return 'light';
    }
  }

  async getHiddenDemoSessionId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.HIDDEN_DEMO_SESSION_KEY);
    } catch (error) {
      console.error('Error loading hidden demo session ID:', error);
      return null;
    }
  }

  async setHiddenDemoSessionId(sessionId: string | null): Promise<void> {
    try {
      if (sessionId) {
        await AsyncStorage.setItem(this.HIDDEN_DEMO_SESSION_KEY, sessionId);
      } else {
        await AsyncStorage.removeItem(this.HIDDEN_DEMO_SESSION_KEY);
      }
    } catch (error) {
      console.error('Error saving hidden demo session ID:', error);
    }
  }

  async saveTheme(theme: Theme): Promise<void> {
    try {
      await AsyncStorage.setItem(this.THEME_KEY, theme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }
}

export const storageService = new StorageService();