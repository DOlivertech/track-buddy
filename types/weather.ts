export interface WeatherData {
  location: string;
  country: string;
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    pressure: number;
    visibility: number;
    uvIndex: number;
    cloudCover: number;
    precipitation: number;
    condition: string;
    conditionIcon: string;
  };
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitationAmount: number;
  precipitationProbability: number;
  condition: string;
  conditionIcon: string;
}

export interface DailyForecast {
  date: string;
  minTemp: number;
  maxTemp: number;
  humidity: number;
  windSpeed: number;
  precipitationAmount: number;
  precipitationProbability: number;
  condition: string;
  conditionIcon: string;
}

export interface RacingTrack {
  id: string;
  name: string;
  country: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  category: 'F1' | 'MotoGP' | 'NASCAR' | 'IndyCar' | 'Other';
}

export interface RaceCondition {
  type: 'OPTIMAL' | 'WET' | 'WINDY' | 'POOR_VIS' | 'EXTREME';
  label: string;
  color: string;
}

export interface UserSettings {
  temperatureUnit: 'celsius' | 'fahrenheit';
  windSpeedUnit: 'kmh' | 'mph';
  precipitationUnit: 'mm' | 'inches';
  selectedTrack: string;
}