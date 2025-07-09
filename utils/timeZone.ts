import { RacingTrack } from '@/types/weather';

// Time zone mappings for racing tracks
const TRACK_TIMEZONES: { [key: string]: string } = {
  // Formula 1 Tracks
  'silverstone': 'Europe/London',
  'monaco': 'Europe/Monaco',
  'monza': 'Europe/Rome',
  'spa': 'Europe/Brussels',
  'suzuka': 'Asia/Tokyo',
  'austin': 'America/Chicago',
  'interlagos': 'America/Sao_Paulo',
  'melbourne': 'Australia/Melbourne',
  'bahrain': 'Asia/Bahrain',
  'imola': 'Europe/Rome',
  'miami': 'America/New_York',
  'barcelona': 'Europe/Madrid',
  'canada': 'America/Montreal',
  'red-bull-ring': 'Europe/Vienna',
  'hungaroring': 'Europe/Budapest',
  'zandvoort': 'Europe/Amsterdam',
  'singapore': 'Asia/Singapore',
  'mexico': 'America/Mexico_City',
  'las-vegas': 'America/Los_Angeles',
  'qatar': 'Asia/Qatar',
  'abu-dhabi': 'Asia/Dubai',
  'saudi-arabia': 'Asia/Riyadh',
  
  // MotoGP Tracks
  'mugello': 'Europe/Rome',
  'assen': 'Europe/Amsterdam',
  'phillip-island': 'Australia/Melbourne',
  'jerez': 'Europe/Madrid',
  'le-mans-motogp': 'Europe/Paris',
  'sachsenring': 'Europe/Berlin',
  'brno': 'Europe/Prague',
  'misano': 'Europe/Rome',
  'aragon': 'Europe/Madrid',
  'motegi': 'Asia/Tokyo',
  'sepang': 'Asia/Kuala_Lumpur',
  'valencia-motogp': 'Europe/Madrid',
  
  // NASCAR Tracks
  'daytona': 'America/New_York',
  'talladega': 'America/Chicago',
  'charlotte': 'America/New_York',
  'bristol': 'America/New_York',
  'martinsville': 'America/New_York',
  'richmond': 'America/New_York',
  'dover': 'America/New_York',
  'pocono': 'America/New_York',
  'michigan': 'America/Detroit',
  'kansas': 'America/Chicago',
  'texas-motor-speedway': 'America/Chicago',
  'phoenix': 'America/Phoenix',
  'homestead': 'America/New_York',
  'watkins-glen': 'America/New_York',
  'sonoma': 'America/Los_Angeles',
  
  // IndyCar Tracks
  'indianapolis': 'America/Indiana/Indianapolis',
  'long-beach': 'America/Los_Angeles',
  'st-petersburg': 'America/New_York',
  'barber': 'America/Chicago',
  'road-america': 'America/Chicago',
  'mid-ohio': 'America/New_York',
  'toronto': 'America/Toronto',
  'iowa-speedway': 'America/Chicago',
  'gateway': 'America/Chicago',
  'portland': 'America/Los_Angeles',
  'laguna-seca': 'America/Los_Angeles',
  
  // Club Level & Regional Tracks - United States
  'harris-hill-raceway': 'America/Chicago',
  'g2-motorsports-park': 'America/Chicago',
  'msr-houston': 'America/Chicago',
  'eagles-canyon-raceway': 'America/Chicago',
  'motorsport-ranch': 'America/Chicago',
  'hallett-motor-racing-circuit': 'America/Chicago',
  'heartland-motorsports-park': 'America/Chicago',
  'thunderhill-raceway': 'America/Los_Angeles',
  'buttonwillow-raceway': 'America/Los_Angeles',
  'willow-springs': 'America/Los_Angeles',
  'chuckwalla-valley-raceway': 'America/Los_Angeles',
  'auto-club-speedway': 'America/Los_Angeles',
  'streets-of-willow': 'America/Los_Angeles',
  'big-willow': 'America/Los_Angeles',
  'thermal-club': 'America/Los_Angeles',
  'spring-mountain-motorsports': 'America/Los_Angeles',
  'miller-motorsports-park': 'America/Denver',
  'pikes-peak-international-raceway': 'America/Denver',
  'high-plains-raceway': 'America/Denver',
  'pueblo-motorsports-park': 'America/Denver',
  'hastings-raceway': 'America/Chicago',
  'motorsport-park-hastings': 'America/Chicago',
  'brainerd-international-raceway': 'America/Chicago',
  'dakota-county-technical-college': 'America/Chicago',
  'blackhawk-farms-raceway': 'America/Chicago',
  'autobahn-country-club': 'America/Chicago',
  'gingerman-raceway': 'America/Detroit',
  'grattan-raceway': 'America/Detroit',
  'waterford-hills-road-racing': 'America/Detroit',
  'putnam-park-road-course': 'America/Indiana/Indianapolis',
  'bluegrass-motorsport': 'America/New_York',
  'nelson-ledges-road-course': 'America/New_York',
  'mid-america-motorplex': 'America/Chicago',
  'carolina-motorsports-park': 'America/New_York',
  'roebling-road-raceway': 'America/New_York',
  'atlanta-motorsports-park': 'America/New_York',
  'road-atlanta': 'America/New_York',
  'sebring-international-raceway': 'America/New_York',
  'palm-beach-international-raceway': 'America/New_York',
  'moroso-motorsports-park': 'America/New_York',
  'virginia-international-raceway': 'America/New_York',
  'summit-point-raceway': 'America/New_York',
  'new-jersey-motorsports-park': 'America/New_York',
  'lime-rock-park': 'America/New_York',
  'thompson-speedway-motorsports-park': 'America/New_York',
  'new-hampshire-motor-speedway': 'America/New_York',
  'palmer-motorsports-park': 'America/New_York',
  'club-motorsports': 'America/New_York',
  'monticello-motor-club': 'America/New_York',
  'the-glen': 'America/New_York',
  'finger-lakes-racing': 'America/New_York',
  'pittsburgh-international-race-complex': 'America/New_York',
  'beaverun-motorsports-complex': 'America/New_York',
  
  // International Club Level Tracks - United Kingdom
  'donnington-park': 'Europe/London',
  'brands-hatch': 'Europe/London',
  'oulton-park': 'Europe/London',
  'snetterton': 'Europe/London',
  'thruxton': 'Europe/London',
  'cadwell-park': 'Europe/London',
  'mallory-park': 'Europe/London',
  'castle-combe': 'Europe/London',
  'knockhill': 'Europe/London',
  'anglesey-circuit': 'Europe/London',
  'pembrey-circuit': 'Europe/London',
  'croft-circuit': 'Europe/London',
  'rockingham-motor-speedway': 'Europe/London',
  
  // Germany
  'nurburgring-nordschleife': 'Europe/Berlin',
  'nurburgring-gp': 'Europe/Berlin',
  'hockenheimring': 'Europe/Berlin',
  'lausitzring': 'Europe/Berlin',
  'oschersleben': 'Europe/Berlin',
  
  // Austria
  'salzburgring': 'Europe/Vienna',
  
  // Czech Republic
  'most': 'Europe/Prague',
  
  // Slovakia
  'slovakia-ring': 'Europe/Bratislava',
  
  // Hungary
  'pannonia-ring': 'Europe/Budapest',
  
  // France
  'paul-ricard': 'Europe/Paris',
  'magny-cours': 'Europe/Paris',
  'dijon-prenois': 'Europe/Paris',
  'nogaro': 'Europe/Paris',
  'ledenon': 'Europe/Paris',
  'albi': 'Europe/Paris',
  'croix-en-ternois': 'Europe/Paris',
  
  // Belgium
  'zolder': 'Europe/Brussels',
  
  // Netherlands
  'zandvoort-club': 'Europe/Amsterdam',
  'assen-club': 'Europe/Amsterdam',
  
  // Italy
  'vallelunga': 'Europe/Rome',
  'adria': 'Europe/Rome',
  'varano': 'Europe/Rome',
  'binetto': 'Europe/Rome',
  
  // Portugal
  'estoril': 'Europe/Lisbon',
  'portimao': 'Europe/Lisbon',
  
  // Spain
  'jarama': 'Europe/Madrid',
  'navarra': 'Europe/Madrid',
  'cartagena': 'Europe/Madrid',
  'almeria': 'Europe/Madrid',
  
  // Sweden
  'anderstorp': 'Europe/Stockholm',
  'mantorp-park': 'Europe/Stockholm',
  
  // Norway
  'rudskogen': 'Europe/Oslo',
  
  // Finland
  'ahvenisto': 'Europe/Helsinki',
  'botniaring': 'Europe/Helsinki',
  'alastaro': 'Europe/Helsinki',
  
  // Australia
  'eastern-creek': 'Australia/Sydney',
  'sandown': 'Australia/Melbourne',
  'winton': 'Australia/Melbourne',
  'wakefield-park': 'Australia/Sydney',
  'mallala': 'Australia/Adelaide',
  'barbagallo': 'Australia/Perth',
  'queensland-raceway': 'Australia/Brisbane',
  'lakeside': 'Australia/Brisbane',
  'hidden-valley': 'Australia/Darwin',
  'symmons-plains': 'Australia/Hobart',
  
  // New Zealand
  'pukekohe': 'Pacific/Auckland',
  'manfeild': 'Pacific/Auckland',
  'hampton-downs': 'Pacific/Auckland',
  'highlands-motorsport-park': 'Pacific/Auckland',
  'teretonga': 'Pacific/Auckland',
  
  // Japan
  'fuji-speedway': 'Asia/Tokyo',
  'okayama': 'Asia/Tokyo',
  'autopolis': 'Asia/Tokyo',
  'ebisu': 'Asia/Tokyo',
  'tsukuba': 'Asia/Tokyo',
  'mine': 'Asia/Tokyo',
  'sugo': 'Asia/Tokyo',
  
  // South Korea
  'korean-international-circuit': 'Asia/Seoul',
  'inje-speedium': 'Asia/Seoul',
  'everland-speedway': 'Asia/Seoul',
  
  // China
  'shanghai-international-circuit': 'Asia/Shanghai',
  'zhuhai': 'Asia/Shanghai',
  'beijing-goldenport': 'Asia/Shanghai',
  'ordos': 'Asia/Shanghai',
  
  // Indonesia
  'sentul': 'Asia/Jakarta',
  
  // Thailand
  'chang-international-circuit': 'Asia/Bangkok',
  'bira-circuit': 'Asia/Bangkok',
  
  // United Arab Emirates
  'dubai-autodrome': 'Asia/Dubai',
  'dubai-kartdrome': 'Asia/Dubai',
  
  // South Africa
  'kyalami': 'Africa/Johannesburg',
  'killarney': 'Africa/Johannesburg',
  'east-london': 'Africa/Johannesburg',
  'zwartkops': 'Africa/Johannesburg',
  'red-star-raceway': 'Africa/Johannesburg',
  
  // Mexico
  'autodromo-hermanos-rodriguez': 'America/Mexico_City',
  'autodromo-miguel-e-abed': 'America/Mexico_City',
  'autodromo-potosino': 'America/Mexico_City',
  
  // Brazil
  'jacarepagua': 'America/Sao_Paulo',
  'goiania': 'America/Sao_Paulo',
  'taruma': 'America/Sao_Paulo',
  'curitiba': 'America/Sao_Paulo',
  'velopark': 'America/Sao_Paulo',
  
  // Argentina
  'buenos-aires': 'America/Argentina/Buenos_Aires',
  'termas-de-rio-hondo': 'America/Argentina/Buenos_Aires',
  'san-juan-villicum': 'America/Argentina/Buenos_Aires',
  'la-plata': 'America/Argentina/Buenos_Aires',
  
  // Canada
  'mosport': 'America/Toronto',
  'mont-tremblant': 'America/Montreal',
  'shannonville': 'America/Toronto',
  'grand-bend': 'America/Toronto',
  'atlantic-motorsport-park': 'America/Halifax'
};

export function getTrackLocalTime(track: RacingTrack): string {
  try {
    const timezone = TRACK_TIMEZONES[track.id] || 'UTC';
    const now = new Date();
    
    return now.toLocaleTimeString('en-GB', {
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error getting track local time:', error);
    // Fallback to UTC time
    return new Date().toLocaleTimeString('en-GB', {
      timeZone: 'UTC',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

export function getTrackTimezone(track: RacingTrack): string {
  return TRACK_TIMEZONES[track.id] || 'UTC';
}

export function formatTrackTime(track: RacingTrack, date: Date = new Date()): string {
  try {
    const timezone = TRACK_TIMEZONES[track.id] || 'UTC';
    
    return date.toLocaleTimeString('en-GB', {
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting track time:', error);
    return date.toLocaleTimeString('en-GB', {
      timeZone: 'UTC',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}