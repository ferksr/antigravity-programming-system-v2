import React from 'react'
import type { Criterion, Destination, TravelMode } from '../domain/evaluation/types'

interface CriteriaConfigPanelProps {
  destinations: Destination[]
  criteria: Criterion[]
  penaltySlider: number
  onAddDestination: (dest: Destination) => void
  onRemoveDestination: (id: string) => void
  onAddCriterion: (crit: Criterion) => void
  onRemoveCriterion: (id: string) => void
  onPenaltyChange: (val: number) => void
  onRunEvaluation: () => void
  isEvaluating: boolean
}

export const CriteriaConfigPanel: React.FC<CriteriaConfigPanelProps> = ({
  destinations,
  criteria,
  penaltySlider,
  onAddDestination,
  onRemoveDestination,
  onAddCriterion,
  onRemoveCriterion,
  onPenaltyChange,
  onRunEvaluation,
  isEvaluating,
}) => {
  const [newDestName, setNewDestName] = React.useState('')
  const [newDestLat, setNewDestLat] = React.useState('-34.59')
  const [newDestLng, setNewDestLng] = React.useState('-58.40')

  const [selectedDestId, setSelectedDestId] = React.useState('')
  const [travelMode, setTravelMode] = React.useState<TravelMode>('TRANSIT')
  const [weight, setWeight] = React.useState<number>(3)

  const handleCreateDestination = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDestName.trim()) return
    const dest: Destination = {
      id: `dest-${Date.now()}`,
      name: newDestName.trim(),
      lat: parseFloat(newDestLat) || -34.59,
      lng: parseFloat(newDestLng) || -58.40,
    }
    onAddDestination(dest)
    setNewDestName('')
  }

  const handleCreateCriterion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDestId) return
    const crit: Criterion = {
      id: `crit-${Date.now()}`,
      destinationId: selectedDestId,
      travelMode,
      direction: 'LOWER_IS_BETTER',
      weight,
    }
    onAddCriterion(crit)
  }

  return (
    <div style={{ padding: 16, borderBottom: '1px solid #e0e0e0' }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>1. Destinos</h3>

      {/* Lista de destinos */}
      {destinations.map((d) => (
        <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
          <span>📍 <strong>{d.name}</strong> ({d.lat.toFixed(4)}, {d.lng.toFixed(4)})</span>
          <button onClick={() => onRemoveDestination(d.id)} style={{ padding: '2px 6px', fontSize: 11, cursor: 'pointer' }}>Borrar</button>
        </div>
      ))}

      {/* Formulario nuevo destino */}
      <form onSubmit={handleCreateDestination} style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Nombre (ej. Trabajo)"
          value={newDestName}
          onChange={(e) => setNewDestName(e.target.value)}
          style={{ flex: 1, minWidth: 120, padding: 4, fontSize: 12 }}
        />
        <input
          type="text"
          placeholder="Lat"
          value={newDestLat}
          onChange={(e) => setNewDestLat(e.target.value)}
          style={{ width: 60, padding: 4, fontSize: 12 }}
        />
        <input
          type="text"
          placeholder="Lng"
          value={newDestLng}
          onChange={(e) => setNewDestLng(e.target.value)}
          style={{ width: 60, padding: 4, fontSize: 12 }}
        />
        <button type="submit" style={{ padding: '4px 8px', fontSize: 12, cursor: 'pointer' }}>+ Destino</button>
      </form>

      <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #eee' }} />

      <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>2. Criterios de Evaluación</h3>

      {/* Lista de criterios */}
      {criteria.map((c) => {
        const dest = destinations.find((d) => d.id === c.destinationId)
        return (
          <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
            <span>🎯 <strong>{dest?.name || 'Destino'}</strong> ({c.travelMode}) — Peso: {c.weight}/5</span>
            <button onClick={() => onRemoveCriterion(c.id)} style={{ padding: '2px 6px', fontSize: 11, cursor: 'pointer' }}>Borrar</button>
          </div>
        )
      })}

      {/* Formulario nuevo criterio */}
      {destinations.length > 0 && (
        <form onSubmit={handleCreateCriterion} style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <select
            value={selectedDestId}
            onChange={(e) => setSelectedDestId(e.target.value)}
            style={{ padding: 4, fontSize: 12, flex: 1 }}
          >
            <option value="">-- Elegir Destino --</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <select
            value={travelMode}
            onChange={(e) => setTravelMode(e.target.value as TravelMode)}
            style={{ padding: 4, fontSize: 12 }}
          >
            <option value="TRANSIT">Transporte Público</option>
            <option value="DRIVING">Automóvil</option>
            <option value="BICYCLING">Bicicleta</option>
            <option value="WALKING">Caminando</option>
          </select>
          <select
            value={weight}
            onChange={(e) => setWeight(parseInt(e.target.value, 10))}
            style={{ padding: 4, fontSize: 12 }}
          >
            <option value={1}>Peso 1 (Bajo)</option>
            <option value={2}>Peso 2</option>
            <option value={3}>Peso 3 (Medio)</option>
            <option value={4}>Peso 4</option>
            <option value={5}>Peso 5 (Crítico)</option>
          </select>
          <button type="submit" disabled={!selectedDestId} style={{ padding: '4px 8px', fontSize: 12, cursor: 'pointer' }}>
            + Criterio
          </button>
        </form>
      )}

      <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #eee' }} />

      <h3 style={{ margin: '0 0 4px 0', fontSize: 16 }}>3. Penalización por Desigualdad</h3>
      <p style={{ margin: '0 0 8px 0', fontSize: 11, color: '#666' }}>
        Penaliza ubicaciones con criterios desparejos (Sección 29 spec).
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="range"
          min={0}
          max={100}
          value={penaltySlider}
          onChange={(e) => onPenaltyChange(parseInt(e.target.value, 10))}
          style={{ flex: 1 }}
        />
        <span style={{ fontWeight: 'bold', fontSize: 14, minWidth: 32 }}>{penaltySlider}%</span>
      </div>

      <button
        onClick={onRunEvaluation}
        disabled={isEvaluating || criteria.length === 0}
        style={{
          marginTop: 16,
          width: '100%',
          padding: '10px 16px',
          fontSize: 14,
          fontWeight: 'bold',
          backgroundColor: criteria.length > 0 ? '#0066cc' : '#ccc',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          cursor: criteria.length > 0 ? 'pointer' : 'not-allowed',
        }}
      >
        {isEvaluating ? '⚡ Evaluando candidatos...' : '🚀 Ejecutar Evaluación'}
      </button>
    </div>
  )
}
