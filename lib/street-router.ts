import { encodePolyline, decodePolyline } from './polyline';

export interface RouteStep {
  distanceMeters: number;
  duration: string;
  instructions: string;
  maneuver?: string;
  streetName?: string;
}

export interface RouteLeg {
  legIndex: number;
  distanceMeters: number;
  duration: string;
  steps: RouteStep[];
}

export interface RouteResult {
  duration: string;
  distanceMeters: number;
  encodedPolyline: string;
  coordinates: [number, number][];
  legs: RouteLeg[];
  source: 'osrm' | 'google' | 'kolkata_road_network' | 'pedestrian_corridor';
}

const GOOGLE_API_KEY = 'AIzaSyAbhrgPRQVLCpYojXWwrWk7_oRpSZFOjxM';

export interface MetroStation {
  name: string;
  lat: number;
  lng: number;
  line: 'green' | 'blue';
}

export const KOLKATA_METRO_STATIONS: MetroStation[] = [
  // Green Line (East - West Metro)
  { name: 'Howrah Maidan', lat: 22.5855, lng: 88.3275, line: 'green' },
  { name: 'Howrah Railway Station', lat: 22.5835, lng: 88.3425, line: 'green' },
  { name: 'BBD Bag / Mahakaran', lat: 22.5715, lng: 88.3490, line: 'green' },
  { name: 'Esplanade (Green Line)', lat: 22.5645, lng: 88.3515, line: 'green' },
  { name: 'Sealdah Metro', lat: 22.5670, lng: 88.3715, line: 'green' },
  { name: 'Phoolbagan', lat: 22.5720, lng: 88.3895, line: 'green' },
  { name: 'Salt Lake Stadium', lat: 22.5750, lng: 88.4020, line: 'green' },
  { name: 'Bengal Chemical', lat: 22.5800, lng: 88.4055, line: 'green' },
  { name: 'City Centre (Salt Lake)', lat: 22.5872, lng: 88.4088, line: 'green' },
  { name: 'Central Park', lat: 22.5862, lng: 88.4168, line: 'green' },
  { name: 'Karunamoyee', lat: 22.5855, lng: 88.4215, line: 'green' },
  { name: 'Salt Lake Sector V', lat: 22.5815, lng: 88.4320, line: 'green' },

  // Blue Line (North - South Corridor)
  { name: 'Dakshineswar', lat: 22.6535, lng: 88.3580, line: 'blue' },
  { name: 'Baranagar', lat: 22.6415, lng: 88.3670, line: 'blue' },
  { name: 'Noapara', lat: 22.6345, lng: 88.3780, line: 'blue' },
  { name: 'Dum Dum', lat: 22.6215, lng: 88.3775, line: 'blue' },
  { name: 'Belgachia', lat: 22.6075, lng: 88.3810, line: 'blue' },
  { name: 'Shyambazar', lat: 22.6025, lng: 88.3705, line: 'blue' },
  { name: 'Shovabazar Sutanuti', lat: 22.5975, lng: 88.3635, line: 'blue' },
  { name: 'Girish Park', lat: 22.5855, lng: 88.3605, line: 'blue' },
  { name: 'MG Road', lat: 22.5820, lng: 88.3610, line: 'blue' },
  { name: 'Central', lat: 22.5680, lng: 88.3600, line: 'blue' },
  { name: 'Chandni Chowk', lat: 22.5640, lng: 88.3550, line: 'blue' },
  { name: 'Esplanade (Blue Line)', lat: 22.5645, lng: 88.3515, line: 'blue' },
  { name: 'Park Street', lat: 22.5535, lng: 88.3510, line: 'blue' },
  { name: 'Maidan', lat: 22.5455, lng: 88.3495, line: 'blue' },
  { name: 'Rabindra Sadan', lat: 22.5390, lng: 88.3475, line: 'blue' },
  { name: 'Netaji Bhavan', lat: 22.5310, lng: 88.3465, line: 'blue' },
  { name: 'Jatin Das Park', lat: 22.5220, lng: 88.3485, line: 'blue' },
  { name: 'Kalighat', lat: 22.5175, lng: 88.3490, line: 'blue' },
  { name: 'Rabindra Sarobar', lat: 22.5080, lng: 88.3460, line: 'blue' },
  { name: 'Mahanayak Uttam Kumar', lat: 22.4975, lng: 88.3450, line: 'blue' },
  { name: 'Netaji (Kudghat)', lat: 22.4865, lng: 88.3475, line: 'blue' },
  { name: 'Masterda Surya Sen', lat: 22.4765, lng: 88.3550, line: 'blue' },
  { name: 'Gitanjali', lat: 22.4670, lng: 88.3685, line: 'blue' },
  { name: 'Kavi Nazrul', lat: 22.4580, lng: 88.3800, line: 'blue' },
  { name: 'Shahid Khudiram', lat: 22.4505, lng: 88.3905, line: 'blue' },
  { name: 'Kavi Subhash', lat: 22.4410, lng: 88.3980, line: 'blue' },
];

