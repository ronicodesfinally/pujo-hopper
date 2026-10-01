import dynamic from 'next/dynamic';

// Leaflet must be client-side only — never SSR
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-muslin">
      <div className="text-5xl mb-3 animate-bounce">🏮</div>
      <p className="text-lal text-xl font-bold tracking-tight">PujoHopper</p>
      <p className="text-inkMute text-xs mt-1">Loading Kolkata Durga Puja map…</p>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="fixed inset-0 overflow-hidden bg-muslin">
      <MapView />
    </main>
  );
}
