'use client';

import type { LayerState } from '@/lib/types';
import clsx from 'clsx';
import { Utensils, Bath, ParkingCircle, Flame, Route } from 'lucide-react';

interface LayerBtn { key: keyof LayerState; icon: React.ReactNode; label: string; }

const BUTTONS: LayerBtn[] = [
  { key: 'heatmap', icon: <Flame size={15} />,        label: 'Crowd'   },
  { key: 'food',    icon: <Utensils size={15} />,     label: 'Food'    },
  { key: 'toilet',  icon: <Bath size={15} />,         label: 'Toilets' },
  { key: 'parking', icon: <ParkingCircle size={15} />,label: 'Parking' },
  { key: 'route',   icon: <Route size={15} />,        label: 'Route'   },
];

interface Props { layers: LayerState; onToggle: (key: keyof LayerState) => void; }

export default function LayerControls({ layers, onToggle }: Props) {
  return (
    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-2">
      {BUTTONS.map(({ key, icon, label }) => {
        const active = layers[key];
        return (
          <button
            key={key}
            onClick={() => onToggle(key)}
            className={clsx(
              'w-11 h-11 rounded-xl border flex flex-col items-center justify-center gap-0.5',
              'transition-all shadow-card backdrop-blur-sm text-[8px] font-semibold',
              active
                ? 'bg-lal border-lalDark text-muslin shadow-lal'
                : 'bg-muslin/95 border-inkFaint text-inkMid hover:border-lal/50 hover:text-lal'
            )}
            title={label}
          >
            {icon}
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
