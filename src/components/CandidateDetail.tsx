import React from 'react'
import type { CandidateEvaluationResult, Criterion, Destination } from '../domain/evaluation/types'
import { getScoreColor } from './RankingPanel'

interface CandidateDetailProps {
  candidate: CandidateEvaluationResult | null
  criteria: Criterion[]
  destinationsMap: Record<string, Destination>
  onClose: () => void
}

export const CandidateDetail: React.FC<CandidateDetailProps> = ({
  candidate,
  criteria,
  destinationsMap,
  onClose,
}) => {
  if (!candidate) return null

  const overallColor = getScoreColor(candidate.totalScore)

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 8,
          padding: 24,
          maxWidth: 480,
          width: '90%',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>Detalle de Ubicación Candidate</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ marginBottom: 16, fontSize: 13, color: '#666' }}>
          <div><strong>ID Candidato:</strong> {candidate.candidateId}</div>
          <div><strong>Celda H3 Index:</strong> {candidate.h3Index}</div>
        </div>

        <div
          style={{
            padding: 12,
            backgroundColor: overallColor,
            color: '#fff',
            borderRadius: 6,
            textAlign: 'center',
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 20,
          }}
        >
          Score Final: {candidate.totalScore.toFixed(1)} / 100
        </div>

        <h4 style={{ margin: '0 0 8px 0', fontSize: 14 }}>Desglose por Criterio</h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {candidate.criterionResults.map((cr) => {
            const criterion = criteria.find((c) => c.id === cr.criterionId)
            const dest = criterion ? destinationsMap[criterion.destinationId] : undefined
            const scoreColor = cr.score !== null ? getScoreColor(cr.score) : '#aaa'

            return (
              <div
                key={cr.criterionId}
                style={{
                  padding: 10,
                  border: '1px solid #e0e0e0',
                  borderRadius: 4,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 13,
                }}
              >
                <div>
                  <div>🎯 <strong>{dest?.name || 'Destino'}</strong> ({criterion?.travelMode})</div>
                  <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                    Tiempo estimado: {cr.rawValue !== null ? `${cr.rawValue} min` : 'N/A'} (Peso: {criterion?.weight}/5)
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: scoreColor,
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}
                >
                  {cr.score !== null ? `${cr.score.toFixed(1)} pts` : 'N/A'}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
