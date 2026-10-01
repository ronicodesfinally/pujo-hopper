'use client';

import { useState } from 'react';
import type { SearchedPlace } from '@/lib/types';
import { Navigation, Plus, Check, Star, MapPin, Clock, X, Copy, CheckCircle2, Flame } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  place: SearchedPlace;
  inRoute: boolean;
  onClose: () => void;
  onGetDirections: () => void;
  onAddToRoute: () => void;
  onRemoveDirections?: () => void;
  userLat?: number;
  userLng?: number;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  if (d < 1) {
    return `${Math.round(d * 1000)} m away`;
  }
  return `${d.toFixed(1)} km away`;
}

export default function GooglePlaceCard({
  place,
  inRoute,
  onClose,
  onGetDirections,
  onAddToRoute,
  onRemoveDirections,
  userLat = 22.5904744,
  userLng = 88.4082609,
}: Props) {
  const [copied, setCopied] = useState(false);

  const distanceStr = calculateDistance(userLat, userLng, place.lat, place.lng);

  const handleCopy = () => {
    navigator.clipboard?.writeText(`${place.name}, ${place.address}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Crowd / Busyness visual configuration
  const busynessText = place.busyness || 'Usually steady flow right now';
  const isHighRush = busynessText.toLowerCase().includes('peak') || busynessText.toLowerCase().includes('very busy');
  const isModerate = busynessText.toLowerCase().includes('moderate') || busynessText.toLowerCase().includes('rush');

  return (
    <div className="px-4 pt-3 pb-6 animate-fade-up">
      {/* Header with Title and Close Button */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 pr-2 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-inkDark font-bold text-base leading-tight truncate">{place.name}</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="bg-cream border border-inkFaint text-inkMid font-medium px-2 py-0.5 rounded-full text-[11px]">
              {place.primaryType || 'Google Place'}
            </span>
            <span className="text-inkFaint">·</span>
            <span className="text-lal font-semibold text-[11px]">{distanceStr}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-full bg-cream hover:bg-inkFaint/50 text-inkMute transition-colors flex-shrink-0"
          title="Close card"
        >
          <X size={15} />
        </button>
      </div>

      {/* Ratings, Reviews, and Open Status (Google Maps style) */}
      <div className="flex items-center gap-3 mb-3 text-xs flex-wrap">
        {place.rating ? (
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
            <span className="font-bold text-amber-900">{place.rating.toFixed(1)}</span>
            <div className="flex items-center text-amber-500">
              <Star size={12} className="fill-amber-400 text-amber-400" />
            </div>
            {place.userRatingCount && (
              <span className="text-amber-800/80 text-[11px]">
                ({place.userRatingCount.toLocaleString()} reviews)
              </span>
            )}
          </div>
        ) : null}

        <div className={clsx(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border',
          place.isOpen !== false
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        )}>
          <span className={clsx('w-2 h-2 rounded-full', place.isOpen !== false ? 'bg-emerald-500' : 'bg-red-500')} />
          <span>{place.isOpen !== false ? 'Open now' : 'Closed'}</span>
        </div>
      </div>

      {/* Google Maps Real-time Crowd / Busyness Meter */}
      <div className={clsx(
        'p-3 rounded-2xl border mb-3.5',
        isHighRush
          ? 'bg-red-50/80 border-red-200'
          : isModerate
          ? 'bg-amber-50/80 border-amber-200'
          : 'bg-emerald-50/80 border-emerald-200'
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame
              size={15}
              className={clsx(
                isHighRush ? 'text-red-600' : isModerate ? 'text-amber-600' : 'text-emerald-600'
              )}
            />
            <span className="text-xs font-bold text-inkDark">
              {isHighRush ? 'Active Surge / Heavy Crowd' : isModerate ? 'Moderate Crowd' : 'Light Crowd / Free Flow'}
            </span>
          </div>
          <span className="text-[10px] text-inkMute font-medium">Google Live Activity</span>
        </div>
        <p className="text-inkMid text-[11px] mt-1 pl-6">
          {busynessText}
        </p>
      </div>

      {/* Address Row */}
      <div className="flex items-start gap-2 text-xs text-inkMid bg-cream border border-inkFaint rounded-2xl p-3 mb-4">
        <MapPin size={15} className="text-lal flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-inkDark font-medium leading-relaxed">{place.address}</p>
        </div>
        <button
          onClick={handleCopy}
          className="text-inkMute hover:text-lal p-1 rounded-lg transition-colors flex-shrink-0"
          title="Copy address"
        >
          {copied ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Copy size={14} />}
        </button>
      </div>

      {/* Hours description if available */}
      {place.hours && place.hours.length > 0 && (
        <div className="flex items-start gap-2 text-[11px] text-inkMute mb-4 px-1">
          <Clock size={13} className="text-inkMute flex-shrink-0 mt-0.5" />
          <p>{place.hours[0]}</p>
        </div>
      )}

      {/* Primary Action Buttons: Google Maps Blue Directions Button */}
      <div className="flex gap-2.5">
        <button
          onClick={onGetDirections}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all bg-[#1A73E8] text-white hover:bg-[#1557B0] active:scale-95 shadow-md"
        >
          <Navigation size={15} className="fill-white" />
          <span>Directions</span>
        </button>

        <button
          onClick={onAddToRoute}
          className={clsx(
            'flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all border active:scale-95',
            inRoute
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
              : 'border-inkFaint bg-muslin text-inkDark hover:border-lal hover:text-lal'
          )}
        >
          {inRoute ? (
            <>
              <Check size={15} className="text-emerald-600" />
              <span>In Route</span>
            </>
          ) : (
            <>
              <Plus size={15} />
              <span>Add to Route</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
