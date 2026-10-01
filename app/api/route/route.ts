import { NextRequest, NextResponse } from 'next/server';
import { encodePolyline } from '@/lib/polyline';
import { interpolateRoadCorridor } from '@/lib/street-router';

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyAbhrgPRQVLCpYojXWwrWk7_oRpSZFOjxM';

// Haversine distance calculation in meters
function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export async function POST(req: NextRequest) {
  try {
    const { origin, destination, intermediates = [], travelMode = 'WALK' } = await req.json();

    const isCab = travelMode === 'cab' || travelMode === 'DRIVE';
    const isTransit = travelMode === 'metro' || travelMode === 'bus';

    // ── 1. Try Google Routes API (New directions/v2:computeRoutes) ──────────────
    try {
      const gMode = isCab ? 'DRIVE' : 'WALK';
      const body: any = {
        origin: {
          location: {
            latLng: {
              latitude: origin.lat,
              longitude: origin.lng,
            },
          },
        },
        destination: {
          location: {
            latLng: {
              latitude: destination.lat,
              longitude: destination.lng,
            },
          },
        },
        travelMode: gMode,
        routingPreference: isCab ? 'TRAFFIC_AWARE' : undefined,
      };

      if (intermediates.length > 0) {
        body.intermediates = intermediates.map((pt: { lat: number; lng: number }) => ({
          location: {
            latLng: {
              latitude: pt.lat,
              longitude: pt.lng,
            },
          },
        }));
      }

      const res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const data = await res.json();
        const route = data.routes?.[0];
        if (route?.polyline?.encodedPolyline) {
          const legs = (route.legs || []).map((leg: any, idx: number) => ({
            legIndex: idx,
            distanceMeters: leg.distanceMeters,
            duration: leg.duration || leg.staticDuration,
            steps: (leg.steps || []).map((s: any) => ({
              distanceMeters: s.distanceMeters,
              duration: s.staticDuration,
              instructions: s.navigationInstruction?.instructions || 'Proceed along designated route',
              maneuver: s.navigationInstruction?.maneuver,
            })),
          }));

          return NextResponse.json({
            duration: route.duration,
            distanceMeters: route.distanceMeters,
            encodedPolyline: route.polyline.encodedPolyline,
            legs,
            source: 'google',
          });
        }
      }
    } catch {
      // Fall through to OSRM
    }

    // ── 2. High-Accuracy OSRM Street Router Fallback ───────────────────────────
    try {
      const allWaypoints = [
        origin,
        ...intermediates,
        destination,
      ];
      const coordsString = allWaypoints.map((p) => `${p.lng},${p.lat}`).join(';');
      const osrmMode = isCab ? 'driving' : 'walking';
      const osrmUrl = `https://router.project-osrm.org/route/v1/${osrmMode}/${coordsString}?overview=full&geometries=geojson&steps=true`;

      const osrmRes = await fetch(osrmUrl, { signal: AbortSignal.timeout(5000) });
      if (osrmRes.ok) {
        const osrmData = await osrmRes.json();
        if (osrmData.code === 'Ok' && osrmData.routes?.length > 0) {
          const route = osrmData.routes[0];
          // OSRM coordinates are [lng, lat], convert to [lat, lng] for encodePolyline
          const latLngs: [number, number][] = route.geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]] as [number, number]
          );

          const speedMs = isCab ? 5.5 : isTransit ? 4.5 : 1.17;
          const totalDurationSecs = isCab ? Math.round(route.duration) : Math.round(route.distance / speedMs);

          const legs = (route.legs || []).map((leg: any, idx: number) => {
            const legDurationSecs = isCab ? Math.round(leg.duration) : Math.round(leg.distance / speedMs);
            return {
              legIndex: idx,
              distanceMeters: Math.round(leg.distance),
              duration: `${legDurationSecs}s`,
              steps: (leg.steps || []).map((s: any) => ({
                distanceMeters: Math.round(s.distance),
                duration: `${isCab ? Math.round(s.duration) : Math.max(10, Math.round(s.distance / speedMs))}s`,
                instructions: s.maneuver?.type === 'depart'
                  ? `Head along ${s.name || 'street'}`
                  : s.maneuver?.type === 'arrive'
                  ? `Arrive at destination stop`
                  : `${s.maneuver?.modifier || 'turn'} onto ${s.name || 'street'}`,
                maneuver: s.maneuver?.type,
              })),
            };
          });

          return NextResponse.json({
            duration: `${totalDurationSecs}s`,
            distanceMeters: Math.round(route.distance),
            encodedPolyline: encodePolyline(latLngs),
            legs,
            source: 'osrm',
          });
        }
      }
    } catch {
      // Fall through to Grid Router
    }

    // ── 3. Grid-Following Kolkata Road Router (Never Straight Lines) ───────────
    const allStops: [number, number][] = [
      [origin.lat, origin.lng],
      ...intermediates.map((p: any) => [p.lat, p.lng] as [number, number]),
      [destination.lat, destination.lng],
    ];

    const speedMs = isCab ? 5.5 : isTransit ? 4.5 : 1.17;
    let totalMeters = 0;
    const pathCoordinates: [number, number][] = [];
    const legs: any[] = [];

    for (let i = 0; i < allStops.length - 1; i++) {
      const legDist = haversineMeters(allStops[i][0], allStops[i][1], allStops[i + 1][0], allStops[i + 1][1]);
      totalMeters += legDist * 1.25;
      const legPts = interpolateRoadCorridor(allStops[i], allStops[i + 1]);
      if (i > 0) legPts.shift();
      pathCoordinates.push(...legPts);

      const legSecs = Math.round((legDist * 1.25) / speedMs);
      legs.push({
        legIndex: i,
        distanceMeters: Math.round(legDist * 1.25),
        duration: `${legSecs}s`,
        steps: [
          {
            distanceMeters: Math.round(legDist * 1.25),
            duration: `${legSecs}s`,
            instructions: `Follow Kolkata street corridor to stop ${i + 1}`,
          },
        ],
      });
    }

    const durationSeconds = Math.round(totalMeters / speedMs);

    return NextResponse.json({
      duration: `${durationSeconds}s`,
      distanceMeters: Math.round(totalMeters),
      encodedPolyline: encodePolyline(pathCoordinates),
      legs,
      source: 'road_grid',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
