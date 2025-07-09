import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, TrackNote, TrackSetup, AppData } from '@/types/user';
import { storageService } from './storageService';
import { itineraryService } from './itineraryService';

class UserService {
  private readonly USER_KEY = 'weather_app_user';
  private readonly NOTES_KEY = 'weather_app_notes';
  private readonly SETUPS_KEY = 'weather_app_setups';

  // User Management
  async getUser(): Promise<User | null> {
    try {
      const user = await AsyncStorage.getItem(this.USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error loading user:', error);
      return null;
    }
  }

  async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
    }
  }

  async createUser(name: string, email?: string): Promise<User> {
    const user: User = {
      id: Date.now().toString(),
      name,
      email,
      createdAt: new Date().toISOString(),
    };
    await this.saveUser(user);
    return user;
  }

  async updateUser(updates: Partial<User>): Promise<User | null> {
    const currentUser = await this.getUser();
    if (!currentUser) return null;

    const updatedUser = { ...currentUser, ...updates };
    await this.saveUser(updatedUser);
    return updatedUser;
  }

  // Notes Management
  async getNotes(trackId?: string): Promise<TrackNote[]> {
    try {
      const notes = await AsyncStorage.getItem(this.NOTES_KEY);
      const allNotes: TrackNote[] = notes ? JSON.parse(notes) : [];
      // Always return all notes - filtering will be done in the UI if needed
      return allNotes;
    } catch (error) {
      console.error('Error loading notes:', error);
      return [];
    }
  }

  async saveNote(note: Omit<TrackNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<TrackNote> {
    try {
      const notes = await this.getNotes();
      const newNote: TrackNote = {
        ...note,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      notes.push(newNote);
      await AsyncStorage.setItem(this.NOTES_KEY, JSON.stringify(notes));
      return newNote;
    } catch (error) {
      console.error('Error saving note:', error);
      throw error;
    }
  }

  async updateNote(id: string, updates: Partial<TrackNote>): Promise<TrackNote | null> {
    try {
      const notes = await this.getNotes();
      const noteIndex = notes.findIndex(note => note.id === id);
      if (noteIndex === -1) return null;

      notes[noteIndex] = {
        ...notes[noteIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(this.NOTES_KEY, JSON.stringify(notes));
      return notes[noteIndex];
    } catch (error) {
      console.error('Error updating note:', error);
      return null;
    }
  }

  async deleteNote(id: string): Promise<boolean> {
    try {
      const notes = await this.getNotes();
      const filteredNotes = notes.filter(note => note.id !== id);
      if (notes.length === filteredNotes.length) {
        // Note not found
        return false;
      }
      await AsyncStorage.setItem(this.NOTES_KEY, JSON.stringify(filteredNotes));
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  }

  // Setup Management
  async getSetups(trackId?: string): Promise<TrackSetup[]> {
    try {
      const setups = await AsyncStorage.getItem(this.SETUPS_KEY);
      const allSetups: TrackSetup[] = setups ? JSON.parse(setups) : [];
      // Always return all setups - filtering will be done in the UI if needed
      return allSetups;
    } catch (error) {
      console.error('Error loading setups:', error);
      return [];
    }
  }

  async saveSetup(setup: Omit<TrackSetup, 'id' | 'createdAt' | 'updatedAt'>): Promise<TrackSetup> {
    try {
      const setups = await this.getSetups();
      const newSetup: TrackSetup = {
        ...setup,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setups.push(newSetup);
      await AsyncStorage.setItem(this.SETUPS_KEY, JSON.stringify(setups));
      return newSetup;
    } catch (error) {
      console.error('Error saving setup:', error);
      throw error;
    }
  }

  async updateSetup(id: string, updates: Partial<TrackSetup>): Promise<TrackSetup | null> {
    try {
      const setups = await this.getSetups();
      const setupIndex = setups.findIndex(setup => setup.id === id);
      if (setupIndex === -1) return null;

      setups[setupIndex] = {
        ...setups[setupIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(this.SETUPS_KEY, JSON.stringify(setups));
      return setups[setupIndex];
    } catch (error) {
      console.error('Error updating setup:', error);
      return null;
    }
  }

  async deleteSetup(id: string): Promise<boolean> {
    try {
      const setups = await this.getSetups();
      const filteredSetups = setups.filter(setup => setup.id !== id);
      if (setups.length === filteredSetups.length) {
        // Setup not found
        return false;
      }
      await AsyncStorage.setItem(this.SETUPS_KEY, JSON.stringify(filteredSetups));
      return true;
    } catch (error) {
      console.error('Error deleting setup:', error);
      return false;
    }
  }

  // Reset current session data (clear current storage without affecting sessions)
  async resetCurrentSessionData(): Promise<void> {
    try {
      console.log('🧹 Resetting current session data...');
      await AsyncStorage.multiRemove([
        this.USER_KEY,
        this.NOTES_KEY,
        this.SETUPS_KEY,
      ]);
      console.log('✅ Current session data reset');
    } catch (error) {
      console.error('Error resetting current session data:', error);
    }
  }

  // Load data from session into current storage
  async loadDataFromSession(sessionData: AppData): Promise<void> {
    try {
      console.log('📥 Loading data from session...');
      
      if (sessionData.user) {
        await this.saveUser(sessionData.user);
      }
      
      if (sessionData.notes) {
        await AsyncStorage.setItem(this.NOTES_KEY, JSON.stringify(sessionData.notes));
      }
      
      if (sessionData.setups) {
        await AsyncStorage.setItem(this.SETUPS_KEY, JSON.stringify(sessionData.setups));
      }
      
      if (sessionData.raceWeekends) {
        await AsyncStorage.setItem(itineraryService['RACE_WEEKENDS_KEY'], JSON.stringify(sessionData.raceWeekends));
      }
      
      if (sessionData.settings) {
        await storageService.saveSettings(sessionData.settings);
      }
      
      if (sessionData.favorites) {
        await storageService.saveFavorites(sessionData.favorites);
      }
      
      console.log('✅ Session data loaded into current storage');
    } catch (error) {
      console.error('Error loading data from session:', error);
    }
  }

  // Data Export/Import
  async exportData(): Promise<AppData> {
    const { storageService } = await import('./storageService');
    
    const user = await this.getUser();
    const notes = await this.getNotes();
    const setups = await this.getSetups();
    const raceWeekends = await itineraryService.getRaceWeekends();
    const settings = await storageService.getSettings();
    const favorites = await storageService.getFavorites();

    return {
      user: user!,
      notes,
      setups,
      raceWeekends,
      settings,
      favorites,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  async importData(data: AppData): Promise<boolean> {
    try {
      const { storageService } = await import('./storageService');
      
      if (data.user) await this.saveUser(data.user);
      if (data.notes) await AsyncStorage.setItem(this.NOTES_KEY, JSON.stringify(data.notes));
      if (data.setups) await AsyncStorage.setItem(this.SETUPS_KEY, JSON.stringify(data.setups));
      if (data.raceWeekends) await AsyncStorage.setItem(itineraryService['RACE_WEEKENDS_KEY'], JSON.stringify(data.raceWeekends));
      if (data.settings) await storageService.saveSettings(data.settings);
      if (data.favorites) await storageService.saveFavorites(data.favorites);

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  async clearAllData(): Promise<void> {
    try {
      console.log('🗑️ Starting clearAllData operation...');
      
      // Log current data before clearing
      const currentNotes = await this.getNotes();
      const currentSetups = await this.getSetups();
      const currentSettings = await storageService.getSettings();
      const currentFavorites = await storageService.getFavorites();
      const currentTheme = await storageService.getTheme();
      
      console.log('📊 Current data before clearing:');
      console.log('  - Notes:', currentNotes.length);
      console.log('  - Setups:', currentSetups.length);
      console.log('  - Settings:', currentSettings);
      console.log('  - Favorites:', currentFavorites);
      console.log('  - Theme:', currentTheme);
      
      // Clear user data
      console.log('🧹 Clearing AsyncStorage keys...');
      await AsyncStorage.multiRemove([
        this.USER_KEY,
        this.NOTES_KEY,
        this.SETUPS_KEY,
        itineraryService['RACE_WEEKENDS_KEY'],
      ]);
      console.log('✅ AsyncStorage keys cleared');
      
      // Clear settings, favorites, and theme by resetting to defaults
      console.log('🔄 Resetting settings to defaults...');
      const defaultSettings = {
        temperatureUnit: 'celsius' as const,
        windSpeedUnit: 'kmh' as const,
        precipitationUnit: 'mm' as const,
        selectedTrack: 'silverstone'
      };
      
      console.log('💾 Saving default settings...');
      await storageService.saveSettings(defaultSettings);
      console.log('✅ Default settings saved');
      
      console.log('💾 Saving empty favorites...');
      await storageService.saveFavorites([]);
      console.log('✅ Empty favorites saved');
      
      console.log('💾 Saving light theme...');
      await storageService.saveTheme('light');
      console.log('✅ Light theme saved');
      
      // Verify data has been cleared by reading it back
      console.log('🔍 Verifying data has been cleared...');
      const verifyNotes = await this.getNotes();
      const verifySetups = await this.getSetups();
      const verifySettings = await storageService.getSettings();
      const verifyFavorites = await storageService.getFavorites();
      const verifyTheme = await storageService.getTheme();
      
      console.log('📊 Data after clearing:');
      console.log('  - Notes:', verifyNotes.length);
      console.log('  - Setups:', verifySetups.length);
      console.log('  - Settings:', verifySettings);
      console.log('  - Favorites:', verifyFavorites);
      console.log('  - Theme:', verifyTheme);
      
      console.log('✅ All app data cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }
}

export const userService = new UserService();