'use client';

import { getBusynessLabel } from '@/lib/popular-times';

interface Props {
  hourlyData: number[];
  currentHour: number;
  currentBusyness: number;
  isLive?: boolean;
}

const HOUR_LABELS = ['12a','','','3a','','','6a','','','9a','','','12p','','','3p','','','6p','','','9p','',''];

export default function PopularityChart({ hourlyData, currentHour, currentBusyness, isLive = false }: Props) {
  const info = getBusynessLabel(currentBusyness);
  const maxVal = Math.max(...hourlyData, 1);

  return (
    <div className="bg-cream border border-inkFaint rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-inkMute text-[10px] uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
            Popular Times
            {isLive && (
              <span className="flex items-center gap-1 text-[9px] font-semibold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />Live
              </span>
            )}
          </p>
          <p className="text-inkDark font-bold text-sm">{info.label}</p>
          <p className="text-inkMute text-[10px]">{info.sublabel}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border-2"
          style={{ color: info.color, borderColor: info.color, background: `${info.color}10` }}>
          {currentBusyness}
        </div>
      </div>

      {/* Bars */}
      <div className="flex items-end gap-[2px] h-12 mb-1">
        {hourlyData.map((val, hour) => {
          const isCurrent = hour === currentHour;
          const h = Math.max(Math.round((val / maxVal) * 100), 3);
          return (
            <div key={hour} className="flex-1 flex items-end group relative" style={{ height: '100%' }}>
              {/* Hover tooltip */}
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-muslin border border-inkFaint rounded-lg px-2 py-1 text-[9px] text-inkDark shadow-card whitespace-nowrap">
                  {hour % 12 === 0 ? 12 : hour % 12}{hour < 12 ? 'am' : 'pm'}: {val}%
                </div>
              </div>
              <div
                className="w-full rounded-t-sm transition-all"
                style={{
                  height: `${h}%`,
                  background: isCurrent ? info.barColor : '#E8CECE',
                  position: 'relative',
                }}
              >
                {isCurrent && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ background: info.barColor }} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hour labels */}
      <div className="flex gap-[2px]">
        {HOUR_LABELS.map((label, i) => (
          <div key={i} className="flex-1 text-center text-[7px]"
            style={{ color: i === currentHour ? info.color : '#9B6060', fontWeight: i === currentHour ? 700 : 400 }}>
            {label}
          </div>
        ))}
      </div>

      <p className="text-inkMute text-[9px] mt-2 text-right">
        {isLive ? '🟢 Google Places live' : '📊 Durga Puja crowd model'}
      </p>
    </div>
  );
}
