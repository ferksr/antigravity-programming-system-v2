/**
 * Domain types for the evaluation engine strictly following notes/inbox/ideas.md.
 * Consolidated Criterio model.
 */

export type TravelMode = 'DRIVING' | 'TRANSIT' | 'BICYCLING' | 'WALKING'

export type CriterionDirection = 'LOWER_IS_BETTER' | 'HIGHER_IS_BETTER'

export type CriterionType = 'TRAVEL_TIME' | 'PROXIMITY_LOCATION'

export interface Destination {
  readonly id: string
  readonly name: string
  readonly lat: number
  readonly lng: number
}

/**
 * Unified Criterion definition:
 * Every question about a location is a Criterion.
 * Types include:
 * - TRAVEL_TIME: Travel duration (minutes) to/from a destination.
 * - PROXIMITY_LOCATION: Direct geodesic distance (meters) to a destination/POI.
 */
export interface Criterion {
  readonly id: string
  readonly name: string
  readonly criterionType: CriterionType
  readonly destinationId: string
  readonly travelMode?: TravelMode
  readonly direction: CriterionDirection
  /** Relative weight (1=low, 5=critical). */
  readonly weight: number
}

/** Config for scoring aggregation (Section 26, 28, 29 of ideas.md) */
export interface EvaluationConfig {
  readonly criteria: Criterion[]
  /**
   * Inequality penalty slider from 0 to 100 (Section 29).
   * 0 = no inequality penalty (weighted arithmetic mean)
   * 100 = maximum inequality penalty
   */
  readonly penaltySlider: number
}

export interface CriterionResult {
  readonly criterionId: string
  /** Original raw value (minutes for travel time, meters for proximity) */
  readonly rawValue: number | null
  /** Normalized score in [1, 100] (Section 26.1). */
  readonly score: number | null
}

export interface CandidateEvaluationResult {
  readonly candidateId: string
  readonly h3Index: string
  readonly totalScore: number
  readonly criterionResults: CriterionResult[]
  readonly isComplete: boolean
}
