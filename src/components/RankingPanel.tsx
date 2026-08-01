import React from 'react'
import type { CandidateEvaluationResult } from '../domain/evaluation/types'

interface RankingPanelProps {
  results: CandidateEvaluationResult[]
  selectedCandidateId: string | null
  onSelectCandidate: (candidateId: string) => void
}

/** Helper function to convert score 1-100 to HSL color (green=100, red=1) */
export function getScoreColor(score: number): string {
  // Hue 120 = Green (100), Hue 0 = Red (1)
  const normalized = Math.min(100, Math.max(1, score))
  const hue = ((normalized - 1) / 99) * 120
  return `hsl(${hue}, 75%, 45%)`
}

export const RankingPanel: React.FC<RankingPanelProps> = ({
  results,
  selectedCandidateId,
  onSelectCandidate,
}) => {
  if (results.length === 0) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: '#888', fontSize: 13 }}>
        No hay resultados de evaluación disponibles. Ejecutá una evaluación para ver el ranking.
      </div>
    )
  }

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>Ranking de Ubicaciones ({results.length})</h3>

      <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 4 }}>
        {results.map((res, index) => {
          const isSelected = res.candidateId === selectedCandidateId
          const badgeColor = getScoreColor(res.totalScore)

          return (
            <div
              key={res.candidateId}
              onClick={() => onSelectCandidate(res.candidateId)}
              style={{
                padding: '8px 12px',
                borderBottom: '1px solid #eee',
                backgroundColor: isSelected ? '#e6f2ff' : '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 'bold', width: 24, fontSize: 13 }}>#{index + 1}</span>
                <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#555' }}>
                  {res.h3Index.slice(0, 8)}…
                </span>
              </div>

              <div
                style={{
                  backgroundColor: badgeColor,
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 'bold',
                }}
              >
                {res.totalScore.toFixed(1)} pts
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
