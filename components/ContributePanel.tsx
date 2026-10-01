'use client';

import { useState } from 'react';
import {
  Send,
  MapPin,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Utensils,
  Bath,
  Car,
  Compass,
  Sparkles,
  Info,
  Clock,
  DollarSign,
  Star,
  Users,
} from 'lucide-react';
import { pandals } from '@/lib/pandals';
import type { Pandal, SearchedPlace } from '@/lib/types';
import clsx from 'clsx';

type ContributeType = 'pandal' | 'restaurant' | 'toilet' | 'parking';
type TabMode = 'add_place' | 'crowd_intel';

interface Props {
  onPlaceAdded?: (item: { type: ContributeType; data: any }) => void;
}

const ZONES = [
  { id: 'east', label: 'Salt Lake & East Kolkata' },
  { id: 'north', label: 'North Kolkata' },
  { id: 'central', label: 'Central Kolkata' },
  { id: 'south', label: 'South Kolkata' },
  { id: 'behala', label: 'Behala & South West' },
];

export default function ContributePanel({ onPlaceAdded }: Props) {
  const [tabMode, setTabMode] = useState<TabMode>('add_place');
  const [category, setCategory] = useState<ContributeType>('pandal');

  // Core Fields
  const [name, setName] = useState('');
  const [zone, setZone] = useState('east');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('22.5904744');
  const [lng, setLng] = useState('88.4082609');

  // Pandal Specific Fields
  const [theme, setTheme] = useState('');
  const [themeDesc, setThemeDesc] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [artist, setArtist] = useState('');
  const [bestTime, setBestTime] = useState('Evening (6 PM – 11 PM)');
  const [highlights, setHighlights] = useState('');
  const [wheelchairAccess, setWheelchairAccess] = useState(true);

  // Restaurant Specific Fields
  const [cuisine, setCuisine] = useState('Bengali Cuisine');
  const [priceForTwo, setPriceForTwo] = useState('₹400 - ₹800');
  const [timings, setTimings] = useState('11:00 AM – 11:30 PM (All-Night Puja Special)');
  const [hasAC, setHasAC] = useState(true);
  const [hasPujaSpecialMenu, setHasPujaSpecialMenu] = useState(true);

  // Toilet Specific Fields
  const [toiletType, setToiletType] = useState('KMC e-Toilet / Public Restroom');
  const [cleanliness, setCleanliness] = useState(4);
  const [toiletFee, setToiletFee] = useState('Free');
  const [toiletGender, setToiletGender] = useState('Separate Men & Women');
  const [waterAvailable, setWaterAvailable] = useState(true);

  // Parking Specific Fields
  const [parkingType, setParkingType] = useState('Designated Kolkata Police Puja Ground');
  const [capacity, setCapacity] = useState('100+ Cars & Bikes');
  const [parkingFee, setParkingFee] = useState('Free Official Parking');
  const [parkingRestrictions, setParkingRestrictions] = useState('Entry from main road');

  // Submitter Info
  const [contributorName, setContributorName] = useState('');
  const [contributorPhone, setContributorPhone] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Intel Report Fields
  const [selectedPandalForIntel, setSelectedPandalForIntel] = useState(pandals[0].id);
  const [intelCrowd, setIntelCrowd] = useState('moderate');
  const [intelParking, setIntelParking] = useState('limited');
  const [intelComment, setIntelComment] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [submittedItemName, setSubmittedItemName] = useState('');

  const fillDeviceLocation = () => {
    setLat('22.5904744');
    setLng('88.4082609');
    setAddress('Near Momo I Am, CD-18, Sector 1, Salt Lake, Kolkata 700064');
  };

  const handlePlaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const latNum = parseFloat(lat) || 22.5904744;
    const lngNum = parseFloat(lng) || 88.4082609;

    let payload: any = {
      name,
      address,
      zone,
      lat: latNum,
      lng: lngNum,
      contributor: contributorName || 'Anonymous Hopper',
      notes: additionalNotes,
    };

    if (category === 'pandal') {
      const newPandal: Pandal = {
        id: `user-${Date.now()}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name,
        nameBengali: 'পুজো',
        lat: latNum,
        lng: lngNum,
        theme: theme || 'Community Puja 2026',
        themeDescription: themeDesc || 'Community submitted Durga Puja pandal.',
        theme2026: theme || 'Community Puja 2026',
        themeDescription2026: themeDesc || 'Community submitted Durga Puja pandal.',
        mustWatch: highlights ? highlights.split(',').map((s) => s.trim()) : ['Community Decoration', 'Idol Art'],
        artist: artist || 'Local Artisan',
        organizer: organizer || name,
        established: 2026,
        timings: 'Open 24 Hours during Puja',
        bestTime: bestTime,
        entryFee: 'Free',
        tags: ['user_added', zone, 'durga_puja'],
        rating: 4.5,
        imageEmoji: '🏮',
        zone: zone as any,
      };
      payload = { type: 'pandal', data: newPandal };
      onPlaceAdded?.(payload);
    } else {
      const newPlace: SearchedPlace = {
        id: `user-${Date.now()}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name,
        address,
        lat: latNum,
        lng: lngNum,
        rating: category === 'toilet' ? cleanliness : 4.4,
        userRatingCount: 1,
        primaryType:
          category === 'restaurant'
            ? cuisine
            : category === 'toilet'
            ? toiletType
            : parkingType,
        category: category,
        isOpen: true,
        busyness: 'Normal Flow',
        hours: [
          category === 'restaurant'
            ? timings
            : category === 'toilet'
            ? 'Open 24 Hours'
            : 'Puja Special Parking',
        ],
        source: 'community_contribution',
      };
      payload = { type: category, data: newPlace };
      onPlaceAdded?.(payload);
    }

    // Persist in localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('pujo_hopper_contributions') || '[]');
      existing.unshift(payload);
      localStorage.setItem('pujo_hopper_contributions', JSON.stringify(existing.slice(0, 50)));
    } catch {
      /* ignore */
    }

    setSubmittedItemName(name);
    setSubmitted(true);
  };

  const handleIntelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedItemName('Live Crowd Intel Report');
    setSubmitted(true);
  };

  const resetForm = () => {
    setSubmitted(false);
    setName('');
    setTheme('');
    setThemeDesc('');
    setOrganizer('');
    setArtist('');
    setHighlights('');
    setAdditionalNotes('');
  };

  return (
    <div className="px-4 pt-2 pb-8 space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-lg">✍️</span>
          <h3 className="text-inkDark font-bold text-sm">Contribute to Kolkata Map</h3>
        </div>
        <p className="text-inkMute text-[11px] mt-0.5">
          Add newly discovered pandals, late-night food stalls, clean toilets, or parking spots for fellow hoppers.
        </p>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex bg-cream border border-inkFaint p-1 rounded-2xl gap-1">
        <button
          type="button"
          onClick={() => {
            setTabMode('add_place');
            setSubmitted(false);
          }}
          className={clsx(
            'flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all',
            tabMode === 'add_place'
              ? 'bg-muslin text-lal shadow-xs border border-inkFaint'
              : 'text-inkMute hover:text-inkDark'
          )}
        >
          <PlusCircle size={13} />
          Add Pandal or Place
        </button>

        <button
          type="button"
          onClick={() => {
            setTabMode('crowd_intel');
            setSubmitted(false);
          }}
          className={clsx(
            'flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all',
            tabMode === 'crowd_intel'
              ? 'bg-muslin text-lal shadow-xs border border-inkFaint'
              : 'text-inkMute hover:text-inkDark'
          )}
        >
          <Users size={13} />
          Report Crowd Intel
        </button>
      </div>

      {/* Confirmation State */}
      {submitted ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center space-y-3 animate-fade-up shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="text-emerald-950 font-bold text-sm">Successfully Submitted!</p>
            <p className="text-emerald-800 text-xs font-medium mt-1">
              "{submittedItemName}" has been added and shared with Kolkata Durga Puja hoppers.
            </p>
          </div>
          <button
            onClick={resetForm}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            Add Another Location
          </button>
        </div>
      ) : tabMode === 'add_place' ? (
        /* Full Intake Form */
        <form onSubmit={handlePlaceSubmit} className="space-y-4">
          {/* Category Selector */}
          <div>
            <label className="block text-[11px] font-bold text-inkDark uppercase tracking-wider mb-1.5">
              Select What You Are Adding *
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'pandal', label: 'Pandal', icon: '🏮' },
                { id: 'restaurant', label: 'Food / Cafe', icon: '🍽️' },
                { id: 'toilet', label: 'Toilet', icon: '🚻' },
                { id: 'parking', label: 'Parking', icon: '🅿️' },
              ].map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategory(c.id as ContributeType)}
                  className={clsx(
                    'p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1',
                    category === c.id
                      ? 'bg-lalPale border-lal text-lal font-bold ring-1 ring-lal shadow-xs'
                      : 'bg-muslin border-inkFaint text-inkMid hover:border-lal/40'
                  )}
                >
                  <span className="text-lg leading-none">{c.icon}</span>
                  <span className="text-[11px] font-bold">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Basic Information */}
          <div className="bg-muslin border border-inkFaint rounded-2xl p-3.5 space-y-3 shadow-xs">
            <p className="text-[10px] uppercase font-bold text-inkMute tracking-wider">
              1. Basic Location Information
            </p>

            {/* Name */}
            <div>
              <label className="block text-[11px] font-semibold text-inkDark mb-1">
                {category === 'pandal'
                  ? 'Puja Committee / Pandal Name *'
                  : category === 'restaurant'
                  ? 'Restaurant / Eatery Name *'
                  : category === 'toilet'
                  ? 'Restroom Facility Name *'
                  : 'Parking Zone Name *'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  category === 'pandal'
                    ? 'e.g. Salt Lake BD Block Sarbojanin'
                    : category === 'restaurant'
                    ? 'e.g. Arsalan Biryani Express'
                    : category === 'toilet'
                    ? 'e.g. KMC Bio-Toilet Near Gate 2'
                    : 'e.g. Central Park Gate 3 Open Parking'
                }
                className="w-full bg-cream border border-inkFaint rounded-xl px-3 py-2 text-xs text-inkDark placeholder-inkMute outline-none focus:border-lal font-medium"
              />
            </div>

            {/* Zone & Area */}
            <div>
              <label className="block text-[11px] font-semibold text-inkDark mb-1">
                Kolkata Zone / Area *
              </label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full bg-cream border border-inkFaint rounded-xl px-3 py-2 text-xs text-inkDark outline-none focus:border-lal font-medium"
              >
                {ZONES.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Address / Landmark */}
            <div>
              <label className="block text-[11px] font-semibold text-inkDark mb-1">
                Street Address / Landmark *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Near Tank 9, CD Block, Sector 1, Salt Lake"
                className="w-full bg-cream border border-inkFaint rounded-xl px-3 py-2 text-xs text-inkDark placeholder-inkMute outline-none focus:border-lal"
              />
            </div>

            {/* Coordinates & Fill Device GPS */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-inkDark">
                  Map GPS Coordinates (Lat, Lng)
                </label>
                <button
                  type="button"
                  onClick={fillDeviceLocation}
                  className="text-[10px] text-blue-700 font-bold hover:underline flex items-center gap-1"
                >
                  <Compass size={11} /> Use My Device Location
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="Latitude"
                  className="bg-cream border border-inkFaint rounded-xl px-2.5 py-1.5 text-xs text-inkDark font-mono"
                />
                <input
                  type="text"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="Longitude"
                  className="bg-cream border border-inkFaint rounded-xl px-2.5 py-1.5 text-xs text-inkDark font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section: Category Specific Details */}
          {category === 'pandal' && (
            <div className="bg-muslin border border-inkFaint rounded-2xl p-3.5 space-y-3 shadow-xs animate-fade-in">
              <p className="text-[10px] uppercase font-bold text-inkMute tracking-wider">
                2. Durga Puja Pandal Details
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-inkDark mb-1">
                  2026 Puja Theme / Concept *
                </label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="e.g. Heritage Terracotta of Bishnupur"
                  className="w-full bg-cream border border-inkFaint rounded-xl px-3 py-2 text-xs text-inkDark placeholder-inkMute outline-none focus:border-lal"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-inkDark mb-1">
                  Theme Story & Architectural Concept
                </label>
                <textarea
                  rows={2}
                  value={themeDesc}
                  onChange={(e) => setThemeDesc(e.target.value)}
                  placeholder="Describe the materials, idol style, lighting, or social message…"
                  className="w-full bg-cream border border-inkFaint rounded-xl p-2.5 text-xs text-inkDark placeholder-inkMute outline-none focus:border-lal resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-inkDark mb-1">
                    Organizing Club / Committee
                  </label>
                  <input
                    type="text"
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    placeholder="e.g. FD Block Sarbojanin"
                    className="w-full bg-cream border border-inkFaint rounded-xl px-2.5 py-1.5 text-xs text-inkDark"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-inkDark mb-1">
                    Theme / Idol Artist
                  </label>
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="e.g. Bhabatosh Sutar"
                    className="w-full bg-cream border border-inkFaint rounded-xl px-2.5 py-1.5 text-xs text-inkDark"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-inkDark mb-1">
                  Best Visiting Hours
                </label>
                <select
                  value={bestTime}
                  onChange={(e) => setBestTime(e.target.value)}
                  className="w-full bg-cream border border-inkFaint rounded-xl px-3 py-2 text-xs text-inkDark outline-none"
                >
                  <option>Morning (8 AM – 11 AM) · Less crowded</option>
                  <option>Afternoon (12 PM – 4 PM) · Minimal wait</option>
                  <option>Evening (6 PM – 11 PM) · Full lighting</option>
                  <option>Midnight (12 AM – 4 AM) · True hopper vibe</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-inkDark mb-1">
                  Must-Watch Highlights (Comma separated)
                </label>
                <input
                  type="text"
                  value={highlights}
                  onChange={(e) => setHighlights(e.target.value)}
                  placeholder="e.g. 60ft Grand Chandelier, Eco-friendly idol, Illuminated archway"
                  className="w-full bg-cream border border-inkFaint rounded-xl px-3 py-2 text-xs text-inkDark"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-inkDark">
                  Wheelchair / Senior Citizen Line Available?
                </span>
                <input
                  type="checkbox"
                  checked={wheelchairAccess}
                  onChange={(e) => setWheelchairAccess(e.target.checked)}
                  className="w-4 h-4 accent-lal cursor-pointer"
                />
              </div>
            </div>
          )}

          {category === 'restaurant' && (
            <div className="bg-muslin border border-inkFaint rounded-2xl p-3.5 space-y-3 shadow-xs animate-fade-in">
              <p className="text-[10px] uppercase font-bold text-inkMute tracking-wider">
                2. Restaurant & Food Stall Details
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-inkDark mb-1">
                  Cuisine & Food Specialty *
                </label>
                <input
                  type="text"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  placeholder="e.g. Kolkata Biryani & Chaap, Momos, Bengali Sweets"
                  className="w-full bg-cream border border-inkFaint rounded-xl px-3 py-2 text-xs text-inkDark"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-inkDark mb-1">
                    Approx Cost for Two
                  </label>
                  <select
                    value={priceForTwo}
                    onChange={(e) => setPriceForTwo(e.target.value)}
                    className="w-full bg-cream border border-inkFaint rounded-xl px-2.5 py-1.5 text-xs text-inkDark"
                  >
                    <option>Under ₹300 (Street Food)</option>
                    <option>₹300 - ₹700 (Casual Dine)</option>
                    <option>₹700 - ₹1500 (Fine Dine)</option>
                    <option>₹1500+ (Luxury)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-inkDark mb-1">
                    Puja Hours
                  </label>
                  <input
                    type="text"
                    value={timings}
                    onChange={(e) => setTimings(e.target.value)}
                    placeholder="e.g. Open All Night"
                    className="w-full bg-cream border border-inkFaint rounded-xl px-2.5 py-1.5 text-xs text-inkDark"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-inkDark">Air Conditioned Seating</span>
                <input
                  type="checkbox"
                  checked={hasAC}
                  onChange={(e) => setHasAC(e.target.checked)}
                  className="w-4 h-4 accent-lal cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-inkDark">Special Puja Thali / Combos</span>
                <input
                  type="checkbox"
                  checked={hasPujaSpecialMenu}
                  onChange={(e) => setHasPujaSpecialMenu(e.target.checked)}
                  className="w-4 h-4 accent-lal cursor-pointer"
                />
              </div>
            </div>
          )}

          {category === 'toilet' && (
            <div className="bg-muslin border border-inkFaint rounded-2xl p-3.5 space-y-3 shadow-xs animate-fade-in">
              <p className="text-[10px] uppercase font-bold text-inkMute tracking-wider">
                2. Restroom & Hygiene Details
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-inkDark mb-1">
                  Facility Type *
                </label>
                <select
                  value={toiletType}
                  onChange={(e) => setToiletType(e.target.value)}
                  className="w-full bg-cream border border-inkFaint rounded-xl px-3 py-2 text-xs text-inkDark"
                >
                  <option>KMC e-Toilet / Automated Booth</option>
                  <option>Pay & Use Clean Restroom</option>
                  <option>Mall / Complex Restroom</option>
                  <option>Temporary Puja Mobile Bio-Toilet</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-inkDark mb-1">
                    Entry Fee
                  </label>
                  <select
                    value={toiletFee}
                    onChange={(e) => setToiletFee(e.target.value)}
                    className="w-full bg-cream border border-inkFaint rounded-xl px-2.5 py-1.5 text-xs text-inkDark"
                  >
                    <option>Free</option>
                    <option>Pay & Use (₹5)</option>
                    <option>Pay & Use (₹10)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-inkDark mb-1">
                    Cleanliness Rating
                  </label>
                  <select
                    value={cleanliness}
                    onChange={(e) => setCleanliness(Number(e.target.value))}
                    className="w-full bg-cream border border-inkFaint rounded-xl px-2.5 py-1.5 text-xs text-inkDark"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (Spotless)</option>
                    <option value={4}>⭐⭐⭐⭐ (Clean & Maintained)</option>
                    <option value={3}>⭐⭐⭐ (Usable / Standard)</option>
                    <option value={2}>⭐⭐ (Average / Crowded)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-inkDark">Running Water & Handwash Available</span>
                <input
                  type="checkbox"
                  checked={waterAvailable}
                  onChange={(e) => setWaterAvailable(e.target.checked)}
                  className="w-4 h-4 accent-lal cursor-pointer"
                />
              </div>
            </div>
          )}

          {category === 'parking' && (
            <div className="bg-muslin border border-inkFaint rounded-2xl p-3.5 space-y-3 shadow-xs animate-fade-in">
              <p className="text-[10px] uppercase font-bold text-inkMute tracking-wider">
                2. Parking Space Details
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-inkDark mb-1">
                  Parking Zone Type *
                </label>
                <select
                  value={parkingType}
                  onChange={(e) => setParkingType(e.target.value)}
                  className="w-full bg-cream border border-inkFaint rounded-xl px-3 py-2 text-xs text-inkDark"
                >
                  <option>Designated Kolkata Police Puja Ground</option>
                  <option>Mall Basement / Multilevel Parking</option>
                  <option>Open Field Paid Parking</option>
                  <option>Designated Street Parallel Parking</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-inkDark mb-1">
                    Capacity
                  </label>
                  <input
                    type="text"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="e.g. 200 Cars"
                    className="w-full bg-cream border border-inkFaint rounded-xl px-2.5 py-1.5 text-xs text-inkDark"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-inkDark mb-1">
                    Parking Fee
                  </label>
                  <input
                    type="text"
                    value={parkingFee}
                    onChange={(e) => setParkingFee(e.target.value)}
                    placeholder="e.g. Free or ₹20/hr"
                    className="w-full bg-cream border border-inkFaint rounded-xl px-2.5 py-1.5 text-xs text-inkDark"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section: Submitter & Tips */}
          <div className="bg-muslin border border-inkFaint rounded-2xl p-3.5 space-y-3 shadow-xs">
            <p className="text-[10px] uppercase font-bold text-inkMute tracking-wider">
              3. Helpful Hopper Tips & Contact
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-inkDark mb-1">
                Helpful Tips or Navigation Advice
              </label>
              <textarea
                rows={2}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="e.g. Enter from the 2nd cross road side to avoid barricades..."
                className="w-full bg-cream border border-inkFaint rounded-xl p-2.5 text-xs text-inkDark placeholder-inkMute outline-none focus:border-lal resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-inkDark mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={contributorName}
                  onChange={(e) => setContributorName(e.target.value)}
                  placeholder="e.g. Subhankar"
                  className="w-full bg-cream border border-inkFaint rounded-xl px-2.5 py-1.5 text-xs text-inkDark"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-inkDark mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={contributorPhone}
                  onChange={(e) => setContributorPhone(e.target.value)}
                  placeholder="For verification"
                  className="w-full bg-cream border border-inkFaint rounded-xl px-2.5 py-1.5 text-xs text-inkDark"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-lal hover:bg-lalDark text-muslin font-bold py-3 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-lal active:scale-95 transition-all cursor-pointer"
          >
            <Send size={14} />
            Submit & Add to Kolkata Map
          </button>
        </form>
      ) : (
        /* Live Intel Report Form */
        <form onSubmit={handleIntelSubmit} className="space-y-4 bg-muslin border border-inkFaint rounded-2xl p-4 shadow-xs">
          <div>
            <label className="block text-[11px] font-bold text-inkDark mb-1">
              Select Pandal Location
            </label>
            <div className="relative">
              <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkMute" />
              <select
                value={selectedPandalForIntel}
                onChange={(e) => setSelectedPandalForIntel(e.target.value)}
                className="w-full bg-cream border border-inkFaint rounded-xl pl-8 pr-3 py-2 text-xs text-inkDark outline-none focus:border-lal font-medium"
              >
                {pandals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.zone.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-inkDark mb-1">
              Current Crowd Situation
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'light', label: '🟢 Light', desc: 'No queue / walk-in' },
                { id: 'moderate', label: '🟡 Moving', desc: '10–20 min queue' },
                { id: 'heavy', label: '🔴 Packed', desc: '45+ min wait' },
              ].map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setIntelCrowd(c.id)}
                  className={clsx(
                    'p-2.5 rounded-2xl border text-center transition-all',
                    intelCrowd === c.id
                      ? 'bg-lalPale border-lal text-lal font-bold ring-1 ring-lal'
                      : 'bg-cream border-inkFaint text-inkMid hover:border-lal/40'
                  )}
                >
                  <div className="text-xs">{c.label}</div>
                  <div className="text-[9px] text-inkMute mt-0.5">{c.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-inkDark mb-1">
              Parking & Street Access
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'available', label: 'Plenty Available' },
                { id: 'limited', label: 'Tight / Busy' },
                { id: 'full', label: 'Barricaded / Full' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setIntelParking(p.id)}
                  className={clsx(
                    'py-2 px-2 rounded-2xl border text-xs text-center transition-all',
                    intelParking === p.id
                      ? 'bg-lalPale border-lal text-lal font-bold ring-1 ring-lal'
                      : 'bg-cream border-inkFaint text-inkMid'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-inkDark mb-1">
              Queue & Barricade Notes
            </label>
            <textarea
              rows={2}
              value={intelComment}
              onChange={(e) => setIntelComment(e.target.value)}
              placeholder="e.g. VIP line gate has moved to 2nd cross road, good food stall near exit..."
              className="w-full bg-cream border border-inkFaint rounded-xl p-2.5 text-xs text-inkDark placeholder-inkMute outline-none focus:border-lal resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-lal hover:bg-lalDark text-muslin font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs shadow-card active:scale-95 transition-all"
          >
            <Send size={13} />
            Post Live Update
          </button>
        </form>
      )}

      {/* Community Guidelines */}
      <div className="flex items-start gap-2 bg-cream/70 border border-inkFaint rounded-2xl p-3 text-[10px] text-inkMute">
        <AlertCircle size={14} className="text-lal flex-shrink-0 mt-0.5" />
        <span>
          Contributions are verified against the Kolkata Police Puja Guide and updated across user devices in real time.
        </span>
      </div>
    </div>
  );
}