export function haversineDistMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Calculates whether Metro and Bus options should be active or muted based on distance and station access
 */
export function getTransitAvailability(
  stops: Array<{ lat: number; lng: number }>,
  origin: { lat: number; lng: number } = { lat: 22.5904744, lng: 88.4082609 }
) {
  if (stops.length === 0) {
    return {
      metro: { available: true, label: 'Green/Blue Line', reason: '' },
      bus:   { available: true, label: 'Local / Auto', reason: '' },
    };
  }

  const distances = stops.map((s) => haversineDistMeters(origin.lat, origin.lng, s.lat, s.lng));
  const maxDist = Math.max(...distances);

  // 1. Metro check:
  // Under 1.2 km (e.g. CD Block 190m, Labony 820m, FD Block 880m): walking is 2-10 min, no metro route makes sense.
  const isTooCloseForMetro = maxDist < 1200;

  // Check if at least one stop is within 1.3 km of a Metro station
  const isDestNearMetro = stops.some((s) =>
    KOLKATA_METRO_STATIONS.some((st) => haversineDistMeters(s.lat, s.lng, st.lat, st.lng) <= 1300)
  );

  const isOriginNearMetro = KOLKATA_METRO_STATIONS.some(
    (st) => haversineDistMeters(origin.lat, origin.lng, st.lat, st.lng) <= 900
  );

  const metroAvailable = !isTooCloseForMetro && isOriginNearMetro && isDestNearMetro;
  let metroLabel = 'Green/Blue Line';
  let metroReason = '';
  if (isTooCloseForMetro) {
    metroLabel = 'Walk is faster (< 1.2 km)';
    metroReason = 'Destination is within short walking distance; taking metro is unnecessary.';
  } else if (!isDestNearMetro) {
    metroLabel = 'No direct Metro';
    metroReason = 'No metro station is within comfortable reach of this pandal.';
  } else if (!isOriginNearMetro) {
    metroLabel = 'No nearby Metro';
    metroReason = 'Origin has no immediate metro station.';
  }

  // 2. Bus check:
  // Under 900m: Local / state buses do not operate inside residential block lanes for a 5-minute stroll.
  const isTooCloseForBus = maxDist < 900;
  const busAvailable = !isTooCloseForBus;
  const busLabel = isTooCloseForBus ? 'Walk is faster (< 900m)' : 'Local / Auto';
  const busReason = isTooCloseForBus
    ? 'Walking through block footpaths is significantly faster than waiting for a bus.'
    : 'Local buses and Toto autos connect along major avenues.';

  return {
    metro: { available: metroAvailable, label: metroLabel, reason: metroReason },
    bus:   { available: busAvailable, label: busLabel, reason: busReason },
  };
}

/**
 * Kolkata Major Vehicular Arteries (Cars, Cabs, Cabs cannot enter pedestrian park paths)
 * Enforces one-way avenue flows, roundabouts, and designated police parking/drop points.
 */
