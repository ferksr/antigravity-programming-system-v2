interface ZoneControlsProps {
  resolution: number
  onResolutionChange: (newRes: number) => void
  totalHexagons: number
  totalCandidates: number
  onResetZone: () => void
}

export const ZoneControls = ({
  resolution,
  onResolutionChange,
  totalHexagons,
  totalCandidates,
  onResetZone,
}: ZoneControlsProps) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 1100,
        pointerEvents: 'auto',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        borderRadius: 12,
        padding: '16px 20px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        width: 320,
        color: '#1e293b',
        border: '1px solid rgba(226, 232, 240, 0.8)',
      }}
    >
      <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
        🗺️ Zona y Grilla H3
      </h3>

      <div style={{ marginBottom: 14 }}>
        <label
          htmlFor="h3-resolution-input"
          style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#475569' }}
        >
          Resolución H3: <span style={{ color: '#2563eb', fontWeight: 700 }}>Nivel {resolution}</span>
        </label>
        <input
          id="h3-resolution-input"
          type="range"
          min={7}
          max={9}
          step={1}
          value={resolution}
          onChange={(e) => onResolutionChange(Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer', accentColor: '#2563eb' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
          <span>Res 7 (Gruesa)</span>
          <span>Res 8 (Media)</span>
          <span>Res 9 (Fina)</span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          marginBottom: 14,
          backgroundColor: '#f8fafc',
          padding: 10,
          borderRadius: 8,
          border: '1px solid #f1f5f9',
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Celdas H3</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>{totalHexagons}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Candidatos</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#2563eb' }}>{totalCandidates}</div>
        </div>
      </div>

      <button
        type="button"
        onClick={onResetZone}
        style={{
          width: '100%',
          padding: '8px 12px',
          backgroundColor: '#f1f5f9',
          color: '#334155',
          border: '1px solid #cbd5e1',
          borderRadius: 6,
          fontWeight: 600,
          fontSize: 12,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        🔄 Centrar Zona Predeterminada
      </button>
    </div>
  )
}
