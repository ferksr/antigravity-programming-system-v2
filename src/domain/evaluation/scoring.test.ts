import { describe, expect, it } from 'vitest'
import {
  applyPessimisticBound,
  calculateRelativeScore,
  normalizeWeights,
  calculateGeneralizedMeanScore,
  evaluateAndRankCandidates,
} from './scoring'
import type { Criterion, EvaluationConfig } from './types'
import type { CandidatePoint } from '../spatial/types'

// --- Section 27: Pessimistic Bound Tests ---

describe('applyPessimisticBound (Section 27)', () => {
  it('returns max bound for LOWER_IS_BETTER (travel time 20-50 min -> 50 min)', () => {
    expect(applyPessimisticBound({ min: 20, max: 50 }, 'LOWER_IS_BETTER')).toBe(50)
  })

  it('returns min bound for HIGHER_IS_BETTER (rating 4.2-4.7 -> 4.2)', () => {
    expect(applyPessimisticBound({ min: 4.2, max: 4.7 }, 'HIGHER_IS_BETTER')).toBe(4.2)
  })
})

// --- Section 26.1: Relative Normalization (Scale 1–100) ---

describe('calculateRelativeScore (Section 26.1)', () => {
  describe('LOWER_IS_BETTER (e.g. travel time, distance)', () => {
    it('returns score = 100 for minimum value (best)', () => {
      expect(calculateRelativeScore(10, 10, 50, 'LOWER_IS_BETTER')).toBe(100)
    })

    it('returns score = 1 for maximum value (worst)', () => {
      expect(calculateRelativeScore(50, 10, 50, 'LOWER_IS_BETTER')).toBe(1)
    })

    it('returns score = 50.5 for midpoint value', () => {
      expect(calculateRelativeScore(30, 10, 50, 'LOWER_IS_BETTER')).toBeCloseTo(50.5)
    })
  })

  describe('HIGHER_IS_BETTER (e.g. rating, review count)', () => {
    it('returns score = 100 for maximum value (best)', () => {
      expect(calculateRelativeScore(4.8, 3.0, 4.8, 'HIGHER_IS_BETTER')).toBe(100)
    })

    it('returns score = 1 for minimum value (worst)', () => {
      expect(calculateRelativeScore(3.0, 3.0, 4.8, 'HIGHER_IS_BETTER')).toBe(1)
    })
  })

  describe('All values equal (max = min)', () => {
    it('returns score = 100 when max equals min (Section 26.1 rule)', () => {
      expect(calculateRelativeScore(25, 25, 25, 'LOWER_IS_BETTER')).toBe(100)
      expect(calculateRelativeScore(4.5, 4.5, 4.5, 'HIGHER_IS_BETTER')).toBe(100)
    })
  })
})

// --- Section 28: Normalized Weights ---

describe('normalizeWeights (Section 28)', () => {
  it('normalizes weights so they sum to 1.0', () => {
    const criteria: Criterion[] = [
      { id: 'c1', destinationId: 'd1', travelMode: 'TRANSIT', direction: 'LOWER_IS_BETTER', weight: 3 },
      { id: 'c2', destinationId: 'd2', travelMode: 'DRIVING', direction: 'LOWER_IS_BETTER', weight: 1 },
    ]
    const weights = normalizeWeights(criteria)
    expect(weights[0]).toBe(0.75)
    expect(weights[1]).toBe(0.25)
    expect(weights.reduce((a, b) => a + b, 0)).toBe(1)
  })

  it('throws an error if sum of weights is 0', () => {
    const criteria: Criterion[] = [
      { id: 'c1', destinationId: 'd1', travelMode: 'TRANSIT', direction: 'LOWER_IS_BETTER', weight: 0 },
    ]
    expect(() => normalizeWeights(criteria)).toThrowError()
  })
})

// --- Section 29: Generalized Mean Penalty ---

describe('calculateGeneralizedMeanScore (Section 29)', () => {
  it('acts as weighted arithmetic mean when penaltySlider = 0', () => {
    const scores = [100, 50]
    const weights = [0.5, 0.5]
    // (100*0.5 + 50*0.5) = 75
    expect(calculateGeneralizedMeanScore(scores, weights, 0)).toBeCloseTo(75)
  })

  it('penalizes unequal scores heavily as penaltySlider increases (Section 29 requirement: 45,45 > 100,1 with high penalty)', () => {
    const equalScores = [45, 45]
    const unequalScores = [100, 1]
    const weights = [0.5, 0.5]

    // With 0 penalty, unequal (100+1)/2 = 50.5 is higher than equal 45
    const scoreEqualNoPenalty = calculateGeneralizedMeanScore(equalScores, weights, 0)
    const scoreUnequalNoPenalty = calculateGeneralizedMeanScore(unequalScores, weights, 0)
    expect(scoreUnequalNoPenalty).toBeGreaterThan(scoreEqualNoPenalty)

    // With 100 penalty, equal 45 > unequal (due to p-norm inequality penalty)
    const scoreEqualMaxPenalty = calculateGeneralizedMeanScore(equalScores, weights, 100)
    const scoreUnequalMaxPenalty = calculateGeneralizedMeanScore(unequalScores, weights, 100)
    expect(scoreEqualMaxPenalty).toBeGreaterThan(scoreUnequalMaxPenalty)
  })
})

// --- evaluateAndRankCandidates ---

describe('evaluateAndRankCandidates', () => {
  const criteria: Criterion[] = [
    { id: 'c1', destinationId: 'd1', travelMode: 'TRANSIT', direction: 'LOWER_IS_BETTER', weight: 2 },
    { id: 'c2', destinationId: 'd2', travelMode: 'DRIVING', direction: 'LOWER_IS_BETTER', weight: 1 },
  ]
  const config: EvaluationConfig = {
    criteria,
    penaltySlider: 0,
  }

  const candA: CandidatePoint = { id: 'cand-a', h3Index: '88dd6b8151fffff', lat: -34.59, lng: -58.40 }
  const candB: CandidatePoint = { id: 'cand-b', h3Index: '88dd6b8153fffff', lat: -34.60, lng: -58.39 }

  it('ranks candidate with lower travel times higher', () => {
    const valuesMap = {
      'cand-a': { c1: 15, c2: 10 }, // Best overall
      'cand-b': { c1: 45, c2: 30 }, // Worst overall
    }

    const results = evaluateAndRankCandidates([candA, candB], config, valuesMap)
    expect(results[0].candidateId).toBe('cand-a')
    expect(results[0].totalScore).toBeCloseTo(100)
    expect(results[1].candidateId).toBe('cand-b')
    expect(results[1].totalScore).toBeCloseTo(1)
  })
})
