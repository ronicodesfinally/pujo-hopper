'use client';

import type { Pandal } from '@/lib/types';
import { placeToPandalStop } from '@/lib/types';
import { searchAllPlaces } from '@/lib/places-data';
import {
  Trash2,
  Navigation,
  X,
  Plus,
  Search,
  MapPin,
  ArrowRight,
  Sparkles,
  Footprints,
  Train,
  Bus,
  Car,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Utensils,
  Bath,
  Star,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getTransitAvailability } from '@/lib/street-router';
import clsx from 'clsx';

interface Props {
  pandals: Pandal[];
  allPandals: Pandal[];
  routeInfo?: any;
  onRemove: (id: string) => void;
  onAdd: (p: Pandal) => void;
  onReorder?: (pandals: Pandal[]) => void;
  onClear: () => void;
  onBuild: (mode?: string) => void;
  onStartNav?: () => void;
}

const TRANSPORT_MODES = [
  { id: 'walk',  label: 'Walk',  icon: Footprints, est: 'Walking' },
  { id: 'metro', label: 'Metro', icon: Train,      est: 'Green/Blue Line' },
  { id: 'bus',   label: 'Bus',   icon: Bus,        est: 'Local / Auto' },
  { id: 'cab',   label: 'Cab',   icon: Car,        est: 'Traffic Aware' },
];

function formatDuration(durStr: string | number): string {
  if (typeof durStr === 'number') {
    const mins = Math.round(durStr / 60);
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h} hr ${m} min`;
    }
    return `${mins} min`;
  }
  const clean = durStr.replace('s', '');
  const sec = parseInt(clean, 10);
  if (isNaN(sec)) return durStr;
  const mins = Math.round(sec / 60);
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h} hr ${m} min`;
  }
  return `${mins} min`;
}

function getTransitOptions(pandal: Pandal, mode: string) {
  const isSaltLake = pandal.zone === 'east' || pandal.id.startsWith('salt-lake') || pandal.id === 'sreebhumi';
  const isNorth = pandal.zone === 'north';
  const isCentral = pandal.zone === 'central';

  if (mode === 'metro') {
    if (isSaltLake) {
      return {
        title: 'Green Line Metro (Line 2)',
        time: '~10–14 mins',
        steps: [
          'Walk 450m from Momo I Am along 2nd Cross Rd to City Centre Metro Station',
          'Board Green Line train towards Karunamoyee / Central Park',
          'De-board at Karunamoyee or Central Park Station',
          `Short walk to ${pandal.name} park grounds`,
        ],
        fare: '₹10',
      };
    } else if (isCentral) {
      return {
        title: 'Green Line → Blue Line Interchange',
        time: '~25–30 mins',
        steps: [
          'Board at City Centre Metro Station (Green Line)',
          'Ride to Esplanade Metro Station (East-West corridor)',
          'Interchange to Line 1 (Northbound)',
          `De-board at Central or MG Road Station → Walk to ${pandal.name}`,
        ],
        fare: '₹20',
      };
    } else if (isNorth) {
      return {
        title: 'Metro Green Line → Blue Line (North)',
        time: '~30–35 mins',
        steps: [
          'Board Green Line at City Centre Metro → Esplanade Interchange',
          'Switch to Northbound Line 1 towards Dakshineswar',
          `De-board at Sovabazar Sutanuti or Shyambazar Station → Walk to ${pandal.name}`,
        ],
        fare: '₹25',
      };
    } else {
      return {
        title: 'Metro Green Line → Blue Line (South)',
        time: '~35–40 mins',
        steps: [
          'Board Green Line at City Centre Metro → Esplanade Interchange',
          'Switch to Southbound Line 1 towards Kavi Subhash',
          `De-board at Kalighat or Jatin Das Park Station → Walk to ${pandal.name}`,
        ],
        fare: '₹25',
      };
    }
  } else if (mode === 'bus') {
    if (isSaltLake) {
      return {
        title: 'Local Bus 206 / Auto Rickshaw',
        time: '~10–12 mins',
        steps: [
          'Board Bus Route 206 or Shared Toto from Sector 1 island',
          `Direct drop-off at ${pandal.name} / 206 Bus Terminus`,
          'Zero interchange required',
        ],
        fare: '₹10–15',
      };
    } else {
      return {
        title: 'Kolkata State Transport / AC Bus',
        time: '~35–45 mins',
        steps: [
          'Board Bus S-9 or AC-12 from Salt Lake Gate / EM Bypass',
          'Travel via Ultadanga / Park Circus connector',
          `Get off at designated Kolkata Police Puja Bus Stop near ${pandal.name}`,
        ],
        fare: '₹20–35',
      };
    }
  } else if (mode === 'cab') {
    return {
      title: 'Cab / Ride (Uber, Ola, Yellow Taxi)',
      time: '~12–25 mins (Traffic Aware)',
      steps: [
        'Pickup point at Momo I Am / CD-18, 2nd Cross Road',
        'Route via 2nd Cross Rd & 3rd Avenue',
        `Drop-off at Kolkata Police designated parking/drop zone (200m before pandal gate)`,
      ],
      fare: '₹120–250 (Puja rush fare)',
    };
  } else {
    return {
      title: 'Pedestrian Walking Route',
      time: '~15–25 mins',
      steps: [
        'Head along 2nd Cross Road pedestrian pavement from Momo I Am',
        'Follow Kolkata Police illuminated pedestrian barricade corridor',
        `Arrive at main entry queue of ${pandal.name}`,
      ],
      fare: 'Free',
    };
  }
}