const KOLKATA_VEHICULAR_NODES: [number, number][] = [
  // Salt Lake Sector 1 & 2 Vehicular Grid
  [22.5904744, 88.4082609], // Momo I Am Pickup / 2nd Cross Road
  [22.5893, 88.4073],       // 2nd Cross Rd & 3rd Avenue South Intersection
  [22.5899, 88.4040],       // 3rd Ave & Sector 1 Island / CA Market
  [22.5882, 88.4095],       // 3rd Ave towards City Centre Roundabout
  [22.5880, 88.4100],       // City Centre 1 Vehicular Roundabout
  [22.5872, 88.4088],       // 1st Avenue / City Centre Metro
  [22.5932, 88.4101],       // 2nd Cross Rd & 1st Avenue North Crossing
  [22.5914, 88.4112],       // CD Block Police Vehicular Drop Zone (3rd Ave access)
  [22.5865, 88.4145],       // 3rd Avenue & Central Park West
  [22.5855, 88.4190],       // 3rd Avenue & Broadway Crossing
  [22.5845, 88.4135],       // FD Block Official Police Parking Zone (Broadway)
  [22.5862, 88.4168],       // Central Park North Gate / Broadway
  [22.5855, 88.4215],       // Karunamoyee Vehicular Crossing
  [22.5885, 88.4285],       // 3rd Avenue East / BJ Block Vehicle Drop Zone
  [22.5898, 88.4278],       // BJ Block Parking Ground (Sector 2)
  [22.5832, 88.4060],       // Labony Estate Vehicular Access (1st Avenue / 2nd Cross Rd)

  // Ultadanga & VIP Road Vehicular Corridor (Sreebhumi, Dum Dum Park)
  [22.5985, 88.4055],       // Ultadanga Hudco Vehicular Crossing
  [22.6005, 88.4010],       // Gouribari / VIP Road Flyover Ramp
  [22.6025, 88.4040],       // Dakshindari Road / VIP Road Service Lane
  [22.6035, 88.4060],       // Sreebhumi Police Car Drop-off Point (VIP Road)
  [22.6120, 88.4150],       // Dum Dum Park Bharat Chakra Crossing
  [22.6145, 88.4180],       // Dum Dum Park Tarun Sangha Drop Zone

  // Central Kolkata Vehicular Arteries
  [22.5765, 88.3662],       // College Street & Surya Sen St Crossing
  [22.5740, 88.3685],       // Sealdah Flyover / BB Ganguly St
  [22.5710, 88.3675],       // Santosh Mitra Square Car Drop-off (BB Ganguly St)
  [22.5820, 88.3610],       // CR Avenue & MG Road Crossing (Mohammad Ali Park)

  // North Kolkata Vehicular Arteries
  [22.6040, 88.3675],       // Girish Avenue & Bagbazar St
  [22.5990, 88.3645],       // Rabindra Sarani & Kumartuli Vehicular Drop
  [22.5955, 88.3620],       // Ahiritola Ghat Road
  [22.5930, 88.3725],       // Bidhan Sarani / Hatibagan Crossing

  // South Kolkata Vehicular Arteries
  [22.5185, 88.3540],       // Rashbehari Avenue & Lake View Rd
  [22.5165, 88.3520],       // Southern Avenue Vehicular Corridor
  [22.5150, 88.3560],       // Lake Temple Rd Crossing
  [22.5190, 88.3605],       // Manohar Pukur Rd (Tridhara Drop Zone)
  [22.5180, 88.3640],       // Gariahat Crossing (Ekdalia Evergreen)
  [22.5245, 88.3620],       // Ballygunge Cultural Vehicle Parking
];

/**
 * Kolkata Pedestrian Walking Corridors:
 * Enables shortcuts through park gates, pedestrian footpaths, pedestrian-only alleys,
 * overbridges, and Kolkata Police illuminated Puja walking barricades.
 */
const KOLKATA_PEDESTRIAN_NODES: [number, number][] = [
  // Salt Lake Sector 1 Direct Pedestrian Corridors
  [22.5904744, 88.4082609], // Momo I Am Pedestrian Entrance / 2nd Cross Rd
  [22.5911, 88.4087],       // CD-18 Interior Residential Block Walkway
  [22.5916, 88.4091],       // CD Block Children Park South Gate
  [22.5919194, 88.409485],  // CD Block Mandap & Park Grounds (Direct 190m Walk!)
  [22.5880, 88.4085],       // 2nd Cross Road Pedestrian Footpath
  [22.5855, 88.4072],       // Labony Estate Pedestrian Gate
  [22.5832131, 88.4067466], // Labony Estate Park Mandap
  [22.5842, 88.4112],       // FD Block Park Pedestrian Gate Barricade
  [22.5834541, 88.4122701], // FD Block Park Mandap Ground
  [22.5905, 88.4180],       // CC-BJ Block Connecting Footpath
  [22.5906892, 88.4265676], // BJ Block Park Mandap Pedestrian Gate
  [22.5888537, 88.4307676], // AK Block Park Pedestrian Gate

  // Pedestrian Footbridge & Puja Queue Corridors (Sreebhumi, North)
  [22.5960, 88.4065],       // 1st Avenue Pedestrian Footpath
  [22.6000, 88.4030],       // Ultadanga Kestopur Canal Pedestrian Footbridge
  [22.6045, 88.4068],       // Sreebhumi Sporting Club Clock Tower Pedestrian Gate
  [22.6120, 88.4150],       // Dum Dum Park Bharat Chakra Pedestrian Queue
  [22.6145, 88.4180],       // Dum Dum Park Tarun Sangha Queue

  // Central Pedestrian Puja Corridors
  [22.5660201, 88.3656532], // Santosh Mitra Square (Lebutala Park) Mandap Gate
  [22.5745279, 88.3644724], // College Square Lake Promenade
  [22.5820, 88.3610],       // Mohammad Ali Park Interior Queue

  // North Heritage Pedestrian Lanes
  [22.6040, 88.3675],       // Bagbazar Sarbojanin Entry Queue
  [22.5990, 88.3645],       // Kumartuli Park Mandap Entrance
  [22.5955, 88.3620],       // Ahiritola Ghat Street Pedestrian Walkway
  [22.5930, 88.3725],       // Kashi Bose Lane Puja Alley

  // South Kolkata Southern Avenue Pedestrian Walkways
  [22.5165, 88.3520],       // Mudiali Club Park Gate
  [22.5150, 88.3560],       // Shib Mandir Lake Temple Queue
  [22.5190, 88.3605],       // Tridhara Sammilani Pedestrian Barricade
  [22.5180, 88.3640],       // Ekdalia Evergreen Queue Corridor
  [22.5245, 88.3620],       // Ballygunge Cultural Mandap Gate
];

