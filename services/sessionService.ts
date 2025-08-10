import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionMetadata, AppData } from '@/types/user';
import { userService } from './userService';
import { storageService } from './storageService';
import { demoSessionData } from '@/data/demoSessionData';

class SessionService {
  private readonly SESSION_LIST_KEY = 'racing_weather_sessions';
  private readonly ACTIVE_SESSION_ID_KEY = 'racing_weather_active_session';
  private readonly SESSION_DATA_PREFIX = 'racing_weather_session_data_';
  private readonly DEMO_SESSION_ID = 'demo-session-001';

  // Get all available sessions
  async getAllSessions(): Promise<SessionMetadata[]> {
    try {
      const sessions = await AsyncStorage.getItem(this.SESSION_LIST_KEY);
      const sessionList: SessionMetadata[] = sessions ? JSON.parse(sessions) : [];
      
      // Ensure demo session is always present
      const demoSessionExists = sessionList.some(s => s.id === this.DEMO_SESSION_ID);
      if (!demoSessionExists) {
        const demoSession: SessionMetadata = {
          id: this.DEMO_SESSION_ID,
          name: 'Demo Session',
          description: 'Sample racing data to explore the app features',
          emoji: '🏁',
          createdAt: '2024-01-01T00:00:00.000Z',
          lastAccessedAt: '2024-01-01T00:00:00.000Z',
          isDemo: true
        };
        
        sessionList.unshift(demoSession); // Add demo session at the beginning
        await this.saveSessions(sessionList);
        
        // Initialize demo session data if it doesn't exist
        const existingDemoData = await this.getSessionData(this.DEMO_SESSION_ID);
        if (!existingDemoData) {
          await this.saveSessionData(this.DEMO_SESSION_ID, demoSessionData);
          console.log('✅ Demo session initialized with sample data');
        }
      }
      
      return sessionList;
    } catch (error) {
      console.error('Error loading sessions:', error);
      return [];
    }
  }

  // Save sessions list
  async saveSessions(sessions: SessionMetadata[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SESSION_LIST_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving sessions:', error);
    }
  }

