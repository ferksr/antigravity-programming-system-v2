import { useState, useMemo } from 'react'
import { MapContainer } from './components/MapContainer'
import { ZoneControls } from './components/ZoneControls'
import { CriteriaConfigPanel } from './components/CriteriaConfigPanel'
import { RankingPanel } from './components/RankingPanel'
import { CandidateDetail } from './components/CandidateDetail'
import { AuditLogViewer } from './components/AuditLogViewer'
import type { QuadrilateralZone } from './domain/spatial/types'
import type { CandidateEvaluationResult, Criterion, Destination } from './domain/evaluation/types'
import { generateH3Grid } from './infrastructure/h3/grid'
import { evaluationRunner } from './application/evaluation/EvaluationRunner'

// Zona predeterminada inicial en Buenos Aires (Palermo / Recoleta)
const DEFAULT_ZONE: QuadrilateralZone = [
  { lat: -34.5800, lng: -58.4100 }, // NW
  { lat: -34.5800, lng: -58.3800 }, // NE
  { lat: -34.6050, lng: -58.3800 }, // SE
  { lat: -34.6050, lng: -58.4100 }, // SW
]

// Destinos de ejemplo iniciales para probar con 1-click
const INITIAL_DESTINATIONS: Destination[] = [
  { id: 'dest-work', name: 'Trabajo (Centro)', lat: -34.6037, lng: -58.3816 },
  { id: 'dest-park', name: 'Parque Las Heras', lat: -34.5847, lng: -58.4081 },
]

const INITIAL_CRITERIA: Criterion[] = [
  { id: 'crit-work', destinationId: 'dest-work', travelMode: 'TRANSIT', direction: 'LOWER_IS_BETTER', weight: 4 },
  { id: 'crit-park', destinationId: 'dest-park', travelMode: 'WALKING', direction: 'LOWER_IS_BETTER', weight: 2 },
]

export function App() {
  const [zone, setZone] = useState<QuadrilateralZone>(DEFAULT_ZONE)
  const [resolution, setResolution] = useState<number>(8)

  const [destinations, setDestinations] = useState<Destination[]>(INITIAL_DESTINATIONS)
  const [criteria, setCriteria] = useState<Criterion[]>(INITIAL_CRITERIA)
  const [penaltySlider, setPenaltySlider] = useState<number>(30)

  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluationResults, setEvaluationResults] = useState<CandidateEvaluationResult[]>([])
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null)

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isLogViewerOpen, setIsLogViewerOpen] = useState(true)

  // Generación reactiva e instantánea de la grilla H3 local-first
  const grid = useMemo(() => {
    return generateH3Grid(zone, { resolution })
  }, [zone, resolution])

  const destinationsMap = useMemo(() => {
    const map: Record<string, Destination> = {}
    destinations.forEach((d) => { map[d.id] = d })
    return map
  }, [destinations])

  const handleResetZone = () => {
    setZone(DEFAULT_ZONE)
    setResolution(8)
  }

  const handleRunEvaluation = async () => {
    setIsEvaluating(true)
    try {
      const result = await evaluationRunner.run({
        zone,
        candidates: grid.candidates,
        criteria,
        destinationsMap,
        penaltySlider,
      })

      setEvaluationResults(result.rankedCandidates)
      if (result.rankedCandidates.length > 0) {
        setSelectedCandidateId(result.rankedCandidates[0].candidateId)
      }
    } finally {
      setIsEvaluating(false)
    }
  }

  const selectedCandidate = useMemo(() => {
    if (!selectedCandidateId) return null
    return evaluationResults.find((r) => r.candidateId === selectedCandidateId) ?? null
  }, [selectedCandidateId, evaluationResults])

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Zona y Mapa principal */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <ZoneControls
          resolution={resolution}
          onResolutionChange={setResolution}
          totalHexagons={grid.hexagonsGeoJSON.features.length}
          totalCandidates={grid.candidates.length}
          onResetZone={handleResetZone}
        />

        <MapContainer
          zone={zone}
          onZoneChange={setZone}
          grid={grid}
          destinations={destinations}
          evaluationResults={evaluationResults}
          selectedCandidateId={selectedCandidateId}
          onSelectCandidate={setSelectedCandidateId}
        />

        {/* Botón toggle sidebar */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{
            position: 'absolute',
            top: 16,
            right: isSidebarOpen ? 376 : 16,
            zIndex: 1200,
            padding: '8px 12px',
            backgroundColor: '#1e293b',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          {isSidebarOpen ? '➡️ Ocultar Panel' : '⬅️ Mostrar Panel de Evaluación'}
        </button>

        {/* Sidebar Derecho de Control & Resultados */}
        {isSidebarOpen && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 360,
              height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(8px)',
              zIndex: 1100,
              boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: '16px 16px 0 16px', borderBottom: '1px solid #e2e8f0' }}>
              <h2 style={{ margin: 0, fontSize: 18, color: '#0f172a' }}>⚙️ GeoZone Optimizer</h2>
              <p style={{ margin: '4px 0 12px 0', fontSize: 12, color: '#64748b' }}>
                Evalúa ubicaciones optimizando criterios con scoring relativo y reutilización local.
              </p>
            </div>

            <CriteriaConfigPanel
              destinations={destinations}
              criteria={criteria}
              penaltySlider={penaltySlider}
              onAddDestination={(d) => setDestinations([...destinations, d])}
              onRemoveDestination={(id) => {
                setDestinations(destinations.filter((d) => d.id !== id))
                setCriteria(criteria.filter((c) => c.destinationId !== id))
              }}
              onAddCriterion={(c) => setCriteria([...criteria, c])}
              onRemoveCriterion={(id) => setCriteria(criteria.filter((c) => c.id !== id))}
              onPenaltyChange={setPenaltySlider}
              onRunEvaluation={handleRunEvaluation}
              isEvaluating={isEvaluating}
            />

            <RankingPanel
              results={evaluationResults}
              selectedCandidateId={selectedCandidateId}
              onSelectCandidate={setSelectedCandidateId}
            />
          </div>
        )}
      </div>

      {/* Visor de Audit Log en Tiempo Real en la parte inferior */}
      <div style={{ position: 'relative', zIndex: 1200 }}>
        <div
          style={{
            backgroundColor: '#0f172a',
            color: '#94a3b8',
            padding: '4px 16px',
            fontSize: 11,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
          }}
          onClick={() => setIsLogViewerOpen(!isLogViewerOpen)}
        >
          <span>📊 Console Audit Log (Local-First Diagnostics)</span>
          <span>{isLogViewerOpen ? '▼ Minimizar' : '▲ Expander Log'}</span>
        </div>
        {isLogViewerOpen && <AuditLogViewer />}
      </div>

      {/* Modal de Detalle al hacer clic en un candidato */}
      {selectedCandidate && (
        <CandidateDetail
          candidate={selectedCandidate}
          criteria={criteria}
          destinationsMap={destinationsMap}
          onClose={() => setSelectedCandidateId(null)}
        />
      )}
    </div>
  )
}

export default App
