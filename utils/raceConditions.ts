import { WeatherData, RaceCondition } from '@/types/weather';

export function getRaceCondition(weather: WeatherData): RaceCondition {
  const { current } = weather;
  
  // Extreme conditions
  if (current.windSpeed > 40 || current.precipitation > 50) {
    return {
      type: 'EXTREME',
      label: 'EXTREME',
      color: '#DC2626'
    };
  }
  
  // Wet conditions - check precipitation amount
  if (current.precipitation > 0 || current.humidity > 85) {
    return {
      type: 'WET',
      label: 'WET',
      color: '#2563EB'
    };
  }
  
  // Windy conditions
  if (current.windSpeed > 25) {
    return {
      type: 'WINDY',
      label: 'WINDY',
      color: '#D97706'
    };
  }
  
  // Poor visibility
  if (current.visibility < 5 || current.cloudCover > 80) {
    return {
      type: 'POOR_VIS',
      label: 'POOR VIS',
      color: '#9333EA'
    };
  }
  
  // Optimal conditions
  return {
    type: 'OPTIMAL',
    label: 'OPTIMAL',
    color: '#16A34A'
  };
}

export function convertTemperature(temp: number, unit: 'celsius' | 'fahrenheit'): number {
  if (unit === 'fahrenheit') {
    return Math.round((temp * 9/5) + 32);
  }
  return temp;
}

export function convertWindSpeed(speed: number, unit: 'kmh' | 'mph'): number {
  if (unit === 'mph') {
    return Math.round(speed * 0.621371);
  }
  return speed;
}

export function getTemperatureUnit(unit: 'celsius' | 'fahrenheit'): string {
  return unit === 'celsius' ? '°C' : '°F';
}

export function getWindSpeedUnit(unit: 'kmh' | 'mph'): string {
  return unit === 'kmh' ? 'km/h' : 'mph';
}

export function getCardinalDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

export function convertPrecipitation(value: number, unit: 'mm' | 'inches'): number {
  if (unit === 'inches') {
    return Math.round((value * 0.0393701) * 100) / 100; // Convert mm to inches with 2 decimal places
  }
  return value;
}

export function getPrecipitationUnit(unit: 'mm' | 'inches'): string {
  return unit === 'mm' ? 'mm' : 'in';
}