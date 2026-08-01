import { calculateGeodesicDistanceMeters } from '../../../domain/reuse/geodesic'
import type { TravelMode } from '../../../domain/evaluation/types'

export interface RouteEstimationRequest {
  readonly originLat: number
  readonly originLng: number
  readonly destinationLat: number
  readonly destinationLng: number
  readonly travelMode: TravelMode
}

export interface RouteEstimationResult {
  readonly distanceMeters: number
  readonly durationMinutes: number
  readonly provider: 'SIMULATED'
}

/**
 * Average speeds and overheads by travel mode:
 * - WALKING: ~5 km/h (12 min/km)
 * - BICYCLING: ~15 km/h (4 min/km + 2m overhead)
 * - TRANSIT: ~20 km/h (3 min/km + 5m wait/transfer overhead)
 * - DRIVING: ~30 km/h (2 min/km + 3m traffic/parking overhead)
 */
const TRAVEL_MODE_SPEEDS: Record<TravelMode, { minPerKm: number; overheadMin: number }> = {
  WALKING: { minPerKm: 12, overheadMin: 1 },
  BICYCLING: { minPerKm: 4, overheadMin: 2 },
  TRANSIT: { minPerKm: 3, overheadMin: 5 },
  DRIVING: { minPerKm: 2, overheadMin: 3 },
}

/**
 * Local simulated routing provider.
 * Computes realistic estimated travel times based on geodesic distance,
 * transport mode speeds, and fixed overheads.
 */
export class SimulatedRoutingProvider {
  /**
   * Estimates route travel time in minutes.
   */
  estimateRoute(request: RouteEstimationRequest): RouteEstimationResult {
    const distanceMeters = calculateGeodesicDistanceMeters(
      request.originLat,
      request.originLng,
      request.destinationLat,
      request.destinationLng
    )

    const distanceKm = distanceMeters / 1000
    const profile = TRAVEL_MODE_SPEEDS[request.travelMode] ?? TRAVEL_MODE_SPEEDS.DRIVING

    // Calculate time in minutes
    const durationMinutes = Math.max(1, Math.round(distanceKm * profile.minPerKm + profile.overheadMin))

    return {
      distanceMeters: Math.round(distanceMeters),
      durationMinutes,
      provider: 'SIMULATED',
    }
  }
}

export const simulatedRoutingProvider = new SimulatedRoutingProvider()
