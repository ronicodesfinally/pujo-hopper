import { NextRequest, NextResponse } from 'next/server';

// Proxy to avoid CORS issues with Overpass API from the browser
export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Missing query' }, { status: 400 });
    }

    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(20_000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Overpass API error' }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[overpass proxy]', err);
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}
