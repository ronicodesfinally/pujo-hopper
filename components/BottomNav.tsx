'use client';

import { Compass, Navigation, MessageSquarePlus } from 'lucide-react';
import clsx from 'clsx';

export type GoogleMapsTab = 'near_me' | 'route' | 'contribute';

const TABS: { id: GoogleMapsTab; Icon: React.ElementType; label: string }[] = [
  { id: 'near_me',    Icon: Compass,           label: 'Near Me' },
  { id: 'route',      Icon: Navigation,        label: 'Route' },
  { id: 'contribute', Icon: MessageSquarePlus, label: 'Contribute' },
];

interface Props {
  active: GoogleMapsTab;
  onChange: (tab: GoogleMapsTab) => void;
}

export default function BottomNav({ active, onChange }: Props) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1001] bg-muslin border-t border-inkFaint shadow-card safe-bottom">
      <div className="flex max-w-md mx-auto">
        {TABS.map(({ id, Icon, label }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={clsx(
                'flex-1 flex flex-col items-center justify-center py-2.5 gap-1 relative transition-all',
                isActive ? 'text-lal font-semibold' : 'text-inkMute hover:text-inkDark'
              )}
            >
              <div
                className={clsx(
                  'px-4 py-1 rounded-full transition-all flex items-center justify-center',
                  isActive ? 'bg-lalPale text-lal' : 'text-inkMute'
                )}
              >
                <Icon size={19} strokeWidth={isActive ? 2.4 : 1.8} />
              </div>
              <span className={clsx('text-[11px] leading-tight tracking-tight', isActive ? 'text-lal font-bold' : 'text-inkMute')}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
