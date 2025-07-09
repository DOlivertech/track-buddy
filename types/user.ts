export interface User {
  id: string;
  name: string;
  email?: string;
  profileImage?: string;
  createdAt: string;
}

export interface TrackNote {
  id: string;
  trackId: string;
  title: string;
  content: string;
  type: 'condition' | 'driver' | 'general' | 'setup';
  youtubeLinks?: string[];
  session?: {
    type: 'practice' | 'qualifying' | 'race';
    number?: number; // For multiple sessions of same type (Practice 1, Practice 2, etc.)
    date: string; // YYYY-MM-DD format
  };
  trackSnapshot?: {
    id: string;
    name: string;
    country: string;
    coordinates: {
      lat: number;
      lon: number;
    };
    capturedAt: string;
  };
  voiceNote?: {
    uri: string;
    duration: number; // in seconds
  };
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  description?: string;
  startTime: string; // HH:MM format
  endTime?: string; // HH:MM format
  notifications: {
    oneHour: boolean;
    thirtyMinutes: boolean;
    tenMinutes: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ItineraryDay {
  id: string;
  date: string; // YYYY-MM-DD format
  title: string;
  description?: string;
  imageUrl?: string;
  scheduleItems: ScheduleItem[];
  createdAt: string;
  updatedAt: string;
}

export interface RaceWeekend {
  id: string;
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
  trackId?: string;
  imageUrl?: string;
  days: ItineraryDay[];
  createdAt: string;
  updatedAt: string;
}
export interface TrackSetup {
  id: string;
  trackId: string;
  name: string;
  date: string;
  notes: string;
  setupData?: {
    tirePressures: {
      frontLeft: string;
      frontRight: string;
      rearLeft: string;
      rearRight: string;
    };
    springRates: {
      frontLeft: string;
      frontRight: string;
      rearLeft: string;
      rearRight: string;
    };
    swayBars: {
      front: string;
      rear: string;
    };
    wings: {
      front: string;
      rear: string;
    };
    fuelLevel: string;
  };
  trackSnapshot?: {
    id: string;
    name: string;
    country: string;
    coordinates: {
      lat: number;
      lon: number;
    };
    capturedAt: string;
  };
  weatherSnapshot?: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    condition: string;
    pressure: number;
    capturedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  user: User;
  notes: TrackNote[];
  setups: TrackSetup[];
  raceWeekends: RaceWeekend[];
  settings: any;
  favorites: string[];
  sessionId?: string;
  exportedAt: string;
  version: string;
}

export interface SessionMetadata {
  id: string;
  name: string;
  createdAt: string;
  lastAccessedAt: string;
  description?: string;
  emoji?: string;
  isDemo?: boolean;
}