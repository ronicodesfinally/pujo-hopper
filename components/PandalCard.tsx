'use client';

import { useEffect, useState } from 'react';
import type { Pandal } from '@/lib/types';
import { getHourlyPattern, getCurrentBusynessFromPattern, getBusynessLabel, getKolkataHour } from '@/lib/popular-times';
import PopularityChart from './PopularityChart';
import { Star, Clock, Ticket, ChevronRight, Tag, Plus, Check, Loader2, Navigation, XCircle } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  pandal: Pandal;
  inRoute: boolean;
  onClose: () => void;
  onGetDirections: () => void;
  onRemoveDirections?: () => void;
  onStartNav?: () => void;
  onExpand: () => void;
}

interface LiveBusyness { busyness: number; isLive: boolean; source: string; hour: number; }

export default function PandalCard({ pandal, inRoute, onClose, onGetDirections, onRemoveDirections, onStartNav, onExpand }: Props) {
  const stars = Math.round(pandal.rating);
  const [liveData, setLiveData] = useState<LiveBusyness | null>(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const hourlyData = getHourlyPattern(pandal.id, now);
  const patternBusyness = getCurrentBusynessFromPattern(pandal.id, now);
  const currentHour = getKolkataHour(now);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/crowd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pandalId: pandal.id }),
    })
      .then((r) => r.json())
      .then((data: LiveBusyness) => { if (!cancelled) { setLiveData(data); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pandal.id]);

  const activeBusyness = liveData?.busyness ?? patternBusyness;
  const isLive = liveData?.isLive ?? false;
  const crowdInfo = getBusynessLabel(activeBusyness);

  return (
    <div className="px-4 pt-3 pb-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 pr-2">
          <div className="flex items-center gap-2 mb-1">
            <div>
              <h2 className="text-inkDark font-bold text-base leading-tight">{pandal.name}</h2>
              <p className="text-inkMute text-xs font-serif">{pandal.nameBengali}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <span className="text-lal text-[10px] font-semibold bg-lalPale border border-lal/20 px-2 py-0.5 rounded-full">
              Est. {pandal.established}
            </span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={10} className={i < stars ? 'text-zari fill-zari' : 'text-inkFaint'} />
              ))}
              <span className="text-inkMute text-[10px] ml-1">{pandal.rating}</span>
            </div>
          </div>
        </div>

        {/* Busyness badge */}
        <div className="text-right flex-shrink-0">
          {loading ? (
            <div className="flex items-center gap-1.5 bg-cream border border-inkFaint px-3 py-1.5 rounded-xl">
              <Loader2 size={11} className="animate-spin text-inkMute" />
              <span className="text-inkMute text-xs">Loading…</span>
            </div>
          ) : (
            <div
              className="px-3 py-1.5 rounded-xl text-right border"
              style={{
                background: `${crowdInfo.color}15`,
                borderColor: `${crowdInfo.color}40`,
              }}
            >
              <div className="flex items-center justify-end gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: crowdInfo.color }} />
                <span className="font-bold text-xs" style={{ color: crowdInfo.color }}>
                  {crowdInfo.label}
                </span>
              </div>
              <p className="text-[10px] text-inkMute mt-0.5">{crowdInfo.sublabel}</p>
              {isLive ? (
                <span className="text-[9px] text-green-700 font-semibold bg-green-50 px-1 py-0.2 rounded">
                  ● LIVE
                </span>
              ) : (
                <span className="text-[9px] text-inkFaint">puja model</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Theme */}
      <div className="bg-cream border border-inkFaint rounded-2xl p-3.5 mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-bold text-lal uppercase tracking-wider">2026 Theme</span>
          <span className="text-inkFaint text-xs">·</span>
          <span className="text-inkDark text-xs font-semibold">
            {pandal.theme2026 ? `"${pandal.theme2026}"` : 'To be announced'}
          </span>
        </div>
        <p className="text-inkMid text-xs leading-relaxed">
          {pandal.themeDescription2026 || 'No information announced yet for Durga Puja 2026.'}
        </p>
      </div>

      {/* Popular Times 24h chart */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="par-left text-inkDark text-xs font-semibold">Popular Times</p>
          <span className="text-inkMute text-[10px]">Today · 24-hr forecast</span>
        </div>
        <PopularityChart hourlyData={hourlyData} currentHour={currentHour} isLive={isLive} currentBusyness={activeBusyness} />
      </div>

      {/* Must watch highlights */}
      <div className="mb-4">
        <p className="par-left text-inkDark text-xs font-semibold mb-2">Must Watch Highlights</p>
        <div className="space-y-1.5">
          {pandal.mustWatch.map((item, i) => (
            <div key={i} className="flex items-start gap-2 bg-cream/70 border border-inkFaint rounded-xl p-2.5">
              <span className="text-lal font-bold text-xs mt-0.5">✦</span>
              <p className="text-inkDark text-xs leading-snug">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Info chips */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <InfoChip icon={<Ticket size={11} />} label="Entry" value={pandal.entryFee} />
        <InfoChip icon={<Clock size={11} />} label="Timings" value={pandal.timings.split(' (')[0]} />
      </div>

      {/* Artist & Organizer */}
      <p className="text-inkMute text-xs mb-0.5 par-left">
        <span className="text-inkMid font-medium">Artist:</span> {pandal.artist}
      </p>
      <p className="text-inkMute text-xs mb-4 par-left">
        <span className="text-inkMid font-medium">Organiser:</span> {pandal.organizer}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {pandal.tags.map((tag) => (
          <span key={tag} className="text-[10px] text-inkMid bg-cream border border-inkFaint px-2 py-0.5 rounded-full flex items-center gap-1">
            <Tag size={8} className="text-lal" />{tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {/* Primary green Start button — Google Maps style */}
        {onStartNav && (
          <button
            onClick={onStartNav}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all bg-green-600 hover:bg-green-700 text-white active:scale-95 shadow-md"
          >
            <Navigation size={16} className="fill-white" />
            Start Navigation
          </button>
        )}

        {/* Directions / Remove row */}
        <div className="flex gap-2">
          {inRoute && onRemoveDirections ? (
            <button
              onClick={onRemoveDirections}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl font-bold text-sm transition-all bg-red-50 border border-red-200 text-lal hover:bg-red-100 active:scale-95 shadow-sm"
            >
              <XCircle size={16} />
              Remove
            </button>
          ) : (
            <button
              onClick={onGetDirections}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl font-bold text-sm transition-all bg-lal text-muslin hover:bg-lalDark active:scale-95 shadow-lal"
            >
              <Navigation size={15} className="fill-muslin" />
              Directions
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl bg-cream border border-inkFaint text-inkMid text-sm hover:bg-lalPale hover:border-lal/30 transition-all font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-cream border border-inkFaint rounded-xl p-2.5">
      <div className="flex items-center gap-1 text-inkMute mb-1">{icon}<span className="text-[9px] uppercase tracking-wider">{label}</span></div>
      <p className="text-inkDark text-xs font-semibold leading-tight">{value}</p>
    </div>
  );
}
