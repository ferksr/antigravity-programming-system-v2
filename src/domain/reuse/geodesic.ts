/**
 * Geodesic distance calculation module (Section 6 of ideas.md).
 * Uses the Haversine formula to compute geodesic distance in meters
 * between two (lat, lng) points on Earth.
 */

const EARTH_RADIUS_METERS = 6371000

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * Computes the geodesic distance in meters between two geographical points.
 *
 * @param lat1 Latitude of point 1 in degrees
 * @param lng1 Longitude of point 1 in degrees
 * @param lat2 Latitude of point 2 in degrees
 * @param lng2 Longitude of point 2 in degrees
 * @returns Geodesic distance in meters
 */
export function calculateGeodesicDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)

  const radLat1 = toRadians(lat1)
  const radLat2 = toRadians(lat2)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(radLat1) * Math.cos(radLat2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_METERS * c
}
