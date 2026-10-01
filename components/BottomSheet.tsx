'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Pandal, SearchedPlace } from '@/lib/types';
import type { GoogleMapsTab } from './BottomNav';
import PandalCard from './PandalCard';
import GooglePlaceCard from './GooglePlaceCard';
import PandalList from './PandalList';
import RoutePanel from './RoutePanel';
import ContributePanel from './ContributePanel';
import clsx from 'clsx';

type SheetHeight = 'peek' | 'default' | 'half' | 'full';

const HEIGHT_CLASS: Record<SheetHeight, string> = {
  peek: 'h-[44px]',
  default: 'h-[154px]', // shows drag handle + 1 full card + half of the next card
  half: 'h-[50vh]',
  full: 'h-[86vh]',
};

interface Props {
  activeTab: GoogleMapsTab;
  selectedPandal: Pandal | null;
  selectedPlace?: SearchedPlace | null;
  routePandals: Pandal[];
  allPandals: Pandal[];
  routeInfo?: any;
  onClose: () => void;
  onClosePlace?: () => void;
  onFlyTo: (p: Pandal) => void;
  onGetDirections?: (p: Pandal) => void;
  onGetPlaceDirections?: (place: SearchedPlace) => void;
  onAddToRoute: (p: Pandal) => void;
  onAddPlaceToRoute?: (place: SearchedPlace) => void;
  onReorderRoute?: (pandals: Pandal[]) => void;
  onRemoveFromRoute: (id: string) => void;
  onClearRoute: () => void;
  onBuildRoute: (pandals: Pandal[], travelMode?: string) => void;
  onPlaceAdded?: (item: { type: string; data: any }) => void;
  onStartNav?: () => void;
  onStartNavDirect?: (pandal: Pandal) => void;
}

export default function BottomSheet({
  activeTab,
  selectedPandal,
  selectedPlace,
  routePandals,
  allPandals,
  routeInfo,
  onClose,
  onClosePlace,
  onFlyTo,
  onGetDirections,
  onGetPlaceDirections,
  onAddToRoute,
  onAddPlaceToRoute,
  onReorderRoute,
  onRemoveFromRoute,
  onClearRoute,
  onBuildRoute,
  onPlaceAdded,
  onStartNav,
  onStartNavDirect,
}: Props) {
  const [height, setHeight] = useState<SheetHeight>('default');
  const dragStartY = useRef<number | null>(null);
  const dragStartH = useRef<SheetHeight>('default');

  useEffect(() => {
    if (selectedPandal || selectedPlace) {
      setHeight('half');
    } else if (activeTab === 'near_me') {
      setHeight('default');
    } else {
      setHeight('half');
    }
  }, [selectedPandal?.id, selectedPlace?.id, activeTab]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    dragStartH.current = height;
  }, [height]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (dragStartY.current == null) return;
    const dy = dragStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(dy) < 10) { dragStartY.current = null; return; }
    if (dy > 40) {
      // Swiping up
      if (dragStartH.current === 'peek') setHeight('default');
      else if (dragStartH.current === 'default') setHeight('half');
      else setHeight('full');
    }
    if (dy < -40) {
      // Swiping down
      if (dragStartH.current === 'full') setHeight('half');
      else if (dragStartH.current === 'half') setHeight('default');
      else setHeight('peek');
    }
    dragStartY.current = null;
  }, [height]);

  const inRoute = selectedPandal ? routePandals.some((p) => p.id === selectedPandal.id) : false;

  const toggleHeight = () => {
    setHeight((h) => {
      if (h === 'peek') return 'default';
      if (h === 'default') return 'half';
      if (h === 'half') return 'full';
      return 'default';
    });
  };

  return (
    <div
      className={clsx(
        'absolute bottom-0 left-0 right-0 z-[999] bg-muslin',
        'rounded-t-3xl flex flex-col',
        'transition-all duration-300 ease-out border-t border-inkFaint',
        HEIGHT_CLASS[height]
      )}
      style={{
        boxShadow: '0 -4px 24px rgba(26,5,5,0.08)',
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Clean Drag Handle Bar only — arrow removed as requested */}
      <button
        onClick={toggleHeight}
        className="flex-shrink-0 w-full flex items-center justify-center py-2.5 hover:bg-cream/60 transition-colors"
        aria-label="Toggle sheet height"
      >
        <div className="w-10 h-1 rounded-full bg-inkFaint hover:bg-inkMute transition-colors" />
      </button>

      {/* Sheet Content Body */}
      {height !== 'peek' && (
        <div className="flex-1 overflow-hidden">
          {selectedPlace ? (
            <div className="h-full overflow-y-auto">
              <GooglePlaceCard
                place={selectedPlace}
                inRoute={routePandals.some((p) => p.name === selectedPlace.name || p.id.includes(selectedPlace.id))}
                onClose={onClosePlace || onClose}
                onGetDirections={() => (onGetPlaceDirections ? onGetPlaceDirections(selectedPlace) : onAddPlaceToRoute?.(selectedPlace))}
                onAddToRoute={() => onAddPlaceToRoute?.(selectedPlace)}
              />
            </div>
          ) : selectedPandal ? (
            <div className="h-full overflow-y-auto">
              <PandalCard
                pandal={selectedPandal}
                inRoute={inRoute}
                onClose={onClose}
                onGetDirections={() => (onGetDirections ? onGetDirections(selectedPandal) : onAddToRoute(selectedPandal))}
                onRemoveDirections={() => onRemoveFromRoute(selectedPandal.id)}
                onStartNav={onStartNavDirect ? () => onStartNavDirect(selectedPandal) : undefined}
                onExpand={() => setHeight('full')}
              />
            </div>
          ) : activeTab === 'near_me' ? (
            <div className="h-full overflow-y-auto">
              <PandalList
                pandals={allPandals}
                routePandals={routePandals}
                onSelect={(p) => onFlyTo(p)}
                onAddToRoute={onAddToRoute}
                isCompact={height === 'default'}
              />
            </div>
          ) : activeTab === 'route' ? (
            <div className="h-full overflow-y-auto">
              <RoutePanel
                pandals={routePandals}
                allPandals={allPandals}
                routeInfo={routeInfo}
                onRemove={onRemoveFromRoute}
                onAdd={onAddToRoute}
                onReorder={onReorderRoute}
                onClear={onClearRoute}
                onBuild={(m) => onBuildRoute(routePandals, m)}
                onStartNav={onStartNav}
              />
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              <ContributePanel onPlaceAdded={onPlaceAdded} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
