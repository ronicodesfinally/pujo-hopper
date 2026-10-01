'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  CornerUpLeft,
  CornerUpRight,
  ArrowUp,
  RotateCw,
  Flag,
  Navigation,
  ExternalLink,
  MapPin,
} from 'lucide-react';
import type { Pandal } from '@/lib/types';
import type { RouteResult } from '@/lib/street-router';
import clsx from 'clsx';

interface Props {
  pandals: Pandal[];
  routeInfo: RouteResult | null;
  travelMode: string;
  onExit: () => void;
  onStepFocus?: (lat: number, lng: number) => void;
}

interface StepItem {
  instruction: string;
  distanceMeters: number;
  duration: string;
  streetName?: string;
  maneuver?: string;
  stopName?: string;
}

export default function NavigationHUD({
  pandals,
  routeInfo,
  travelMode,
  onExit,
  onStepFocus,
}: Props) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [steps, setSteps] = useState<StepItem[]>([]);

  // 1. Flatten all legs into a sequential list of turn-by-turn steps
  useEffect(() => {
    if (!routeInfo?.legs || routeInfo.legs.length === 0) {
      // Fallback steps if legs are empty
      const simpleSteps: StepItem[] = pandals.map((p, i) => ({
        instruction: i === 0 ? `Head from Momo I Am towards ${p.name}` : `Continue along street towards ${p.name}`,
        distanceMeters: Math.round((routeInfo?.distanceMeters || 1000) / pandals.length),
        duration: '5 min',
        stopName: p.name,
        maneuver: 'depart',
      }));
      simpleSteps.push({
        instruction: `Arrive at final destination ${pandals[pandals.length - 1]?.name || 'Stop'}`,
        distanceMeters: 50,
        duration: '1 min',
        stopName: pandals[pandals.length - 1]?.name,
        maneuver: 'arrive',
      });
      setSteps(simpleSteps);
      return;
    }

    const flat: StepItem[] = [];
    routeInfo.legs.forEach((leg, lIdx) => {
      const destName = pandals[lIdx]?.name || `Stop ${lIdx + 1}`;
      if (leg.steps && leg.steps.length > 0) {
        leg.steps.forEach((s) => {
          flat.push({
            instruction: s.instructions,
            distanceMeters: s.distanceMeters,
            duration: s.duration,
            streetName: s.streetName,
            maneuver: s.maneuver,
            stopName: destName,
          });
        });
      } else {
        flat.push({
          instruction: `Follow street towards ${destName}`,
          distanceMeters: leg.distanceMeters,
          duration: leg.duration,
          stopName: destName,
          maneuver: 'straight',
        });
      }
    });

    if (flat.length === 0) {
      flat.push({
        instruction: `Head to ${pandals[0]?.name || 'Destination'}`,
        distanceMeters: routeInfo.distanceMeters,
        duration: routeInfo.duration,
        stopName: pandals[0]?.name,
        maneuver: 'straight',
      });
    }

    setSteps(flat);
    setCurrentStepIdx(0);
  }, [routeInfo, pandals]);

  // Voice announcement of maneuvers
  const speakInstruction = useCallback(
    (text: string) => {
      if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;
      try {
        window.speechSynthesis.cancel();
        const clean = text.replace(/➔|·|→/g, ' to ');
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.lang = 'en-IN';
        window.speechSynthesis.speak(utterance);
      } catch {
        /* silent */
      }
    },
    [isMuted]
  );

  const activeStep = steps[currentStepIdx] || {
    instruction: 'Follow route towards destination',
    distanceMeters: 100,
    duration: '2 min',
  };

  const nextStep = steps[currentStepIdx + 1];

  // Speak initial instruction on start
  useEffect(() => {
    if (steps.length > 0) {
      speakInstruction(steps[0].instruction);
    }
  }, [steps, speakInstruction]);

  const handleNextStep = () => {
    if (currentStepIdx < steps.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      speakInstruction(steps[nextIdx].instruction);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      speakInstruction(steps[prevIdx].instruction);
    }
  };

  // Icon determination for current maneuver
  const getManeuverIcon = (instruction: string, maneuver?: string) => {
    const text = (instruction || '').toLowerCase();
    if (maneuver === 'arrive' || text.includes('arrive')) {
      return <Flag size={32} className="text-white fill-white" />;
    }
    if (text.includes('left')) {
      return <CornerUpLeft size={36} className="text-white stroke-[2.8]" />;
    }
    if (text.includes('right')) {
      return <CornerUpRight size={36} className="text-white stroke-[2.8]" />;
    }
    if (text.includes('roundabout')) {
      return <RotateCw size={34} className="text-white stroke-[2.8]" />;
    }
    return <ArrowUp size={36} className="text-white stroke-[2.8]" />;
  };

  // Google Maps external deep-link URL (supports all stops)
  const originLat = 22.5904744;
  const originLng = 88.4082609;
  const dest = pandals[pandals.length - 1];
  const waypoints = pandals.slice(0, -1);
  const waypointsParam =
    waypoints.length > 0
      ? `&waypoints=${waypoints.map((w) => `${w.lat},${w.lng}`).join('|')}`
      : '';
  const gMode = travelMode === 'cab' ? 'driving' : travelMode === 'metro' || travelMode === 'bus' ? 'transit' : 'walking';
  const googleMapsUrl = dest
    ? `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${dest.lat},${dest.lng}${waypointsParam}&travelmode=${gMode}`
    : `https://www.google.com/maps`;

  // Format arrival time
  const getArrivalTime = () => {
    const totalSecs = parseInt(routeInfo?.duration || '1200', 10);
    const arrival = new Date(Date.now() + totalSecs * 1000);
    return arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  return (
    <div className="absolute inset-0 z-[1050] pointer-events-none flex flex-col justify-between overflow-hidden">
      {/* ── TOP: Google Maps Navigation HUD (Dark Emerald Green Banner) ── */}
      <div className="pointer-events-auto w-full max-w-lg mx-auto p-3 pt-2">
        <div className="bg-[#137333] text-white rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-fade-in">
          {/* Main instruction section */}
          <div className="p-4 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
              {getManeuverIcon(activeStep.instruction, activeStep.maneuver)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-white">
                  {formatDistance(activeStep.distanceMeters)}
                </span>
                {activeStep.streetName && (
                  <span className="text-xs font-semibold text-white/80 truncate">
                    on {activeStep.streetName}
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-white/95 leading-snug line-clamp-2">
                {activeStep.instruction}
              </p>
            </div>

            {/* Mute toggle button */}
            <button
              onClick={() => {
                const next = !isMuted;
                setIsMuted(next);
                if (next && typeof window !== 'undefined' && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                }
              }}
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center transition-all flex-shrink-0"
              title={isMuted ? 'Unmute voice navigation' : 'Mute voice navigation'}
              aria-label={isMuted ? 'Unmute voice navigation' : 'Mute voice navigation'}
            >
              {isMuted ? <VolumeX size={18} className="text-white/70" /> : <Volume2 size={18} className="text-white" />}
            </button>
          </div>

          {/* Secondary preview of next turn */}
          {nextStep && (
            <div className="bg-[#0b5424] px-4 py-2 flex items-center gap-2 text-xs font-semibold text-white/90 border-t border-white/10">
              <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider">Then:</span>
              <span className="truncate">{nextStep.instruction}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM: Google Maps Ride Bar & Controls ── */}
      <div className="pointer-events-auto w-full max-w-lg mx-auto p-3 pb-4 safe-bottom">
        <div className="bg-muslin/98 backdrop-blur-md border border-inkFaint rounded-3xl p-4 shadow-2xl space-y-3 animate-fade-up">
          {/* Top Row: Big ETA, Distance, Arrival Time & Close Button */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#137333] tracking-tight">
                  {routeInfo?.duration
                    ? `${Math.round(parseInt(routeInfo.duration, 10) / 60)} min`
                    : '18 min'}
                </span>
                <span className="text-xs font-bold text-inkMute">
                  ({formatDistance(routeInfo?.distanceMeters || 1200)})
                </span>
              </div>
              <p className="text-xs font-bold text-inkDark flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#137333] inline-block animate-pulse" />
                ETA: {getArrivalTime()} · Live Street Track
              </p>
            </div>

            {/* Red Circular Exit Button (Google Maps Style) */}
            <button
              onClick={onExit}
              className="w-11 h-11 rounded-full bg-red-100 hover:bg-red-200 text-red-700 flex items-center justify-center font-bold shadow-md active:scale-90 transition-all"
              title="Exit Navigation"
              aria-label="Exit Navigation"
            >
              <X size={20} className="stroke-[2.5]" />
            </button>
          </div>

          {/* Current Stop Chip & Step Nav Buttons */}
          <div className="flex items-center justify-between bg-cream/70 border border-inkFaint/80 rounded-2xl px-3 py-2 text-xs">
            <div className="flex items-center gap-2 truncate">
              <MapPin size={14} className="text-lal flex-shrink-0" />
              <span className="font-bold text-inkDark truncate">
                {activeStep.stopName || pandals[0]?.name || 'Kolkata Pandal'}
              </span>
              <span className="text-[10px] text-inkMute font-semibold flex-shrink-0">
                ({currentStepIdx + 1}/{steps.length})
              </span>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handlePrevStep}
                disabled={currentStepIdx === 0}
                className="w-7 h-7 rounded-lg bg-white border border-inkFaint flex items-center justify-center text-inkDark disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 active:scale-95"
                title="Previous step"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNextStep}
                disabled={currentStepIdx >= steps.length - 1}
                className="w-7 h-7 rounded-lg bg-white border border-inkFaint flex items-center justify-center text-inkDark disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 active:scale-95"
                title="Next step"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Action Row: Google Maps App Launch Button */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white py-2.5 px-4 rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <Navigation size={14} className="fill-white" />
            <span>Open in Google Maps App</span>
            <ExternalLink size={12} className="opacity-80" />
          </a>
        </div>
      </div>
    </div>
  );
}
