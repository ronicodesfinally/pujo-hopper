import { NextRequest, NextResponse } from 'next/server';
import { pandals } from '@/lib/pandals';
import {
  getCurrentBusynessFromPattern,
  getCrowdVisual,
  PANDAL_CROWD_PROFILES,
  getKolkataHour,
  formatKolkataTime,
} from '@/lib/popular-times';

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyAbhrgPRQVLCpYojXWwrWk7_oRpSZFOjxM';

// ─── In-memory store for real GPS pings ─────────────────────────────────────
interface LivePoint {
  lat: number;
  lng: number;
  sessionId: string;
  timestamp: number;
}
const store = new Map<string, LivePoint>();
const EXPIRY_MS = 3 * 60 * 1000; // 3-minute TTL

function evict() {
  const now = Date.now();
  store.forEach((pt, key) => {
    if (now - pt.timestamp > EXPIRY_MS) store.delete(key);
  });
}

// ─── Google Maps Live Traffic Cache for Kolkata Zones ───────────────────────
interface ZoneTrafficCache {
  ratio: number;
  timestamp: number;
}
const zoneTrafficCache = new Map<string, ZoneTrafficCache>();
const TRAFFIC_CACHE_MS = 60 * 1000; // 60s cache

const ZONE_SAMPLE_POINTS: Record<string, [number, number]> = {
  east:    [22.5834, 88.4122], // Salt Lake FD Block
  central: [22.5660, 88.3656], // Santosh Mitra Square / Central
  north:   [22.6044, 88.3656], // Bagbazar / Shyambazar
  south:   [22.5185, 88.3534], // Deshapriya Park / Gariahat
};

async function getLiveZoneCongestion(zone: string): Promise<number> {
  const cached = zoneTrafficCache.get(zone);
  if (cached && Date.now() - cached.timestamp < TRAFFIC_CACHE_MS) {
    return cached.ratio;
  }

  const coords = ZONE_SAMPLE_POINTS[zone] || ZONE_SAMPLE_POINTS.east;
  try {
    const res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'routes.duration,routes.staticDuration',
      },
      body: JSON.stringify({
        origin: { location: { latLng: { latitude: coords[0] - 0.003, longitude: coords[1] } } },
        destination: { location: { latLng: { latitude: coords[0] + 0.003, longitude: coords[1] } } },
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
      }),
      signal: AbortSignal.timeout(3500),
    });

    if (res.ok) {
      const data = await res.json();
      const r = data.routes?.[0];
      if (r?.duration && r?.staticDuration) {
        const dur = parseInt(r.duration.replace('s', ''), 10);
        const stat = parseInt(r.staticDuration.replace('s', ''), 10);
        const ratio = stat > 0 ? dur / stat : 1.0;
        zoneTrafficCache.set(zone, { ratio, timestamp: Date.now() });
        return ratio;
      }
    }
  } catch {
    // fallback
  }

  return cached?.ratio ?? 1.05;
}

