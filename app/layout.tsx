import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PujoHopper 🏮 — Kolkata Pandal Guide',
  description: "Navigate Kolkata's Durga Puja with live crowd heatmaps, pandal themes, food spots, toilets, parking, and route planning.",
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'PujoHopper' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#B5002E',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="bg-muslin text-inkDark overflow-hidden">{children}</body>
    </html>
  );
}
