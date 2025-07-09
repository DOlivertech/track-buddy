export interface TimeOfDay {
  period: 'DAWN' | 'MORNING' | 'MIDDAY' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
  label: string;
  color: string;
}

export function getTimeOfDay(): TimeOfDay {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour >= 5 && hour < 7) {
    return {
      period: 'DAWN',
      label: 'DAWN',
      color: '#F59E0B'
    };
  }
  
  if (hour >= 7 && hour < 12) {
    return {
      period: 'MORNING',
      label: 'MORNING',
      color: '#10B981'
    };
  }
  
  if (hour >= 12 && hour < 14) {
    return {
      period: 'MIDDAY',
      label: 'MIDDAY',
      color: '#F59E0B'
    };
  }
  
  if (hour >= 14 && hour < 18) {
    return {
      period: 'AFTERNOON',
      label: 'AFTERNOON',
      color: '#3B82F6'
    };
  }
  
  if (hour >= 18 && hour < 21) {
    return {
      period: 'EVENING',
      label: 'EVENING',
      color: '#8B5CF6'
    };
  }
  
  return {
    period: 'NIGHT',
    label: 'NIGHT',
    color: '#1F2937'
  };
}

export function getTimeOfDayDescription(timeOfDay: TimeOfDay): string {
  switch (timeOfDay.period) {
    case 'DAWN':
      return 'Early morning hours with rising sun and changing light conditions.';
    case 'MORNING':
      return 'Optimal morning conditions with good visibility and stable temperatures.';
    case 'MIDDAY':
      return 'Peak sun hours with maximum heat and intense lighting conditions.';
    case 'AFTERNOON':
      return 'Stable afternoon conditions with consistent temperatures and lighting.';
    case 'EVENING':
      return 'Late day conditions with setting sun and changing temperatures.';
    case 'NIGHT':
      return 'Night time conditions with artificial lighting and cooler temperatures.';
    default:
      return 'Current time of day for racing conditions.';
  }
}