import type { ResultEntity } from '../../infrastructure/persistence/db'

export interface ReuseConfig {
  /** Geodesic distance threshold in meters. Default: 200m (Section 6). */
  readonly thresholdMeters: number
  /** Maximum freshness age in milliseconds. Default: 30 days (Section 23). */
  readonly maxFreshnessMs: number
}

export interface ReuseQuery {
  readonly candidateId: string
  readonly lat: number
  readonly lng: number
  readonly signature: string
  readonly criterionId: string
}

export type RejectionReason =
  | 'NO_MATCHING_SIGNATURE'
  | 'EXCEEDS_DISTANCE_THRESHOLD'
  | 'STALE_FRESHNESS'
  | 'NO_RESULTS_FOUND'

export interface CandidateResultMatch {
  readonly result: ResultEntity
  readonly distanceMeters: number
  readonly isSignatureMatch: boolean
  readonly isWithinThreshold: boolean
  readonly isFresh: boolean
  readonly rejectionReason?: RejectionReason
}

export interface ReuseDecision {
  readonly action: 'REUSE' | 'CALCULATE'
  readonly query: ReuseQuery
  readonly matchedResult?: ResultEntity
  readonly distanceMeters?: number
  readonly rejectionReason?: RejectionReason
}
