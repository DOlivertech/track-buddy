import { AppData } from '@/types/user';

export const demoSessionData: AppData = {
  user: {
    id: 'demo-user-001',
    name: 'Demo Driver',
    email: 'demo@trackbuddy.com',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  notes: [
    {
      id: 'demo-note-001',
      trackId: 'silverstone',
      title: 'Perfect Practice Session',
      content: 'Excellent grip levels today. Track temperature at 28°C provided optimal conditions for tire performance. Car balance felt neutral through Maggotts and Becketts complex. Consider reducing rear wing by 1 click for qualifying.',
      type: 'condition',
      session: {
        type: 'practice',
        number: 1,
        date: '2024-01-15'
      },
      trackSnapshot: {
        id: 'silverstone',
        name: 'Silverstone Circuit',
        country: 'United Kingdom',
        coordinates: { lat: 52.0786, lon: -1.0169 },
        capturedAt: '2024-01-15T14:30:00.000Z'
      },
      createdAt: '2024-01-15T14:30:00.000Z',
      updatedAt: '2024-01-15T14:30:00.000Z'
    },
    {
      id: 'demo-note-002',
      trackId: 'silverstone',
      title: 'Qualifying Strategy Notes',
      content: 'Weather forecast shows 20% chance of rain for Q3. Prepared wet setup with increased ride height and softer suspension. Driver feedback: car feels planted in high-speed corners but needs more front grip in slow sections.',
      type: 'driver',
      session: {
        type: 'qualifying',
        number: 1,
        date: '2024-01-16'
      },
      trackSnapshot: {
        id: 'silverstone',
        name: 'Silverstone Circuit',
        country: 'United Kingdom',
        coordinates: { lat: 52.0786, lon: -1.0169 },
        capturedAt: '2024-01-16T15:45:00.000Z'
      },
      createdAt: '2024-01-16T15:45:00.000Z',
      updatedAt: '2024-01-16T15:45:00.000Z'
    },
    {
      id: 'demo-note-003',
      trackId: 'monaco',
      title: 'Monaco Street Circuit Analysis',
      content: 'Narrow track requires maximum downforce setup. Brake temperatures critical through Casino Square. Focus on smooth inputs and maintaining momentum through Swimming Pool section.',
      type: 'setup',
      session: {
        type: 'practice',
        number: 2,
        date: '2024-02-20'
      },
      trackSnapshot: {
        id: 'monaco',
        name: 'Monaco Grand Prix',
        country: 'Monaco',
        coordinates: { lat: 43.7347, lon: 7.4206 },
        capturedAt: '2024-02-20T11:15:00.000Z'
      },
      createdAt: '2024-02-20T11:15:00.000Z',
      updatedAt: '2024-02-20T11:15:00.000Z'
    }
  ],
  setups: [
    {
      id: 'demo-setup-001',
      trackId: 'silverstone',
      name: 'Silverstone High-Speed Setup',
      date: '2024-01-15',
      notes: 'Optimized for high-speed stability through Maggotts-Becketts complex. Reduced downforce for straight-line speed while maintaining cornering performance.',
      setupData: {
        tirePressures: {
          frontLeft: '32.5',
          frontRight: '32.5',
          rearLeft: '30.0',
          rearRight: '30.0'
        },
        springRates: {
          frontLeft: '65',
          frontRight: '65',
          rearLeft: '85',
          rearRight: '85'
        },
        swayBars: {
          front: '3',
          rear: '5'
        },
        wings: {
          front: '7',
          rear: '5'
        },
        fuelLevel: '110L'
      },
      trackSnapshot: {
        id: 'silverstone',
        name: 'Silverstone Circuit',
        country: 'United Kingdom',
        coordinates: { lat: 52.0786, lon: -1.0169 },
        capturedAt: '2024-01-15T14:00:00.000Z'
      },
      weatherSnapshot: {
        temperature: 18,
        humidity: 65,
        windSpeed: 15,
        windDirection: 240,
        condition: 'Partly Cloudy',
        pressure: 1013,
        capturedAt: '2024-01-15T14:00:00.000Z'
      },
      createdAt: '2024-01-15T14:00:00.000Z',
      updatedAt: '2024-01-15T14:00:00.000Z'
    },
    {
      id: 'demo-setup-002',
      trackId: 'monaco',
      name: 'Monaco Maximum Downforce',
      date: '2024-02-20',
      notes: 'Street circuit configuration with maximum downforce for tight corners. Softer suspension for better mechanical grip over bumps and kerbs.',
      setupData: {
        tirePressures: {
          frontLeft: '31.0',
          frontRight: '31.0',
          rearLeft: '29.5',
          rearRight: '29.5'
        },
        springRates: {
          frontLeft: '55',
          frontRight: '55',
          rearLeft: '75',
          rearRight: '75'
        },
        swayBars: {
          front: '2',
          rear: '4'
        },
        wings: {
          front: '11',
          rear: '9'
        },
        fuelLevel: '95L'
      },
      trackSnapshot: {
        id: 'monaco',
        name: 'Monaco Grand Prix',
        country: 'Monaco',
        coordinates: { lat: 43.7347, lon: 7.4206 },
        capturedAt: '2024-02-20T10:30:00.000Z'
      },
      weatherSnapshot: {
        temperature: 22,
        humidity: 70,
        windSpeed: 8,
        windDirection: 180,
        condition: 'Sunny',
        pressure: 1018,
        capturedAt: '2024-02-20T10:30:00.000Z'
      },
      createdAt: '2024-02-20T10:30:00.000Z',
      updatedAt: '2024-02-20T10:30:00.000Z'
    }
  ],
  raceWeekends: [
    {
      id: 'demo-weekend-001',
      title: 'Silverstone Grand Prix Weekend',
      description: 'British Grand Prix weekend at Silverstone Circuit',
      startDate: '2024-07-05',
      endDate: '2024-07-07',
      trackId: 'silverstone',
      imageUrl: 'https://images.pexels.com/photos/358220/pexels-photo-358220.jpeg?auto=compress&cs=tinysrgb&w=800',
      days: [
        {
          id: 'demo-day-001',
          date: '2024-07-05',
          title: 'Practice Day',
          description: 'Free practice sessions and setup work',
          scheduleItems: [
            {
              id: 'demo-item-001',
              title: 'Track Walk',
              description: 'Walk the circuit to check track conditions',
              startTime: '09:00',
              endTime: '10:00',
              notifications: {
                oneHour: true,
                thirtyMinutes: false,
                tenMinutes: true
              },
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z'
            },
            {
              id: 'demo-item-002',
              title: 'Free Practice 1',
              description: 'First practice session - baseline setup',
              startTime: '13:30',
              endTime: '14:30',
              notifications: {
                oneHour: true,
                thirtyMinutes: true,
                tenMinutes: true
              },
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z'
            }
          ],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 'demo-day-002',
          date: '2024-07-06',
          title: 'Qualifying Day',
          description: 'Final practice and qualifying sessions',
          scheduleItems: [
            {
              id: 'demo-item-003',
              title: 'Free Practice 2',
              description: 'Final practice - qualifying simulation',
              startTime: '12:00',
              endTime: '13:00',
              notifications: {
                oneHour: true,
                thirtyMinutes: true,
                tenMinutes: false
              },
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z'
            },
            {
              id: 'demo-item-004',
              title: 'Qualifying Session',
              description: 'Q1, Q2, Q3 qualifying format',
              startTime: '16:00',
              endTime: '17:00',
              notifications: {
                oneHour: true,
                thirtyMinutes: true,
                tenMinutes: true
              },
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z'
            }
          ],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
  ],
  settings: {
    temperatureUnit: 'celsius',
    windSpeedUnit: 'kmh',
    precipitationUnit: 'mm',
    selectedTrack: 'silverstone'
  },
  favorites: ['silverstone', 'monaco', 'spa'],
  sessionId: 'demo-session-001',
  exportedAt: '2024-01-01T00:00:00.000Z',
  version: '1.0.0'
};