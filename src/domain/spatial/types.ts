import type { FeatureCollection, Polygon } from 'geojson'

export interface LatLng {
  lat: number
  lng: number
}

// Representa un cuadrilátero definido por 4 puntos [NW, NE, SE, SW]
export type QuadrilateralZone = [LatLng, LatLng, LatLng, LatLng]

export interface CandidatePoint {
  id: string
  h3Index: string
  lat: number
  lng: number
}

export interface H3GridConfig {
  resolution: number // Rango 6 a 10 (típicamente 7 u 8 para ciudad)
}

export interface GeneratedGrid {
  hexagonsGeoJSON: FeatureCollection<Polygon>
  candidates: CandidatePoint[]
}
