import { WeatherData } from '@/types/weather';
import { demoWeatherData } from '@/data/demoWeatherData';
import { RacingTrack } from '@/types/weather';

class WeatherService {
  private baseUrl = 'https://api.open-meteo.com/v1';

  async getWeatherData(track: RacingTrack): Promise<WeatherData> {
    try {
      const { lat, lon } = track.coordinates;
      
      // Open-Meteo API request with all required parameters
      const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lon.toString(),
        current: [
          'temperature_2m',
          'apparent_temperature',
          'relative_humidity_2m',
          'precipitation',
          'weather_code',
          'cloud_cover',
          'pressure_msl',
          'wind_speed_10m',
          'wind_direction_10m'
        ].join(','),
        hourly: [
          'temperature_2m',
          'relative_humidity_2m',
          'precipitation_probability',
          'precipitation',
          'weather_code',
          'wind_speed_10m'
        ].join(','),
        daily: [
          'weather_code',
          'temperature_2m_max',
          'temperature_2m_min',
          'precipitation_sum',
          'precipitation_probability_max',
          'wind_speed_10m_max'
        ].join(','),
        timezone: 'auto',
        forecast_days: '5'
      });

      const response = await fetch(`${this.baseUrl}/forecast?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      return this.transformOpenMeteoData(data, track);
    } catch (error) {
      console.error('Weather API error:', error);
      // Fallback to demo data
      return {
        ...demoWeatherData,
        location: track.name,
        country: track.country
      };
    }
  }

  private transformOpenMeteoData(data: any, track: RacingTrack): WeatherData {
    const current = data.current;
    const hourly = data.hourly;
    const daily = data.daily;

    // Get current hour index to start hourly forecast from next hour
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const startIndex = Math.max(0, currentHour + 1);

    // Transform hourly data (next 6 hours)
    const hourlyData = [];
    for (let i = startIndex; i < Math.min(startIndex + 6, hourly.time.length); i++) {
      const time = new Date(hourly.time[i]);
      hourlyData.push({
        time: time.toLocaleTimeString('en-US', { 
          hour: 'numeric',
          hour12: true 
        }),
        temperature: Math.round(hourly.temperature_2m[i] || 0),
        humidity: Math.round(hourly.relative_humidity_2m[i] || 0),
        windSpeed: Math.round(hourly.wind_speed_10m[i] || 0),
        precipitationAmount: Math.round((hourly.precipitation[i] || 0) * 100) / 100,
        precipitationProbability: Math.round(hourly.precipitation_probability[i] || 0),
        condition: this.getWeatherCondition(hourly.weather_code[i]),
        conditionIcon: this.mapWeatherIcon(hourly.weather_code[i])
      });
    }

    // Transform daily data
    const dailyData = [];
    const dayNames = ['Today', 'Tomorrow'];
    
    for (let i = 0; i < Math.min(5, daily.time.length); i++) {
      const date = new Date(daily.time[i]);
      let dayLabel;
      
      if (i < dayNames.length) {
        dayLabel = dayNames[i];
      } else {
        dayLabel = date.toLocaleDateString('en-US', { weekday: 'long' });
      }

      dailyData.push({
        date: dayLabel,
        minTemp: Math.round(daily.temperature_2m_min[i] || 0),
        maxTemp: Math.round(daily.temperature_2m_max[i] || 0),
        humidity: 65, // Open-Meteo doesn't provide daily humidity, using average
        windSpeed: Math.round(daily.wind_speed_10m_max[i] || 0),
        precipitationAmount: Math.round((daily.precipitation_sum[i] || 0) * 100) / 100,
        precipitationProbability: Math.round(daily.precipitation_probability_max[i] || 0),
        condition: this.getWeatherCondition(daily.weather_code[i]),
        conditionIcon: this.mapWeatherIcon(daily.weather_code[i])
      });
    }

    return {
      location: track.name,
      country: track.country,
      current: {
        temperature: Math.round(current.temperature_2m || 0),
        feelsLike: Math.round(current.apparent_temperature || current.temperature_2m || 0),
        humidity: Math.round(current.relative_humidity_2m || 0),
        windSpeed: Math.round(current.wind_speed_10m || 0),
        windDirection: Math.round(current.wind_direction_10m || 0),
        pressure: Math.round(current.pressure_msl || 1013),
        visibility: 10, // Open-Meteo doesn't provide visibility, using default
        uvIndex: 0, // Open-Meteo doesn't provide UV index in free tier
        cloudCover: Math.round(current.cloud_cover || 0),
        precipitation: Math.round((current.precipitation || 0) * 100) / 100,
        condition: this.getWeatherCondition(current.weather_code),
        conditionIcon: this.mapWeatherIcon(current.weather_code)
      },
      hourly: hourlyData,
      daily: dailyData
    };
  }

  private getWeatherCondition(code: number): string {
    const conditions: { [key: number]: string } = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      56: 'Light freezing drizzle',
      57: 'Dense freezing drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      66: 'Light freezing rain',
      67: 'Heavy freezing rain',
      71: 'Slight snow fall',
      73: 'Moderate snow fall',
      75: 'Heavy snow fall',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail'
    };
    
    return conditions[code] || 'Unknown';
  }

  private mapWeatherIcon(code: number): string {
    if (code === 0) return 'sunny';
    if (code === 1) return 'partly-cloudy';
    if (code === 2) return 'partly-cloudy';
    if (code === 3) return 'cloudy';
    if (code === 45 || code === 48) return 'mist';
    if (code >= 51 && code <= 57) return 'light-rain';
    if (code >= 61 && code <= 67) return 'rain';
    if (code >= 71 && code <= 77) return 'snow';
    if (code >= 80 && code <= 82) return 'rain';
    if (code >= 85 && code <= 86) return 'snow';
    if (code >= 95 && code <= 99) return 'thunderstorm';
    
    return 'partly-cloudy';
  }
}

export const weatherService = new WeatherService();