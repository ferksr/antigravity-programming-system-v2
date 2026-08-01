import * as h3 from 'h3-js'
import type { Feature, Polygon } from 'geojson'
import type { QuadrilateralZone, H3GridConfig, GeneratedGrid, CandidatePoint } from '../../domain/spatial/types'

/**
 * Genera la grilla de hexágonos H3 y los puntos candidatos centroides dentro de un cuadrilátero.
 */
export function generateH3Grid(zone: QuadrilateralZone, config: H3GridConfig): GeneratedGrid {
  // h3.polygonToCells requiere coordenadas en formato [lat, lng]
  const polygonCoordinates: [number, number][] = zone.map((point) => [point.lat, point.lng])
  polygonCoordinates.push([zone[0].lat, zone[0].lng])

  let h3Indexes: string[] = []
  try {
    h3Indexes = h3.polygonToCells(polygonCoordinates, config.resolution)
  } catch (e) {
    console.error('Error al generar celdas H3:', e)
  }

  const features: Feature<Polygon>[] = []
  const candidates: CandidatePoint[] = []

  h3Indexes.forEach((h3Index) => {
    // cellToBoundary(h3Index, true) devuelve array de [lng, lat] directo para GeoJSON
    const boundaryGeoJson = h3.cellToBoundary(h3Index, true)
    
    // Asegurar que el anillo GeoJSON se cierre repitiendo el primer punto
    const closedCoordinates = [...boundaryGeoJson, boundaryGeoJson[0]]

    features.push({
      type: 'Feature',
      properties: { h3Index },
      geometry: {
        type: 'Polygon',
        coordinates: [closedCoordinates],
      },
    })

    // cellToLatLng devuelve [lat, lng]
    const [lat, lng] = h3.cellToLatLng(h3Index)
    candidates.push({
      id: `cand-${h3Index}`,
      h3Index,
      lat,
      lng,
    })
  })

  return {
    hexagonsGeoJSON: {
      type: 'FeatureCollection',
      features,
    },
    candidates,
  }
}
