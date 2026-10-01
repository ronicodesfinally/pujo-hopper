'use client';

import { Flame, Bath, Car, Train, Cross, ShieldAlert, Landmark, Fuel } from 'lucide-react';
import clsx from 'clsx';

export type PillCategory =
  | 'crowd'
  | 'police_booth'
  | 'parking'
  | 'toilet'
  | 'transit'
  | 'poi'
  | 'hospital'
  | 'indianoil';

interface Props {
  activePill: PillCategory | null;
  onSelectPill: (pill: PillCategory) => void;
}

const PILLS: { id: PillCategory; label: string; icon: React.ElementType }[] = [
  { id: 'crowd',        label: 'Crowd Heatmap',         icon: Flame },
  { id: 'police_booth', label: 'Police Booths',         icon: ShieldAlert },
  { id: 'parking',      label: 'Parking Zones',         icon: Car },
  { id: 'toilet',       label: 'Toilets',               icon: Bath },
  { id: 'transit',      label: 'Metro Stations',        icon: Train },
  { id: 'poi',          label: 'Places of Interest',    icon: Landmark },
  { id: 'hospital',     label: 'Hospitals & Medical',   icon: Cross },
  { id: 'indianoil',    label: 'IndianOil Fuel/LPG',    icon: Fuel },
];

export default function CategoryPills({ activePill, onSelectPill }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 pt-1 px-3 no-scrollbar pointer-events-auto">
      {PILLS.map(({ id, label, icon: Icon }) => {
        const isActive = activePill === id;
        return (
          <button
            key={id}
            onClick={() => onSelectPill(id)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shadow-card border flex-shrink-0',
              isActive
                ? 'bg-lal border-lal text-muslin font-semibold ring-2 ring-lal/20'
                : 'bg-muslin/95 backdrop-blur-md border-inkFaint text-inkDark hover:bg-cream hover:border-lal/40'
            )}
          >
            <Icon size={13} className={isActive ? 'text-muslin' : 'text-lal'} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