/**
 * Mode-Aware Road & Pedestrian Corridor Interpolator
 * Produces fundamentally different routes for walking vs driving:
 * - Walking: Takes internal block pathways, park gates, and direct sidewalks.
 * - Driving: Takes vehicular avenues, one-way loops, and designated police drop zones.
 */
export function interpolateRoadCorridor(
  start: [number, number],
  end: [number, number],
  mode: string = 'walk'
): [number, number][] {
  const isVehicular = mode === 'cab' || mode === 'DRIVE';
  const network = isVehicular ? KOLKATA_VEHICULAR_NODES : KOLKATA_PEDESTRIAN_NODES;

  const directDist = haversineDistMeters(start[0], start[1], end[0], end[1]);

  // Special authentic pedestrian corridor: Momo I Am to CD Block Children Park (~190m)
  // Walkers go directly through the CD-18 block path into the park gate.
  // Drivers CANNOT enter the park gate; they must drive down to 3rd Ave and loop around.
  const isNearMomoIAm = haversineDistMeters(start[0], start[1], 22.5904744, 88.4082609) < 60;
  const isCDBlock = haversineDistMeters(end[0], end[1], 22.5919194, 88.409485) < 70;

  if (isNearMomoIAm && isCDBlock) {
    if (isVehicular) {
      // Vehicular path: Momo I Am -> 2nd Cross Rd south -> 3rd Ave -> vehicular drop zone
      return [
        start,
        [22.5898, 88.4077], // 2nd Cross Rd south
        [22.5893, 88.4073], // Turn on 3rd Avenue
        [22.5896, 88.4090], // 3rd Avenue East
        [22.5905, 88.4105], // CD Block vehicular approach lane
        [22.5914, 88.4112], // CD Block Police Drop Zone
        end,
      ];
    } else {
      // Pedestrian path: Direct CD-18 residential block walkway straight into park south gate
      return [
        start,
        [22.5909, 22.5909 ? 88.4085 : 88.4085], // Exit CD-18
        [22.5913, 88.4088],                     // CD block interior walkway
        [22.5916, 88.4091],                     // CD Park pedestrian gate
        end,
      ];
    }
  }

  // Find nearest network nodes
  let nearestStart = network[0];
  let minStartDist = Infinity;
  let nearestEnd = network[0];
  let minEndDist = Infinity;

  for (const node of network) {
    const d1 = haversineDistMeters(start[0], start[1], node[0], node[1]);
    if (d1 < minStartDist) {
      minStartDist = d1;
      nearestStart = node;
    }
    const d2 = haversineDistMeters(end[0], end[1], node[0], node[1]);
    if (d2 < minEndDist) {
      minEndDist = d2;
      nearestEnd = node;
    }
  }

  const corridor: [number, number][] = [start];

  if (minStartDist > 25 && minStartDist < 1200) {
    corridor.push(nearestStart);
  }

  // Find intermediate corridor nodes
  const midLat = (nearestStart[0] + nearestEnd[0]) / 2;
  const midLng = (nearestStart[1] + nearestEnd[1]) / 2;
  let bestMid: [number, number] | null = null;
  let minMidDist = Infinity;

  for (const node of network) {
    if (node === nearestStart || node === nearestEnd) continue;
    const d = haversineDistMeters(midLat, midLng, node[0], node[1]);
    if (d < minMidDist && d < directDist * 0.75) {
      minMidDist = d;
      bestMid = node;
    }
  }

  if (bestMid) {
    corridor.push(bestMid);
  }

  if (nearestEnd !== nearestStart && minEndDist > 25 && minEndDist < 1200) {
    corridor.push(nearestEnd);
  }

  corridor.push(end);
  return corridor;
}

