import { RacingTrack } from '@/types/weather';

export const racingTracks: RacingTrack[] = [
  // Formula 1 Tracks
  {
    id: 'silverstone',
    name: 'Silverstone Circuit',
    country: 'United Kingdom',
    coordinates: { lat: 52.0786, lon: -1.0169 },
    category: 'F1'
  },
  {
    id: 'monaco',
    name: 'Monaco Grand Prix',
    country: 'Monaco',
    coordinates: { lat: 43.7347, lon: 7.4206 },
    category: 'F1'
  },
  {
    id: 'monza',
    name: 'Autodromo Nazionale Monza',
    country: 'Italy',
    coordinates: { lat: 45.6156, lon: 9.2811 },
    category: 'F1'
  },
  {
    id: 'spa',
    name: 'Circuit de Spa-Francorchamps',
    country: 'Belgium',
    coordinates: { lat: 50.4372, lon: 5.9714 },
    category: 'F1'
  },
  {
    id: 'suzuka',
    name: 'Suzuka International Racing Course',
    country: 'Japan',
    coordinates: { lat: 34.8431, lon: 136.5408 },
    category: 'F1'
  },
  {
    id: 'austin',
    name: 'Circuit of the Americas',
    country: 'United States',
    coordinates: { lat: 30.1328, lon: -97.6411 },
    category: 'F1'
  },
  {
    id: 'interlagos',
    name: 'Autódromo José Carlos Pace',
    country: 'Brazil',
    coordinates: { lat: -23.7036, lon: -46.6997 },
    category: 'F1'
  },
  {
    id: 'melbourne',
    name: 'Albert Park Circuit',
    country: 'Australia',
    coordinates: { lat: -37.8497, lon: 144.9681 },
    category: 'F1'
  },
  {
    id: 'bahrain',
    name: 'Bahrain International Circuit',
    country: 'Bahrain',
    coordinates: { lat: 26.0325, lon: 50.5106 },
    category: 'F1'
  },
  {
    id: 'imola',
    name: 'Autodromo Enzo e Dino Ferrari',
    country: 'Italy',
    coordinates: { lat: 44.3439, lon: 11.7167 },
    category: 'F1'
  },
  {
    id: 'miami',
    name: 'Miami International Autodrome',
    country: 'United States',
    coordinates: { lat: 25.9581, lon: -80.2389 },
    category: 'F1'
  },
  {
    id: 'barcelona',
    name: 'Circuit de Barcelona-Catalunya',
    country: 'Spain',
    coordinates: { lat: 41.5700, lon: 2.2611 },
    category: 'F1'
  },
  {
    id: 'canada',
    name: 'Circuit Gilles Villeneuve',
    country: 'Canada',
    coordinates: { lat: 45.5000, lon: -73.5228 },
    category: 'F1'
  },
  {
    id: 'red-bull-ring',
    name: 'Red Bull Ring',
    country: 'Austria',
    coordinates: { lat: 47.2197, lon: 14.7647 },
    category: 'F1'
  },
  {
    id: 'hungaroring',
    name: 'Hungaroring',
    country: 'Hungary',
    coordinates: { lat: 47.5789, lon: 19.2486 },
    category: 'F1'
  },
  {
    id: 'zandvoort',
    name: 'Circuit Zandvoort',
    country: 'Netherlands',
    coordinates: { lat: 52.3888, lon: 4.5409 },
    category: 'F1'
  },
  {
    id: 'singapore',
    name: 'Marina Bay Street Circuit',
    country: 'Singapore',
    coordinates: { lat: 1.2914, lon: 103.8640 },
    category: 'F1'
  },
  {
    id: 'mexico',
    name: 'Autódromo Hermanos Rodríguez',
    country: 'Mexico',
    coordinates: { lat: 19.4042, lon: -99.0907 },
    category: 'F1'
  },
  {
    id: 'las-vegas',
    name: 'Las Vegas Street Circuit',
    country: 'United States',
    coordinates: { lat: 36.1147, lon: -115.1728 },
    category: 'F1'
  },
  {
    id: 'qatar',
    name: 'Lusail International Circuit',
    country: 'Qatar',
    coordinates: { lat: 25.4900, lon: 51.4542 },
    category: 'F1'
  },
  {
    id: 'abu-dhabi',
    name: 'Yas Marina Circuit',
    country: 'United Arab Emirates',
    coordinates: { lat: 24.4672, lon: 54.6031 },
    category: 'F1'
  },
  {
    id: 'saudi-arabia',
    name: 'Jeddah Corniche Circuit',
    country: 'Saudi Arabia',
    coordinates: { lat: 21.6319, lon: 39.1044 },
    category: 'F1'
  },
  
  // MotoGP Tracks
  {
    id: 'mugello',
    name: 'Mugello Circuit',
    country: 'Italy',
    coordinates: { lat: 43.9975, lon: 11.3719 },
    category: 'MotoGP'
  },
  {
    id: 'assen',
    name: 'TT Circuit Assen',
    country: 'Netherlands',
    coordinates: { lat: 52.9581, lon: 6.5153 },
    category: 'MotoGP'
  },
  {
    id: 'phillip-island',
    name: 'Phillip Island Grand Prix Circuit',
    country: 'Australia',
    coordinates: { lat: -38.5097, lon: 145.2881 },
    category: 'MotoGP'
  },
  {
    id: 'jerez',
    name: 'Circuito de Jerez',
    country: 'Spain',
    coordinates: { lat: 36.7086, lon: -6.0339 },
    category: 'MotoGP'
  },
  {
    id: 'le-mans-motogp',
    name: 'Circuit Bugatti Le Mans',
    country: 'France',
    coordinates: { lat: 47.9567, lon: 0.2086 },
    category: 'MotoGP'
  },
  {
    id: 'sachsenring',
    name: 'Sachsenring',
    country: 'Germany',
    coordinates: { lat: 50.7928, lon: 12.6936 },
    category: 'MotoGP'
  },
  {
    id: 'brno',
    name: 'Automotodrom Brno',
    country: 'Czech Republic',
    coordinates: { lat: 49.2150, lon: 16.4300 },
    category: 'MotoGP'
  },
  {
    id: 'misano',
    name: 'Misano World Circuit Marco Simoncelli',
    country: 'Italy',
    coordinates: { lat: 43.9356, lon: 12.6869 },
    category: 'MotoGP'
  },
  {
    id: 'aragon',
    name: 'MotorLand Aragón',
    country: 'Spain',
    coordinates: { lat: 41.2719, lon: -0.3306 },
    category: 'MotoGP'
  },
  {
    id: 'motegi',
    name: 'Twin Ring Motegi',
    country: 'Japan',
    coordinates: { lat: 36.5439, lon: 140.2269 },
    category: 'MotoGP'
  },
  {
    id: 'sepang',
    name: 'Sepang International Circuit',
    country: 'Malaysia',
    coordinates: { lat: 2.7608, lon: 101.7381 },
    category: 'MotoGP'
  },
  {
    id: 'valencia-motogp',
    name: 'Circuit Ricardo Tormo',
    country: 'Spain',
    coordinates: { lat: 39.4889, lon: -0.6306 },
    category: 'MotoGP'
  },
  
  // NASCAR Tracks
  {
    id: 'daytona',
    name: 'Daytona International Speedway',
    country: 'United States',
    coordinates: { lat: 29.1869, lon: -81.0714 },
    category: 'NASCAR'
  },
  {
    id: 'talladega',
    name: 'Talladega Superspeedway',
    country: 'United States',
    coordinates: { lat: 33.5681, lon: -86.0647 },
    category: 'NASCAR'
  },
  {
    id: 'charlotte',
    name: 'Charlotte Motor Speedway',
    country: 'United States',
    coordinates: { lat: 35.3503, lon: -80.6828 },
    category: 'NASCAR'
  },
  {
    id: 'bristol',
    name: 'Bristol Motor Speedway',
    country: 'United States',
    coordinates: { lat: 36.5156, lon: -82.2581 },
    category: 'NASCAR'
  },
  {
    id: 'martinsville',
    name: 'Martinsville Speedway',
    country: 'United States',
    coordinates: { lat: 36.6356, lon: -79.8472 },
    category: 'NASCAR'
  },
  {
    id: 'richmond',
    name: 'Richmond Raceway',
    country: 'United States',
    coordinates: { lat: 37.5919, lon: -77.4197 },
    category: 'NASCAR'
  },
  {
    id: 'dover',
    name: 'Dover Motor Speedway',
    country: 'United States',
    coordinates: { lat: 39.1897, lon: -75.5328 },
    category: 'NASCAR'
  },
  {
    id: 'pocono',
    name: 'Pocono Raceway',
    country: 'United States',
    coordinates: { lat: 41.0556, lon: -75.4889 },
    category: 'NASCAR'
  },
  {
    id: 'michigan',
    name: 'Michigan International Speedway',
    country: 'United States',
    coordinates: { lat: 42.0678, lon: -84.2397 },
    category: 'NASCAR'
  },
  {
    id: 'kansas',
    name: 'Kansas Speedway',
    country: 'United States',
    coordinates: { lat: 39.1147, lon: -94.8306 },
    category: 'NASCAR'
  },
  {
    id: 'texas-motor-speedway',
    name: 'Texas Motor Speedway',
    country: 'United States',
    coordinates: { lat: 33.0356, lon: -97.2811 },
    category: 'NASCAR'
  },
  {
    id: 'phoenix',
    name: 'Phoenix Raceway',
    country: 'United States',
    coordinates: { lat: 33.3750, lon: -112.3111 },
    category: 'NASCAR'
  },
  {
    id: 'homestead',
    name: 'Homestead-Miami Speedway',
    country: 'United States',
    coordinates: { lat: 25.4481, lon: -80.4089 },
    category: 'NASCAR'
  },
  {
    id: 'watkins-glen',
    name: 'Watkins Glen International',
    country: 'United States',
    coordinates: { lat: 42.3369, lon: -76.9267 },
    category: 'NASCAR'
  },
  {
    id: 'sonoma',
    name: 'Sonoma Raceway',
    country: 'United States',
    coordinates: { lat: 38.1611, lon: -122.4544 },
    category: 'NASCAR'
  },
  
  // IndyCar Tracks
  {
    id: 'indianapolis',
    name: 'Indianapolis Motor Speedway',
    country: 'United States',
    coordinates: { lat: 39.7951, lon: -86.2350 },
    category: 'IndyCar'
  },
  {
    id: 'long-beach',
    name: 'Long Beach Street Circuit',
    country: 'United States',
    coordinates: { lat: 33.7701, lon: -118.1937 },
    category: 'IndyCar'
  },
  {
    id: 'st-petersburg',
    name: 'Streets of St. Petersburg',
    country: 'United States',
    coordinates: { lat: 27.7681, lon: -82.6267 },
    category: 'IndyCar'
  },
  {
    id: 'barber',
    name: 'Barber Motorsports Park',
    country: 'United States',
    coordinates: { lat: 33.5406, lon: -86.6711 },
    category: 'IndyCar'
  },
  {
    id: 'road-america',
    name: 'Road America',
    country: 'United States',
    coordinates: { lat: 43.8000, lon: -87.9889 },
    category: 'IndyCar'
  },
  {
    id: 'mid-ohio',
    name: 'Mid-Ohio Sports Car Course',
    country: 'United States',
    coordinates: { lat: 40.3439, lon: -82.6119 },
    category: 'IndyCar'
  },
  {
    id: 'toronto',
    name: 'Exhibition Place',
    country: 'Canada',
    coordinates: { lat: 43.6319, lon: -79.4181 },
    category: 'IndyCar'
  },
  {
    id: 'iowa-speedway',
    name: 'Iowa Speedway',
    country: 'United States',
    coordinates: { lat: 41.4556, lon: -93.4089 },
    category: 'IndyCar'
  },
  {
    id: 'gateway',
    name: 'World Wide Technology Raceway',
    country: 'United States',
    coordinates: { lat: 38.6472, lon: -90.2181 },
    category: 'IndyCar'
  },
  {
    id: 'portland',
    name: 'Portland International Raceway',
    country: 'United States',
    coordinates: { lat: 45.5919, lon: -122.6931 },
    category: 'IndyCar'
  },
  {
    id: 'laguna-seca',
    name: 'WeatherTech Raceway Laguna Seca',
    country: 'United States',
    coordinates: { lat: 36.5844, lon: -121.7544 },
    category: 'IndyCar'
  },
  
  // Club Level & Regional Tracks - United States
  {
    id: 'harris-hill-raceway',
    name: 'Harris Hill Raceway',
    country: 'United States',
    coordinates: { lat: 30.2672, lon: -97.7431 },
    category: 'Other'
  },
  {
    id: 'donnington-park',
    name: 'Donington Park',
    country: 'United Kingdom',
    coordinates: { lat: 52.8306, lon: -1.3756 },
    category: 'Other'
  },
  {
    id: 'g2-motorsports-park',
    name: 'G2 Motorsports Park',
    country: 'United States',
    coordinates: { lat: 30.0833, lon: -95.4167 },
    category: 'Other'
  },
  {
    id: 'msr-houston',
    name: 'MSR Houston',
    country: 'United States',
    coordinates: { lat: 30.1500, lon: -95.4000 },
    category: 'Other'
  },
  {
    id: 'eagles-canyon-raceway',
    name: 'Eagles Canyon Raceway',
    country: 'United States',
    coordinates: { lat: 33.1833, lon: -97.1167 },
    category: 'Other'
  },
  {
    id: 'motorsport-ranch',
    name: 'Motorsport Ranch',
    country: 'United States',
    coordinates: { lat: 33.1500, lon: -97.1000 },
    category: 'Other'
  },
  {
    id: 'hallett-motor-racing-circuit',
    name: 'Hallett Motor Racing Circuit',
    country: 'United States',
    coordinates: { lat: 36.2167, lon: -96.0833 },
    category: 'Other'
  },
  {
    id: 'heartland-motorsports-park',
    name: 'Heartland Motorsports Park',
    country: 'United States',
    coordinates: { lat: 38.8833, lon: -95.0167 },
    category: 'Other'
  },
  {
    id: 'thunderhill-raceway',
    name: 'Thunderhill Raceway Park',
    country: 'United States',
    coordinates: { lat: 39.5333, lon: -122.0167 },
    category: 'Other'
  },
  {
    id: 'buttonwillow-raceway',
    name: 'Buttonwillow Raceway Park',
    country: 'United States',
    coordinates: { lat: 35.4000, lon: -119.4667 },
    category: 'Other'
  },
  {
    id: 'willow-springs',
    name: 'Willow Springs International Raceway',
    country: 'United States',
    coordinates: { lat: 34.8833, lon: -118.1167 },
    category: 'Other'
  },
  {
    id: 'chuckwalla-valley-raceway',
    name: 'Chuckwalla Valley Raceway',
    country: 'United States',
    coordinates: { lat: 33.6667, lon: -115.4167 },
    category: 'Other'
  },
  {
    id: 'auto-club-speedway',
    name: 'Auto Club Speedway',
    country: 'United States',
    coordinates: { lat: 34.0889, lon: -117.5000 },
    category: 'Other'
  },
  {
    id: 'streets-of-willow',
    name: 'Streets of Willow Springs',
    country: 'United States',
    coordinates: { lat: 34.8667, lon: -118.1333 },
    category: 'Other'
  },
  {
    id: 'big-willow',
    name: 'Big Willow',
    country: 'United States',
    coordinates: { lat: 34.8833, lon: -118.1167 },
    category: 'Other'
  },
  {
    id: 'thermal-club',
    name: 'Thermal Club',
    country: 'United States',
    coordinates: { lat: 33.6333, lon: -116.1667 },
    category: 'Other'
  },
  {
    id: 'spring-mountain-motorsports',
    name: 'Spring Mountain Motorsports Ranch',
    country: 'United States',
    coordinates: { lat: 36.4000, lon: -115.9667 },
    category: 'Other'
  },
  {
    id: 'miller-motorsports-park',
    name: 'Utah Motorsports Campus',
    country: 'United States',
    coordinates: { lat: 40.5833, lon: -112.3833 },
    category: 'Other'
  },
  {
    id: 'pikes-peak-international-raceway',
    name: 'Pikes Peak International Raceway',
    country: 'United States',
    coordinates: { lat: 38.9167, lon: -104.5167 },
    category: 'Other'
  },
  {
    id: 'high-plains-raceway',
    name: 'High Plains Raceway',
    country: 'United States',
    coordinates: { lat: 39.8167, lon: -104.1833 },
    category: 'Other'
  },
  {
    id: 'pueblo-motorsports-park',
    name: 'Pueblo Motorsports Park',
    country: 'United States',
    coordinates: { lat: 38.3167, lon: -104.5833 },
    category: 'Other'
  },
  {
    id: 'hastings-raceway',
    name: 'Hastings Raceway',
    country: 'United States',
    coordinates: { lat: 40.5833, lon: -98.3833 },
    category: 'Other'
  },
  {
    id: 'motorsport-park-hastings',
    name: 'Motorsport Park Hastings',
    country: 'United States',
    coordinates: { lat: 40.5667, lon: -98.3667 },
    category: 'Other'
  },
  {
    id: 'brainerd-international-raceway',
    name: 'Brainerd International Raceway',
    country: 'United States',
    coordinates: { lat: 46.3833, lon: -94.1167 },
    category: 'Other'
  },
  {
    id: 'dakota-county-technical-college',
    name: 'Dakota County Technical College Motorsports',
    country: 'United States',
    coordinates: { lat: 44.7333, lon: -93.0167 },
    category: 'Other'
  },
  {
    id: 'blackhawk-farms-raceway',
    name: 'Blackhawk Farms Raceway',
    country: 'United States',
    coordinates: { lat: 42.4167, lon: -89.3333 },
    category: 'Other'
  },
  {
    id: 'autobahn-country-club',
    name: 'Autobahn Country Club',
    country: 'United States',
    coordinates: { lat: 41.8833, lon: -88.0833 },
    category: 'Other'
  },
  {
    id: 'gingerman-raceway',
    name: 'Gingerman Raceway',
    country: 'United States',
    coordinates: { lat: 42.3833, lon: -86.2167 },
    category: 'Other'
  },
  {
    id: 'grattan-raceway',
    name: 'Grattan Raceway',
    country: 'United States',
    coordinates: { lat: 43.1833, lon: -85.2167 },
    category: 'Other'
  },
  {
    id: 'waterford-hills-road-racing',
    name: 'Waterford Hills Road Racing',
    country: 'United States',
    coordinates: { lat: 42.6833, lon: -83.4167 },
    category: 'Other'
  },
  {
    id: 'putnam-park-road-course',
    name: 'Putnam Park Road Course',
    country: 'United States',
    coordinates: { lat: 39.5667, lon: -86.8167 },
    category: 'Other'
  },
  {
    id: 'bluegrass-motorsport',
    name: 'Bluegrass Motorsport',
    country: 'United States',
    coordinates: { lat: 38.0833, lon: -84.8167 },
    category: 'Other'
  },
  {
    id: 'nelson-ledges-road-course',
    name: 'Nelson Ledges Road Course',
    country: 'United States',
    coordinates: { lat: 41.2167, lon: -81.0167 },
    category: 'Other'
  },
  {
    id: 'mid-america-motorplex',
    name: 'Mid-America Motorplex',
    country: 'United States',
    coordinates: { lat: 42.4167, lon: -96.4167 },
    category: 'Other'
  },
  {
    id: 'carolina-motorsports-park',
    name: 'Carolina Motorsports Park',
    country: 'United States',
    coordinates: { lat: 33.4167, lon: -81.8167 },
    category: 'Other'
  },
  {
    id: 'roebling-road-raceway',
    name: 'Roebling Road Raceway',
    country: 'United States',
    coordinates: { lat: 32.1833, lon: -81.2167 },
    category: 'Other'
  },
  {
    id: 'atlanta-motorsports-park',
    name: 'Atlanta Motorsports Park',
    country: 'United States',
    coordinates: { lat: 34.6167, lon: -83.9167 },
    category: 'Other'
  },
  {
    id: 'road-atlanta',
    name: 'Road Atlanta',
    country: 'United States',
    coordinates: { lat: 34.2833, lon: -83.7667 },
    category: 'Other'
  },
  {
    id: 'sebring-international-raceway',
    name: 'Sebring International Raceway',
    country: 'United States',
    coordinates: { lat: 27.4500, lon: -81.3500 },
    category: 'Other'
  },
  {
    id: 'palm-beach-international-raceway',
    name: 'Palm Beach International Raceway',
    country: 'United States',
    coordinates: { lat: 26.9167, lon: -80.2167 },
    category: 'Other'
  },
  {
    id: 'moroso-motorsports-park',
    name: 'Moroso Motorsports Park',
    country: 'United States',
    coordinates: { lat: 26.9000, lon: -80.2000 },
    category: 'Other'
  },
  {
    id: 'virginia-international-raceway',
    name: 'Virginia International Raceway',
    country: 'United States',
    coordinates: { lat: 36.5833, lon: -78.8167 },
    category: 'Other'
  },
  {
    id: 'summit-point-raceway',
    name: 'Summit Point Raceway',
    country: 'United States',
    coordinates: { lat: 39.3167, lon: -77.9167 },
    category: 'Other'
  },
  {
    id: 'new-jersey-motorsports-park',
    name: 'New Jersey Motorsports Park',
    country: 'United States',
    coordinates: { lat: 39.6500, lon: -75.0167 },
    category: 'Other'
  },
  {
    id: 'lime-rock-park',
    name: 'Lime Rock Park',
    country: 'United States',
    coordinates: { lat: 41.9167, lon: -73.3833 },
    category: 'Other'
  },
  {
    id: 'thompson-speedway-motorsports-park',
    name: 'Thompson Speedway Motorsports Park',
    country: 'United States',
    coordinates: { lat: 41.9833, lon: -71.8167 },
    category: 'Other'
  },
  {
    id: 'new-hampshire-motor-speedway',
    name: 'New Hampshire Motor Speedway',
    country: 'United States',
    coordinates: { lat: 43.3833, lon: -71.4667 },
    category: 'Other'
  },
  {
    id: 'palmer-motorsports-park',
    name: 'Palmer Motorsports Park',
    country: 'United States',
    coordinates: { lat: 42.1833, lon: -72.3167 },
    category: 'Other'
  },
  {
    id: 'club-motorsports',
    name: 'Club Motorsports',
    country: 'United States',
    coordinates: { lat: 43.4167, lon: -72.0167 },
    category: 'Other'
  },
  {
    id: 'monticello-motor-club',
    name: 'Monticello Motor Club',
    country: 'United States',
    coordinates: { lat: 41.6500, lon: -74.6833 },
    category: 'Other'
  },
  {
    id: 'the-glen',
    name: 'The Glen at Watkins Glen',
    country: 'United States',
    coordinates: { lat: 42.3369, lon: -76.9267 },
    category: 'Other'
  },
  {
    id: 'finger-lakes-racing',
    name: 'Finger Lakes Racing',
    country: 'United States',
    coordinates: { lat: 42.8833, lon: -76.8167 },
    category: 'Other'
  },
  {
    id: 'pittsburgh-international-race-complex',
    name: 'Pittsburgh International Race Complex',
    country: 'United States',
    coordinates: { lat: 40.2833, lon: -80.2167 },
    category: 'Other'
  },
  {
    id: 'beaverun-motorsports-complex',
    name: 'BeaveRun Motorsports Complex',
    country: 'United States',
    coordinates: { lat: 40.6167, lon: -80.3167 },
    category: 'Other'
  },
  
  // International Club Level Tracks
  {
    id: 'brands-hatch',
    name: 'Brands Hatch',
    country: 'United Kingdom',
    coordinates: { lat: 51.3569, lon: 0.2636 },
    category: 'Other'
  },
  {
    id: 'oulton-park',
    name: 'Oulton Park',
    country: 'United Kingdom',
    coordinates: { lat: 53.1833, lon: -2.6167 },
    category: 'Other'
  },
  {
    id: 'snetterton',
    name: 'Snetterton Circuit',
    country: 'United Kingdom',
    coordinates: { lat: 52.4667, lon: 0.9500 },
    category: 'Other'
  },
  {
    id: 'thruxton',
    name: 'Thruxton Circuit',
    country: 'United Kingdom',
    coordinates: { lat: 51.2167, lon: -1.6000 },
    category: 'Other'
  },
  {
    id: 'cadwell-park',
    name: 'Cadwell Park',
    country: 'United Kingdom',
    coordinates: { lat: 53.3167, lon: -0.0833 },
    category: 'Other'
  },
  {
    id: 'mallory-park',
    name: 'Mallory Park',
    country: 'United Kingdom',
    coordinates: { lat: 52.6167, lon: -1.3833 },
    category: 'Other'
  },
  {
    id: 'castle-combe',
    name: 'Castle Combe Circuit',
    country: 'United Kingdom',
    coordinates: { lat: 51.4833, lon: -2.1833 },
    category: 'Other'
  },
  {
    id: 'knockhill',
    name: 'Knockhill Racing Circuit',
    country: 'United Kingdom',
    coordinates: { lat: 56.0667, lon: -3.4167 },
    category: 'Other'
  },
  {
    id: 'anglesey-circuit',
    name: 'Anglesey Circuit',
    country: 'United Kingdom',
    coordinates: { lat: 53.2167, lon: -4.5167 },
    category: 'Other'
  },
  {
    id: 'pembrey-circuit',
    name: 'Pembrey Circuit',
    country: 'United Kingdom',
    coordinates: { lat: 51.7167, lon: -4.3167 },
    category: 'Other'
  },
  {
    id: 'croft-circuit',
    name: 'Croft Circuit',
    country: 'United Kingdom',
    coordinates: { lat: 54.4500, lon: -1.5500 },
    category: 'Other'
  },
  {
    id: 'rockingham-motor-speedway',
    name: 'Rockingham Motor Speedway',
    country: 'United Kingdom',
    coordinates: { lat: 52.4500, lon: -0.6500 },
    category: 'Other'
  },
  {
    id: 'nurburgring-nordschleife',
    name: 'Nürburgring Nordschleife',
    country: 'Germany',
    coordinates: { lat: 50.3333, lon: 6.9500 },
    category: 'Other'
  },
  {
    id: 'nurburgring-gp',
    name: 'Nürburgring GP-Strecke',
    country: 'Germany',
    coordinates: { lat: 50.3333, lon: 6.9500 },
    category: 'Other'
  },
  {
    id: 'hockenheimring',
    name: 'Hockenheimring',
    country: 'Germany',
    coordinates: { lat: 49.3278, lon: 8.5661 },
    category: 'Other'
  },
  {
    id: 'lausitzring',
    name: 'Lausitzring',
    country: 'Germany',
    coordinates: { lat: 51.5333, lon: 14.1500 },
    category: 'Other'
  },
  {
    id: 'oschersleben',
    name: 'Motorsport Arena Oschersleben',
    country: 'Germany',
    coordinates: { lat: 52.0333, lon: 11.2833 },
    category: 'Other'
  },
  {
    id: 'salzburgring',
    name: 'Salzburgring',
    country: 'Austria',
    coordinates: { lat: 47.8167, lon: 13.0833 },
    category: 'Other'
  },
  {
    id: 'most',
    name: 'Autodrom Most',
    country: 'Czech Republic',
    coordinates: { lat: 50.5167, lon: 13.6333 },
    category: 'Other'
  },
  {
    id: 'slovakia-ring',
    name: 'Slovakia Ring',
    country: 'Slovakia',
    coordinates: { lat: 47.9833, lon: 17.8333 },
    category: 'Other'
  },
  {
    id: 'pannonia-ring',
    name: 'Pannonia Ring',
    country: 'Hungary',
    coordinates: { lat: 47.0833, lon: 16.8833 },
    category: 'Other'
  },
  {
    id: 'paul-ricard',
    name: 'Circuit Paul Ricard',
    country: 'France',
    coordinates: { lat: 43.2506, lon: 5.7911 },
    category: 'Other'
  },
  {
    id: 'magny-cours',
    name: 'Circuit de Nevers Magny-Cours',
    country: 'France',
    coordinates: { lat: 46.8644, lon: 3.1636 },
    category: 'Other'
  },
  {
    id: 'dijon-prenois',
    name: 'Circuit de Dijon-Prenois',
    country: 'France',
    coordinates: { lat: 47.3667, lon: 4.8833 },
    category: 'Other'
  },
  {
    id: 'nogaro',
    name: 'Circuit de Nogaro',
    country: 'France',
    coordinates: { lat: 43.7667, lon: 0.0333 },
    category: 'Other'
  },
  {
    id: 'ledenon',
    name: 'Circuit de Lédenon',
    country: 'France',
    coordinates: { lat: 44.0167, lon: 4.5000 },
    category: 'Other'
  },
  {
    id: 'albi',
    name: 'Circuit d\'Albi',
    country: 'France',
    coordinates: { lat: 43.9167, lon: 2.1500 },
    category: 'Other'
  },
  {
    id: 'croix-en-ternois',
    name: 'Circuit de Croix-en-Ternois',
    country: 'France',
    coordinates: { lat: 50.3833, lon: 2.3167 },
    category: 'Other'
  },
  {
    id: 'zolder',
    name: 'Circuit Zolder',
    country: 'Belgium',
    coordinates: { lat: 50.9900, lon: 5.2556 },
    category: 'Other'
  },
  {
    id: 'zandvoort-club',
    name: 'Circuit Park Zandvoort Club',
    country: 'Netherlands',
    coordinates: { lat: 52.3888, lon: 4.5409 },
    category: 'Other'
  },
  {
    id: 'assen-club',
    name: 'TT Circuit Assen Club',
    country: 'Netherlands',
    coordinates: { lat: 52.9581, lon: 6.5153 },
    category: 'Other'
  },
  {
    id: 'vallelunga',
    name: 'Autodromo Vallelunga',
    country: 'Italy',
    coordinates: { lat: 42.2167, lon: 12.2833 },
    category: 'Other'
  },
  {
    id: 'adria',
    name: 'Adria International Raceway',
    country: 'Italy',
    coordinates: { lat: 45.0167, lon: 12.0667 },
    category: 'Other'
  },
  {
    id: 'varano',
    name: 'Autodromo di Varano de\' Melegari',
    country: 'Italy',
    coordinates: { lat: 44.6833, lon: 10.0833 },
    category: 'Other'
  },
  {
    id: 'binetto',
    name: 'Circuito di Binetto',
    country: 'Italy',
    coordinates: { lat: 41.0833, lon: 16.8167 },
    category: 'Other'
  },
  {
    id: 'estoril',
    name: 'Autódromo do Estoril',
    country: 'Portugal',
    coordinates: { lat: 38.7506, lon: -9.3939 },
    category: 'Other'
  },
  {
    id: 'portimao',
    name: 'Autódromo Internacional do Algarve',
    country: 'Portugal',
    coordinates: { lat: 37.2272, lon: -8.6267 },
    category: 'Other'
  },
  {
    id: 'jarama',
    name: 'Circuito del Jarama',
    country: 'Spain',
    coordinates: { lat: 40.6167, lon: -3.5833 },
    category: 'Other'
  },
  {
    id: 'navarra',
    name: 'Circuito de Navarra',
    country: 'Spain',
    coordinates: { lat: 42.4833, lon: -1.6833 },
    category: 'Other'
  },
  {
    id: 'cartagena',
    name: 'Circuito de Cartagena',
    country: 'Spain',
    coordinates: { lat: 37.6667, lon: -0.9833 },
    category: 'Other'
  },
  {
    id: 'almeria',
    name: 'Circuito de Almería',
    country: 'Spain',
    coordinates: { lat: 36.8333, lon: -2.3500 },
    category: 'Other'
  },
  {
    id: 'anderstorp',
    name: 'Anderstorp Raceway',
    country: 'Sweden',
    coordinates: { lat: 57.2667, lon: 13.6000 },
    category: 'Other'
  },
  {
    id: 'mantorp-park',
    name: 'Mantorp Park',
    country: 'Sweden',
    coordinates: { lat: 58.1333, lon: 15.0333 },
    category: 'Other'
  },
  {
    id: 'rudskogen',
    name: 'Rudskogen Motorsenter',
    country: 'Norway',
    coordinates: { lat: 60.7833, lon: 11.0167 },
    category: 'Other'
  },
  {
    id: 'ahvenisto',
    name: 'Ahvenisto Circuit',
    country: 'Finland',
    coordinates: { lat: 61.6833, lon: 25.6167 },
    category: 'Other'
  },
  {
    id: 'botniaring',
    name: 'BotniARing',
    country: 'Finland',
    coordinates: { lat: 63.4167, lon: 19.8167 },
    category: 'Other'
  },
  {
    id: 'alastaro',
    name: 'Alastaro Circuit',
    country: 'Finland',
    coordinates: { lat: 60.9500, lon: 22.5833 },
    category: 'Other'
  },
  {
    id: 'eastern-creek',
    name: 'Sydney Motorsport Park',
    country: 'Australia',
    coordinates: { lat: -33.7833, lon: 150.7833 },
    category: 'Other'
  },
  {
    id: 'sandown',
    name: 'Sandown Raceway',
    country: 'Australia',
    coordinates: { lat: -37.9500, lon: 145.1333 },
    category: 'Other'
  },
  {
    id: 'winton',
    name: 'Winton Motor Raceway',
    country: 'Australia',
    coordinates: { lat: -36.4333, lon: 146.0167 },
    category: 'Other'
  },
  {
    id: 'wakefield-park',
    name: 'Wakefield Park',
    country: 'Australia',
    coordinates: { lat: -34.7833, lon: 149.6167 },
    category: 'Other'
  },
  {
    id: 'mallala',
    name: 'Mallala Motor Sport Park',
    country: 'Australia',
    coordinates: { lat: -34.4667, lon: 138.5000 },
    category: 'Other'
  },
  {
    id: 'barbagallo',
    name: 'Wanneroo Raceway',
    country: 'Australia',
    coordinates: { lat: -31.6167, lon: 115.8167 },
    category: 'Other'
  },
  {
    id: 'queensland-raceway',
    name: 'Queensland Raceway',
    country: 'Australia',
    coordinates: { lat: -27.6167, lon: 152.7833 },
    category: 'Other'
  },
  {
    id: 'lakeside',
    name: 'Lakeside Park',
    country: 'Australia',
    coordinates: { lat: -27.3167, lon: 152.9833 },
    category: 'Other'
  },
  {
    id: 'hidden-valley',
    name: 'Hidden Valley Raceway',
    country: 'Australia',
    coordinates: { lat: -12.6167, lon: 131.0167 },
    category: 'Other'
  },
  {
    id: 'symmons-plains',
    name: 'Symmons Plains Raceway',
    country: 'Australia',
    coordinates: { lat: -41.6167, lon: 147.1833 },
    category: 'Other'
  },
  {
    id: 'pukekohe',
    name: 'Pukekohe Park Raceway',
    country: 'New Zealand',
    coordinates: { lat: -37.2167, lon: 174.9167 },
    category: 'Other'
  },
  {
    id: 'manfeild',
    name: 'Manfeild Circuit Chris Amon',
    country: 'New Zealand',
    coordinates: { lat: -40.2167, lon: 175.6167 },
    category: 'Other'
  },
  {
    id: 'hampton-downs',
    name: 'Hampton Downs Motorsport Park',
    country: 'New Zealand',
    coordinates: { lat: -37.4167, lon: 175.1167 },
    category: 'Other'
  },
  {
    id: 'highlands-motorsport-park',
    name: 'Highlands Motorsport Park',
    country: 'New Zealand',
    coordinates: { lat: -45.0333, lon: 169.1833 },
    category: 'Other'
  },
  {
    id: 'teretonga',
    name: 'Teretonga Park',
    country: 'New Zealand',
    coordinates: { lat: -46.4167, lon: 168.3833 },
    category: 'Other'
  },
  {
    id: 'fuji-speedway',
    name: 'Fuji Speedway',
    country: 'Japan',
    coordinates: { lat: 35.3681, lon: 138.9267 },
    category: 'Other'
  },
  {
    id: 'okayama',
    name: 'Okayama International Circuit',
    country: 'Japan',
    coordinates: { lat: 34.9167, lon: 134.2167 },
    category: 'Other'
  },
  {
    id: 'autopolis',
    name: 'Autopolis',
    country: 'Japan',
    coordinates: { lat: 33.2833, lon: 131.0167 },
    category: 'Other'
  },
  {
    id: 'ebisu',
    name: 'Ebisu Circuit',
    country: 'Japan',
    coordinates: { lat: 37.4167, lon: 140.5833 },
    category: 'Other'
  },
  {
    id: 'tsukuba',
    name: 'Tsukuba Circuit',
    country: 'Japan',
    coordinates: { lat: 36.1833, lon: 140.0833 },
    category: 'Other'
  },
  {
    id: 'mine',
    name: 'Mine Circuit',
    country: 'Japan',
    coordinates: { lat: 34.1833, lon: 131.3167 },
    category: 'Other'
  },
  {
    id: 'sugo',
    name: 'Sportsland SUGO',
    country: 'Japan',
    coordinates: { lat: 38.4167, lon: 140.7833 },
    category: 'Other'
  },
  {
    id: 'korean-international-circuit',
    name: 'Korean International Circuit',
    country: 'South Korea',
    coordinates: { lat: 34.7333, lon: 126.6833 },
    category: 'Other'
  },
  {
    id: 'inje-speedium',
    name: 'Inje Speedium',
    country: 'South Korea',
    coordinates: { lat: 38.0667, lon: 128.1667 },
    category: 'Other'
  },
  {
    id: 'everland-speedway',
    name: 'Everland Speedway',
    country: 'South Korea',
    coordinates: { lat: 37.2833, lon: 127.2000 },
    category: 'Other'
  },
  {
    id: 'shanghai-international-circuit',
    name: 'Shanghai International Circuit',
    country: 'China',
    coordinates: { lat: 31.3386, lon: 121.2200 },
    category: 'Other'
  },
  {
    id: 'zhuhai',
    name: 'Zhuhai International Circuit',
    country: 'China',
    coordinates: { lat: 22.3167, lon: 113.5833 },
    category: 'Other'
  },
  {
    id: 'beijing-goldenport',
    name: 'Beijing Goldenport Park Circuit',
    country: 'China',
    coordinates: { lat: 40.1833, lon: 116.7167 },
    category: 'Other'
  },
  {
    id: 'ordos',
    name: 'Ordos International Circuit',
    country: 'China',
    coordinates: { lat: 39.6167, lon: 109.7833 },
    category: 'Other'
  },
  {
    id: 'sentul',
    name: 'Sentul International Circuit',
    country: 'Indonesia',
    coordinates: { lat: -6.5833, lon: 106.8500 },
    category: 'Other'
  },
  {
    id: 'chang-international-circuit',
    name: 'Chang International Circuit',
    country: 'Thailand',
    coordinates: { lat: 14.2167, lon: 101.0167 },
    category: 'Other'
  },
  {
    id: 'bira-circuit',
    name: 'Bira Circuit',
    country: 'Thailand',
    coordinates: { lat: 13.9167, lon: 100.6167 },
    category: 'Other'
  },
  {
    id: 'dubai-autodrome',
    name: 'Dubai Autodrome',
    country: 'United Arab Emirates',
    coordinates: { lat: 25.0500, lon: 55.2667 },
    category: 'Other'
  },
  {
    id: 'dubai-kartdrome',
    name: 'Dubai Kartdrome',
    country: 'United Arab Emirates',
    coordinates: { lat: 25.1167, lon: 55.2000 },
    category: 'Other'
  },
  {
    id: 'kyalami',
    name: 'Kyalami Grand Prix Circuit',
    country: 'South Africa',
    coordinates: { lat: -25.9833, lon: 28.0667 },
    category: 'Other'
  },
  {
    id: 'killarney',
    name: 'Killarney International Raceway',
    country: 'South Africa',
    coordinates: { lat: -33.9833, lon: 18.5167 },
    category: 'Other'
  },
  {
    id: 'east-london',
    name: 'East London Grand Prix Circuit',
    country: 'South Africa',
    coordinates: { lat: -33.0167, lon: 27.9167 },
    category: 'Other'
  },
  {
    id: 'zwartkops',
    name: 'Zwartkops Raceway',
    country: 'South Africa',
    coordinates: { lat: -25.8167, lon: 28.1167 },
    category: 'Other'
  },
  {
    id: 'red-star-raceway',
    name: 'Red Star Raceway',
    country: 'South Africa',
    coordinates: { lat: -26.5833, lon: 27.8167 },
    category: 'Other'
  },
  {
    id: 'autodromo-hermanos-rodriguez',
    name: 'Autódromo Hermanos Rodríguez Club',
    country: 'Mexico',
    coordinates: { lat: 19.4042, lon: -99.0907 },
    category: 'Other'
  },
  {
    id: 'autodromo-miguel-e-abed',
    name: 'Autódromo Miguel E. Abed',
    country: 'Mexico',
    coordinates: { lat: 19.2833, lon: -98.7167 },
    category: 'Other'
  },
  {
    id: 'autodromo-potosino',
    name: 'Autódromo Potosino',
    country: 'Mexico',
    coordinates: { lat: 22.1167, lon: -100.9167 },
    category: 'Other'
  },
  {
    id: 'jacarepagua',
    name: 'Autódromo Internacional Nelson Piquet',
    country: 'Brazil',
    coordinates: { lat: -22.9833, lon: -43.3833 },
    category: 'Other'
  },
  {
    id: 'goiania',
    name: 'Autódromo Internacional Ayrton Senna',
    country: 'Brazil',
    coordinates: { lat: -16.6333, lon: -49.2167 },
    category: 'Other'
  },
  {
    id: 'taruma',
    name: 'Autódromo Internacional de Tarumã',
    country: 'Brazil',
    coordinates: { lat: -29.7167, lon: -51.1167 },
    category: 'Other'
  },
  {
    id: 'curitiba',
    name: 'Autódromo Internacional de Curitiba',
    country: 'Brazil',
    coordinates: { lat: -25.5167, lon: -49.1833 },
    category: 'Other'
  },
  {
    id: 'velopark',
    name: 'Velopark',
    country: 'Brazil',
    coordinates: { lat: -29.6833, lon: -51.1000 },
    category: 'Other'
  },
  {
    id: 'buenos-aires',
    name: 'Autódromo Oscar y Juan Gálvez',
    country: 'Argentina',
    coordinates: { lat: -34.6833, lon: -58.4833 },
    category: 'Other'
  },
  {
    id: 'termas-de-rio-hondo',
    name: 'Autódromo Termas de Río Hondo',
    country: 'Argentina',
    coordinates: { lat: -27.4833, lon: -64.8667 },
    category: 'Other'
  },
  {
    id: 'san-juan-villicum',
    name: 'Autódromo San Juan Villicum',
    country: 'Argentina',
    coordinates: { lat: -31.4667, lon: -68.4167 },
    category: 'Other'
  },
  {
    id: 'la-plata',
    name: 'Autódromo Roberto José Mouras',
    country: 'Argentina',
    coordinates: { lat: -34.9167, lon: -57.9833 },
    category: 'Other'
  },
  {
    id: 'mosport',
    name: 'Canadian Tire Motorsport Park',
    country: 'Canada',
    coordinates: { lat: 44.0500, lon: -78.6833 },
    category: 'Other'
  },
  {
    id: 'mont-tremblant',
    name: 'Circuit Mont-Tremblant',
    country: 'Canada',
    coordinates: { lat: 46.1833, lon: -74.6167 },
    category: 'Other'
  },
  {
    id: 'shannonville',
    name: 'Shannonville Motorsport Park',
    country: 'Canada',
    coordinates: { lat: 44.2833, lon: -77.0833 },
    category: 'Other'
  },
  {
    id: 'grand-bend',
    name: 'Grand Bend Motorplex',
    country: 'Canada',
    coordinates: { lat: 43.3167, lon: -81.7667 },
    category: 'Other'
  },
  {
    id: 'atlantic-motorsport-park',
    name: 'Atlantic Motorsport Park',
    country: 'Canada',
    coordinates: { lat: 45.0833, lon: -64.4167 },
    category: 'Other'
  }
];