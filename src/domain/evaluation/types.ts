/**
 * Domain types for the evaluation engine strictly following notes/inbox/ideas.md.
 */

export type TravelMode = 'DRIVING' | 'TRANSIT' | 'BICYCLING' | 'WALKING'

export type CriterionDirection = 'LOWER_IS_BETTER' | 'HIGHER_IS_BETTER'

export interface Destination {
  readonly id: string
  readonly name: string
  readonly lat: number
  readonly lng: number
}

export interface Criterion {
  readonly id: string
  readonly destinationId: string
  readonly travelMode: TravelMode
  readonly direction: CriterionDirection
  /** Relative weight (non-negative). Weights do not need to sum to 100. */
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
  /** Original raw value (e.g. travel time in minutes, rating, etc.) */
  readonly rawValue: number | null
  /**
   * Normalized score strictly in [1, 100] (Section 26.1).
   * Null if rawValue is null.
   */
  readonly score: number | null
}

export interface CandidateEvaluationResult {
  readonly candidateId: string
  readonly h3Index: string
  /**
   * Final score in [1, 100] computed via Generalized Mean (Section 29).
   */
  readonly totalScore: number
  readonly criterionResults: CriterionResult[]
  readonly isComplete: boolean
}