function getSpeedMetersPerSec(mode: string): number {
  if (mode === 'cab' || mode === 'DRIVE') return 5.5; // ~20 km/h Kolkata Puja vehicular traffic
  if (mode === 'bus') return 4.0;                     // ~14.4 km/h local bus & auto
  if (mode === 'metro') return 6.0;                   // ~21.6 km/h metro commute
  return 1.17;                                       // ~4.2 km/h natural pedestrian walking speed
}

/**
 * Primary Natural Route Computer:
 * Strictly distinguishes between walking and driving geometries, distances, and ETAs.
 */
export async function computeNaturalRoute(
  waypoints: Array<{ lat: number; lng: number; name?: string }>,
  travelMode: string = 'walk'
): Promise<RouteResult> {
  if (waypoints.length < 2) {
    throw new Error('At least 2 waypoints are required for navigation.');
  }

  const isCab = travelMode === 'cab' || travelMode === 'DRIVE';
  const speedMs = getSpeedMetersPerSec(travelMode);
  const coordsString = waypoints.map((p) => `${p.lng},${p.lat}`).join(';');

  // ── ATTEMPT 1: OSRM Driving for Cab (Real road network) ────────────────────
  if (isCab) {
    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson&steps=true`;
      const res = await fetch(osrmUrl, { signal: AbortSignal.timeout(4500) });
      if (res.ok) {
        const data = await res.json();
        if (data.code === 'Ok' && data.routes?.length > 0) {
          const route = data.routes[0];
          const coordinates: [number, number][] = route.geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]] as [number, number]
          );

          const totalDurationSecs = Math.round(route.duration);

          const legs: RouteLeg[] = (route.legs || []).map((leg: any, idx: number) => {
            const fromName = waypoints[idx]?.name || (idx === 0 ? 'Momo I Am' : `Stop ${idx}`);
            const toName = waypoints[idx + 1]?.name || `Stop ${idx + 1}`;

            const steps: RouteStep[] = (leg.steps || []).map((s: any) => {
              const street = s.name || 'vehicular avenue';
              let instruction = '';
              if (s.maneuver?.type === 'depart') {
                instruction = `Drive along ${street} from ${fromName}`;
              } else if (s.maneuver?.type === 'arrive') {
                instruction = `Arrive at designated vehicle parking/drop zone near ${toName}`;
              } else if (s.maneuver?.type === 'roundabout') {
                instruction = `Take exit ${s.maneuver?.exit || 1} at roundabout onto ${street}`;
              } else {
                instruction = `${s.maneuver?.modifier ? `Turn ${s.maneuver.modifier}` : 'Turn'} onto ${street}`;
              }

              return {
                distanceMeters: Math.round(s.distance),
                duration: `${Math.round(s.duration)}s`,
                instructions: instruction,
                maneuver: s.maneuver?.type,
                streetName: street,
              };
            });

            return {
              legIndex: idx,
              distanceMeters: Math.round(leg.distance),
              duration: `${Math.round(leg.duration)}s`,
              steps: steps.length > 0 ? steps : [
                {
                  distanceMeters: Math.round(leg.distance),
                  duration: `${Math.round(leg.duration)}s`,
                  instructions: `Drive along road corridor from ${fromName} to ${toName}`,
                },
              ],
            };
          });

          return {
            duration: `${totalDurationSecs}s`,
            distanceMeters: Math.round(route.distance),
            encodedPolyline: encodePolyline(coordinates),
            coordinates,
            legs,
            source: 'osrm',
          };
        }
      }
    } catch (osrmErr) {
      console.warn('OSRM driving attempt skipped:', osrmErr);
    }
  }

  // ── ATTEMPT 2: Google Routes API (Travel Mode Aware) ───────────────────────
  try {
    const origin = waypoints[0];
    const destination = waypoints[waypoints.length - 1];
    const intermediates = waypoints.slice(1, waypoints.length - 1);

    const body: any = {
      origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
      destination: { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } },
      travelMode: isCab ? 'DRIVE' : 'WALK',
      routingPreference: isCab ? 'TRAFFIC_AWARE' : undefined,
    };

    if (intermediates.length > 0) {
      body.intermediates = intermediates.map((pt) => ({
        location: { latLng: { latitude: pt.lat, longitude: pt.lng } },
      }));
    }

    const gRes = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });

    if (gRes.ok) {
      const gData = await gRes.json();
      const route = gData.routes?.[0];
      if (route?.polyline?.encodedPolyline) {
        const decoded = decodePolyline(route.polyline.encodedPolyline);
        const legs: RouteLeg[] = (route.legs || []).map((leg: any, idx: number) => ({
          legIndex: idx,
          distanceMeters: leg.distanceMeters,
          duration: leg.duration,
          steps: (leg.steps || []).map((s: any) => ({
            distanceMeters: s.distanceMeters,
            duration: s.staticDuration,
            instructions: s.navigationInstruction?.instructions || (isCab ? 'Drive along route' : 'Walk along route'),
            maneuver: s.navigationInstruction?.maneuver,
          })),
        }));

        return {
          duration: route.duration,
          distanceMeters: route.distanceMeters,
          encodedPolyline: route.polyline.encodedPolyline,
          coordinates: decoded,
          legs,
          source: 'google',
        };
      }
    }
  } catch (gErr) {
    console.warn('Google Routes API skipped:', gErr);
  }

  // ── ATTEMPT 3: High-Fidelity Kolkata Mode-Aware Network ─────────────────────
  // Explicitly branches between authentic pedestrian walkways and vehicular avenues
  const allCoordinates: [number, number][] = [];
  const legs: RouteLeg[] = [];
  let totalDistance = 0;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const start: [number, number] = [waypoints[i].lat, waypoints[i].lng];
    const end: [number, number] = [waypoints[i + 1].lat, waypoints[i + 1].lng];
    const segment = interpolateRoadCorridor(start, end, travelMode);

    if (i > 0) segment.shift();
    allCoordinates.push(...segment);

    let legDist = 0;
    for (let j = 0; j < segment.length - 1; j++) {
      legDist += haversineDistMeters(segment[j][0], segment[j][1], segment[j + 1][0], segment[j + 1][1]);
    }
    totalDistance += legDist;

    const legSecs = Math.round(legDist / speedMs);
    const fromName = waypoints[i].name || (i === 0 ? 'Momo I Am' : `Stop ${i}`);
    const toName = waypoints[i + 1].name || `Stop ${i + 1}`;

    const stepInstructions: RouteStep[] = isCab
      ? [
          {
            distanceMeters: Math.round(legDist * 0.45),
            duration: `${Math.round(legSecs * 0.45)}s`,
            instructions: `Drive along 2nd Cross Road / avenue corridor from ${fromName}`,
            streetName: '2nd Cross Road / 3rd Avenue',
          },
          {
            distanceMeters: Math.round(legDist * 0.55),
            duration: `${Math.round(legSecs * 0.55)}s`,
            instructions: `Follow Kolkata Police Puja vehicular diversion to drop zone near ${toName}`,
            streetName: 'Puja Vehicular Corridor',
          },
        ]
      : [
          {
            distanceMeters: Math.round(legDist * 0.4),
            duration: `${Math.round(legSecs * 0.4)}s`,
            instructions: `Walk along pedestrian pavement from ${fromName}`,
            streetName: 'Pedestrian Footpath',
          },
          {
            distanceMeters: Math.round(legDist * 0.6),
            duration: `${Math.round(legSecs * 0.6)}s`,
            instructions: `Follow illuminated Kolkata Police pedestrian queue into ${toName}`,
            streetName: 'Pedestrian Queue Barricade',
          },
        ];

    legs.push({
      legIndex: i,
      distanceMeters: Math.round(legDist),
      duration: `${legSecs}s`,
      steps: stepInstructions,
    });
  }

  const totalDuration = Math.round(totalDistance / speedMs);

  return {
    duration: `${totalDuration}s`,
    distanceMeters: Math.round(totalDistance),
    encodedPolyline: encodePolyline(allCoordinates),
    coordinates: allCoordinates,
    legs,
    source: isCab ? 'kolkata_road_network' : 'pedestrian_corridor',
  };
}
