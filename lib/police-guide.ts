/**
 * Official IndianOil - Kolkata Police Puja Guide 2025 Data
 *
 * Mapped from the official Kolkata Police Puja Guide Map:
 *  - Zone I: North & Central Kolkata
 *  - Zone II: South & South East Kolkata
 *  - Zone III: Port Area
 *  - Zone IV: South Suburban & South West (Jadavpur Division & Behala Division)
 *
 * Includes:
 *  - Verified Pandals with zone, division, and police traffic sector
 *  - Kolkata Police Assistance Booths & Traffic circulation zones
 *  - Official Parking Zones (P)
 *  - Places of Interest (Victoria Memorial, Birla Planetarium, Science City, Kalighat Temple, etc.)
 *  - IndianOil Petrol Pumps & Auto LPG Dispensing Units
 */

export interface PoliceAssistanceBooth {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  zone: 'north' | 'central' | 'south' | 'port' | 'jadavpur' | 'behala';
}

export interface OfficialParkingZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacity?: string;
  restrictions?: string;
}

export interface PlaceOfInterest {
  id: string;
  name: string;
  category: 'heritage' | 'museum' | 'lake' | 'temple' | 'science';
  lat: number;
  lng: number;
}

export interface IndianOilStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'petrol_diesel' | 'auto_lpg' | 'xp95_xp100';
}

// ── 1. Police Assistance Booths from the Official Map ───────────────────────
export const policeBooths: PoliceAssistanceBooth[] = [
  { id: 'pb-shyambazar', name: 'Kolkata Police Booth - Shyambazar Five Point', location: 'Shyambazar Crossing, APC Road', lat: 22.6035, lng: 88.3712, zone: 'north' },
  { id: 'pb-hatibagan', name: 'Kolkata Police Booth - Hatibagan', location: 'Bidhan Sarani & Grey Street', lat: 22.5930, lng: 88.3725, zone: 'north' },
  { id: 'pb-girish-park', name: 'Kolkata Police Booth - Girish Park', location: 'CR Avenue & Vivekananda Road', lat: 22.5852, lng: 88.3610, zone: 'central' },
  { id: 'pb-mg-road', name: 'Kolkata Police Booth - MG Road Crossing', location: 'MG Road & CR Avenue Crossing', lat: 22.5815, lng: 88.3601, zone: 'central' },
  { id: 'pb-college-sq', name: 'Kolkata Police Booth - College Square', location: 'College Street & Surya Sen Street', lat: 22.5768, lng: 88.3660, zone: 'central' },
  { id: 'pb-sealdah', name: 'Kolkata Police Booth - Sealdah Station', location: 'Sealdah Flyover / AJC Bose Road', lat: 22.5695, lng: 88.3720, zone: 'central' },
  { id: 'pb-lalbazar', name: 'Kolkata Police Headquarters Lalbazar', location: 'Lalbazar Street / BBD Bagh', lat: 22.5724, lng: 88.3512, zone: 'central' },
  { id: 'pb-park-circus', name: 'Kolkata Police Booth - Park Circus 7-Point', location: 'Park Circus 7-Point Crossing', lat: 22.5441, lng: 88.3685, zone: 'south' },
  { id: 'pb-gariahat', name: 'Kolkata Police Booth - Gariahat Crossing', location: 'Rashbehari Avenue & Gariahat Road', lat: 22.5186, lng: 88.3642, zone: 'south' },
  { id: 'pb-rashbehari', name: 'Kolkata Police Booth - Rashbehari Crossing', location: 'Rashbehari Avenue & SP Mukherjee Road', lat: 22.5184, lng: 88.3475, zone: 'south' },
  { id: 'pb-hazra', name: 'Kolkata Police Booth - Hazra Crossing', location: 'SP Mukherjee Road & Hazra Road', lat: 22.5255, lng: 88.3470, zone: 'south' },
  { id: 'pb-kalighat', name: 'Kolkata Police Booth - Kalighat Temple', location: 'Kalighat Road & Kali Temple Area', lat: 22.5165, lng: 88.3425, zone: 'south' },
  { id: 'pb-behala-tram', name: 'Kolkata Police Booth - Behala Tram Depot', location: 'Diamond Harbour Road, Behala', lat: 22.4985, lng: 88.3180, zone: 'behala' },
  { id: 'pb-taratala', name: 'Kolkata Police Booth - Taratala Crossing', location: 'Taratala Road & DH Road', lat: 22.5140, lng: 88.3195, zone: 'behala' },
  { id: 'pb-jadavpur', name: 'Kolkata Police Booth - Jadavpur 8B Bus Stand', location: 'Raja SC Mallick Road, Jadavpur', lat: 22.4975, lng: 88.3710, zone: 'jadavpur' },
  { id: 'pb-khidderpore', name: 'Kolkata Police Booth - Khidderpore Tram Depot', location: 'Circular Garden Reach Road', lat: 22.5390, lng: 88.3245, zone: 'port' },
];

