import AsyncStorage from '@react-native-async-storage/async-storage';
import { RaceWeekend, ItineraryDay, ScheduleItem } from '@/types/user';

class ItineraryService {
  private readonly RACE_WEEKENDS_KEY = 'weather_app_race_weekends';

  // Race Weekend Management
  async getRaceWeekends(): Promise<RaceWeekend[]> {
    try {
      const weekends = await AsyncStorage.getItem(this.RACE_WEEKENDS_KEY);
      const allWeekends: RaceWeekend[] = weekends ? JSON.parse(weekends) : [];
      // Sort by start date (most recent first)
      return allWeekends.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    } catch (error) {
      console.error('Error loading race weekends:', error);
      return [];
    }
  }

  async saveRaceWeekend(weekend: Omit<RaceWeekend, 'id' | 'createdAt' | 'updatedAt'>): Promise<RaceWeekend> {
    try {
      const weekends = await this.getRaceWeekends();
      const newWeekend: RaceWeekend = {
        ...weekend,
        id: Date.now().toString(),
        days: weekend.days || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      weekends.push(newWeekend);
      await AsyncStorage.setItem(this.RACE_WEEKENDS_KEY, JSON.stringify(weekends));
      return newWeekend;
    } catch (error) {
      console.error('Error saving race weekend:', error);
      throw error;
    }
  }

  async updateRaceWeekend(id: string, updates: Partial<RaceWeekend>): Promise<RaceWeekend | null> {
    try {
      const weekends = await this.getRaceWeekends();
      const weekendIndex = weekends.findIndex(weekend => weekend.id === id);
      if (weekendIndex === -1) return null;

      weekends[weekendIndex] = {
        ...weekends[weekendIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(this.RACE_WEEKENDS_KEY, JSON.stringify(weekends));
      return weekends[weekendIndex];
    } catch (error) {
      console.error('Error updating race weekend:', error);
      return null;
    }
  }

  async deleteRaceWeekend(id: string): Promise<boolean> {
    try {
      const weekends = await this.getRaceWeekends();
      const filteredWeekends = weekends.filter(weekend => weekend.id !== id);
      if (weekends.length === filteredWeekends.length) {
        return false; // Weekend not found
      }
      await AsyncStorage.setItem(this.RACE_WEEKENDS_KEY, JSON.stringify(filteredWeekends));
      return true;
    } catch (error) {
      console.error('Error deleting race weekend:', error);
      return false;
    }
  }

  // Day Management
  async addDayToWeekend(weekendId: string, day: Omit<ItineraryDay, 'id' | 'createdAt' | 'updatedAt'>): Promise<ItineraryDay | null> {
    try {
      const weekends = await this.getRaceWeekends();
      const weekendIndex = weekends.findIndex(w => w.id === weekendId);
      if (weekendIndex === -1) return null;

      const newDay: ItineraryDay = {
        ...day,
        id: Date.now().toString(),
        scheduleItems: day.scheduleItems || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      weekends[weekendIndex].days.push(newDay);
      weekends[weekendIndex].updatedAt = new Date().toISOString();
      
      await AsyncStorage.setItem(this.RACE_WEEKENDS_KEY, JSON.stringify(weekends));
      return newDay;
    } catch (error) {
      console.error('Error adding day to weekend:', error);
      return null;
    }
  }

  async updateDay(weekendId: string, dayId: string, updates: Partial<ItineraryDay>): Promise<ItineraryDay | null> {
    try {
      const weekends = await this.getRaceWeekends();
      const weekendIndex = weekends.findIndex(w => w.id === weekendId);
      if (weekendIndex === -1) return null;

      const dayIndex = weekends[weekendIndex].days.findIndex(d => d.id === dayId);
      if (dayIndex === -1) return null;

      weekends[weekendIndex].days[dayIndex] = {
        ...weekends[weekendIndex].days[dayIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      weekends[weekendIndex].updatedAt = new Date().toISOString();

      await AsyncStorage.setItem(this.RACE_WEEKENDS_KEY, JSON.stringify(weekends));
      return weekends[weekendIndex].days[dayIndex];
    } catch (error) {
      console.error('Error updating day:', error);
      return null;
    }
  }

  async deleteDay(weekendId: string, dayId: string): Promise<boolean> {
    try {
      const weekends = await this.getRaceWeekends();
      const weekendIndex = weekends.findIndex(w => w.id === weekendId);
      if (weekendIndex === -1) return false;

      const originalLength = weekends[weekendIndex].days.length;
      weekends[weekendIndex].days = weekends[weekendIndex].days.filter(d => d.id !== dayId);
      
      if (weekends[weekendIndex].days.length === originalLength) {
        return false; // Day not found
      }

      weekends[weekendIndex].updatedAt = new Date().toISOString();
      await AsyncStorage.setItem(this.RACE_WEEKENDS_KEY, JSON.stringify(weekends));
      return true;
    } catch (error) {
      console.error('Error deleting day:', error);
      return false;
    }
  }

  // Schedule Item Management
  async addScheduleItem(weekendId: string, dayId: string, item: Omit<ScheduleItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ScheduleItem | null> {
    try {
      const weekends = await this.getRaceWeekends();
      const weekendIndex = weekends.findIndex(w => w.id === weekendId);
      if (weekendIndex === -1) return null;

      const dayIndex = weekends[weekendIndex].days.findIndex(d => d.id === dayId);
      if (dayIndex === -1) return null;

      const newItem: ScheduleItem = {
        ...item,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      weekends[weekendIndex].days[dayIndex].scheduleItems.push(newItem);
      weekends[weekendIndex].days[dayIndex].updatedAt = new Date().toISOString();
      weekends[weekendIndex].updatedAt = new Date().toISOString();

      await AsyncStorage.setItem(this.RACE_WEEKENDS_KEY, JSON.stringify(weekends));
      return newItem;
    } catch (error) {
      console.error('Error adding schedule item:', error);
      return null;
    }
  }

  async updateScheduleItem(weekendId: string, dayId: string, itemId: string, updates: Partial<ScheduleItem>): Promise<ScheduleItem | null> {
    try {
      const weekends = await this.getRaceWeekends();
      const weekendIndex = weekends.findIndex(w => w.id === weekendId);
      if (weekendIndex === -1) return null;

      const dayIndex = weekends[weekendIndex].days.findIndex(d => d.id === dayId);
      if (dayIndex === -1) return null;

      const itemIndex = weekends[weekendIndex].days[dayIndex].scheduleItems.findIndex(i => i.id === itemId);
      if (itemIndex === -1) return null;

      weekends[weekendIndex].days[dayIndex].scheduleItems[itemIndex] = {
        ...weekends[weekendIndex].days[dayIndex].scheduleItems[itemIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      weekends[weekendIndex].days[dayIndex].updatedAt = new Date().toISOString();
      weekends[weekendIndex].updatedAt = new Date().toISOString();

      await AsyncStorage.setItem(this.RACE_WEEKENDS_KEY, JSON.stringify(weekends));
      return weekends[weekendIndex].days[dayIndex].scheduleItems[itemIndex];
    } catch (error) {
      console.error('Error updating schedule item:', error);
      return null;
    }
  }

  async deleteScheduleItem(weekendId: string, dayId: string, itemId: string): Promise<boolean> {
    try {
      const weekends = await this.getRaceWeekends();
      const weekendIndex = weekends.findIndex(w => w.id === weekendId);
      if (weekendIndex === -1) return false;

      const dayIndex = weekends[weekendIndex].days.findIndex(d => d.id === dayId);
      if (dayIndex === -1) return false;

      const originalLength = weekends[weekendIndex].days[dayIndex].scheduleItems.length;
      weekends[weekendIndex].days[dayIndex].scheduleItems = 
        weekends[weekendIndex].days[dayIndex].scheduleItems.filter(i => i.id !== itemId);

      if (weekends[weekendIndex].days[dayIndex].scheduleItems.length === originalLength) {
        return false; // Item not found
      }

      weekends[weekendIndex].days[dayIndex].updatedAt = new Date().toISOString();
      weekends[weekendIndex].updatedAt = new Date().toISOString();
      await AsyncStorage.setItem(this.RACE_WEEKENDS_KEY, JSON.stringify(weekends));
      return true;
    } catch (error) {
      console.error('Error deleting schedule item:', error);
      return false;
    }
  }

  // Get a specific race weekend
  async getRaceWeekend(id: string): Promise<RaceWeekend | null> {
    try {
      const weekends = await this.getRaceWeekends();
      return weekends.find(w => w.id === id) || null;
    } catch (error) {
      console.error('Error getting race weekend:', error);
      return null;
    }
  }

  // Get a specific day
  async getDay(weekendId: string, dayId: string): Promise<ItineraryDay | null> {
    try {
      const weekend = await this.getRaceWeekend(weekendId);
      if (!weekend) return null;
      return weekend.days.find(d => d.id === dayId) || null;
    } catch (error) {
      console.error('Error getting day:', error);
      return null;
    }
  }
}

export const itineraryService = new ItineraryService();