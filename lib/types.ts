export interface Pandal {
  id: string;
  name: string;
  nameBengali: string;
  lat: number;
  lng: number;
  theme: string;
  themeDescription: string;
  theme2026?: string;
  themeDescription2026?: string;
  mustWatch: string[];
  artist: string;
  organizer: string;
  established: number;
  timings: string;
  bestTime: string;
  entryFee: string;
  tags: string[];
  rating: number;
  imageEmoji: string;
  zone: 'north' | 'central' | 'south' | 'east';
}

export interface CrowdPoint {
  lat: number;
  lng: number;
}

export interface CrowdData {
  real: number;
  simulated: number;
  total: number;
  points: CrowdPoint[];
}

export interface OverpassNode {
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
  type: LayerType;
}

export type LayerType = 'food' | 'toilet' | 'parking';

export interface LayerState {
  heatmap: boolean;
  food: boolean;
  toilet: boolean;
  parking: boolean;
  route: boolean;
}

export interface RouteInfo {
  coordinates: [number, number][];
  distanceKm: number;
  durationMin: number;
  pandals: Pandal[];
}

export interface SearchedPlace {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  userRatingCount?: number;
  primaryType?: string;
  category?: string;
  isOpen?: boolean;
  busyness?: string;
  hours?: string[];
  source?: string;
}

export function placeToPandalStop(place: SearchedPlace): Pandal {
  return {
    id: `place-${place.id || place.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    name: place.name,
    nameBengali: place.primaryType || 'স্থান',
    lat: place.lat,
    lng: place.lng,
    theme: place.primaryType || place.category || 'Google Verified Place',
    themeDescription: place.address,
    theme2026: place.address,
    mustWatch: [
      place.address,
      place.rating ? `⭐ ${place.rating} (${place.userRatingCount?.toLocaleString() || 0} reviews)` : 'Google Place',
      place.isOpen ? 'Open Now' : 'Closed',
      place.busyness || 'Normal flow',
    ],
    artist: 'Google Places',
    organizer: place.name,
    established: 2026,
    timings: place.hours?.[0] || 'Open Daily',
    bestTime: 'Anytime',
    entryFee: 'Free',
    tags: ['place', place.category || 'establishment'],
    rating: place.rating || 4.5,
    imageEmoji: '📍',
    zone: 'east',
  };
}
