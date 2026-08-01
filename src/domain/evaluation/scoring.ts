import type {
  Criterion,
  CriterionScore,
  CandidateEvaluationResult,
  EvaluationConfig,
} from './types'
import type { CandidatePoint } from '../spatial/types'

/**
 * Computes the raw normalized score [0, 1] for a single criterion.
 *
 * Algorithm:
 *   - If actualTime ≤ maxTime: score = max(0, 1 - actualTime / maxTime)
 *     → 0 min = perfect score 1.0; at maxTime = score 0.0
 *   - If actualTime > maxTime: score = e^(-penaltyFactor × (actualTime/maxTime - 1))
 *     → Exponential decay below 0, approaching 0 asymptotically.
 *
 * @param actualTimeMinutes - Measured travel time in minutes.
 * @param maxTimeMinutes    - User-defined acceptable maximum in minutes.
 * @param penaltyFactor     - Steepness of exponential penalty (default 2).
 */
export function computeRawScore(
  actualTimeMinutes: number,
  maxTimeMinutes: number,
  penaltyFactor: number
): number {
  if (maxTimeMinutes <= 0) return 0
  const ratio = actualTimeMinutes / maxTimeMinutes
  if (ratio <= 1) {
    return Math.max(0, 1 - ratio)
  }
  // Exponential penalty for exceeding maxTime
  return Math.exp(-penaltyFactor * (ratio - 1))
}

/**
 * Scores a single criterion for a given actual travel time.
 */
export function scoreCriterion(
  criterion: Criterion,
  actualTimeMinutes: number | null,
  penaltyFactor: number
): CriterionScore {
  if (actualTimeMinutes === null) {
    return {
      criterionId: criterion.id,
      actualTimeMinutes: null,
      rawScore: 0,
      weightedContribution: 0,
    }
  }
  const rawScore = computeRawScore(actualTimeMinutes, criterion.maxTimeMinutes, penaltyFactor)
  return {
    criterionId: criterion.id,
    actualTimeMinutes,
    rawScore,
    weightedContribution: rawScore * criterion.importance,
  }
}

/**
 * Aggregates an array of criterion scores into a final [0, 100] score.
 *
 * Formula: (Σ weightedContribution_i / Σ importance_i) × 100
 *
 * If totalImportance is 0 (no criteria), returns 0.
 */
export function aggregateScore(
  criterionScores: CriterionScore[],
  criteria: Criterion[]
): number {
  const totalImportance = criteria.reduce((sum, c) => sum + c.importance, 0)
  if (totalImportance === 0) return 0
  const totalWeighted = criterionScores.reduce((sum, cs) => sum + cs.weightedContribution, 0)
  return Math.min(100, Math.max(0, (totalWeighted / totalImportance) * 100))
}

/**
 * Evaluates a single candidate against all criteria given a map of actual travel times.
 *
 * @param candidate   - The H3 candidate point to evaluate.
 * @param config      - Criteria and penalty configuration.
 * @param timesMap    - Map of criterionId → actualTimeMinutes (null = not fetched).
 */
export function evaluateCandidate(
  candidate: CandidatePoint,
  config: EvaluationConfig,
  timesMap: Record<string, number | null>
): CandidateEvaluationResult {
  const breakdown = config.criteria.map((criterion) =>
    scoreCriterion(criterion, timesMap[criterion.id] ?? null, config.penaltyFactor)
  )
  const totalScore = aggregateScore(breakdown, config.criteria)
  const isComplete = breakdown.every((cs) => cs.actualTimeMinutes !== null)

  return {
    candidateId: candidate.id,
    h3Index: candidate.h3Index,
    totalScore,
    breakdown,
    isComplete,
  }
}

/**
 * Evaluates all candidates and returns them sorted by totalScore descending.
 */
export function evaluateAndRankCandidates(
  candidates: CandidatePoint[],
  config: EvaluationConfig,
  timesMap: Record<string, Record<string, number | null>>
): CandidateEvaluationResult[] {
  return candidates
    .map((candidate) => evaluateCandidate(candidate, config, timesMap[candidate.id] ?? {}))
    .sort((a, b) => b.totalScore - a.totalScore)
}
