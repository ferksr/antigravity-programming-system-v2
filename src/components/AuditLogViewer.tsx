import React from 'react'
import { useAuditLog } from '../application/audit/useAuditLog'
import type { AuditLevel } from '../domain/audit/types'
import { formatEventAsText } from '../domain/audit/logger'

export const AuditLogViewer: React.FC = () => {
  const [levelFilter, setLevelFilter] = React.useState<AuditLevel | undefined>(undefined)
  const [autoScroll, setAutoScroll] = React.useState(true)
  const [copied, setCopied] = React.useState(false)
  const logEndRef = React.useRef<HTMLDivElement>(null)

  const { events, exportAsText } = useAuditLog({ level: levelFilter, limit: 100 })

  React.useEffect(() => {
    if (autoScroll) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [events, autoScroll])

  const handleCopyLog = () => {
    const text = exportAsText()
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      style={{
        height: 200,
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        fontFamily: 'Consolas, monospace',
        fontSize: 12,
        display: 'flex',
        flexDirection: 'column',
        borderTop: '2px solid #333',
      }}
    >
      {/* Top toolbar */}
      <div
        style={{
          padding: '6px 12px',
          backgroundColor: '#252526',
          borderBottom: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <strong style={{ color: '#569cd6' }}>📋 Audit Log en Tiempo Real</strong>
          <span style={{ color: '#888', fontSize: 11 }}>({events.length} eventos)</span>

          <select
            value={levelFilter || ''}
            onChange={(e) => setLevelFilter((e.target.value as AuditLevel) || undefined)}
            style={{
              backgroundColor: '#3c3c3c',
              color: '#fff',
              border: 'none',
              borderRadius: 3,
              padding: '2px 6px',
              fontSize: 11,
            }}
          >
            <option value="">Todos los niveles</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
            <option value="DEBUG">DEBUG</option>
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 11 }}>
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
            Autoscroll
          </label>
        </div>

        <button
          onClick={handleCopyLog}
          style={{
            backgroundColor: copied ? '#4ec9b0' : '#0e639c',
            color: '#fff',
            border: 'none',
            borderRadius: 3,
            padding: '4px 10px',
            fontSize: 11,
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          {copied ? '✓ ¡Copiado!' : '📄 Copiar Log para IA'}
        </button>
      </div>

      {/* Log Output Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {events.length === 0 ? (
          <div style={{ color: '#666', fontStyle: 'italic' }}>No hay eventos registrados aún.</div>
        ) : (
          events.map((evt) => {
            const formatted = formatEventAsText(evt)
            const isError = evt.level === 'ERROR'
            const isWarn = evt.level === 'WARN'

            return (
              <pre
                key={evt.id}
                style={{
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  color: isError ? '#f48771' : isWarn ? '#cca700' : '#d4d4d4',
                  backgroundColor: '#2d2d2d',
                  padding: 6,
                  borderRadius: 3,
                  borderLeft: `3px solid ${isError ? '#f48771' : isWarn ? '#cca700' : '#007acc'}`,
                }}
              >
                {formatted}
              </pre>
            )
          })
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  )
}