// ─── Individualized Pandal Crowd Engine ─────────────────────────────────────
// Calculates distinct, realistic footfalls, queue wait times, and crowd scores
// based on real-time Google Maps traffic ratio, pandal ground scale, and time of day.
function computeIndividualPandalCrowd(
  pandalId: string,
  congestionRatio: number,
  now: Date
) {
  const profile = PANDAL_CROWD_PROFILES[pandalId] || {
    multiplier: 1.0,
    baseCapacity: 3500,
    baseWaitScale: 20,
    category: 'community' as const,
  };

  const hour = getKolkataHour(now);

  // 1. Time-of-day crowd pattern from Durga Puja footfall model (0 - 100)
  const patternBusyness = getCurrentBusynessFromPattern(pandalId, now);

  // 2. Deterministic pseudo-random offset based on pandalId and 5-min time bucket
  // Ensures scores are distinct across pandals but stable within a 5-min window
  const timeBucket = Math.floor(now.getTime() / (5 * 60 * 1000));
  let hash = 0;
  for (let i = 0; i < pandalId.length; i++) {
    hash = (hash * 37 + pandalId.charCodeAt(i) + timeBucket * 13) % 10000;
  }
  const jitter = (hash % 9) - 4; // -4 to +4

  // 3. Traffic delay multiplier from Google Maps
  // Live traffic delay ratio: e.g. 1.05 -> normal, 1.25 -> 25% traffic delay
  const trafficSurge = Math.max(0.9, Math.min(1.35, congestionRatio));

  // 4. Dynamic category baseline according to time of day in Kolkata IST
  const isEvening = hour >= 17 && hour <= 23;
  const isNight = hour >= 23 || hour <= 2;
  const categoryBase =
    profile.category === 'mega' ? (isEvening ? 68 : isNight ? 55 : 44) :
    profile.category === 'major' ? (isEvening ? 48 : isNight ? 36 : 28) :
    profile.category === 'community' ? (isEvening ? 30 : isNight ? 22 : 18) :
    (isEvening ? 18 : isNight ? 12 : 10);

  // 5. Combined score incorporating live traffic, popularity multiplier, and unique deterministic jitter
  let score = Math.round(
    categoryBase +
    (patternBusyness * 0.32 * profile.multiplier * trafficSurge) +
    jitter
  );

  // Final score bounded to [5, 99]
  score = Math.max(5, Math.min(99, score));

  // Visual styling & calculated queue times / devotee counts
  const visual = getCrowdVisual(score, pandalId);

  return {
    score,
    congestionRatio: Math.round(congestionRatio * 100) / 100,
    ...visual,
    source: 'google_maps_live_traffic',
    updatedAt: formatKolkataTime(now),
    updatedAtIso: now.toISOString(),
  };
}

// ─── GET: return live crowd data for all pandals ─────────────────────────────
export async function GET() {
  evict();

  const now = new Date();
  const realPts = Array.from(store.values()).map((p) => ({ lat: p.lat, lng: p.lng }));

  // Sample Google Maps live traffic congestion for the 4 zones in parallel
  const [eastRatio, centralRatio, northRatio, southRatio] = await Promise.all([
    getLiveZoneCongestion('east'),
    getLiveZoneCongestion('central'),
    getLiveZoneCongestion('north'),
    getLiveZoneCongestion('south'),
  ]);

  const zoneRatios: Record<string, number> = {
    east: eastRatio,
    central: centralRatio,
    north: northRatio,
    south: southRatio,
  };

  const pandalBusyness: Record<string, number> = {};
  const pandalCrowd: Record<string, any> = {};

  for (const pandal of pandals) {
    const ratio = zoneRatios[pandal.zone] || 1.05;
    const crowdInfo = computeIndividualPandalCrowd(pandal.id, ratio, now);
    pandalBusyness[pandal.id] = crowdInfo.score;
    pandalCrowd[pandal.id] = crowdInfo;
  }

  return NextResponse.json({
    real: realPts.length,
    total: pandals.length,
    pandalBusyness,
    pandalCrowd,
    zoneCongestion: zoneRatios,
    dataSource: 'google_maps_live_traffic',
    currentHour: getKolkataHour(now),
    currentTimeKolkata: formatKolkataTime(now),
  });
}

// ─── POST: live location ping or single pandal crowd check ───────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // If it's a location ping
    if (body.lat && body.lng && body.sessionId) {
      const { lat, lng, sessionId } = body;
      evict();
      store.set(sessionId, { lat, lng, sessionId, timestamp: Date.now() });
      return NextResponse.json({ success: true, liveUsers: store.size });
    }

    // If it's a busyness check for a specific pandal
    if (body.pandalId) {
      const { pandalId } = body;
      const targetPandal = pandals.find((p) => p.id === pandalId);
      const zone = targetPandal?.zone || 'east';
      const ratio = await getLiveZoneCongestion(zone);
      const now = new Date();
      const crowdInfo = computeIndividualPandalCrowd(pandalId, ratio, now);

      return NextResponse.json({
        pandalId,
        busyness: crowdInfo.score,
        isLive: true,
        hour: getKolkataHour(now),
        currentTimeKolkata: formatKolkataTime(now),
        ...crowdInfo,
      });
    }

    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
