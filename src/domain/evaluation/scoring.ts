import type {
  Criterion,
  CriterionDirection,
  CriterionResult,
  CandidateEvaluationResult,
  EvaluationConfig,
} from './types'
import type { CandidatePoint } from '../spatial/types'

/**
 * Section 27: Pessimistic Range Rule
 * When a provider returns a range (e.g. 20-50 min), returns the extreme
 * that produces the worst score for the given criterion direction.
 */
export function applyPessimisticBound(
  range: { min: number; max: number },
  direction: CriterionDirection
): number {
  return direction === 'LOWER_IS_BETTER' ? range.max : range.min
}

/**
 * Section 26.1: Relative Normalization (Scale 1–100)
 *
 * Lower is better (time, distance):
 *   score = 1 + 99 * (max - value) / (max - min)
 *
 * Higher is better (rating, reviews):
 *   score = 1 + 99 * (value - min) / (max - min)
 *
 * All equal (max = min):
 *   score = 100
 *
 * Score is strictly bounded in [1, 100].
 */
export function calculateRelativeScore(
  value: number,
  minVal: number,
  maxVal: number,
  direction: CriterionDirection
): number {
  if (maxVal === minVal) return 100

  let score: number
  if (direction === 'LOWER_IS_BETTER') {
    score = 1 + (99 * (maxVal - value)) / (maxVal - minVal)
  } else {
    score = 1 + (99 * (value - minVal)) / (maxVal - minVal)
  }

  // Ensure strict [1, 100] bounds
  return Math.min(100, Math.max(1, score))
}

/**
 * Section 28: Normalized Weights
 * peso_normalizado = peso / suma_de_pesos
 */
export function normalizeWeights(criteria: Criterion[]): number[] {
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0)
  if (totalWeight <= 0) {
    throw new Error('Total weight must be greater than 0')
  }
  return criteria.map((c) => c.weight / totalWeight)
}

/**
 * Section 29: Inequality Penalty via Generalized Mean (p-norm)
 *
 * Score = (Σ wᵢ * xᵢ^p)^(1/p)
 *
 * Where:
 *   - xᵢ: individual score [1, 100]
 *   - wᵢ: normalized weight (Σ wᵢ = 1)
 *   - p = 1 - 0.99 * (penaltySlider / 100)
 *
 * When penaltySlider = 0:  p = 1   (weighted arithmetic mean)
 * When penaltySlider = 100: p = 0.01 (approaches geometric mean / minimum penalty)
 */
export function calculateGeneralizedMeanScore(
  scores: number[],
  normalizedWeights: number[],
  penaltySlider: number
): number {
  if (scores.length === 0) return 100

  const boundedSlider = Math.min(100, Math.max(0, penaltySlider))
  const p = 1 - 0.99 * (boundedSlider / 100)

  // Avoid divide by zero / extreme numerical instability near p=0
  const safeP = Math.max(0.001, p)

  const weightedSumPower = scores.reduce((acc, score, i) => {
    // Clamp score to positive >0 for power calculation
    const safeScore = Math.max(1, score)
    return acc + normalizedWeights[i] * Math.pow(safeScore, safeP)
  }, 0)

  const result = Math.pow(weightedSumPower, 1 / safeP)

  return Math.min(100, Math.max(1, result))
}

/**
 * Normalizes and scores a full batch of candidates across all criteria for an evaluation.
 * Follows Section 26.1: Relative scoring across all candidates in an evaluation.
 *
 * @param candidates - List of candidate H3 cells.
 * @param config - Evaluation configuration (criteria, weights, penaltySlider).
 * @param valuesMap - Map of candidateId -> criterionId -> rawValue
 */
export function evaluateAndRankCandidates(
  candidates: CandidatePoint[],
  config: EvaluationConfig,
  valuesMap: Record<string, Record<string, number | null>>
): CandidateEvaluationResult[] {
  if (candidates.length === 0 || config.criteria.length === 0) {
    return []
  }

  const normalizedWeights = normalizeWeights(config.criteria)

  // 1. Calculate min and max per criterion across all valid candidate values
  const minMaxPerCriterion: Record<string, { min: number; max: number }> = {}

  for (const criterion of config.criteria) {
    const validValues: number[] = []
    for (const cand of candidates) {
      const val = valuesMap[cand.id]?.[criterion.id]
      if (val !== null && val !== undefined && !isNaN(val)) {
        validValues.push(val)
      }
    }

    if (validValues.length > 0) {
      minMaxPerCriterion[criterion.id] = {
        min: Math.min(...validValues),
        max: Math.max(...validValues),
      }
    }
  }

  // 2. Compute individual criterion scores and total score for each candidate
  const results: CandidateEvaluationResult[] = candidates.map((cand) => {
    const candValues = valuesMap[cand.id] ?? {}
    const criterionResults: CriterionResult[] = []
    const validScores: number[] = []
    const validWeights: number[] = []
    let isComplete = true

    config.criteria.forEach((criterion, idx) => {
      const rawValue = candValues[criterion.id] ?? null

      if (rawValue === null || rawValue === undefined || isNaN(rawValue)) {
        isComplete = false
        criterionResults.push({
          criterionId: criterion.id,
          rawValue: null,
          score: null,
        })
      } else {
        const bounds = minMaxPerCriterion[criterion.id]
        const score = bounds
          ? calculateRelativeScore(rawValue, bounds.min, bounds.max, criterion.direction)
          : 100

        criterionResults.push({
          criterionId: criterion.id,
          rawValue,
          score,
        })

        validScores.push(score)
        validWeights.push(normalizedWeights[idx])
      }
    })

    // If candidate has no valid scores, assign minimum score 1
    let totalScore = 1
    if (validScores.length > 0) {
      // Renormalize weights for available scored criteria if partially evaluated
      const sumValidWeights = validWeights.reduce((a, b) => a + b, 0)
      const adjustedWeights =
        sumValidWeights > 0 ? validWeights.map((w) => w / sumValidWeights) : validWeights

      totalScore = calculateGeneralizedMeanScore(
        validScores,
        adjustedWeights,
        config.penaltySlider
      )
    }

    return {
      candidateId: cand.id,
      h3Index: cand.h3Index,
      totalScore,
      criterionResults,
      isComplete,
    }
  })

  // 3. Sort candidates by totalScore descending (100 = best)
  return results.sort((a, b) => b.totalScore - a.totalScore)
}
