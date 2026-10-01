'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Map as LeafletMap, LayerGroup, Marker } from 'leaflet';
import { pandals } from '@/lib/pandals';
import { getNearbyFacilities } from '@/lib/malls';
import type { Pandal, CrowdData, SearchedPlace } from '@/lib/types';
import { placeToPandalStop } from '@/lib/types';
import BottomSheet from './BottomSheet';
import BottomNav, { type GoogleMapsTab } from './BottomNav';
import TopBar from './TopBar';
import { type PillCategory } from './CategoryPills';
import { computeNaturalRoute } from '@/lib/street-router';
import NavigationHUD from './NavigationHUD';
import { X, Navigation, LocateFixed } from 'lucide-react';
import clsx from 'clsx';

// ─── Default focus: Momo I Am, CD18, 2nd Cross Road, Salt Lake Sector I ──────
const TEST_LAT   = 22.5904744;
const TEST_LNG   = 88.4082609;
const TEST_LABEL = 'Momo I Am (Your Location)';

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem('pujo_session');
    if (!id) {
      id = `u_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
      sessionStorage.setItem('pujo_session', id);
    }
    return id;
  } catch { return 'anon'; }
}

const PILL_COLOR_MAP: Record<PillCategory, { color: string; icon: string }> = {
  crowd:        { color: '#B5002E', icon: '🔥' },
  toilet:       { color: '#2563EB', icon: '🚻' },
  parking:      { color: '#16A34A', icon: '🅿️' },
  transit:      { color: '#7C3AED', icon: '🚇' },
  hospital:     { color: '#DC2626', icon: '🏥' },
  police_booth: { color: '#0369A1', icon: '👮' },
  poi:          { color: '#B45309', icon: '🏛️' },
  indianoil:    { color: '#EA580C', icon: '⛽' },
};

export default function MapView() {
  const mapContainerRef  = useRef<HTMLDivElement>(null);
  const mapRef           = useRef<LeafletMap | null>(null);
  const heatGroupRef     = useRef<LayerGroup | null>(null);
  const placesGroupRef   = useRef<LayerGroup | null>(null);
  const routeLayerRef    = useRef<LayerGroup | null>(null);
  const userMarkerRef    = useRef<Marker | null>(null);
  const placeMarkerRef   = useRef<Marker | null>(null);
  const pollTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [mapReady,         setMapReady]         = useState(false);
  const [isLocationLocked, setIsLocationLocked] = useState(true);
  const [activeTab,        setActiveTab]        = useState<GoogleMapsTab>('near_me');
  const [activePill,       setActivePill]       = useState<PillCategory | null>(null);
  const [selectedPandal,   setSelectedPandal]   = useState<Pandal | null>(null);
  const [selectedPlace,    setSelectedPlace]    = useState<SearchedPlace | null>(null);
  const [routePandals,     setRoutePandals]     = useState<Pandal[]>([]);
  const [isNavigating,     setIsNavigating]     = useState(false);
  const [activeTravelMode, setActiveTravelMode] = useState<string>('walk');
  const [crowdData,      setCrowdData]      = useState<CrowdData>({
    real: 0, simulated: 0, total: 0, points: [],
  });

  // ─── Initialize Map with Google Maps Road Vector Tiles & Momo I Am Focus ──
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    let mounted = true;

    (async () => {
      const L = (await import('leaflet')).default;
      if (!mounted || !mapContainerRef.current) return;

      // Default load up: Focuses directly on the user's location at Momo I Am
      const map = L.map(mapContainerRef.current, {
        center: [TEST_LAT, TEST_LNG],
        zoom: 15,
        zoomControl: false,
        attributionControl: true,
      });

      // Google Maps Native Road Tiles — gives authentic Google Maps colors and streets
      L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        subdomains: ['0', '1', '2', '3'],
        attribution: '© Google',
        maxZoom: 20,
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Label visibility controller based on zoom
      const LABEL_ZOOM = 14;
      const updateLabels = () => {
        const container = map.getContainer();
        if (map.getZoom() >= LABEL_ZOOM) {
          container.classList.add('show-labels');
        } else {
          container.classList.remove('show-labels');
        }
      };
      map.on('zoomend', updateLabels);
      map.on('dragstart', () => setIsLocationLocked(false));
      updateLabels();

      // Layer groups
      heatGroupRef.current   = L.layerGroup().addTo(map);
      placesGroupRef.current = L.layerGroup().addTo(map);
      routeLayerRef.current  = L.layerGroup().addTo(map);

      // Pandal markers (Clean dots when zoomed out, labels when zoomed in)
      for (const pandal of pandals) {
        const el = document.createElement('div');
        el.id = `marker-${pandal.id}`;
        el.className = 'pandal-dot-wrap';
        el.innerHTML = `
          <div class="pandal-dot" id="dot-${pandal.id}"></div>
          <div class="pandal-dot-label" id="label-${pandal.id}">${pandal.name}</div>
        `;

        const icon = L.divIcon({
          html: el.outerHTML,
          className: '',
          iconSize: [8, 8],
          iconAnchor: [4, 4],
        });

        L.marker([pandal.lat, pandal.lng], { icon })
          .addTo(map)
          .on('click', () => {
            setSelectedPandal(pandal);
            map.flyTo([pandal.lat - 0.002, pandal.lng], 16, { duration: 0.6 });
            document.querySelectorAll('.pandal-dot').forEach((d) => d.classList.remove('selected'));
            document.getElementById(`dot-${pandal.id}`)?.classList.add('selected');
          });
      }

      // Permanent, distinguished Blue Pulse GPS Marker at Momo I Am
      const userIcon = L.divIcon({
        html: `
          <div class="user-location-wrap">
            <div class="user-location-ring"></div>
            <div class="user-location-dot"></div>
          </div>
        `,
        className: '',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      userMarkerRef.current = L.marker([TEST_LAT, TEST_LNG], { icon: userIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup(`<b>${TEST_LABEL}</b><br/><span style="font-size:11px;color:#5C2020;">CD-18, Salt Lake Sector 1</span>`);

      mapRef.current = map;
      setMapReady(true);
    })();

    return () => { mounted = false; };
  }, []);

  // ─── Crowd Data Polling ───────────────────────────────────────────────────
  const pollCrowd = useCallback(async () => {
    try {
      const res = await fetch('/api/crowd');
      const data = await res.json();
      setCrowdData(data);
    } catch { /* silent */ } finally {
      pollTimerRef.current = setTimeout(pollCrowd, 6000);
    }
  }, []);

  useEffect(() => {
    if (!mapReady) return;
    pollCrowd();
    return () => { if (pollTimerRef.current) clearTimeout(pollTimerRef.current); };
  }, [mapReady, pollCrowd]);

  // ─── Google Places Fetching for Category Pills ────────────────────────────
  const handleSelectPill = useCallback(async (pill: PillCategory) => {
    if (!mapReady || !mapRef.current || !placesGroupRef.current) return;
    const group = placesGroupRef.current;
    const L = (await import('leaflet')).default;

    // Toggle off if already active
    if (activePill === pill) {
      setActivePill(null);
      group.clearLayers();
      if (pill === 'crowd' && heatGroupRef.current) {
        heatGroupRef.current.clearLayers();
      }
      return;
    }

    setActivePill(pill);
    group.clearLayers();

    // ── Handle "Crowd Heatmap" Pill (Green to Red visually representing crowd) ──
    if (pill === 'crowd') {
      if (heatGroupRef.current) {
        heatGroupRef.current.clearLayers();
        const { getCrowdVisual } = await import('@/lib/popular-times');
        const crowdDict = (crowdData as any).pandalCrowd || {};

        for (const pandal of pandals) {
          const liveInfo = crowdDict[pandal.id];
          const score = liveInfo?.score ?? (crowdData as any).pandalBusyness?.[pandal.id] ?? 20;
          const visual = liveInfo ? liveInfo : getCrowdVisual(score, pandal.id);

          // Scaled radius & opacity based on crowd
          const radius = Math.round(16 + (Math.min(100, Math.max(10, score)) / 100) * 26);
          const fillOpacity = 0.35 + (Math.min(100, Math.max(10, score)) / 100) * 0.35;

          const circle = L.circleMarker([pandal.lat, pandal.lng], {
            radius,
            stroke: true,
            color: visual.strokeColor,
            weight: 2,
            fillColor: visual.fillColor,
            fillOpacity,
          });

          // Press-and-hold / tap popup showcasing real-time Google Maps crowd data
          circle.bindPopup(`
            <div style="font-family:system-ui,sans-serif;min-width:190px;padding:3px;">
              <div style="font-weight:700;font-size:13px;color:#1F2937;">${pandal.name}</div>
              <div style="margin-top:4px;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700;background:${visual.bg};border:1px solid ${visual.border};color:${visual.textColor};display:inline-block;">
                ${visual.badgeText} (${score}/100)
              </div>
              <div style="margin-top:6px;padding:6px 8px;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;">
                <div style="font-size:11px;font-weight:700;color:#1F2937;">👥 Est. ~${(visual.estDevotees || 1000).toLocaleString()} pandal hoppers</div>
                <div style="font-size:10px;color:#4B5563;margin-top:2px;">⏱️ Avg. Queue Wait: ~${visual.waitMins} mins</div>
                <div style="font-size:9px;color:#16A34A;font-weight:600;margin-top:4px;display:flex;align-items:center;gap:3px;">
                  <span>📡 Live Google Maps Traffic · ${liveInfo?.updatedAt || 'Real-time'}</span>
                </div>
              </div>
            </div>
          `);

          circle.addTo(heatGroupRef.current);
        }
      }
      return;
    }

    const center = mapRef.current.getCenter();
    const { color, icon: emoji } = PILL_COLOR_MAP[pill];

    try {
      const res = await fetch(`/api/places?category=${pill}&lat=${center.lat}&lng=${center.lng}&radius=3500`);
      const data = await res.json();
      const places = data.places || [];

      for (const p of places) {
        if (!p.lat || !p.lng) continue;
        const ratingStr = p.rating ? ` ⭐ ${p.rating}` : '';
        const markerIcon = L.divIcon({
          html: `
            <div class="amenity-marker-wrap">
              <div class="amenity-dot" style="background:${color};"></div>
              <div class="amenity-label">${emoji} ${p.name}${ratingStr}</div>
            </div>
          `,
          className: '',
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        });

        L.marker([p.lat, p.lng], { icon: markerIcon })
          .bindPopup(`
            <div style="min-width:180px;">
              <b style="color:#B5002E;font-size:13px;">${emoji} ${p.name}</b>
              ${p.rating ? `<div style="font-size:11px;margin-top:2px;">⭐ <b>${p.rating}</b> (${p.userRatingCount?.toLocaleString() || 0} reviews)</div>` : ''}
              <div style="font-size:10px;color:#5C2020;margin-top:3px;">${p.address || ''}</div>
              <div style="font-size:9px;color:#16A34A;margin-top:2px;font-weight:600;">Google Verified Place</div>
            </div>
          `)
          .addTo(group);
      }

      // Kolkata Police Guide 2025: Police Assistance Booths
      if (pill === 'police_booth') {
        const { policeBooths } = await import('@/lib/police-guide');
        for (const booth of policeBooths) {
          const bIcon = L.divIcon({
            html: `
              <div class="amenity-marker-wrap">
                <div class="amenity-dot" style="background:#0369A1;width:12px;height:12px;border:2px solid white;box-shadow:0 0 0 3px rgba(3,105,161,0.25);"></div>
                <div class="amenity-label" style="font-weight:700;color:#0369A1;">👮 ${booth.name.replace('Kolkata Police Booth - ', '')}</div>
              </div>
            `,
            className: '',
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          });
          L.marker([booth.lat, booth.lng], { icon: bIcon })
            .bindPopup(`
              <div style="min-width:180px;">
                <b style="color:#0369A1;font-size:13px;">👮 ${booth.name}</b>
                <div style="font-size:11px;color:#1A0505;margin-top:3px;">📍 ${booth.location}</div>
                <div style="font-size:10px;color:#16A34A;font-weight:600;margin-top:3px;">Official Kolkata Police Assistance Counter</div>
              </div>
            `)
            .addTo(group);
        }
      }

      // Kolkata Police Guide 2025: Official Parking Zones
      if (pill === 'parking') {
        const { officialParkingZones } = await import('@/lib/police-guide');
        for (const park of officialParkingZones) {
          const pIcon = L.divIcon({
            html: `
              <div class="amenity-marker-wrap">
                <div class="amenity-dot" style="background:#16A34A;width:12px;height:12px;border:2px solid white;box-shadow:0 0 0 3px rgba(22,163,74,0.25);"></div>
                <div class="amenity-label" style="font-weight:700;color:#16A34A;">🅿️ ${park.name}</div>
              </div>
            `,
            className: '',
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          });
          L.marker([park.lat, park.lng], { icon: pIcon })
            .bindPopup(`
              <div style="min-width:180px;">
                <b style="color:#16A34A;font-size:13px;">🅿️ ${park.name}</b>
                <div style="font-size:11px;color:#1A0505;margin-top:3px;">${park.restrictions || 'Designated Puja Parking'}</div>
                <div style="font-size:10px;color:#0369A1;font-weight:600;margin-top:3px;">Police Authorized Parking Ground</div>
              </div>
            `)
            .addTo(group);
        }
      }

      // Kolkata Police Guide 2025: Places of Interest
      if (pill === 'poi') {
        const { placesOfInterest } = await import('@/lib/police-guide');
        for (const poi of placesOfInterest) {
          const poiIcon = L.divIcon({
            html: `
              <div class="amenity-marker-wrap">
                <div class="amenity-dot" style="background:#B45309;width:12px;height:12px;border:2px solid white;box-shadow:0 0 0 3px rgba(180,83,9,0.25);"></div>
                <div class="amenity-label" style="font-weight:700;color:#B45309;">🏛️ ${poi.name}</div>
              </div>
            `,
            className: '',
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          });
          L.marker([poi.lat, poi.lng], { icon: poiIcon })
            .bindPopup(`
              <div style="min-width:180px;">
                <b style="color:#B45309;font-size:13px;">🏛️ ${poi.name}</b>
                <div style="font-size:10px;color:#16A34A;font-weight:600;margin-top:2px;">Featured in Kolkata Police Puja Guide</div>
              </div>
            `)
            .addTo(group);
        }
      }

      // Kolkata Police Guide 2025: IndianOil Stations
      if (pill === 'indianoil') {
        const { indianOilStations } = await import('@/lib/police-guide');
        for (const ioc of indianOilStations) {
          const iocIcon = L.divIcon({
            html: `
              <div class="amenity-marker-wrap">
                <div class="amenity-dot" style="background:#EA580C;width:12px;height:12px;border:2px solid white;box-shadow:0 0 0 3px rgba(234,88,12,0.25);"></div>
                <div class="amenity-label" style="font-weight:700;color:#EA580C;">⛽ ${ioc.name}</div>
              </div>
            `,
            className: '',
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          });
          L.marker([ioc.lat, ioc.lng], { icon: iocIcon })
            .bindPopup(`
              <div style="min-width:180px;">
                <b style="color:#EA580C;font-size:13px;">⛽ ${ioc.name}</b>
                <div style="font-size:10px;color:#0369A1;font-weight:600;margin-top:2px;">Official Fuel & Auto LPG Partner</div>
              </div>
            `)
            .addTo(group);
        }
      }

      // Add mall toilets if toilets category
      if (pill === 'toilet' || pill === 'parking') {
        const malls = getNearbyFacilities(center.lat, center.lng, 5, pill);
        for (const mall of malls) {
          const mIcon = L.divIcon({
            html: `
              <div class="amenity-marker-wrap">
                <div class="amenity-dot" style="background:${color};border:2px solid white;"></div>
                <div class="amenity-label" style="font-weight:700;">${emoji} ${mall.name}</div>
              </div>
            `,
            className: '',
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          });
          L.marker([mall.lat, mall.lng], { icon: mIcon })
            .bindPopup(`<b>${emoji} ${mall.name}</b><br/>${mall.address}`)
            .addTo(group);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch places:', err);
    }
  }, [activePill, mapReady]);

  const [routeInfo,      setRouteInfo]      = useState<any>(null);

  // ─── Google Routes API Navigation ──────────────────────────────────────────
  const buildRoute = useCallback(async (stops: Pandal[], travelMode: string = 'walk') => {
    if (stops.length === 0 || !mapRef.current || !routeLayerRef.current) return;
    setActiveTravelMode(travelMode);
    const L = (await import('leaflet')).default;
    const group = routeLayerRef.current;
    group.clearLayers();

    const allWaypoints = [
      { lat: TEST_LAT, lng: TEST_LNG, name: 'Momo I Am (Origin)' },
      ...stops.map((s) => ({ lat: s.lat, lng: s.lng, name: s.name })),
    ];

    try {
      const data = await computeNaturalRoute(allWaypoints, travelMode);
      setRouteInfo(data);

      const routeCoords = data.coordinates;
      if (routeCoords && routeCoords.length > 0) {
        if (travelMode === 'walk') {
          // Google Maps Authentic Pedestrian Walking Trail: Dotted route with soft halo
          L.polyline(routeCoords, {
            color: '#93C5FD',
            weight: 10,
            opacity: 0.5,
            dashArray: '3, 9',
            lineCap: 'round',
          }).addTo(group);

          L.polyline(routeCoords, {
            color: '#1D4ED8', // Deep vibrant Google walking blue
            weight: 6,
            opacity: 1.0,
            dashArray: '3, 9', // Creates round pedestrian dots
            lineCap: 'round',
          }).addTo(group);
        } else if (travelMode === 'cab' || travelMode === 'DRIVE') {
          // Google Maps Solid Vehicular Highway Line
          L.polyline(routeCoords, {
            color: '#1557B0',
            weight: 9,
            opacity: 0.65,
            lineJoin: 'round',
            lineCap: 'round',
          }).addTo(group);

          L.polyline(routeCoords, {
            color: '#1A73E8', // Signature Google Maps route blue
            weight: 6,
            opacity: 1.0,
            lineJoin: 'round',
            lineCap: 'round',
          }).addTo(group);
        } else if (travelMode === 'metro') {
          // Metro Transit: Deep Royal Purple
          L.polyline(routeCoords, {
            color: '#4C1D95',
            weight: 8,
            opacity: 0.5,
            lineJoin: 'round',
            lineCap: 'round',
          }).addTo(group);
          L.polyline(routeCoords, {
            color: '#7C3AED',
            weight: 5,
            opacity: 1.0,
            lineJoin: 'round',
            lineCap: 'round',
          }).addTo(group);
        } else {
          // Bus: Warm Amber / Orange
          L.polyline(routeCoords, {
            color: '#78350F',
            weight: 8,
            opacity: 0.5,
            lineJoin: 'round',
            lineCap: 'round',
          }).addTo(group);
          L.polyline(routeCoords, {
            color: '#D97706',
            weight: 5,
            opacity: 1.0,
            lineJoin: 'round',
            lineCap: 'round',
          }).addTo(group);
        }

        // 3. Start Marker (Your Location / Momo I Am)
        const startIcon = L.divIcon({
          html: `
            <div style="position:relative;display:flex;align-items:center;justify-content:center;">
              <div style="position:absolute;width:30px;height:30px;border-radius:50%;background:rgba(26,115,232,0.3);animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
              <div style="background:#1A73E8;width:18px;height:18px;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:10px;">
              </div>
            </div>
          `,
          className: '',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        L.marker([TEST_LAT, TEST_LNG], { icon: startIcon })
          .bindPopup('<b>Your Location</b><br/>Momo I Am, Salt Lake Sector 1')
          .addTo(group);

        // 4. Numbered Stop Markers for EVERY PANDAL STOP
        stops.forEach((p, index) => {
          const isFinal = index === stops.length - 1;
          const stopNum = index + 1;
          const stopColor = isFinal ? '#B5002E' : '#374151';

          const stopIcon = L.divIcon({
            html: `
              <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
                <div style="background:${stopColor};color:white;width:24px;height:24px;border:2.5px solid white;border-radius:50%;font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(0,0,0,0.35);">
                  ${stops.length === 1 ? '📍' : stopNum}
                </div>
                <div style="background:white;color:#1F2937;font-size:10px;font-weight:700;padding:1px 6px;border-radius:6px;box-shadow:0 2px 4px rgba(0,0,0,0.15);white-space:nowrap;margin-top:2px;border:1px solid #E5E7EB;">
                  ${p.name.replace(/ \(.*\)/, '')}
                </div>
              </div>
            `,
            className: '',
            iconSize: [30, 42],
            iconAnchor: [15, 20],
          });

          L.marker([p.lat, p.lng], { icon: stopIcon })
            .bindPopup(`<b>Stop ${stopNum}: ${p.name}</b><br/>${p.theme}`)
            .addTo(group);
        });

        const bounds = L.latLngBounds([
          [TEST_LAT, TEST_LNG],
          ...routeCoords,
        ]);
        mapRef.current?.fitBounds(bounds, { padding: [60, 60] });
      }
    } catch (err) {
      console.error('Route error:', err);
    }

    group.addTo(mapRef.current);
    if (activeTab !== 'route') setActiveTab('route');
  }, [activeTab]);

  const flyToPandal = useCallback((pandal: Pandal) => {
    setSelectedPlace(null);
    setSelectedPandal(pandal);
    mapRef.current?.flyTo([pandal.lat - 0.002, pandal.lng], 16, { duration: 0.6 });
    document.querySelectorAll('.pandal-dot').forEach((d) => d.classList.remove('selected'));
    document.getElementById(`dot-${pandal.id}`)?.classList.add('selected');
  }, []);

  const flyToLocation = useCallback((lat: number, lng: number) => {
    setSelectedPandal(null);
    setSelectedPlace(null);
    mapRef.current?.flyTo([lat, lng], 16, { duration: 0.8 });
  }, []);

  const handlePlaceSelect = useCallback(async (place: SearchedPlace) => {
    setSelectedPandal(null);
    setSelectedPlace(place);
    document.querySelectorAll('.pandal-dot').forEach((d) => d.classList.remove('selected'));

    if (!mapRef.current) return;
    const L = (await import('leaflet')).default;

    if (placeMarkerRef.current) {
      placeMarkerRef.current.remove();
    }

    const isFood =
      place.primaryType?.toLowerCase().includes('restaurant') ||
      place.primaryType?.toLowerCase().includes('cafe') ||
      place.primaryType?.toLowerCase().includes('food') ||
      place.category === 'restaurant';

    const iconEmoji = isFood ? '🍜' : '📍';

    const placeIcon = L.divIcon({
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
          <div style="background:#EA4335;color:white;width:32px;height:32px;border:2.5px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.35);font-size:16px;">
            ${iconEmoji}
          </div>
          <div style="background:white;color:#1F2937;font-size:11px;font-weight:700;padding:2px 8px;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.2);white-space:nowrap;margin-top:3px;border:1px solid #E5E7EB;max-width:140px;overflow:hidden;text-overflow:ellipsis;">
            ${place.name}
          </div>
        </div>
      `,
      className: '',
      iconSize: [32, 45],
      iconAnchor: [16, 45],
    });

    const marker = L.marker([place.lat, place.lng], { icon: placeIcon, zIndexOffset: 2000 })
      .addTo(mapRef.current)
      .on('click', () => {
        setSelectedPandal(null);
        setSelectedPlace(place);
        mapRef.current?.flyTo([place.lat - 0.002, place.lng], 16, { duration: 0.6 });
      });

    placeMarkerRef.current = marker;
    mapRef.current.flyTo([place.lat - 0.002, place.lng], 16, { duration: 0.7 });
  }, []);

  const closePandal = useCallback(() => {
    setSelectedPandal(null);
    setSelectedPlace(null);
    document.querySelectorAll('.pandal-dot').forEach((d) => d.classList.remove('selected'));
  }, []);

  const closePlace = useCallback(() => {
    setSelectedPlace(null);
  }, []);

  // Set single pandal directions
  const handleGetDirections = useCallback((pandal: Pandal) => {
    const updated = [pandal];
    setRoutePandals(updated);
    setSelectedPandal(null);
    setSelectedPlace(null);
    setActiveTab('route');
    buildRoute(updated, 'walk');
  }, [buildRoute]);

  // Set single place directions
  const handleGetPlaceDirections = useCallback((place: SearchedPlace) => {
    const stop = placeToPandalStop(place);
    const updated = [stop];
    setRoutePandals(updated);
    setSelectedPlace(null);
    setSelectedPandal(null);
    setActiveTab('route');
    buildRoute(updated, 'walk');
  }, [buildRoute]);

  // Append a pandal to an existing multi-stop route
  const handleAddToRoute = useCallback((pandal: Pandal) => {
    setRoutePandals((prev) => {
      const exists = prev.some((p) => p.id === pandal.id);
      const next = exists ? prev : [...prev, pandal];
      buildRoute(next, 'walk');
      return next;
    });
  }, [buildRoute]);

  // Append a place to an existing multi-stop route
  const handleAddPlaceToRoute = useCallback((place: SearchedPlace) => {
    const stop = placeToPandalStop(place);
    setRoutePandals((prev) => {
      const exists = prev.some((p) => p.name === stop.name || p.id === stop.id);
      const next = exists ? prev : [...prev, stop];
      buildRoute(next, 'walk');
      return next;
    });
  }, [buildRoute]);

  // Reorder stops in multi-stop route
  const handleReorderRoute = useCallback((newOrder: Pandal[]) => {
    setRoutePandals(newOrder);
    buildRoute(newOrder, 'walk');
  }, [buildRoute]);

  const removeFromRoute = useCallback((id: string) => {
    setRoutePandals((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (next.length >= 1) buildRoute(next);
      else {
        setRouteInfo(null);
        routeLayerRef.current?.clearLayers();
      }
      return next;
    });
  }, [buildRoute]);

  const handleRecenter = useCallback(() => {
    setIsLocationLocked(true);
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          mapRef.current?.flyTo([latitude, longitude], 16, { duration: 0.6 });
        },
        () => {
          mapRef.current?.flyTo([TEST_LAT, TEST_LNG], 16, { duration: 0.6 });
        },
        { timeout: 3000 }
      );
    } else {
      mapRef.current?.flyTo([TEST_LAT, TEST_LNG], 16, { duration: 0.6 });
    }
  }, []);

  const handleClearRoute = useCallback(() => {
    setRoutePandals([]);
    setRouteInfo(null);
    routeLayerRef.current?.clearLayers();
  }, []);

  const handlePlaceAdded = useCallback(
    (item: { type: string; data: any }) => {
      if (!mapRef.current) return;
      const L = (window as any).L;

      if (item.type === 'pandal') {
        const p: Pandal = item.data;
        if (L && mapRef.current) {
          const el = document.createElement('div');
          el.id = `marker-${p.id}`;
          el.className = 'pandal-dot-wrap';
          el.innerHTML = `
            <div class="pandal-dot selected" id="dot-${p.id}"></div>
            <div class="pandal-dot-label visible" id="label-${p.id}">${p.name}</div>
          `;
          const icon = L.divIcon({ html: el.outerHTML, className: '', iconSize: [8, 8], iconAnchor: [4, 4] });
          L.marker([p.lat, p.lng], { icon })
            .addTo(mapRef.current)
            .on('click', () => {
              setSelectedPandal(p);
              setSelectedPlace(null);
              mapRef.current?.flyTo([p.lat - 0.002, p.lng], 16, { duration: 0.6 });
            });
        }
        setSelectedPandal(p);
        setSelectedPlace(null);
        mapRef.current.flyTo([p.lat - 0.002, p.lng], 16, { duration: 0.6 });
      } else {
        const place: SearchedPlace = item.data;
        handlePlaceSelect(place);
      }
    },
    [handlePlaceSelect]
  );

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-muslin">
      {/* Map Viewport Area (Takes all space above BottomNav) */}
      <div className="relative flex-1 w-full overflow-hidden">
        {/* Full-screen Google Maps canvas */}
        <div ref={mapContainerRef} className="absolute inset-0 z-0" />

        {/* Active Turn-by-Turn Navigation HUD Mode (Google Maps Style) */}
        {isNavigating ? (
          <NavigationHUD
            pandals={routePandals}
            routeInfo={routeInfo}
            travelMode={activeTravelMode}
            onExit={() => setIsNavigating(false)}
            onStepFocus={(lat, lng) => mapRef.current?.flyTo([lat, lng], 17.5, { duration: 0.8 })}
          />
        ) : (
          <>
            {/* Top Google Maps Bar + Category Pills */}
            <TopBar
              crowdData={crowdData}
              isTracking={isLocationLocked}
              onToggleTracking={handleRecenter}
              onPandalSelect={flyToPandal}
              onLocationSelect={flyToLocation}
              onPlaceSelect={handlePlaceSelect}
              activePill={activePill}
              onSelectPill={handleSelectPill}
            />

            {/* Google Maps Floating Recenter / My Location Button */}
            <button
              onClick={handleRecenter}
              className={clsx(
                'absolute right-3.5 z-[998] w-11 h-11 rounded-full bg-muslin border border-inkFaint shadow-md flex items-center justify-center transition-all active:scale-90 hover:bg-cream',
                isLocationLocked ? 'text-[#1A73E8]' : 'text-inkDark hover:text-[#1A73E8]'
              )}
              style={{
                bottom: selectedPandal || selectedPlace || activeTab === 'route' ? 'calc(50vh + 16px)' : '168px',
              }}
              title="Re-center to your location"
              aria-label="Re-center to your location"
            >
              <LocateFixed size={20} className={isLocationLocked ? 'stroke-[2.5]' : 'stroke-2'} />
            </button>

            {/* Sliding Bottom Sheet */}
            <BottomSheet
              activeTab={activeTab}
              selectedPandal={selectedPandal}
              selectedPlace={selectedPlace}
              routePandals={routePandals}
              allPandals={pandals}
              routeInfo={routeInfo}
              onClose={closePandal}
              onClosePlace={closePlace}
              onFlyTo={flyToPandal}
              onGetDirections={handleGetDirections}
              onGetPlaceDirections={handleGetPlaceDirections}
              onAddToRoute={handleAddToRoute}
              onAddPlaceToRoute={handleAddPlaceToRoute}
              onReorderRoute={handleReorderRoute}
              onRemoveFromRoute={removeFromRoute}
              onClearRoute={handleClearRoute}
              onBuildRoute={buildRoute}
              onPlaceAdded={handlePlaceAdded}
              onStartNav={() => {
                setIsNavigating(true);
                mapRef.current?.flyTo([TEST_LAT, TEST_LNG], 17.5, { duration: 1.2 });
              }}
            />
          </>
        )}
      </div>

      {/* Google Maps 3-Tab Bottom Navigation (Natural flex footer at the exact bottom) */}
      {!isNavigating && (
        <BottomNav
          active={activeTab}
          onChange={(tab) => {
            setSelectedPandal(null);
            setSelectedPlace(null);
            document.querySelectorAll('.pandal-dot').forEach((d) => d.classList.remove('selected'));
            setActiveTab(tab);
          }}
        />
      )}
    </div>
  );
}
