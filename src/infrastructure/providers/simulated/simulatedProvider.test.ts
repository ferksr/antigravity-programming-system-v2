import { describe, expect, it } from 'vitest'
import { simulatedRoutingProvider } from './SimulatedRoutingProvider'

describe('SimulatedRoutingProvider', () => {
  it('estimates travel time for WALKING mode', () => {
    // Distance ~1 km (-34.59 to -34.599 is ~1 km)
    const result = simulatedRoutingProvider.estimateRoute({
      originLat: -34.59,
      originLng: -58.40,
      destinationLat: -34.599,
      destinationLng: -58.40,
      travelMode: 'WALKING',
    })

    expect(result.provider).toBe('SIMULATED')
    expect(result.distanceMeters).toBeGreaterThan(900)
    expect(result.distanceMeters).toBeLessThan(1100)
    // 1 km * 12 min/km + 1 min overhead ≈ 13 min
    expect(result.durationMinutes).toBeGreaterThanOrEqual(10)
    expect(result.durationMinutes).toBeLessThanOrEqual(15)
  })

  it('estimates faster travel time for DRIVING mode compared to WALKING', () => {
    const walkResult = simulatedRoutingProvider.estimateRoute({
      originLat: -34.59,
      originLng: -58.40,
      destinationLat: -34.64,
      destinationLng: -58.40,
      travelMode: 'WALKING',
    })

    const driveResult = simulatedRoutingProvider.estimateRoute({
      originLat: -34.59,
      originLng: -58.40,
      destinationLat: -34.64,
      destinationLng: -58.40,
      travelMode: 'DRIVING',
    })

    expect(driveResult.durationMinutes).toBeLessThan(walkResult.durationMinutes)
  })
})
