'use client';

import { useState } from 'react';
import type { Pandal } from '@/lib/types';
import { getCurrentBusynessFromPattern, getBusynessLabel } from '@/lib/popular-times';
import { Plus, Check, Search, MapPin, Navigation2 } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  pandals: Pandal[];
  routePandals: Pandal[];
  onSelect: (p: Pandal) => void;
  onAddToRoute: (p: Pandal) => void;
  userLat?: number;
  userLng?: number;
  isCompact?: boolean;
}

const ZONE_LABELS: Record<string, string> = {
  north: 'North', central: 'Central', south: 'South', east: 'East',
};

// Momo I Am test device coordinates
const USER_TEST_LAT = 22.5904744;
const USER_TEST_LNG = 88.4082609;

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function PandalList({
  pandals,
  routePandals,
  onSelect,
  onAddToRoute,
  userLat = USER_TEST_LAT,
  userLng = USER_TEST_LNG,
  isCompact = false,
}: Props) {
  const [search, setSearch] = useState('');
  const [zone, setZone] = useState('all');
  const routeIds = new Set(routePandals.map((p) => p.id));

  // Compute distance from Momo I Am for every pandal and sort ascending (Near Me)
  const pandalsWithDistance = pandals.map((p) => ({
    ...p,
    distanceKm: calculateDistanceKm(userLat, userLng, p.lat, p.lng),
  })).sort((a, b) => a.distanceKm - b.distanceKm);

  const filtered = pandalsWithDistance.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      p.theme.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q));
    return matchSearch && (zone === 'all' || p.zone === zone);
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header & filters */}
      <div className={clsx("px-4 flex-shrink-0", isCompact ? "pb-1.5 pt-0" : "pb-2 space-y-2")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-inkDark font-bold">
            <Navigation2 size={13} className="text-lal fill-lal" />
            <span>Pandals Near Momo I Am</span>
          </div>
          <span className="text-[10px] text-inkMute font-medium">Sorted by distance</span>
        </div>

        {!isCompact && (
          <>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkMute" />
              <input
                type="text"
                placeholder="Search nearby pandals, themes…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-cream border border-inkFaint rounded-xl pl-8 pr-3 py-1.5 text-xs text-inkDark placeholder-inkMute outline-none focus:border-lal/50 transition-colors"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {['all', 'east', 'north', 'central', 'south'].map((z) => (
                <button
                  key={z}
                  onClick={() => setZone(z)}
                  className={clsx(
                    'flex-shrink-0 text-[10px] px-2.5 py-0.5 rounded-full border transition-all font-medium',
                    zone === z ? 'bg-lal text-muslin border-lal' : 'border-inkFaint text-inkMid hover:border-lal/40'
                  )}
                >
                  {z === 'all' ? 'All Near Me' : ZONE_LABELS[z]}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* List sorted by proximity */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-4">
        {filtered.length === 0 && <p className="text-inkMute text-xs text-center py-8">No pandals match your search</p>}
        {filtered.map((pandal) => {
          const score = getCurrentBusynessFromPattern(pandal.id);
          const crowd = getBusynessLabel(score);
          const inRoute = routeIds.has(pandal.id);
          const distStr = pandal.distanceKm < 1
            ? `${Math.round(pandal.distanceKm * 1000)} m away`
            : `${pandal.distanceKm.toFixed(1)} km away`;

          return (
            <div
              key={pandal.id}
              className="flex items-center gap-3 bg-muslin border border-inkFaint rounded-2xl px-3 py-2.5 hover:border-lal/40 hover:bg-lalPale transition-all cursor-pointer group"
              onClick={() => onSelect(pandal)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-inkDark text-xs font-semibold truncate">{pandal.name}</p>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: crowd.color }} />
                </div>
                <p className="text-inkMute text-[10px] truncate font-serif">"{pandal.theme2026 || pandal.theme}"</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-lal font-semibold text-[10px]">{distStr}</span>
                  <span className="text-inkFaint text-[10px]">·</span>
                  <MapPin size={9} className="text-inkMute" />
                  <span className="text-inkMute text-[10px]">{ZONE_LABELS[pandal.zone]}</span>
                  <span className="text-inkFaint text-[10px]">· {pandal.entryFee}</span>
                </div>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); onAddToRoute(pandal); }}
                className={clsx(
                  'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center border transition-all',
                  inRoute ? 'bg-green-50 border-green-300 text-green-600' : 'border-inkFaint text-inkMute hover:border-lal hover:text-lal'
                )}
                title={inRoute ? 'In your route' : 'Add to route'}
              >
                {inRoute ? <Check size={12} /> : <Plus size={12} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
