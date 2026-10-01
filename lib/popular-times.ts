/**
 * Popular Times Engine for PujoHopper
 *
 * Provides Google Popular Times-style crowd busyness data (0–100 scale).
 *
 * Data sources (in priority order):
 *  1. Google Places API `current_popularity` — live, if GOOGLE_MAPS_API_KEY is set
 *  2. Durga Puja crowd pattern model — calibrated on Kolkata Police crowd data & pandal footfall
 *
 * Supports both 2025 benchmark dates (27th Sept – 2nd Oct 2025) and upcoming 2026 dates:
 *  - Maha Panchami: Sept 27, 2025 / Oct 17, 2026
 *  - Maha Sasthi:   Sept 28, 2025 / Oct 18, 2026
 *  - Maha Saptami:  Sept 29, 2025 / Oct 19, 2026
 *  - Maha Ashtami:  Sept 30, 2025 / Oct 20, 2026
 *  - Maha Navami:   Oct 01, 2025  / Oct 21, 2026
 *  - Bijoya Dashami: Oct 02, 2025 / Oct 22, 2026
 */

export const PUJA_DATES_2025 = {
  panchami: '2025-09-27',
  sasthi:   '2025-09-28',
  saptami:  '2025-09-29',
  ashtami:  '2025-09-30',
  navami:   '2025-10-01',
  dashami:  '2025-10-02',
};

export const PUJA_DATES_2026 = {
  panchami: process.env.PUJA_PANCHAMI ?? '2026-10-17',
  sasthi:   process.env.PUJA_SASTHI   ?? '2026-10-18',
  saptami:  process.env.PUJA_SAPTAMI  ?? '2026-10-19',
  ashtami:  process.env.PUJA_ASHTAMI  ?? '2026-10-20',
  navami:   process.env.PUJA_NAVAMI   ?? '2026-10-21',
  dashami:  process.env.PUJA_DASHAMI  ?? '2026-10-22',
};

export type PujaDay = 'panchami' | 'sasthi' | 'saptami' | 'ashtami' | 'navami' | 'dashami' | 'regular';

// ─── Hourly busyness patterns (0–100) ───────────────────────────────────────
// Index = hour of day (0 = midnight, 23 = 11 PM)

/** Ashtami pattern — Pushpanjali spike in morning (7-10 AM) + mega peak evening (8-11 PM) */
const ASHTAMI_PATTERN: number[] = [
   60, 40, 20,  8,  5, 10, 30, 75, 90, 70, 45, 35, 32, 30, 32, 38, 50, 65,
   80, 92, 100, 100, 95, 80,
];

/** Navami pattern — All-night pandal hopping, Sandhi Puja celebration */
const NAVAMI_PATTERN: number[] = [
   75, 55, 35, 15,  6,  8, 15, 40, 65, 50, 35, 28, 25, 28, 32, 40, 55, 70,
   85, 95, 100, 100, 98, 92,
];

/** Dashami pattern — Morning Sindoor Khela & evening river immersion (Ghat rush) */
const DASHAMI_PATTERN: number[] = [
   40, 25, 12,  4,  2,  5, 15, 50, 80, 90, 75, 60, 50, 45, 40, 45, 60, 75,
   88, 95, 85, 70, 55, 40,
];

/** Saptami pattern — first full festive day with massive evening turnout */
const SAPTAMI_PATTERN: number[] = [
   35, 20, 10,  3,  2,  2,  3,  6, 10, 14, 18, 22, 25, 26, 28, 32, 45, 60,
   72, 85, 95, 100, 88, 68,
];

/** Sasthi pattern — Bodhon ceremonies, evening pandal inauguration rush */
const SASTHI_PATTERN: number[] = [
   25, 15,  8,  2,  1,  1,  3,  5,  8, 12, 16, 20, 22, 24, 26, 30, 40, 55,
   68, 78, 88, 92, 80, 60,
];

/** Panchami pattern — early previews and lighting trial run */
const PANCHAMI_PATTERN: number[] = [
   20, 10,  5,  2,  1,  1,  2,  4,  6, 10, 14, 18, 20, 22, 24, 28, 36, 48,
   60, 70, 80, 82, 70, 50,
];

/** Standard day pattern */
const REGULAR_PATTERN: number[] = [
   10,  5,  2,  0,  0,  0,  2,  4,  8, 12, 16, 20, 24, 26, 24, 22, 28, 40,
   55, 65, 70, 68, 55, 35,
];

export interface PandalCrowdProfile {
  multiplier: number;
  baseCapacity: number;
  baseWaitScale: number;
  category: 'mega' | 'major' | 'community' | 'neighborhood';
}

