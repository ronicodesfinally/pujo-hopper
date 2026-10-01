'use client';

import type { CrowdData, Pandal, SearchedPlace } from '@/lib/types';
import SearchBar from './SearchBar';
import CategoryPills, { type PillCategory } from './CategoryPills';

interface Props {
  crowdData: CrowdData & { simulated?: number };
  isTracking: boolean;
  onToggleTracking: () => void;
  onPandalSelect: (p: Pandal) => void;
  onLocationSelect: (lat: number, lng: number, label: string) => void;
  onPlaceSelect?: (place: SearchedPlace) => void;
  activePill: PillCategory | null;
  onSelectPill: (pill: PillCategory) => void;
}

export default function TopBar({
  onPandalSelect,
  onLocationSelect,
  onPlaceSelect,
  activePill,
  onSelectPill,
}: Props) {
  return (
    <div className="absolute top-0 left-0 right-0 z-[1000] pointer-events-none flex flex-col gap-2 pt-2">
      {/* Top Bar with PujoHopper Brand + Search Bar */}
      <div className="px-3 pointer-events-auto flex items-center gap-2 max-w-lg mx-auto w-full">
        {/* PujoHopper Brand Badge */}
        <div className="flex-shrink-0 flex items-center gap-1.5 bg-muslin border border-inkFaint rounded-full px-2.5 py-1.5 shadow-card">
          <img
            src="/icons/dhaak.png"
            alt="PujoHopper Dhaak"
            className="w-5 h-5 object-contain flex-shrink-0"
          />
          <span className="text-lal font-bold text-xs tracking-tight">PujoHopper</span>
        </div>

        {/* Search Bar */}
        <div className="flex-1">
          <SearchBar
            onPandalSelect={onPandalSelect}
            onLocationSelect={onLocationSelect}
            onPlaceSelect={onPlaceSelect}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="max-w-lg mx-auto w-full">
        <CategoryPills activePill={activePill} onSelectPill={onSelectPill} />
      </div>
    </div>
  );
}
