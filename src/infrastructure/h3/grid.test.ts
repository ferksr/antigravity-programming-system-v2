import { describe, expect, it } from 'vitest'
import { generateH3Grid } from './grid'
import type { QuadrilateralZone } from '../../domain/spatial/types'

describe('generateH3Grid', () => {
  it('should generate valid GeoJSON coordinates [lng, lat] and candidate points', () => {
    const DEFAULT_ZONE: QuadrilateralZone = [
      { lat: -34.5800, lng: -58.4100 }, // NW
      { lat: -34.5800, lng: -58.3800 }, // NE
      { lat: -34.6050, lng: -58.3800 }, // SE
      { lat: -34.6050, lng: -58.4100 }, // SW
    ]

    const result = generateH3Grid(DEFAULT_ZONE, { resolution: 8 })

    expect(result.hexagonsGeoJSON.features.length).toBeGreaterThan(0)
    expect(result.candidates.length).toBe(result.hexagonsGeoJSON.features.length)

    // Verificar las coordenadas de la primera feature GeoJSON
    const firstPolyCoords = result.hexagonsGeoJSON.features[0].geometry.coordinates[0][0]
    // GeoJSON [lng, lat]: lng debe ser aprox -58.xx y lat debe ser aprox -34.xx
    expect(firstPolyCoords[0]).toBeLessThan(-50) // Longitud (lng)
    expect(firstPolyCoords[1]).toBeGreaterThan(-40) // Latitud (lat)

    // Verificar candidatos: lat ~ -34.xx, lng ~ -58.xx
    const cand = result.candidates[0]
    expect(cand.lat).toBeLessThan(-30)
    expect(cand.lng).toBeLessThan(-50)
  })
})