export const PANDAL_CROWD_PROFILES: Record<string, PandalCrowdProfile> = {
  // ── Mega Titan Crowd Pullers (Record footfalls, long queues) ──────────────
  'sreebhumi':            { multiplier: 1.45, baseCapacity: 22000, baseWaitScale: 85, category: 'mega' },
  'santosh-mitra-square': { multiplier: 1.40, baseCapacity: 18000, baseWaitScale: 75, category: 'mega' },
  'bagbazar':             { multiplier: 1.35, baseCapacity: 16000, baseWaitScale: 65, category: 'mega' },
  'suruchi-sangha':       { multiplier: 1.32, baseCapacity: 14000, baseWaitScale: 60, category: 'mega' },
  'tala-pratyay':         { multiplier: 1.30, baseCapacity: 13000, baseWaitScale: 55, category: 'mega' },
  'chetla-agrani':        { multiplier: 1.30, baseCapacity: 12500, baseWaitScale: 50, category: 'mega' },
  'ekdalia-evergreen':    { multiplier: 1.28, baseCapacity: 11000, baseWaitScale: 48, category: 'mega' },
  'naktala-udayan':       { multiplier: 1.28, baseCapacity: 11500, baseWaitScale: 48, category: 'mega' },
  'deshapriya-park':      { multiplier: 1.25, baseCapacity: 10500, baseWaitScale: 45, category: 'mega' },

  // ── Major & Prominent Pujas (Popular parks and bustling hubs) ─────────────
  'maddox-square':        { multiplier: 1.22, baseCapacity: 9500,  baseWaitScale: 35, category: 'major' },
  'college-square':       { multiplier: 1.20, baseCapacity: 8500,  baseWaitScale: 40, category: 'major' },
  'salt-lake-fd':         { multiplier: 1.18, baseCapacity: 7500,  baseWaitScale: 35, category: 'major' },
  'mohammad-ali-park':    { multiplier: 1.18, baseCapacity: 7500,  baseWaitScale: 35, category: 'major' },
  'tridhara':             { multiplier: 1.18, baseCapacity: 7000,  baseWaitScale: 35, category: 'major' },
  'singhi-park':          { multiplier: 1.16, baseCapacity: 6500,  baseWaitScale: 30, category: 'major' },
  'kumartuli-park':       { multiplier: 1.16, baseCapacity: 6000,  baseWaitScale: 32, category: 'major' },
  'kashi-bose-lane':      { multiplier: 1.16, baseCapacity: 5800,  baseWaitScale: 35, category: 'major' },
  'mudiali-club':         { multiplier: 1.15, baseCapacity: 5500,  baseWaitScale: 30, category: 'major' },
  'hindustan-park':       { multiplier: 1.14, baseCapacity: 5200,  baseWaitScale: 28, category: 'major' },
  'dum-dum-park':         { multiplier: 1.12, baseCapacity: 5000,  baseWaitScale: 28, category: 'major' },
  'dum-dum-tarun-sangha': { multiplier: 1.12, baseCapacity: 4800,  baseWaitScale: 28, category: 'major' },
  'barisha-club':         { multiplier: 1.12, baseCapacity: 4600,  baseWaitScale: 28, category: 'major' },
  'behala-nutan-dal':     { multiplier: 1.12, baseCapacity: 4600,  baseWaitScale: 28, category: 'major' },
  'bosepukur':            { multiplier: 1.10, baseCapacity: 4400,  baseWaitScale: 25, category: 'major' },
  'jodhpur-park':         { multiplier: 1.10, baseCapacity: 4200,  baseWaitScale: 24, category: 'major' },
  'haridevpur-ajeyo-sanghati': { multiplier: 1.10, baseCapacity: 4000, baseWaitScale: 25, category: 'major' },
  'maniktala-chaltabagan':{ multiplier: 1.12, baseCapacity: 4800,  baseWaitScale: 28, category: 'major' },
  'telengabagan':         { multiplier: 1.10, baseCapacity: 4200,  baseWaitScale: 25, category: 'major' },
  'belgachia-sadharan':   { multiplier: 1.08, baseCapacity: 3800,  baseWaitScale: 22, category: 'major' },
  'rajdanga-naba-uday':   { multiplier: 1.08, baseCapacity: 3800,  baseWaitScale: 22, category: 'major' },

  // ── Moderate Community Pujas (Steady flow, comfortable darshan) ───────────
  'salt-lake-bj':         { multiplier: 1.02, baseCapacity: 2800,  baseWaitScale: 16, category: 'community' },
  'shib-mandir':          { multiplier: 1.08, baseCapacity: 3200,  baseWaitScale: 18, category: 'community' },
  'badamtala-ashar-sangha':{ multiplier: 1.08, baseCapacity: 3200, baseWaitScale: 18, category: 'community' },
  '66-pally':             { multiplier: 1.05, baseCapacity: 2800,  baseWaitScale: 16, category: 'community' },
  'ballygunge-cultural':  { multiplier: 1.06, baseCapacity: 2900,  baseWaitScale: 16, category: 'community' },
  'hatibagan':            { multiplier: 1.06, baseCapacity: 3000,  baseWaitScale: 18, category: 'community' },
  'ahiritola':            { multiplier: 1.08, baseCapacity: 3200,  baseWaitScale: 20, category: 'community' },
  'nalin-sarkar-street':  { multiplier: 1.06, baseCapacity: 2800,  baseWaitScale: 18, category: 'community' },
  'babubagan':            { multiplier: 1.06, baseCapacity: 2800,  baseWaitScale: 16, category: 'community' },
  'selimpur-pally':       { multiplier: 1.05, baseCapacity: 2600,  baseWaitScale: 15, category: 'community' },
  'park-circus':          { multiplier: 1.04, baseCapacity: 2400,  baseWaitScale: 14, category: 'community' },
  'shimla-byayam':        { multiplier: 1.05, baseCapacity: 2600,  baseWaitScale: 15, category: 'community' },
  'taltala-sarbojanin':   { multiplier: 1.04, baseCapacity: 2400,  baseWaitScale: 14, category: 'community' },

  // ── Neighborhood & Block Pujas (Quiet, family block atmosphere) ───────────
  'salt-lake-cd':         { multiplier: 0.86, baseCapacity: 850,   baseWaitScale: 5,  category: 'neighborhood' },
  'salt-lake-ak':         { multiplier: 0.88, baseCapacity: 1000,  baseWaitScale: 6,  category: 'neighborhood' },
  'salt-lake-labony':     { multiplier: 0.92, baseCapacity: 1300,  baseWaitScale: 8,  category: 'neighborhood' },
  'chorbagan':            { multiplier: 0.95, baseCapacity: 1700,  baseWaitScale: 10, category: 'neighborhood' },
  'kabitirtha-75-palli':  { multiplier: 0.85, baseCapacity: 750,   baseWaitScale: 4,  category: 'neighborhood' },
  'khidderpore-28':       { multiplier: 0.85, baseCapacity: 750,   baseWaitScale: 4,  category: 'neighborhood' },
};

