/**
 * Encodes an array of [lat, lng] coordinates into a Google Encoded Polyline string.
 */
export function encodePolyline(coordinates: [number, number][], precision = 5): string {
  const factor = Math.pow(10, precision);
  let output = '';
  let prevLat = 0;
  let prevLng = 0;

  for (const [lat, lng] of coordinates) {
    const late = Math.round(lat * factor);
    const lnge = Math.round(lng * factor);
    output += encodePoint(late - prevLat);
    output += encodePoint(lnge - prevLng);
    prevLat = late;
    prevLng = lnge;
  }
  return output;
}

function encodePoint(current: number): string {
  let v = current < 0 ? ~(current << 1) : current << 1;
  let output = '';
  while (v >= 0x20) {
    output += String.fromCharCode((0x20 | (v & 0x1f)) + 63);
    v >>= 5;
  }
  output += String.fromCharCode(v + 63);
  return output;
}

/**
 * Decodes a Google Encoded Polyline string into an array of [lat, lng] coordinates.
 */
export function decodePolyline(str: string, precision = 5): [number, number][] {
  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates: [number, number][] = [];
  let shift = 0;
  let result = 0;
  let byte: number | null = null;
  const factor = Math.pow(10, precision);

  while (index < str.length) {
    byte = null;
    shift = 0;
    result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    coordinates.push([lat / factor, lng / factor]);
  }

  return coordinates;
}
