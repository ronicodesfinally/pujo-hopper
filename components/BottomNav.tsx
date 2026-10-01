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
    <div className="fixed bottom-0 left-0 right-0 z-[1002] bg-muslin/95 backdrop-blur-md border-t border-inkFaint shadow-card safe-bottom select-none">
      <div className="flex max-w-md mx-auto py-0.5">
        {TABS.map(({ id, Icon, label }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={clsx(
                'flex-1 flex flex-col items-center justify-center py-1.5 gap-0.5 relative transition-all',
                isActive ? 'text-lal font-semibold' : 'text-inkMute hover:text-inkDark'
              )}
            >
              <div
                className={clsx(
                  'px-3.5 py-0.5 rounded-full transition-all flex items-center justify-center',
                  isActive ? 'bg-lalPale text-lal' : 'text-inkMute'
                )}
              >
                <Icon size={18} strokeWidth={isActive ? 2.4 : 1.8} />
              </div>
              <span className={clsx('text-[10px] leading-tight tracking-tight', isActive ? 'text-lal font-bold' : 'text-inkMute')}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