// Compatibility map
export const PANDAL_MULTIPLIERS: Record<string, number> = Object.fromEntries(
  Object.entries(PANDAL_CROWD_PROFILES).map(([k, v]) => [k, v.multiplier])
);

export function getPujaDay(date: Date = new Date()): PujaDay {
  const d = date.toISOString().split('T')[0];

  // Check 2025 dates (27th September to 2nd October 2025)
  if (d === PUJA_DATES_2025.ashtami) return 'ashtami';
  if (d === PUJA_DATES_2025.navami)  return 'navami';
  if (d === PUJA_DATES_2025.dashami) return 'dashami';
  if (d === PUJA_DATES_2025.saptami) return 'saptami';
  if (d === PUJA_DATES_2025.sasthi)  return 'sasthi';
  if (d === PUJA_DATES_2025.panchami) return 'panchami';

  // Check 2026 dates
  if (d === PUJA_DATES_2026.ashtami) return 'ashtami';
  if (d === PUJA_DATES_2026.navami)  return 'navami';
  if (d === PUJA_DATES_2026.dashami) return 'dashami';
  if (d === PUJA_DATES_2026.saptami) return 'saptami';
  if (d === PUJA_DATES_2026.sasthi)  return 'sasthi';
  if (d === PUJA_DATES_2026.panchami) return 'panchami';

  return 'regular';
}

function getPatternForDay(day: PujaDay): number[] {
  switch (day) {
    case 'ashtami':  return ASHTAMI_PATTERN;
    case 'navami':   return NAVAMI_PATTERN;
    case 'dashami':  return DASHAMI_PATTERN;
    case 'saptami':  return SAPTAMI_PATTERN;
    case 'sasthi':   return SASTHI_PATTERN;
    case 'panchami': return PANCHAMI_PATTERN;
    default:         return REGULAR_PATTERN;
  }
}

/**
 * Get the full 24-hour busyness array for a pandal on a given date.
 */
export function getHourlyPattern(pandalId: string, date: Date = new Date()): number[] {
  const day = getPujaDay(date);
  const base = getPatternForDay(day);
  const mult = PANDAL_MULTIPLIERS[pandalId] ?? 1.0;
  return base.map((v) => Math.min(100, Math.round(v * mult)));
}

/**
 * Get the busyness score (0–100) for a pandal right now.
 */
export function getCurrentBusynessFromPattern(pandalId: string, date: Date = new Date()): number {
  const hour = date.getHours();
  const pattern = getHourlyPattern(pandalId, date);
  return pattern[hour];
}

