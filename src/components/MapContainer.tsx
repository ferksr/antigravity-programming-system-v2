import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { GeneratedGrid, QuadrilateralZone } from '../domain/spatial/types'
import type { CandidateEvaluationResult, Destination } from '../domain/evaluation/types'
import { getScoreColor } from './RankingPanel'

interface MapContainerProps {
  initialCenter?: [number, number]
  initialZoom?: number
  zone: QuadrilateralZone
  onZoneChange: (newZone: QuadrilateralZone) => void
  grid: GeneratedGrid
  destinations?: Destination[]
  onDestinationMove?: (id: string, lat: number, lng: number) => void
  isAddingDestination?: boolean
  onAddDestinationByClick?: (lat: number, lng: number) => void
  evaluationResults?: CandidateEvaluationResult[]
  selectedCandidateId?: string | null
  onSelectCandidate?: (candidateId: string) => void
}

export const MapContainer = ({
  initialCenter = [-34.5950, -58.4050],
  initialZoom = 13,
  zone,
  onZoneChange,
  grid,
  destinations = [],
  onDestinationMove,
  isAddingDestination = false,
  onAddDestinationByClick,
  evaluationResults = [],
  selectedCandidateId = null,
  onSelectCandidate,
}: MapContainerProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const hexLayerRef = useRef<L.LayerGroup | null>(null)
  const zoneLayerRef = useRef<L.Polygon | null>(null)
  const destLayerRef = useRef<L.LayerGroup | null>(null)
  const activePopupRef = useRef<L.Popup | null>(null)
  const vertexMarkersRef = useRef<L.Marker[]>([])

  const zoneRef = useRef(zone)
  zoneRef.current = zone
  const onZoneChangeRef = useRef(onZoneChange)
  onZoneChangeRef.current = onZoneChange

  // 1. Inicializar Mapa Leaflet una sola vez
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
    })

    L.control.zoom({ position: 'topleft' }).addTo(map)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    const hexLayer = L.layerGroup().addTo(map)
    hexLayerRef.current = hexLayer

    const destLayer = L.layerGroup().addTo(map)
    destLayerRef.current = destLayer

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      hexLayerRef.current = null
      destLayerRef.current = null
      vertexMarkersRef.current = []
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 2. Manejo de Clic en el Mapa para Añadir Destinos
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const container = map.getContainer()
    if (isAddingDestination) {
      container.style.cursor = 'crosshair'
    } else {
      container.style.cursor = ''
    }

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isAddingDestination && onAddDestinationByClick) {
        onAddDestinationByClick(e.latlng.lat, e.latlng.lng)
      }
    }

    map.on('click', handleMapClick)
    return () => {
      map.off('click', handleMapClick)
    }
  }, [isAddingDestination, onAddDestinationByClick])

  // 3. Renderizar Marcadores de Destinos (Arrastrales)
  useEffect(() => {
    const destLayer = destLayerRef.current
    if (!destLayer) return

    destLayer.clearLayers()

    destinations.forEach((d) => {
      const icon = L.divIcon({
        html: `<div style="
          background:#4154f1;color:#fff;
          padding:4px 8px;border-radius:20px;
          border:2px solid #fff;font-size:11px;
          font-weight:600;white-space:nowrap;
          box-shadow:0 4px 12px rgba(65,84,241,0.35);
          cursor:grab;
        ">📍 ${d.name}</div>`,
        className: '',
        iconSize: [100, 24],
        iconAnchor: [50, 12],
      })

      const marker = L.marker([d.lat, d.lng], {
        icon,
        draggable: true,
        title: `Arrastrar destino: ${d.name}`,
      }).addTo(destLayer)

      marker.on('dragend', () => {
        const { lat, lng } = marker.getLatLng()
        if (onDestinationMove) {
          onDestinationMove(d.id, lat, lng)
        }
      })
    })
  }, [destinations, onDestinationMove])

  // 4. Renderizar Hexágonos H3, Cuadrilátero Vértices y Puntos Candidatos
  useEffect(() => {
    const map = mapRef.current
    const hexLayer = hexLayerRef.current
    if (!map || !hexLayer) return

    hexLayer.clearLayers()

    const scoreMap: Record<string, number> = {}
    evaluationResults.forEach((r) => {
      scoreMap[r.candidateId] = r.totalScore
    })

    // Polígono de la Zona
    if (zoneLayerRef.current) {
      zoneLayerRef.current.remove()
    }
    const zoneLatLngs = zone.map((p) => [p.lat, p.lng] as [number, number])
    zoneLayerRef.current = L.polygon(zoneLatLngs, {
      color: '#4154f1',
      weight: 2.5,
      dashArray: '6 4',
      fillColor: '#4154f1',
      fillOpacity: 0.04,
    }).addTo(map)

    // Grilla GeoJSON de H3
    L.geoJSON(grid.hexagonsGeoJSON, {
      style: () => ({
        color: '#4154f1',
        weight: 1.2,
        fillColor: '#4154f1',
        fillOpacity: 0.12,
      }),
    }).addTo(hexLayer)

    // Puntos Candidatos (Centroides H3)
    grid.candidates.forEach((c) => {
      const score = scoreMap[c.id]
      const isScored = score !== undefined
      const isSelected = c.id === selectedCandidateId
      const fillColor = isScored ? getScoreColor(score) : '#4154f1'

      const circle = L.circleMarker([c.lat, c.lng], {
        radius: isSelected ? 9 : isScored ? 7 : 5,
        color: isSelected ? '#012970' : '#ffffff',
        weight: isSelected ? 3 : 1.5,
        fillColor,
        fillOpacity: 0.9,
      }).addTo(hexLayer)

      if (onSelectCandidate) {
        circle.on('click', (e) => {
          L.DomEvent.stopPropagation(e)
          onSelectCandidate(c.id)
        })
      }
    })

    // Vértices Arrastrales de la Zona
    if (vertexMarkersRef.current.length === 0) {
      const labels = ['NW', 'NE', 'SE', 'SW']
      zone.forEach((point, index) => {
        const icon = L.divIcon({
          html: `<div style="
            width:18px;height:18px;
            background:#4154f1;border:2.5px solid #fff;
            border-radius:50%;cursor:grab;
            box-shadow:0 2px 10px rgba(65,84,241,0.4);
          "></div>`,
          className: '',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        })
        const marker = L.marker([point.lat, point.lng], {
          icon,
          draggable: true,
          title: `Vértice ${labels[index]}`,
        }).addTo(map)

        marker.on('drag', () => {
          const { lat, lng } = marker.getLatLng()
          const updated = [...zoneRef.current] as QuadrilateralZone
          updated[index] = { lat, lng }
          onZoneChangeRef.current(updated)
        })

        vertexMarkersRef.current.push(marker)
      })
    } else {
      vertexMarkersRef.current.forEach((marker, i) => {
        const p = zone[i]
        if (p) marker.setLatLng([p.lat, p.lng])
      })
    }
  }, [zone, grid, evaluationResults, selectedCandidateId, onSelectCandidate])

  // 5. Animación flyTo + Popup al seleccionar candidato desde el ranking
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedCandidateId) return

    const candidate = grid.candidates.find((c) => c.id === selectedCandidateId)
    if (!candidate) return

    const evalResult = evaluationResults.find((r) => r.candidateId === selectedCandidateId)

    // Fly to location smoothly
    map.flyTo([candidate.lat, candidate.lng], 15, { animate: true, duration: 0.8 })

    // Abrir Popup con flechita de Leaflet
    if (activePopupRef.current) {
      activePopupRef.current.remove()
    }

    const popupContent = `
      <div style="font-family: system-ui; padding: 4px;">
        <div style="font-weight: 700; color: #012970; font-size: 13px; margin-bottom: 2px;">
          📍 Candidato #${selectedCandidateId}
        </div>
        <div style="font-size: 11px; color: #899bbd; margin-bottom: 6px;">
          Celda H3: ${candidate.h3Index.slice(0, 10)}…
        </div>
        ${
          evalResult
            ? `<div style="
                background: ${getScoreColor(evalResult.totalScore)};
                color: #fff;
                font-weight: bold;
                padding: 4px 8px;
                border-radius: 6px;
                text-align: center;
                font-size: 13px;
              ">
                Score Final: ${evalResult.totalScore.toFixed(1)} / 100
              </div>`
            : `<div style="font-size: 11px; color: #666;">Sin evaluar aún</div>`
        }
      </div>
    `

    const popup = L.popup({
      offset: [0, -6],
      closeButton: true,
    })
      .setLatLng([candidate.lat, candidate.lng])
      .setContent(popupContent)
      .openOn(map)

    activePopupRef.current = popup
  }, [selectedCandidateId, grid.candidates, evaluationResults])

  return (
    <div
      ref={mapContainerRef}
      style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0 }}
    />
  )
}
