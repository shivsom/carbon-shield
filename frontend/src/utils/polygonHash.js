import { ethers } from "ethers";

/**
 * Normalize coordinates for consistent hashing: round to 6 decimals and sort
 * so that same polygon in different vertex order yields same hash.
 * @param coordinates - Array of [lng, lat] pairs (GeoJSON order)
 * @returns Normalized array
 */
export function normalizeCoordinates(coordinates) {
  const rounded = coordinates.map(([lng, lat]) => [
    Math.round(lng * 1e6) / 1e6,
    Math.round(lat * 1e6) / 1e6,
  ]);
  const centroid = [
    rounded.reduce((s, p) => s + p[0], 0) / rounded.length,
    rounded.reduce((s, p) => s + p[1], 0) / rounded.length,
  ];
  const sorted = [...rounded].sort((a, b) => {
    const angleA = Math.atan2(a[1] - centroid[1], a[0] - centroid[0]);
    const angleB = Math.atan2(b[1] - centroid[1], b[0] - centroid[0]);
    return angleA - angleB;
  });
  return sorted;
}

/**
 * Compute keccak256 hash of polygon for on-chain storage and duplicate check.
 * Uses normalized coordinates stringified.
 */
export function polygonToHash(coordinates) {
  const norm = normalizeCoordinates(coordinates);
  const str = JSON.stringify(norm);
  return ethers.keccak256(ethers.toUtf8Bytes(str));
}
