import { WeatherData } from '@/types/weather';

export const demoWeatherData: WeatherData = {
  location: 'Silverstone Circuit',
  country: 'United Kingdom',
  current: {
    temperature: 18,
    feelsLike: 16,
    humidity: 65,
    windSpeed: 15,
    windDirection: 240,
    pressure: 1013,
    visibility: 10,
    uvIndex: 4,
    cloudCover: 40,
    precipitation: 0,
    condition: 'Partly Cloudy',
    conditionIcon: 'partly-cloudy'
  },
  hourly: [
    {
      time: '2 PM',
      temperature: 18,
      humidity: 65,
      windSpeed: 15,
      precipitationAmount: 0,
      precipitationProbability: 0,
      condition: 'Partly Cloudy',
      conditionIcon: 'partly-cloudy'
    },
    {
      time: '3 PM',
      temperature: 19,
      humidity: 62,
      windSpeed: 12,
      precipitationAmount: 0,
      precipitationProbability: 0,
      condition: 'Sunny',
      conditionIcon: 'sunny'
    },
    {
      time: '4 PM',
      temperature: 20,
      humidity: 58,
      windSpeed: 10,
      precipitationAmount: 0,
      precipitationProbability: 0,
      condition: 'Sunny',
      conditionIcon: 'sunny'
    },
    {
      time: '5 PM',
      temperature: 19,
      humidity: 60,
      windSpeed: 8,
      precipitationAmount: 0,
      precipitationProbability: 0,
      condition: 'Partly Cloudy',
      conditionIcon: 'partly-cloudy'
    },
    {
      time: '6 PM',
      temperature: 17,
      humidity: 68,
      windSpeed: 12,
      precipitationAmount: 2.5,
      precipitationProbability: 10,
      condition: 'Light Rain',
      conditionIcon: 'light-rain'
    },
    {
      time: '7 PM',
      temperature: 16,
      humidity: 75,
      windSpeed: 18,
      precipitationAmount: 5.2,
      precipitationProbability: 20,
      condition: 'Rain',
      conditionIcon: 'rain'
    }
  ],
  daily: [
    {
      date: 'Today',
      minTemp: 12,
      maxTemp: 20,
      humidity: 68,
      windSpeed: 15,
      precipitationAmount: 3.2,
      precipitationProbability: 20,
      condition: 'Partly Cloudy',
      conditionIcon: 'partly-cloudy'
    },
    {
      date: 'Tomorrow',
      minTemp: 10,
      maxTemp: 16,
      humidity: 75,
      windSpeed: 22,
      precipitationAmount: 12.5,
      precipitationProbability: 60,
      condition: 'Rain',
      conditionIcon: 'rain'
    },
    {
      date: 'Wednesday',
      minTemp: 8,
      maxTemp: 14,
      humidity: 80,
      windSpeed: 25,
      precipitationAmount: 25.8,
      precipitationProbability: 80,
      condition: 'Heavy Rain',
      conditionIcon: 'heavy-rain'
    },
    {
      date: 'Thursday',
      minTemp: 11,
      maxTemp: 18,
      humidity: 60,
      windSpeed: 18,
      precipitationAmount: 1.2,
      precipitationProbability: 30,
      condition: 'Partly Cloudy',
      conditionIcon: 'partly-cloudy'
    },
    {
      date: 'Friday',
      minTemp: 13,
      maxTemp: 22,
      humidity: 55,
      windSpeed: 12,
      precipitationAmount: 0,
      precipitationProbability: 10,
      condition: 'Sunny',
      conditionIcon: 'sunny'
    }
  ]
};