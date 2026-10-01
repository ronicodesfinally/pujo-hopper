'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Search,
  MapPin,
  X,
  Loader2,
  Navigation,
  Utensils,
  Train,
  Star,
  Bath,
  Car,
  Cross,
  ShieldAlert,
  Landmark,
  Fuel,
} from 'lucide-react';
import { searchAllPlaces } from '@/lib/places-data';
import { pandals } from '@/lib/pandals';
import type { Pandal, SearchedPlace } from '@/lib/types';
import clsx from 'clsx';

interface PlaceResult {
  type: 'place';
  place: SearchedPlace;
}

interface PandalResult {
  type: 'pandal';
  pandal: Pandal;
}

type SearchResult = PlaceResult | PandalResult;

interface Props {
  onPandalSelect: (p: Pandal) => void;
  onLocationSelect: (lat: number, lng: number, label: string) => void;
  onPlaceSelect?: (place: SearchedPlace) => void;
}

function getPlaceVisual(type?: string, name?: string) {
  const t = `${type || ''} ${name || ''}`.toLowerCase();
  if (t.includes('toilet') || t.includes('restroom') || t.includes('washroom') || t.includes('bathroom') || t.includes('loo')) {
    return { icon: Bath, bg: 'bg-cyan-100 text-cyan-800', tag: 'Restroom' };
  }
  if (t.includes('parking') || t.includes('garage')) {
    return { icon: Car, bg: 'bg-emerald-100 text-emerald-800', tag: 'Parking' };
  }
  if (t.includes('police') || t.includes('chowki') || t.includes('thana') || t.includes('assistance')) {
    return { icon: ShieldAlert, bg: 'bg-sky-100 text-sky-800', tag: 'Police' };
  }
  if (t.includes('hospital') || t.includes('clinic') || t.includes('medical') || t.includes('doctor') || t.includes('pharmacy')) {
    return { icon: Cross, bg: 'bg-red-100 text-red-700', tag: 'Medical' };
  }
  if (t.includes('fuel') || t.includes('petrol') || t.includes('cng') || t.includes('lpg') || t.includes('indianoil') || t.includes('gas')) {
    return { icon: Fuel, bg: 'bg-orange-100 text-orange-800', tag: 'Fuel' };
  }
  if (t.includes('transit') || t.includes('subway') || t.includes('metro') || t.includes('train') || t.includes('station')) {
    return { icon: Train, bg: 'bg-purple-100 text-purple-700', tag: 'Transit' };
  }
  if (t.includes('restaurant') || t.includes('food') || t.includes('cafe') || t.includes('bakery') || t.includes('bar') || t.includes('biryani') || t.includes('momo') || t.includes('eatery')) {
    return { icon: Utensils, bg: 'bg-amber-100 text-amber-800', tag: 'Dining' };
  }
  if (t.includes('museum') || t.includes('monument') || t.includes('lake') || t.includes('science') || t.includes('park') || t.includes('temple')) {
    return { icon: Landmark, bg: 'bg-stone-100 text-stone-800', tag: 'Landmark' };
  }
  return { icon: Navigation, bg: 'bg-blue-100 text-blue-700', tag: 'Place' };
}