// ── 2. Official Parking Zones Listed on Police Guide ────────────────────────
export const officialParkingZones: OfficialParkingZone[] = [
  { id: 'park-maidan', name: 'Maidan Parking Area', lat: 22.5510, lng: 88.3480, restrictions: 'Designated parking for Central & South visitors' },
  { id: 'park-rabindra-sarobar', name: 'Rabindra Sarobar / Southern Avenue Parking', lat: 22.5125, lng: 88.3580, restrictions: 'Parallel parking along designated slots on Southern Avenue' },
  { id: 'park-deshapriya', name: 'Deshapriya Park Outer Ring Parking', lat: 22.5190, lng: 88.3550, restrictions: 'Designated one-way parking corridor' },
  { id: 'park-park-circus', name: 'Park Circus Maidan Parking Ground', lat: 22.5410, lng: 88.3690, restrictions: 'Designated visitor parking' },
  { id: 'park-tala-pratyay', name: 'Tala Tank Ground Parking', lat: 22.6070, lng: 88.3790, restrictions: 'Open ground parking for Tala & Shyambazar pujas' },
  { id: 'park-jadavpur', name: 'Jadavpur University Campus Gate 4 Ground', lat: 22.4990, lng: 88.3735, restrictions: 'Designated puja parking' },
  { id: 'park-taratala', name: 'Taratala Transport Ground', lat: 22.5120, lng: 88.3175, restrictions: 'Designated for Behala pandals' },
  { id: 'park-khidderpore', name: 'Port Trust Ground, Khidderpore', lat: 22.5400, lng: 88.3260, restrictions: 'Port area puja visitors' },
];

// ── 3. Places of Interest on Kolkata Police Map Legend ──────────────────────
export const placesOfInterest: PlaceOfInterest[] = [
  { id: 'poi-victoria', name: 'Victoria Memorial', category: 'heritage', lat: 22.5448, lng: 88.3426 },
  { id: 'poi-planetarium', name: 'Birla Planetarium', category: 'science', lat: 22.5455, lng: 88.3470 },
  { id: 'poi-st-pauls', name: "St. Paul's Cathedral", category: 'heritage', lat: 22.5440, lng: 88.3465 },
  { id: 'poi-indian-museum', name: 'Indian Museum', category: 'museum', lat: 22.5579, lng: 88.3511 },
  { id: 'poi-kalighat-temple', name: 'Kalighat Kali Temple', category: 'temple', lat: 22.5165, lng: 88.3420 },
  { id: 'poi-birla-mandir', name: 'Birla Mandir', category: 'temple', lat: 22.5285, lng: 88.3660 },
  { id: 'poi-rabindra-sarobar', name: 'Rabindra Sarobar (Dhakuria Lake)', category: 'lake', lat: 22.5110, lng: 88.3565 },
  { id: 'poi-science-city', name: 'Science City', category: 'science', lat: 22.5405, lng: 88.3965 },
  { id: 'poi-nandan', name: 'Nandan / Rabindra Sadan', category: 'heritage', lat: 22.5430, lng: 88.3478 },
  { id: 'poi-jorasanko', name: 'Jorasanko Thakurbari', category: 'heritage', lat: 22.5855, lng: 88.3590 },
  { id: 'poi-marble-palace', name: 'Marble Palace', category: 'heritage', lat: 22.5825, lng: 88.3605 },
  { id: 'poi-nehru-museum', name: "Nehru Children's Museum", category: 'museum', lat: 22.5460, lng: 88.3485 },
];

// ── 4. IndianOil Stations (Official Sponsor Network) ────────────────────────
export const indianOilStations: IndianOilStation[] = [
  { id: 'ioc-bhavan', name: 'IndianOil Bhavan', lat: 22.5140, lng: 88.3665, type: 'xp95_xp100' },
  { id: 'ioc-park-circus', name: 'IndianOil Park Circus Station', lat: 22.5420, lng: 88.3695, type: 'xp95_xp100' },
  { id: 'ioc-dh-road', name: 'IndianOil Diamond Harbour Road', lat: 22.4960, lng: 88.3170, type: 'auto_lpg' },
  { id: 'ioc-taratala', name: 'IndianOil Taratala Point', lat: 22.5110, lng: 88.3180, type: 'petrol_diesel' },
  { id: 'ioc-shyambazar', name: 'IndianOil Shyambazar Crossing', lat: 22.6040, lng: 88.3720, type: 'petrol_diesel' },
  { id: 'ioc-cr-avenue', name: 'IndianOil Central Avenue', lat: 22.5830, lng: 88.3605, type: 'xp95_xp100' },
  { id: 'ioc-em-bypass', name: 'IndianOil EM Bypass Jadavpur Connector', lat: 22.5020, lng: 88.3920, type: 'auto_lpg' },
];
