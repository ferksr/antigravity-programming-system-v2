import { useState, useMemo } from 'react'
import { MapContainer } from './components/MapContainer'
import { ZoneControls } from './components/ZoneControls'
import type { QuadrilateralZone } from './domain/spatial/types'
import { generateH3Grid } from './infrastructure/h3/grid'

// Zona predeterminada inicial en Buenos Aires (Palermo / Recoleta)
const DEFAULT_ZONE: QuadrilateralZone = [
  { lat: -34.5800, lng: -58.4100 }, // NW
  { lat: -34.5800, lng: -58.3800 }, // NE
  { lat: -34.6050, lng: -58.3800 }, // SE
  { lat: -34.6050, lng: -58.4100 }, // SW
]

export function App() {
  const [zone, setZone] = useState<QuadrilateralZone>(DEFAULT_ZONE)
  const [resolution, setResolution] = useState<number>(8)

  // Generación reactiva e instantánea de la grilla H3 local-first
  const grid = useMemo(() => {
    return generateH3Grid(zone, { resolution })
  }, [zone, resolution])

  const handleResetZone = () => {
    setZone(DEFAULT_ZONE)
    setResolution(8)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <ZoneControls
        resolution={resolution}
        onResolutionChange={setResolution}
        totalHexagons={grid.hexagonsGeoJSON.features.length}
        totalCandidates={grid.candidates.length}
        onResetZone={handleResetZone}
      />
      <MapContainer zone={zone} onZoneChange={setZone} grid={grid} />
    </div>
  )
}

export default App