export default function SearchBar({ onPandalSelect, onLocationSelect, onPlaceSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    const lower = q.toLowerCase();

    // 1. Instant Durga Puja Pandal Search
    const pandalMatches: PandalResult[] = pandals
      .filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.theme.toLowerCase().includes(lower) ||
          p.nameBengali.includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(lower)) ||
          p.zone.includes(lower)
      )
      .slice(0, 4)
      .map((p) => ({ type: 'pandal' as const, pandal: p }));

    // 2. Instant Local Verified Places (restaurants, cafes, toilets, parking, transit)
    const instantPlaces: PlaceResult[] = searchAllPlaces(q, 6).map((p) => ({
      type: 'place' as const,
      place: p,
    }));

    const initialCombined = [...pandalMatches, ...instantPlaces].slice(0, 15);
    setResults(initialCombined);
    if (initialCombined.length > 0) {
      setOpen(true);
    }

    // 3. Google Places API (New) Search (live augment for all restaurants, cafes, etc. in Kolkata)
    if (q.length >= 2) {
      setLoading(true);
      try {
        let googlePlaces: SearchedPlace[] = [];

        // 3a. Primary server route with Kolkata-wide bias
        try {
          const res = await fetch(`/api/places?query=${encodeURIComponent(q)}&lat=22.5904744&lng=88.4082609`);
          if (res.ok) {
            const data = await res.json();
            googlePlaces = data.places || [];
          }
        } catch {
          // Fall through to direct browser fetch
        }

        // 3b. Direct browser Google Places fallback (CORS enabled)
        if (googlePlaces.length === 0) {
          try {
            const directRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': 'AIzaSyAbhrgPRQVLCpYojXWwrWk7_oRpSZFOjxM',
                'X-Goog-FieldMask':
                  'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.currentOpeningHours,places.primaryType',
              },
              signal: AbortSignal.timeout(3500),
              body: JSON.stringify({
                textQuery: lower.includes('kolkata') ? q : `${q}, Kolkata`,
                locationBias: {
                  circle: {
                    center: { latitude: 22.5726, longitude: 88.3639 },
                    radius: 35000.0,
                  },
                },
                maxResultCount: 20,
              }),
            });
            if (directRes.ok) {
              const d = await directRes.json();
              if (Array.isArray(d.places)) {
                googlePlaces = d.places
                  .filter((p: any) => p.location?.latitude && p.location?.longitude && p.displayName?.text)
                  .map((p: any) => ({
                    id: p.id || `gp_${Math.random().toString(36).slice(2, 8)}`,
                    name: p.displayName.text,
                    address: p.formattedAddress || 'Kolkata, West Bengal',
                    lat: p.location.latitude,
                    lng: p.location.longitude,
                    rating: p.rating,
                    userRatingCount: p.userRatingCount,
                    isOpen: p.currentOpeningHours?.openNow ?? true,
                    primaryType: p.primaryType ? p.primaryType.replace(/_/g, ' ') : 'Restaurant',
                    category: p.primaryType || 'restaurant',
                    hours: p.currentOpeningHours?.weekdayDescriptions || [],
                    busyness: 'Usually not too crowded',
                    source: 'google_places_api',
                  }));
              }
            }
          } catch {
            // direct fetch error ignored
          }
        }

        const placeResults: PlaceResult[] = googlePlaces.map((p) => ({
          type: 'place' as const,
          place: p,
        }));

        setResults((prev) => {
          const currentPandals = prev.filter((r) => r.type === 'pandal');
          const seen = new Set<string>(currentPandals.map((p) => p.pandal.name.toLowerCase()));
          const dedupedPlaces: PlaceResult[] = [];
          for (const r of [...instantPlaces, ...placeResults]) {
            const k = r.place.name.toLowerCase();
            if (!seen.has(k)) {
              seen.add(k);
              dedupedPlaces.push(r);
            }
          }
          return [...currentPandals, ...dedupedPlaces].slice(0, 20);
        });
        setOpen(true);
      } catch (err) {
        console.warn('Place search error:', err);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery('');
    if (result.type === 'pandal') {
      onPandalSelect(result.pandal);
    } else {
      if (onPlaceSelect) {
        onPlaceSelect(result.place);
      } else {
        onLocationSelect(result.place.lat, result.place.lng, result.place.name);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0) {
      handleSelect(results[0]);
    }
  };

  return (
    <div className="relative w-full">
      {/* Google Maps Style Search Card with Keyboard Enter/Submit support */}
      <form
        onSubmit={handleSubmit}
        className={clsx(
          'flex items-center gap-2.5 bg-muslin border rounded-full px-4 py-2.5 shadow-card transition-all',
          open ? 'border-lal shadow-lal ring-2 ring-lal/10' : 'border-inkFaint hover:border-inkMute'
        )}
      >
        <Search size={16} className="text-inkMute flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setOpen(true)}
          placeholder="Search pandals, restaurants, toilets, metro…"
          className="flex-1 bg-transparent text-inkDark text-xs sm:text-sm placeholder-inkMute outline-none font-medium"
        />
        {loading && <Loader2 size={14} className="animate-spin text-lal flex-shrink-0" />}
        {query && !loading && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              setOpen(false);
            }}
          >
            <X size={14} className="text-inkMute hover:text-lal transition-colors" />
          </button>
        )}
      </form>

      {/* Results Dropdown (Authentic Google Maps Places autocomplete) */}
      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-muslin border border-inkFaint rounded-2xl shadow-lal overflow-hidden z-50 animate-fade-up max-h-[380px] overflow-y-auto">
          <div className="h-[2px] bg-lal w-full" />
          {results.map((result, i) => {
            if (result.type === 'pandal') {
              return (
                <button
                  key={`pandal-${result.pandal.id}-${i}`}
                  onClick={() => handleSelect(result)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-lalPale transition-colors text-left border-b border-inkFaint/30 last:border-0"
                >
                  <div className="w-8 h-8 rounded-full bg-lalPale flex items-center justify-center flex-shrink-0">
                    <MapPin size={15} className="text-lal" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-inkDark text-xs font-semibold truncate">{result.pandal.name}</p>
                    </div>
                    <p className="text-inkMute text-[10px] truncate">"{result.pandal.theme}"</p>
                  </div>
                  <span className="text-[9px] text-lal font-semibold bg-lalPale border border-lal/20 px-2 py-0.5 rounded-full flex-shrink-0">
                    Pandal
                  </span>
                </button>
              );
            }

            const place = result.place;
            const visual = getPlaceVisual(place.primaryType, place.name);
            const Icon = visual.icon;

            return (
              <button
                key={`place-${place.id}-${i}`}
                onClick={() => handleSelect(result)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-cream transition-colors text-left border-b border-inkFaint/30 last:border-0"
              >
                <div
                  className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    visual.bg
                  )}
                >
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-inkDark text-xs font-semibold truncate">{place.name}</p>
                    {place.rating && (
                      <span className="flex items-center text-[10px] font-bold text-amber-700 gap-0.5 flex-shrink-0">
                        <Star size={10} className="fill-amber-400 text-amber-400" />
                        {place.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-inkMute text-[10px] truncate">{place.address}</p>
                </div>
                <span className={clsx('text-[9px] px-2 py-0.5 rounded-full flex-shrink-0 font-medium border border-inkFaint', visual.bg)}>
                  {visual.tag}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