export default function RoutePanel({
  pandals,
  allPandals,
  routeInfo,
  onRemove,
  onAdd,
  onReorder,
  onClear,
  onBuild,
}: Props) {
  const [mode, setMode] = useState('walk');
  const [showAdd, setShowAdd] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [showSteps, setShowSteps] = useState(false);

  // Evaluate transit feasibility (e.g. mute Metro/Bus if < 1.2 km or no direct lines)
  const transitAvailability = getTransitAvailability(
    pandals.map((p) => ({ lat: p.lat, lng: p.lng })),
    { lat: 22.5904744, lng: 88.4082609 }
  );

  // Auto-switch away from muted mode to 'walk'
  useEffect(() => {
    if (mode === 'metro' && !transitAvailability.metro.available) {
      setMode('walk');
      onBuild('walk');
    } else if (mode === 'bus' && !transitAvailability.bus.available) {
      setMode('walk');
      onBuild('walk');
    }
  }, [transitAvailability.metro.available, transitAvailability.bus.available, mode, onBuild]);

  const SUGGESTED_ROUTES = [
    {
      title: 'Salt Lake & East Circuit',
      desc: 'FD Block (FD Park) → BJ Block (BJ Park) → Sreebhumi',
      stops: ['salt-lake-fd', 'salt-lake-bj', 'sreebhumi'],
    },
    {
      title: 'North Kolkata Heritage Loop',
      desc: 'Bagbazar → Kumartuli Park → Ahiritola → Kashi Bose Lane',
      stops: ['bagbazar', 'kumartuli-park', 'ahiritola', 'kashi-bose-lane'],
    },
    {
      title: 'Central Mega Architectural Circuit',
      desc: 'Santosh Mitra Square → College Square → Mohammad Ali Park',
      stops: ['santosh-mitra-square', 'college-square', 'mohammad-ali-park'],
    },
    {
      title: 'South Kolkata Southern Avenue Trail',
      desc: 'Mudiali Club → Shib Mandir → Tridhara Sammilani → Ballygunge Cultural',
      stops: ['mudiali-club', 'shib-mandir', 'tridhara', 'ballygunge-cultural'],
    },
  ];

  const handleApplySuggested = (stopIds: string[]) => {
    onClear();
    const matches: Pandal[] = [];
    for (const id of stopIds) {
      const match = allPandals.find((p) => p.id === id);
      if (match) matches.push(match);
    }
    if (matches.length > 0) {
      for (const m of matches) {
        onAdd(m);
      }
    }
  };

  const handleModeChange = (newMode: string) => {
    setMode(newMode);
    onBuild(newMode);
  };

  const moveStop = (index: number, direction: 'up' | 'down') => {
    if (!onReorder) return;
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= pandals.length) return;
    const copy = [...pandals];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;
    onReorder(copy);
  };

  const addablePandals = allPandals.filter(
    (p) =>
      !pandals.find((r) => r.id === p.id) &&
      (addSearch === '' ||
        p.name.toLowerCase().includes(addSearch.toLowerCase()) ||
        p.theme.toLowerCase().includes(addSearch.toLowerCase()))
  );

  const matchedPlaces = addSearch.trim().length > 0
    ? searchAllPlaces(addSearch, 8).filter(
        (sp) => !pandals.find((r) => r.name.toLowerCase() === sp.name.toLowerCase() || r.id.includes(sp.id))
      )
    : [];

  const activePandal = pandals[0];
  const transitInfo = activePandal ? getTransitOptions(activePandal, mode) : null;

  return (
    <div className="px-4 pt-2 pb-6 space-y-3">
      {/* Route Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-inkDark font-bold text-sm">
            {pandals.length === 1 ? `Directions to ${pandals[0].name}` : 'Route Planning & Navigation'}
          </h3>
          <p className="text-inkMute text-[11px]">
            {pandals.length === 1
              ? 'Street-following natural directions from Momo I Am.'
              : 'Continuous circuit from Momo I Am connecting all your stops.'}
          </p>
        </div>
        {pandals.length > 0 && (
          <button
            onClick={onClear}
            className="text-lal text-[11px] flex items-center gap-1 hover:bg-red-100 font-bold px-2 py-1 rounded-xl bg-red-50 border border-red-200 transition-colors"
          >
            <Trash2 size={11} /> {pandals.length === 1 ? 'Clear' : 'Clear All'}
          </button>
        )}
      </div>

      {/* Google Maps ETA & Route Summary Banner */}
      {pandals.length > 0 && (
        <div className="bg-muslin border border-blue-200 rounded-2xl p-3.5 shadow-sm space-y-2.5 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full">
                  {pandals.length === 1 ? 'Trip Duration (Direct)' : `Total Circuit Time (${pandals.length} stops combined)`}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-inkDark">
                  {routeInfo?.duration
                    ? formatDuration(routeInfo.duration)
                    : mode === 'cab'
                    ? '~12 min'
                    : mode === 'metro'
                    ? '~14 min'
                    : `~${Math.round(pandals.length * 16)} min`}
                </span>
                <span className="text-xs font-semibold text-inkMute">
                  ({routeInfo?.distanceMeters
                    ? `${(routeInfo.distanceMeters / 1000).toFixed(1)} km`
                    : `${(pandals.length * 1.2).toFixed(1)} km`} total)
                </span>
              </div>
              <p className="text-[11px] text-green-700 font-bold flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
                {pandals.length === 1
                  ? 'Fastest street route from Momo I Am'
                  : `Total time covers all ${pandals.length} stops from Momo I Am`}
              </p>
            </div>

            <button
              onClick={() => {
                if (onStartNav) {
                  onStartNav();
                } else {
                  onBuild(mode);
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Navigation size={13} className="fill-white" />
              Start
            </button>
          </div>

          {/* Turn-by-turn maneuvers accordion */}
          {routeInfo?.legs && routeInfo.legs.length > 0 && (
            <div className="border-t border-inkFaint pt-2">
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="w-full flex items-center justify-between text-xs font-bold text-blue-700 hover:text-blue-800"
              >
                <span>{showSteps ? 'Hide turn-by-turn directions' : 'View turn-by-turn directions'}</span>
                <ChevronDown size={14} className={clsx('transition-transform', showSteps && 'rotate-180')} />
              </button>

              {showSteps && (
                <div className="mt-2 space-y-2.5 pl-2 border-l-2 border-blue-400">
                  {routeInfo.legs.map((leg: any, lIdx: number) => (
                    <div key={lIdx} className="space-y-1">
                      <div className="text-[11px] font-bold text-inkDark flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">
                          {lIdx + 1}
                        </span>
                        <span>
                          {lIdx === 0 ? 'Momo I Am' : pandals[lIdx - 1]?.name.replace(/ \(.*\)/, '')} ➔{' '}
                          {pandals[lIdx]?.name.replace(/ \(.*\)/, '')}
                        </span>
                        <span className="text-[10px] text-inkMute font-normal">
                          ({(leg.distanceMeters / 1000).toFixed(1)} km)
                        </span>
                      </div>
                      <div className="pl-4 space-y-1">
                        {leg.steps?.slice(0, 4).map((s: any, sIdx: number) => (
                          <div key={sIdx} className="text-[10px] text-inkMid flex items-start gap-1.5">
                            <span className="text-blue-500 font-bold">↳</span>
                            <span>{s.instructions.split('\n')[0]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Transport mode selector */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-inkMute text-[10px] uppercase tracking-wider font-semibold">Travel Mode</p>
          {(!transitAvailability.metro.available || !transitAvailability.bus.available) && pandals.length > 0 && (
            <span className="text-[9px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1">
              <span>⚠️</span>
              {!transitAvailability.metro.available && !transitAvailability.bus.available
                ? 'Transit muted (< 1.2 km)'
                : !transitAvailability.metro.available
                ? 'Metro muted (no direct line)'
                : 'Bus muted'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {TRANSPORT_MODES.map((m) => {
            const Icon = m.icon;
            const isMuted =
              (m.id === 'metro' && !transitAvailability.metro.available) ||
              (m.id === 'bus' && !transitAvailability.bus.available);

            const subtitle =
              m.id === 'metro' && !transitAvailability.metro.available
                ? 'Not available'
                : m.id === 'bus' && !transitAvailability.bus.available
                ? 'Not available'
                : m.est;

            return (
              <button
                key={m.id}
                disabled={isMuted}
                onClick={() => !isMuted && handleModeChange(m.id)}
                title={
                  isMuted
                    ? m.id === 'metro'
                      ? transitAvailability.metro.reason
                      : transitAvailability.bus.reason
                    : undefined
                }
                className={clsx(
                  'rounded-xl p-2 text-center border transition-all flex flex-col items-center justify-center gap-0.5 relative',
                  isMuted
                    ? 'bg-stone-100/90 border-stone-200 text-stone-400 cursor-not-allowed opacity-50 select-none'
                    : mode === m.id
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold ring-1 ring-blue-600 shadow-sm'
                    : 'bg-cream border-inkFaint text-inkMid hover:border-lal/40 active:scale-95'
                )}
              >
                <Icon
                  size={14}
                  className={
                    isMuted
                      ? 'text-stone-300'
                      : mode === m.id
                      ? 'text-blue-600'
                      : 'text-inkMute'
                  }
                />
                <div className="text-[11px] font-bold">{m.label}</div>
                <div
                  className={clsx(
                    'text-[8px] leading-tight text-center px-0.5 truncate max-w-full',
                    isMuted ? 'text-stone-500 font-semibold italic' : 'opacity-70'
                  )}
                >
                  {subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Informative notice when transit is muted */}
        {pandals.length > 0 && (!transitAvailability.metro.available || !transitAvailability.bus.available) && (
          <div className="mt-1.5 text-[10px] text-stone-600 bg-stone-100/80 border border-stone-200 rounded-xl px-2.5 py-1 flex items-center gap-1.5">
            <span className="font-semibold text-stone-700">Notice:</span>
            <span className="leading-snug">
              {!transitAvailability.metro.available && !transitAvailability.bus.available
                ? 'Metro and bus options are muted because this destination is within short walking distance (< 1.2 km).'
                : !transitAvailability.metro.available
                ? transitAvailability.metro.reason
                : transitAvailability.bus.reason}
            </span>
          </div>
        )}
      </div>

      {/* Transit Guidance Card */}
      {transitInfo && (
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-900">{transitInfo.title}</span>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                {transitInfo.fare}
              </span>
            </div>
            <span className="text-xs font-bold text-blue-700">{transitInfo.time}</span>
          </div>

          <div className="space-y-1.5 pt-0.5">
            {transitInfo.steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[11px] text-blue-950">
                <span className="w-4 h-4 rounded-full bg-blue-200 text-blue-800 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-snug">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Stops Itinerary */}
      <div>
        <p className="text-inkMute text-[10px] uppercase tracking-wider font-semibold mb-2">
          {pandals.length === 1 ? 'Destination Stop' : `Continuous Route Circuit (${pandals.length} stops)`}
        </p>

        {pandals.length === 0 ? (
          <div className="bg-cream border border-dashed border-inkFaint rounded-2xl p-6 text-center">
            <MapPin size={24} className="text-inkFaint mx-auto mb-2" />
            <p className="text-inkDark text-xs font-semibold">No stops added to your route yet</p>
            <p className="text-inkMute text-[11px] mt-1">
              Select "Directions" on any pandal or pick a suggested circuit below.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {/* Origin (Device Location) */}
            <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                ●
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-blue-950 text-xs font-bold truncate">Momo I Am, Salt Lake Sector 1</p>
                <p className="text-blue-700 text-[9px] uppercase font-semibold">Your Location (Origin)</p>
              </div>
            </div>

            {/* Connection from Origin (Momo I Am) to Stop 1 */}
            {pandals.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 text-[10px] font-semibold text-blue-700">
                <span className="text-blue-500 font-bold">↳</span>
                <span className="bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                  <span>Leg 1: {routeInfo?.legs?.[0]?.duration ? formatDuration(routeInfo.legs[0].duration) : '~8 min'}</span>
                  {routeInfo?.legs?.[0]?.distanceMeters && (
                    <span className="text-blue-600 font-normal">
                      ({routeInfo.legs[0].distanceMeters < 1000 ? `${routeInfo.legs[0].distanceMeters} m` : `${(routeInfo.legs[0].distanceMeters / 1000).toFixed(1)} km`})
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* Sequential Pandal Stops */}
            {pandals.map((pandal, i) => (
              <div key={pandal.id}>
                <div className="flex items-center gap-2.5 bg-cream border border-inkFaint rounded-xl px-3 py-2">
                  <div
                    className={clsx(
                      'flex-shrink-0 w-6 h-6 rounded-full text-muslin text-[11px] font-bold flex items-center justify-center',
                      i === pandals.length - 1 ? 'bg-lal' : 'bg-gray-700'
                    )}
                  >
                    {pandals.length === 1 ? '📍' : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-inkDark text-xs font-semibold truncate">{pandal.name}</p>
                    <p className="text-inkMute text-[10px] truncate">{pandal.zone.toUpperCase()} KOLKATA</p>
                  </div>

                  {/* Reordering and remove controls */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {pandals.length > 1 && (
                      <>
                        <button
                          onClick={() => moveStop(i, 'up')}
                          disabled={i === 0}
                          className="p-1 text-inkMute hover:text-inkDark disabled:opacity-30 disabled:hover:text-inkMute"
                          title="Move stop up"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          onClick={() => moveStop(i, 'down')}
                          disabled={i === pandals.length - 1}
                          className="p-1 text-inkMute hover:text-inkDark disabled:opacity-30 disabled:hover:text-inkMute"
                          title="Move stop down"
                        >
                          <ArrowDown size={12} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onRemove(pandal.id)}
                      className="text-inkFaint hover:text-lal transition p-1 ml-0.5"
                      title="Remove stop"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {i < pandals.length - 1 && (
                  <div className="flex items-center gap-2 px-3 py-1 text-[10px] font-semibold text-blue-700">
                    <span className="text-blue-500 font-bold">↳</span>
                    <span className="bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                      <span>Leg {i + 2}: {routeInfo?.legs?.[i + 1]?.duration ? formatDuration(routeInfo.legs[i + 1].duration) : '~10 min'}</span>
                      {routeInfo?.legs?.[i + 1]?.distanceMeters && (
                        <span className="text-blue-600 font-normal">
                          ({routeInfo.legs[i + 1].distanceMeters < 1000 ? `${routeInfo.legs[i + 1].distanceMeters} m` : `${(routeInfo.legs[i + 1].distanceMeters / 1000).toFixed(1)} km`})
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={() => setShowAdd(!showAdd)}
              className="w-full border border-dashed border-inkFaint rounded-xl py-2 text-inkMute text-xs flex items-center justify-center gap-1.5 hover:border-lal hover:text-lal transition mt-1 bg-muslin font-medium"
            >
              <Plus size={13} /> Add Another Stop to Circuit
            </button>
          </div>
        )}
      </div>

      {/* Suggested Circuits */}
      {pandals.length === 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-inkDark font-bold">
            <Sparkles size={13} className="text-lal" />
            <span>Recommended Circuits (Kolkata Police Guide)</span>
          </div>
          <div className="space-y-2">
            {SUGGESTED_ROUTES.map((circ, idx) => (
              <div
                key={idx}
                className="bg-cream border border-inkFaint rounded-2xl p-3 hover:border-lal/40 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold text-inkDark">{circ.title}</p>
                    <p className="text-[10px] text-inkMute mt-0.5">{circ.desc}</p>
                  </div>
                  <button
                    onClick={() => handleApplySuggested(circ.stops)}
                    className="flex-shrink-0 px-2.5 py-1 rounded-xl bg-lal text-muslin text-[10px] font-bold hover:bg-lalDark transition-colors"
                  >
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Stop (Pandals, Restaurants, Places) Search Dropdown */}
      {showAdd && (
        <div className="bg-cream border border-inkFaint rounded-2xl p-3 space-y-2.5 animate-fade-in shadow-md">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-inkMute" />
            <input
              type="text"
              placeholder="Search pandals, restaurants, or places to add to circuit…"
              value={addSearch}
              onChange={(e) => setAddSearch(e.target.value)}
              className="w-full bg-muslin border border-inkFaint rounded-xl pl-8 pr-3 py-2 text-xs text-inkDark placeholder-inkMute outline-none focus:border-lal shadow-inner font-medium"
              autoFocus
            />
          </div>

          <div className="max-h-56 overflow-y-auto space-y-2">
            {/* 1. Restaurants & Verified Places */}
            {matchedPlaces.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-inkMute tracking-wider px-1">
                  Restaurants & Places ({matchedPlaces.length})
                </p>
                {matchedPlaces.map((sp) => {
                  const isRest = sp.category === 'restaurant';
                  const isToilet = sp.category === 'toilet';
                  return (
                    <button
                      key={sp.id}
                      onClick={() => {
                        onAdd(placeToPandalStop(sp));
                        setShowAdd(false);
                        setAddSearch('');
                      }}
                      className="w-full flex items-center gap-2.5 text-left px-2.5 py-2 rounded-xl hover:bg-amber-50/80 border border-inkFaint/50 hover:border-amber-300 bg-muslin transition group"
                    >
                      <div
                        className={clsx(
                          'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs shadow-xs',
                          isRest
                            ? 'bg-amber-100 text-amber-800'
                            : isToilet
                            ? 'bg-cyan-100 text-cyan-800'
                            : 'bg-blue-100 text-blue-800'
                        )}
                      >
                        {isRest ? <Utensils size={13} /> : isToilet ? <Bath size={13} /> : <MapPin size={13} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-inkDark text-xs font-semibold truncate group-hover:text-amber-900">
                            {sp.name}
                          </p>
                          {sp.rating && (
                            <span className="flex items-center text-[10px] text-amber-700 font-bold gap-0.5 flex-shrink-0">
                              <Star size={9} className="fill-amber-400 text-amber-400" />
                              {sp.rating}
                            </span>
                          )}
                        </div>
                        <p className="text-inkMute text-[10px] truncate">{sp.address}</p>
                      </div>
                      <div className="w-6 h-6 rounded-lg bg-lalPale text-lal flex items-center justify-center group-hover:bg-lal group-hover:text-muslin transition flex-shrink-0">
                        <Plus size={13} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 2. Durga Puja Pandals */}
            {addablePandals.length > 0 && (
              <div className="space-y-1">
                {matchedPlaces.length > 0 && (
                  <p className="text-[10px] uppercase font-bold text-inkMute tracking-wider px-1 pt-1">
                    Durga Puja Pandals ({addablePandals.length})
                  </p>
                )}
                {addablePandals.slice(0, 10).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onAdd(p);
                      setShowAdd(false);
                      setAddSearch('');
                    }}
                    className="w-full flex items-center gap-2.5 text-left px-2.5 py-2 rounded-xl hover:bg-lalPale border border-inkFaint/50 hover:border-lal/40 bg-muslin transition group"
                  >
                    <div className="w-7 h-7 rounded-full bg-lalPale text-lal flex items-center justify-center flex-shrink-0 shadow-xs">
                      <MapPin size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-inkDark text-xs font-semibold truncate group-hover:text-lal">{p.name}</p>
                      <p className="text-inkMute text-[10px] truncate">{p.theme}</p>
                    </div>
                    <div className="w-6 h-6 rounded-lg bg-lalPale text-lal flex items-center justify-center group-hover:bg-lal group-hover:text-muslin transition flex-shrink-0">
                      <Plus size={13} />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {matchedPlaces.length === 0 && addablePandals.length === 0 && (
              <div className="text-center py-4 text-xs text-inkMute">
                No matching pandals, restaurants, or places found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Kolkata Police Transit Guidelines */}
      <div className="bg-cream border border-inkFaint rounded-2xl p-3 space-y-1.5">
        <p className="par-left text-inkMid text-[10px] font-semibold uppercase tracking-wider mb-1">
          Kolkata Police Transit Guidelines
        </p>
        {[
          'One-way pedestrian flow enforced around Southern Avenue, Gariahat, and College Square.',
          'Metro trains run all-night on Ashtami & Navami from Dakshineswar to Kavi Subhash and Green Line.',
          'Vehicles without official puja parking passes restricted within 500m of mega pandals.',
          'Check the "Parking" pill above for authorized parking lots.',
        ].map((tip, i) => (
          <p key={i} className="text-inkMute text-[10px] flex gap-1.5">
            <span className="text-lal">·</span> {tip}
          </p>
        ))}
      </div>
    </div>
  );
}
