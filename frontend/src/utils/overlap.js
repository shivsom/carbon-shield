/**
 * Polygon overlap detection using turf.js.
 * Reject if new polygon overlaps existing polygons by more than 5%.
 */

import * as turf from "@turf/turf";

const MAX_OVERLAP_RATIO = 0.05; // 5%

/**
 * Convert Leaflet latlngs to GeoJSON Polygon coordinates (lng, lat).
 * @param latlngs - Array of {lat, lng} from Leaflet
 */
export function latlngsToGeoJSON(latlngs) {
  const ring = latlngs.map((ll) => [ll.lng, ll.lat]);
  if (ring.length < 3) return null;
  if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
    ring.push(ring[0]);
  }
  return turf.polygon([ring]);
}

/**
 * Check if newPolygon overlaps any of existingPolygons by more than MAX_OVERLAP_RATIO.
 * @param newPolygon - turf Polygon
 * @param existingPolygons - Array of turf Polygons (from existing land parcels)
 * @returns { allowed: boolean, overlapRatio: number, message: string }
 */
export function checkOverlap(newPolygon, existingPolygons) {
  const newArea = turf.area(newPolygon);
  if (newArea < 1e-6) {
    return { allowed: false, overlapRatio: 0, message: "Polygon area too small." };
  }

  let totalOverlapArea = 0;
  for (const existing of existingPolygons) {
    try {
      const intersection = turf.intersect(newPolygon, existing);
      if (intersection) totalOverlapArea += turf.area(intersection);
    } catch (_) {
      // No intersection or invalid geometry
    }
  }

  const overlapRatio = totalOverlapArea / newArea;
  const allowed = overlapRatio <= MAX_OVERLAP_RATIO;
  return {
    allowed,
    overlapRatio,
    message: allowed
      ? `Overlap ${(overlapRatio * 100).toFixed(2)}% – within limit.`
      : `Overlap ${(overlapRatio * 100).toFixed(2)}% exceeds 5% limit. Choose a different area.`,
  };
}