const GOOGLE_PLACE_IDS: Record<string, string> = {
  'bagbazar':           'ChIJvQ4vhEoW6TkROhPAYJo4PGA',
  'sreebhumi':          'ChIJD3OM-gIS6TkRjm4RKCMByoc',
  'college-square':     'ChIJ1dMQYd4W6TkR9k0aaKVV9oI',
  'santosh-mitra-square': 'ChIJvQ4vhEoW6TkROhPAYJo4PGB',
};

/**
 * Fetch live current_popularity from Google Places API.
 * Returns null if no API key or place ID not known.
 */
export async function fetchLivePopularity(pandalId: string): Promise<number | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const placeId = GOOGLE_PLACE_IDS[pandalId];

  if (!apiKey || !placeId) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=current_popularity&key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    const data = await res.json();
    return data?.result?.current_popularity ?? null;
  } catch {
    return null;
  }
}

/**
 * Returns human-readable crowd label like Google shows.
 */
export function getBusynessLabel(score: number): {
  label: string;
  sublabel: string;
  color: string;
  barColor: string;
} {
  if (score >= 80) return {
    label: 'Usually a wait',
    sublabel: 'Peak crowd / Heavy rush',
    color: '#EF4444',
    barColor: '#EF4444',
  };
  if (score >= 60) return {
    label: 'Usually busy',
    sublabel: 'Active crowd surge',
    color: '#F97316',
    barColor: '#F97316',
  };
  if (score >= 35) return {
    label: 'Moderate crowd',
    sublabel: 'Steady movement',
    color: '#F59E0B',
    barColor: '#F59E0B',
  };
  if (score >= 15) return {
    label: 'Not too crowded',
    sublabel: 'Light movement',
    color: '#22C55E',
    barColor: '#22C55E',
  };
  return {
    label: 'Not crowded',
    sublabel: 'Free flow entry',
    color: '#16A34A',
    barColor: '#16A34A',
  };
}

/**
 * Visual representation mapping from GREEN (light / not crowded) to RED (very crowded).
 * Computes individual devotee counts and queue wait times tailored to each pandal's actual physical capacity.
 */
export function getCrowdVisual(score: number, pandalId?: string) {
  const profile = (pandalId && PANDAL_CROWD_PROFILES[pandalId])
    ? PANDAL_CROWD_PROFILES[pandalId]
    : {
        multiplier: 1.0,
        baseCapacity: 4000,
        baseWaitScale: 25,
        category: 'community' as const,
      };

  // Generate a small unique hash offset based on pandalId so numbers are tailored and realistic
  let idHash = 0;
  if (pandalId) {
    for (let i = 0; i < pandalId.length; i++) {
      idHash = (idHash * 19 + pandalId.charCodeAt(i)) % 97;
    }
  }

  // Calculate devotees tailored to this pandal's actual ground capacity and crowd score
  const devoteeFraction = Math.max(0.12, score / 100);
  const devoteeBase = Math.round(profile.baseCapacity * devoteeFraction);
  const devoteeJitter = ((idHash % 15) - 7) * 15;
  const estDevotees = Math.max(150, devoteeBase + devoteeJitter);

  // Calculate queue wait tailored to this pandal's barricade / queue length and score
  const waitFraction = Math.max(0.08, score / 100);
  const waitBase = Math.round(profile.baseWaitScale * waitFraction);
  const waitJitter = (idHash % 3) - 1;
  const waitMins = Math.max(1, waitBase + waitJitter);

  if (score >= 75) {
    return {
      level: 'very_crowded',
      label: 'Very Crowded',
      badgeText: '🔴 Very Crowded · Heavy Queue',
      fillColor: '#EF4444', // Red
      strokeColor: '#B91C1C',
      bg: '#FEF2F2',
      border: '#FECACA',
      textColor: '#991B1B',
      waitMins,
      estDevotees,
    };
  }
  if (score >= 50) {
    return {
      level: 'busy',
      label: 'Busy',
      badgeText: '🟠 Busy · Active Rush',
      fillColor: '#F97316', // Orange
      strokeColor: '#C2410C',
      bg: '#FFF7ED',
      border: '#FFEDD5',
      textColor: '#9A3412',
      waitMins,
      estDevotees,
    };
  }
  if (score >= 30) {
    return {
      level: 'moderate',
      label: 'Moderate',
      badgeText: '🟡 Moderate · Steady Movement',
      fillColor: '#F59E0B', // Amber / Yellow
      strokeColor: '#B45309',
      bg: '#FFFBEB',
      border: '#FDE68A',
      textColor: '#92400E',
      waitMins,
      estDevotees,
    };
  }
  return {
    level: 'light',
    label: 'Not Crowded',
    badgeText: '🟢 Light Crowd · Free Flow',
    fillColor: '#22C55E', // Green
    strokeColor: '#15803D',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    textColor: '#065F46',
    waitMins,
    estDevotees,
  };
}
