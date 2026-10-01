/**
 * Kolkata Mall & Public Facility Database
 *
 * Malls reliably have:
 *  - Multi-level parking (cars + bikes)
 *  - Clean public toilets (usually free or ₹5)
 *
 * Used to seed the toilets/parking layers with reliable data
 * when Overpass API results are sparse.
 */

export interface MallFacility {
  id: string;
  name: string;
  lat: number;
  lng: number;
  parking: {
    available: boolean;
    levels?: number;
    capacity?: number;
    rate?: string; // e.g. "₹40/hr"
    note?: string;
  };
  toilet: {
    available: boolean;
    fee?: string;
    note?: string;
  };
  address: string;
  zone: 'north' | 'central' | 'south' | 'east';
}

export const kolkataMalls: MallFacility[] = [
  {
    id: 'city-centre-1',
    name: 'City Centre 1',
    lat: 22.5730, lng: 88.4328,
    parking: { available: true, levels: 3, capacity: 600, rate: '₹40/hr', note: 'Basement + rooftop' },
    toilet: { available: true, fee: 'Free', note: 'Multiple floors' },
    address: 'DC Block, Sector I, Salt Lake City',
    zone: 'east',
  },
  {
    id: 'city-centre-2',
    name: 'City Centre 2 (Rajarhat)',
    lat: 22.6194, lng: 88.4620,
    parking: { available: true, levels: 4, capacity: 1200, rate: '₹40/hr', note: 'Largest mall parking in Kolkata' },
    toilet: { available: true, fee: 'Free', note: 'Every floor' },
    address: 'Action Area II, Newtown, Rajarhat',
    zone: 'east',
  },
  {
    id: 'quest-mall',
    name: 'Quest Mall',
    lat: 22.5358, lng: 88.3560,
    parking: { available: true, levels: 3, capacity: 500, rate: '₹50/hr', note: 'Validated with mall purchase' },
    toilet: { available: true, fee: 'Free', note: 'Well maintained, every floor' },
    address: 'Park Street, Syed Amir Ali Avenue',
    zone: 'central',
  },
  {
    id: 'forum-mall',
    name: 'Forum Mall',
    lat: 22.5217, lng: 88.3556,
    parking: { available: true, levels: 2, capacity: 350, rate: '₹40/hr' },
    toilet: { available: true, fee: 'Free' },
    address: '10/3 Elgin Road, Alipore',
    zone: 'south',
  },
  {
    id: 'forum-courtyard',
    name: 'Forum Courtyard',
    lat: 22.5190, lng: 88.3471,
    parking: { available: true, levels: 2, capacity: 300, rate: '₹40/hr' },
    toilet: { available: true, fee: 'Free' },
    address: 'Hindustan Park, Rashbehari Avenue',
    zone: 'south',
  },
  {
    id: 'south-city-mall',
    name: 'South City Mall',
    lat: 22.4958, lng: 88.3603,
    parking: { available: true, levels: 3, capacity: 700, rate: '₹40/hr', note: 'Large basement parking' },
    toilet: { available: true, fee: 'Free', note: 'Dedicated toilet floors' },
    address: '375 Prince Anwar Shah Road',
    zone: 'south',
  },
  {
    id: 'acropolis-mall',
    name: 'Acropolis Mall',
    lat: 22.5474, lng: 88.3916,
    parking: { available: true, levels: 3, capacity: 450, rate: '₹40/hr' },
    toilet: { available: true, fee: 'Free' },
    address: '1858/1 Rajdanga Main Road, Kasba',
    zone: 'east',
  },
  {
    id: 'mani-square',
    name: 'Mani Square',
    lat: 22.5634, lng: 88.4012,
    parking: { available: true, levels: 3, capacity: 500, rate: '₹40/hr' },
    toilet: { available: true, fee: 'Free' },
    address: '164/1 Manicktala Main Road, EM Bypass',
    zone: 'east',
  },
  {
    id: 'garia-mall',
    name: 'Dakshinapan Shopping Centre',
    lat: 22.5003, lng: 88.3694,
    parking: { available: true, levels: 1, capacity: 200, rate: '₹20/hr' },
    toilet: { available: true, fee: 'Free' },
    address: 'Dhakuria, Gariahat Road South',
    zone: 'south',
  },
  {
    id: 'axis-mall',
    name: 'Axis Mall (Rajarhat)',
    lat: 22.6213, lng: 88.4580,
    parking: { available: true, levels: 3, capacity: 600, rate: '₹40/hr' },
    toilet: { available: true, fee: 'Free' },
    address: 'Newtown, Action Area II',
    zone: 'east',
  },
  {
    id: 'highlands-park',
    name: 'Highlands Park',
    lat: 22.5286, lng: 88.3426,
    parking: { available: true, levels: 2, capacity: 250, rate: '₹30/hr' },
    toilet: { available: true, fee: 'Free' },
    address: 'James Long Sarani, Behala',
    zone: 'south',
  },
  {
    id: 'girish-park-metro',
    name: 'Girish Park Metro Toilet',
    lat: 22.5924, lng: 88.3660,
    parking: { available: false },
    toilet: { available: true, fee: '₹2', note: 'Kolkata Metro public toilet — very clean' },
    address: 'Girish Park Metro Station, BT Road',
    zone: 'north',
  },
  {
    id: 'howrah-station',
    name: 'Howrah Station Facilities',
    lat: 22.5849, lng: 88.3425,
    parking: { available: true, levels: 1, capacity: 300, rate: '₹20/hr', note: 'Railway parking — open 24hr' },
    toilet: { available: true, fee: '₹5', note: 'Platform toilets — clean, 24hr' },
    address: 'Howrah Railway Station, foreshore road',
    zone: 'central',
  },
  {
    id: 'esplanade-metro',
    name: 'Esplanade Metro Facilities',
    lat: 22.5637, lng: 88.3503,
    parking: { available: false },
    toilet: { available: true, fee: '₹2', note: 'Metro station toilet — 6 AM to 10 PM' },
    address: 'Esplanade Metro Station, Chowringhee',
    zone: 'central',
  },
  {
    id: 'victoria-memorial',
    name: 'Victoria Memorial Complex Toilets',
    lat: 22.5448, lng: 88.3426,
    parking: { available: true, levels: 1, capacity: 200, rate: '₹30/hr', note: 'Garden parking' },
    toilet: { available: true, fee: 'Free with entry', note: 'Inside memorial garden' },
    address: 'Victoria Memorial Hall, Queens Way',
    zone: 'central',
  },
  {
    id: 'eco-park',
    name: 'Eco Park (New Town)',
    lat: 22.6098, lng: 88.4688,
    parking: { available: true, levels: 1, capacity: 800, rate: '₹20/hr', note: 'Huge surface parking' },
    toilet: { available: true, fee: 'Free with park entry', note: 'Multiple blocks, well maintained' },
    address: 'Action Area III, New Town, Rajarhat',
    zone: 'east',
  },
  {
    id: 'nicco-park',
    name: 'Nicco Park',
    lat: 22.5767, lng: 88.4221,
    parking: { available: true, levels: 1, capacity: 400, rate: '₹30/hr' },
    toilet: { available: true, fee: 'Free with entry' },
    address: 'Gate No 1, Salt Lake, Sector IV',
    zone: 'east',
  },
  {
    id: 'nalban-food-park',
    name: 'Nalban Food & Boating Park',
    lat: 22.5796, lng: 88.4143,
    parking: { available: true, levels: 1, capacity: 300, rate: '₹20/hr' },
    toilet: { available: true, fee: '₹5' },
    address: 'Salt Lake, Sector III',
    zone: 'east',
  },
];

/**
 * Returns all malls/facilities within `radiusKm` km of a point.
 */
export function getNearbyFacilities(
  lat: number,
  lng: number,
  radiusKm = 3,
  type: 'parking' | 'toilet' | 'both' = 'both'
): MallFacility[] {
  return kolkataMalls.filter((m) => {
    const d = haversineKm(lat, lng, m.lat, m.lng);
    if (d > radiusKm) return false;
    if (type === 'parking') return m.parking.available;
    if (type === 'toilet') return m.toilet.available;
    return m.parking.available || m.toilet.available;
  });
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
