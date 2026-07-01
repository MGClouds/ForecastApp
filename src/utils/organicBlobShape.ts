/**
 * Procedurally generates an irregular, "radar-like" polygon outline for a
 * weather overlay blob instead of a perfectly round circle. The outline is
 * deterministic per `seedId` (e.g. the blob's id) so the same blob keeps a
 * visually stable silhouette across animation frames - only its center,
 * size, and opacity move/change via interpolation, not its jittered shape.
 */

/** Simple string hash (djb2-ish) used to seed the PRNG deterministically. */
function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

/** Mulberry32 - small, fast, deterministic PRNG from a numeric seed. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const METERS_PER_DEGREE_LAT = 111320;

function metersToLatLngOffset(lat: number, dx: number, dy: number): { dLat: number; dLng: number } {
  const metersPerDegreeLng = METERS_PER_DEGREE_LAT * Math.cos((lat * Math.PI) / 180) || 1;
  return { dLat: dy / METERS_PER_DEGREE_LAT, dLng: dx / metersPerDegreeLng };
}

/**
 * Smooths a closed polygon using Catmull-Rom spline interpolation, turning a
 * handful of jittered anchor points into a much denser, gently curved
 * outline (soft/organic edges rather than sharp polygon corners).
 */
function catmullRomSmoothClosed(points: [number, number][], segmentsPerPoint: number): [number, number][] {
  const n = points.length;
  if (n < 3) return points;
  const result: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    for (let s = 0; s < segmentsPerPoint; s++) {
      const t = s / segmentsPerPoint;
      const t2 = t * t;
      const t3 = t2 * t;
      const lat =
        0.5 *
        (2 * p1[0] +
          (-p0[0] + p2[0]) * t +
          (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
          (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
      const lng =
        0.5 *
        (2 * p1[1] +
          (-p0[1] + p2[1]) * t +
          (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
          (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
      result.push([lat, lng]);
    }
  }
  return result;
}

/**
 * Generates a closed, organically-jittered polygon outline (as Leaflet
 * `[lat, lng]` tuples) roughly centered at `(lat, lng)` with an average
 * radius of `radiusMeters`. The shape is seeded by `seedId` so it stays
 * stable/consistent for the same blob identity across frames, and
 * `radiusScale` lets callers derive a slightly larger/smaller companion ring
 * (used for a soft, faux-blurred outer edge).
 */
export function generateOrganicBlobOutline(
  lat: number,
  lng: number,
  radiusMeters: number,
  seedId: string,
  radiusScale: number = 1
): [number, number][] {
  const anchorCount = 12;
  const rand = mulberry32(hashString(seedId));

  const anchors: [number, number][] = [];
  for (let i = 0; i < anchorCount; i++) {
    const angle = (i / anchorCount) * Math.PI * 2;
    // +/-30% jitter per anchor point, deterministic per seedId so the shape
    // doesn't re-randomize every render.
    const jitter = 0.7 + rand() * 0.6;
    const r = radiusMeters * radiusScale * jitter;
    const dx = Math.cos(angle) * r;
    const dy = Math.sin(angle) * r;
    const { dLat, dLng } = metersToLatLngOffset(lat, dx, dy);
    anchors.push([lat + dLat, lng + dLng]);
  }

  return catmullRomSmoothClosed(anchors, 6);
}
