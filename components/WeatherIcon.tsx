import { 
  Sun, 
  Moon, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  CloudDrizzle,
  Eye
} from 'lucide-react-native';

interface WeatherIconProps {
  icon: string;
  size?: number;
  color?: string;
}

export function WeatherIcon({ icon, size = 24, color = '#374151' }: WeatherIconProps) {
  const iconProps = { size, color };
  
  switch (icon) {
    case 'sunny':
      return <Sun {...iconProps} />;
    case 'clear-night':
      return <Moon {...iconProps} />;
    case 'partly-cloudy':
    case 'partly-cloudy-night':
      return <Cloud {...iconProps} />;
    case 'cloudy':
    case 'overcast':
      return <Cloud {...iconProps} />;
    case 'light-rain':
      return <CloudDrizzle {...iconProps} />;
    case 'rain':
    case 'heavy-rain':
      return <CloudRain {...iconProps} />;
    case 'thunderstorm':
      return <CloudLightning {...iconProps} />;
    case 'snow':
      return <CloudSnow {...iconProps} />;
    case 'mist':
      return <Eye {...iconProps} />;
    default:
      return <Cloud {...iconProps} />;
  }
}