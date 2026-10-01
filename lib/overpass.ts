import { OverpassNode, LayerType } from './types';

// Overpass API supports CORS — call directly from the browser
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

const QUERY_MAP: Record<LayerType, string> = {
  food:    '"amenity"~"restaurant|cafe|fast_food|dhaba|food_court"',
  toilet:  '"amenity"="toilets"',
  parking: '"amenity"="parking"',
};

function buildQuery(type: LayerType, lat: number, lng: number, radius: number): string {
  return `[out:json][timeout:20];(node[${QUERY_MAP[type]}](around:${radius},${lat},${lng});way[${QUERY_MAP[type]}](around:${radius},${lat},${lng}););out center;`;
}

export async function fetchOverpassNodes(
  type: LayerType,
  lat: number,
  lng: number,
  radius = 800
): Promise<OverpassNode[]> {
  const query = buildQuery(type, lat, lng, radius);

  // Manual timeout — AbortSignal.timeout not available in all environments
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);

  try {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);

    const data = await res.json();
    return (data.elements as any[])
      .map((el) => ({
        id:   el.id,
        lat:  el.lat  ?? el.center?.lat,
        lon:  el.lon  ?? el.center?.lon,
        tags: el.tags ?? {},
        type,
      }))
      .filter((el) => el.lat != null && el.lon != null)
      .slice(0, 80);
  } catch (err) {
    clearTimeout(timer);
    console.warn(`[Overpass] ${type} fetch failed:`, err);
    return [];
  }
}

export function nodeLabel(node: OverpassNode): string {
  const t = node.tags;
  return (
    t.name ??
    t['name:en'] ??
    (node.type === 'food' ? 'Food' : node.type === 'toilet' ? 'Toilet' : 'Parking')
  );
}
