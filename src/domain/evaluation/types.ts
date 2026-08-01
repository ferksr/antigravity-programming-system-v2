/**
 * Domain types for the evaluation engine.
 * All types are pure data structures — no UI, API, or infrastructure dependencies.
 */

/** Supported travel modes for route calculation. */
export type TravelMode = 'DRIVING' | 'TRANSIT' | 'BICYCLING' | 'WALKING'

/** A geographic destination the user needs to reach. */
export interface Destination {
  readonly id: string
  readonly name: string
  readonly lat: number
  readonly lng: number
}

/**
 * A single evaluation criterion: one destination + travel mode + constraints.
 * The importance weight (1=low, 5=critical) controls how much this criterion
 * contributes to the final weighted score.
 */
export interface Criterion {
  readonly id: string
  readonly destinationId: string
  readonly travelMode: TravelMode
  /** Maximum acceptable travel time in minutes. Beyond this triggers penalty scoring. */
  readonly maxTimeMinutes: number
  /** Relative importance: 1 (nice to have) … 5 (non-negotiable). */
  readonly importance: 1 | 2 | 3 | 4 | 5
}

/** Configuration for a full evaluation run. */
export interface EvaluationConfig {
  readonly criteria: Criterion[]
  /**
   * Controls how steeply the score decays when actualTime > maxTime.
   * Higher values = harsher penalty. Default: 2.
   * Formula: score = e^(-penaltyFactor * (actualTime/maxTime - 1))
   */
  readonly penaltyFactor: number
}

/** Score result for a single criterion applied to a single candidate. */
export interface CriterionScore {
  readonly criterionId: string
  /** Actual travel time in minutes, or null if not yet fetched. */
  readonly actualTimeMinutes: number | null
  /**
   * Normalized score in [0, 1]:
   * - t ≤ tMax → max(0, 1 - t/tMax)
   * - t > tMax → e^(-k*(t/tMax - 1)) decaying toward 0
   */
  readonly rawScore: number
  /** rawScore × criterion.importance */
  readonly weightedContribution: number
}

/** Full evaluation result for one candidate H3 cell. */
export interface CandidateEvaluationResult {
  readonly candidateId: string
  readonly h3Index: string
  /**
   * Final aggregated score in [0, 100].
   * Computed as: (sum of weightedContributions / sum of importances) × 100
   */
  readonly totalScore: number
  readonly breakdown: CriterionScore[]
  /** False if any criterion has actualTimeMinutes = null. */
  readonly isComplete: boolean
}