  // Get active session ID
  async getActiveSessionId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.ACTIVE_SESSION_ID_KEY);
    } catch (error) {
      console.error('Error loading active session ID:', error);
      return null;
    }
  }

  // Set active session ID
  async setActiveSessionId(sessionId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.ACTIVE_SESSION_ID_KEY, sessionId);
    } catch (error) {
      console.error('Error saving active session ID:', error);
    }
  }

  // Create a new session
  async createSession(name: string, description?: string, emoji?: string): Promise<SessionMetadata> {
    try {
      const sessionId = Date.now().toString();
      const newSession: SessionMetadata = {
        id: sessionId,
        name: name.trim(),
        description: description?.trim(),
        emoji: emoji?.trim(),
        createdAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString()
      };

      const sessions = await this.getAllSessions();
      sessions.push(newSession);
      await this.saveSessions(sessions);

      // Initialize empty data for the new session
      const emptyData: AppData = {
        user: {
          id: Date.now().toString(),
          name: 'Racing Driver',
          createdAt: new Date().toISOString()
        },
        notes: [],
        setups: [],
        settings: {
          temperatureUnit: 'celsius',
          windSpeedUnit: 'kmh',
          precipitationUnit: 'mm',
          visibilityUnit: 'km',
          pressureUnit: 'hpa',
          selectedTrack: 'silverstone'
        },
        favorites: [],
        sessionId,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };

      await this.saveSessionData(sessionId, emptyData);
      console.log('✅ Created new session:', newSession);
      return newSession;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  // Load a session and set it as active
  async loadSession(sessionId: string): Promise<boolean> {
    try {
      console.log('🔄 Loading session:', sessionId);
      
      // Save current data to the currently active session (if any)
      const currentActiveId = await this.getActiveSessionId();
      if (currentActiveId && currentActiveId !== sessionId) {
        console.log('💾 Saving current session data before switching...');
        await this.saveCurrentDataToSession(currentActiveId);
      }

      // Load the new session data
      const sessionData = await this.getSessionData(sessionId);
      if (!sessionData) {
        console.error('❌ Session data not found for ID:', sessionId);
        return false;
      }

      // Clear current data and load session data
      await userService.resetCurrentSessionData();
      await userService.loadDataFromSession(sessionData);

      // Update session's last accessed time
      const sessions = await this.getAllSessions();
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      if (sessionIndex !== -1) {
        sessions[sessionIndex].lastAccessedAt = new Date().toISOString();
        await this.saveSessions(sessions);
      }

      // Set as active session
      await this.setActiveSessionId(sessionId);
      console.log('✅ Session loaded successfully:', sessionId);
      return true;
    } catch (error) {
      console.error('Error loading session:', error);
      return false;
    }
  }

  // Save current app data to a specific session
  async saveCurrentDataToSession(sessionId: string): Promise<void> {
    try {
      console.log('💾 Saving current data to session:', sessionId);
      const currentData = await userService.exportData();
      currentData.sessionId = sessionId;
      await this.saveSessionData(sessionId, currentData);
      console.log('✅ Current data saved to session');
    } catch (error) {
      console.error('Error saving current data to session:', error);
    }
  }

  // Get session data
  async getSessionData(sessionId: string): Promise<AppData | null> {
    try {
      const data = await AsyncStorage.getItem(`${this.SESSION_DATA_PREFIX}${sessionId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading session data:', error);
      return null;
    }
  }

  // Save session data
  async saveSessionData(sessionId: string, data: AppData): Promise<void> {
    try {
      await AsyncStorage.setItem(`${this.SESSION_DATA_PREFIX}${sessionId}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving session data:', error);
    }
  }

  // Delete a session
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      // Prevent deletion of demo session
      if (sessionId === this.DEMO_SESSION_ID) {
        console.warn('Cannot delete demo session');
        return false;
      }
      
      console.log('🗑️ Deleting session:', sessionId);
      
      // Remove from sessions list
      const sessions = await this.getAllSessions();
      const filteredSessions = sessions.filter(s => s.id !== sessionId);
      await this.saveSessions(filteredSessions);

      // Remove session data
      await AsyncStorage.removeItem(`${this.SESSION_DATA_PREFIX}${sessionId}`);

      // If this was the active session, clear the active session ID
      const activeSessionId = await this.getActiveSessionId();
      if (activeSessionId === sessionId) {
        await AsyncStorage.removeItem(this.ACTIVE_SESSION_ID_KEY);
      }

      console.log('✅ Session deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }

  // Create a session from imported data
  async createSessionFromImport(importedData: AppData): Promise<SessionMetadata> {
    try {
      const sessionId = Date.now().toString();
      const sessionName = importedData.sessionId ? 
        `Imported Session (${new Date().toLocaleDateString()})` : 
        `Imported Data (${new Date().toLocaleDateString()})`;
      
      const newSession: SessionMetadata = {
        id: sessionId,
        name: sessionName,
        description: `Imported from ${importedData.version || 'unknown version'} on ${new Date(importedData.exportedAt).toLocaleDateString()}`,
        createdAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString()
      };

      const sessions = await this.getAllSessions();
      sessions.push(newSession);
      await this.saveSessions(sessions);

      // Save the imported data to the new session
      const sessionData: AppData = {
        ...importedData,
        sessionId,
        exportedAt: new Date().toISOString()
      };
      
      await this.saveSessionData(sessionId, sessionData);
      console.log('✅ Created session from import:', newSession);
      return newSession;
    } catch (error) {
      console.error('Error creating session from import:', error);
      throw error;
    }
  }

  // Clear all sessions and reset app
  async clearAllSessions(): Promise<void> {
    try {
      console.log('🚨 Clearing all sessions...');
      
      // Get all sessions to delete their data
      const sessions = await this.getAllSessions();
      
      // Remove all session data except demo session
      for (const session of sessions) {
        if (session.id !== this.DEMO_SESSION_ID) {
          await AsyncStorage.removeItem(`${this.SESSION_DATA_PREFIX}${session.id}`);
        }
      }

      // Clear sessions list and active session
      await AsyncStorage.multiRemove([
        this.SESSION_LIST_KEY,
        this.ACTIVE_SESSION_ID_KEY,
        storageService['HIDDEN_DEMO_SESSION_KEY'] // Clear hidden demo session state
      ]);

      // Clear all current app data
      await userService.clearAllData();
      
      // Reinitialize with demo session
      await this.getAllSessions(); // This will recreate the demo session
      
      console.log('✅ All sessions cleared');
    } catch (error) {
      console.error('Error clearing all sessions:', error);
      throw error;
    }
  }

  // Check if there's existing unsessioned data and migrate it
  async migrateExistingData(): Promise<string | null> {
    try {
      console.log('🔍 Checking for existing data to migrate...');
      
      // Check if there's any existing data
      const [notes, setups, settings, favorites] = await Promise.all([
        userService.getNotes(),
        userService.getSetups(),
        storageService.getSettings(),
        storageService.getFavorites()
      ]);

      // If there's any data, create a migration session
      if (notes.length > 0 || setups.length > 0 || favorites.length > 0) {
        console.log('📦 Found existing data, creating migration session...');
        console.log(`  - Notes: ${notes.length}`);
        console.log(`  - Setups: ${setups.length}`);
        console.log(`  - Favorites: ${favorites.length}`);
        
        const migrationSession = await this.createSession(
          'Migrated Data',
          'Your existing notes, setups, and settings from before sessions were introduced'
        );

        // The data is already in the current storage, so we just need to save it to the session
        await this.saveCurrentDataToSession(migrationSession.id);
        
        console.log('✅ Data migrated to session:', migrationSession.id);
        return migrationSession.id;
      }

      console.log('ℹ️ No existing data found to migrate');
      return null;
    } catch (error) {
      console.error('Error migrating existing data:', error);
      return null;
    }
  }

  // Update session metadata
  async updateSession(sessionId: string, updates: Partial<Pick<SessionMetadata, 'name' | 'description' | 'emoji'>>): Promise<boolean> {
    try {
      const sessions = await this.getAllSessions();
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex === -1) {
        return false;
      }

      sessions[sessionIndex] = {
        ...sessions[sessionIndex],
        ...updates,
        lastAccessedAt: new Date().toISOString()
      };

      await this.saveSessions(sessions);
      return true;
    } catch (error) {
      console.error('Error updating session:', error);
      return false;
    }
  }

  // Check if a session is the demo session
  isDemoSession(sessionId: string): boolean {
    return sessionId === this.DEMO_SESSION_ID;
  }

  // Get demo session ID
  getDemoSessionId(): string {
    return this.DEMO_SESSION_ID;
  }
}

export const sessionService = new SessionService();