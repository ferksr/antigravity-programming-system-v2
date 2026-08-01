import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { GeneratedGrid, QuadrilateralZone } from '../domain/spatial/types'

interface MapContainerProps {
  initialCenter?: [number, number] // [lat, lng] — Leaflet convention
  initialZoom?: number
  zone: QuadrilateralZone
  onZoneChange: (newZone: QuadrilateralZone) => void
  grid: GeneratedGrid
}

export const MapContainer = ({
  initialCenter = [-34.5950, -58.4050],
  initialZoom = 13,
  zone,
  onZoneChange,
  grid,
}: MapContainerProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const hexLayerRef = useRef<L.LayerGroup | null>(null)
  const zoneLayerRef = useRef<L.Polygon | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  const zoneRef = useRef(zone)
  zoneRef.current = zone
  const onZoneChangeRef = useRef(onZoneChange)
  onZoneChangeRef.current = onZoneChange

  // Montar mapa Leaflet una sola vez
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    // LayerGroup para hexágonos (fácil de limpiar)
    const hexLayer = L.layerGroup().addTo(map)
    hexLayerRef.current = hexLayer

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      hexLayerRef.current = null
      markersRef.current = []
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Actualizar hexágonos y zona cuando cambia grid/zone
  useEffect(() => {
    const map = mapRef.current
    const hexLayer = hexLayerRef.current
    if (!map || !hexLayer) return

    // --- Limpiar capa anterior de hexágonos ---
    hexLayer.clearLayers()

    // --- Dibujar polígono de la zona ---
    if (zoneLayerRef.current) {
      zoneLayerRef.current.remove()
    }
    const zoneLatLngs = zone.map((p) => [p.lat, p.lng] as [number, number])
    zoneLayerRef.current = L.polygon(zoneLatLngs, {
      color: '#dc2626',
      weight: 3,
      dashArray: '6 4',
      fillColor: '#ef4444',
      fillOpacity: 0.08,
    }).addTo(map)

    // --- Dibujar hexágonos H3 desde el GeoJSON ---
    L.geoJSON(grid.hexagonsGeoJSON, {
      style: {
        color: '#1d4ed8',
        weight: 2,
        fillColor: '#3b82f6',
        fillOpacity: 0.3,
      },
    }).addTo(hexLayer)

    // --- Dibujar puntos candidatos ---
    grid.candidates.forEach((c) => {
      L.circleMarker([c.lat, c.lng], {
        radius: 6,
        color: '#ffffff',
        weight: 2,
        fillColor: '#1e40af',
        fillOpacity: 1,
      }).addTo(hexLayer)
    })

    // --- Actualizar marcadores de vértices ---
    if (markersRef.current.length === 0) {
      // Primera vez: crear los 4 marcadores de vértice
      const labels = ['NW', 'NE', 'SE', 'SW']
      zone.forEach((point, index) => {
        const icon = L.divIcon({
          html: `<div style="
            width:20px;height:20px;
            background:#dc2626;border:2.5px solid #fff;
            border-radius:50%;cursor:grab;
            box-shadow:0 2px 8px rgba(0,0,0,0.4);
          "></div>`,
          className: '',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
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

        markersRef.current.push(marker)
      })
    } else {
      // Actualizar posición de marcadores existentes
      markersRef.current.forEach((marker, i) => {
        const p = zone[i]
        if (p) marker.setLatLng([p.lat, p.lng])
      })
    }
  }, [zone, grid])

  return (
    <div
      ref={mapContainerRef}
      style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0 }}
    />
  )
}
