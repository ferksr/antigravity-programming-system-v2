import Dexie, { type Table } from 'dexie'
import type { EvaluationConfig } from '../../domain/evaluation/types'
import type { QuadrilateralZone } from '../../domain/spatial/types'

export interface ProjectEntity {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface EvaluationEntity {
  id: string
  projectId: string
  parentEvaluationId?: string
  name: string
  config: EvaluationConfig
  zone: QuadrilateralZone
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PARTIAL' | 'FAILED'
  createdAt: string
}

export interface CandidateEntity {
  id: string
  evaluationId: string
  h3Index: string
  lat: number
  lng: number
}

export interface ResultEntity {
  id: string
  signature: string
  lat: number
  lng: number
  criterionId: string
  rawValue: number | null
  provider: string
  createdAt: string
}

export interface AuditEventEntity {
  id: string
  evaluationId?: string
  timestamp: string
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'
  eventType: string
  message: string
  details?: Record<string, unknown>
}

export class GeoZoneDatabase extends Dexie {
  projects!: Table<ProjectEntity, string>
  evaluations!: Table<EvaluationEntity, string>
  candidates!: Table<CandidateEntity, string>
  results!: Table<ResultEntity, string>
  auditEvents!: Table<AuditEventEntity, string>

  constructor() {
    super('GeoZoneOptimizerDB')

    this.version(1).stores({
      projects: 'id, createdAt, updatedAt',
      evaluations: 'id, projectId, parentEvaluationId, createdAt',
      candidates: 'id, evaluationId, h3Index',
      results: 'id, signature, criterionId, [signature+criterionId], createdAt',
      auditEvents: 'id, evaluationId, timestamp, level, eventType',
    })
  }
}

export const db = new GeoZoneDatabase()
