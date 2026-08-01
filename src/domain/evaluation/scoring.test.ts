import { describe, expect, it } from 'vitest'
import {
  computeRawScore,
  scoreCriterion,
  aggregateScore,
  evaluateCandidate,
  evaluateAndRankCandidates,
} from './scoring'
import type { Criterion, EvaluationConfig } from './types'
import type { CandidatePoint } from '../spatial/types'

// --- Fixtures ---

const BASE_CRITERION: Criterion = {
  id: 'crit-1',
  destinationId: 'dest-1',
  travelMode: 'DRIVING',
  maxTimeMinutes: 30,
  importance: 3,
}

const CANDIDATE_A: CandidatePoint = {
  id: 'cand-a',
  h3Index: '88dd6b8151fffff',
  lat: -34.59,
  lng: -58.40,
}

const CANDIDATE_B: CandidatePoint = {
  id: 'cand-b',
  h3Index: '88dd6b8153fffff',
  lat: -34.60,
  lng: -58.39,
}

// --- computeRawScore ---

describe('computeRawScore', () => {
  it('returns 1.0 for actualTime = 0 (perfect location)', () => {
    expect(computeRawScore(0, 30, 2)).toBeCloseTo(1.0)
  })

  it('returns 0.5 for actualTime = half of maxTime', () => {
    expect(computeRawScore(15, 30, 2)).toBeCloseTo(0.5)
  })

  it('returns 0.0 for actualTime = maxTime exactly', () => {
    expect(computeRawScore(30, 30, 2)).toBeCloseTo(0.0)
  })

  it('applies exponential penalty when actualTime > maxTime', () => {
    // ratio = 45/30 = 1.5, score = e^(-2 * 0.5) = e^(-1) ≈ 0.3679
    const score = computeRawScore(45, 30, 2)
    expect(score).toBeCloseTo(Math.exp(-1), 4)
    // Penalty score is lower than 0 (in regular scale) but above 0
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(0.5)
  })

  it('returns 0 for maxTime = 0 (invalid config)', () => {
    expect(computeRawScore(10, 0, 2)).toBe(0)
  })

  it('decays toward 0 with larger exceedance', () => {
    const scoreSmall = computeRawScore(40, 30, 2)
    const scoreLarge = computeRawScore(60, 30, 2)
    expect(scoreSmall).toBeGreaterThan(scoreLarge)
  })
})

// --- scoreCriterion ---

describe('scoreCriterion', () => {
  it('returns null-safe zero score when actualTimeMinutes is null', () => {
    const result = scoreCriterion(BASE_CRITERION, null, 2)
    expect(result.actualTimeMinutes).toBeNull()
    expect(result.rawScore).toBe(0)
    expect(result.weightedContribution).toBe(0)
  })

  it('assigns weighted contribution = rawScore × importance', () => {
    const result = scoreCriterion(BASE_CRITERION, 15, 2) // rawScore = 0.5, importance = 3
    expect(result.rawScore).toBeCloseTo(0.5)
    expect(result.weightedContribution).toBeCloseTo(1.5)
  })

  it('stores criterionId correctly', () => {
    const result = scoreCriterion(BASE_CRITERION, 10, 2)
    expect(result.criterionId).toBe('crit-1')
  })
})

// --- aggregateScore ---

describe('aggregateScore', () => {
  it('returns 100 when all rawScores are 1.0', () => {
    const criteria: Criterion[] = [
      { ...BASE_CRITERION, id: 'c1', importance: 5 },
      { ...BASE_CRITERION, id: 'c2', importance: 3 },
    ]
    const scores = [
      { criterionId: 'c1', actualTimeMinutes: 0, rawScore: 1, weightedContribution: 5 },
      { criterionId: 'c2', actualTimeMinutes: 0, rawScore: 1, weightedContribution: 3 },
    ]
    expect(aggregateScore(scores, criteria)).toBeCloseTo(100)
  })

  it('returns 0 when all rawScores are 0', () => {
    const criteria: Criterion[] = [{ ...BASE_CRITERION, id: 'c1', importance: 4 }]
    const scores = [
      { criterionId: 'c1', actualTimeMinutes: 30, rawScore: 0, weightedContribution: 0 },
    ]
    expect(aggregateScore(scores, criteria)).toBeCloseTo(0)
  })

  it('returns 0 when criteria array is empty', () => {
    expect(aggregateScore([], [])).toBe(0)
  })

  it('correctly weights higher-importance criteria more', () => {
    // Criterion A (importance=5) scores 1.0, Criterion B (importance=1) scores 0.0
    // Expected: (5×1 + 1×0) / (5+1) × 100 = 83.33
    const criteria: Criterion[] = [
      { ...BASE_CRITERION, id: 'c-high', importance: 5 },
      { ...BASE_CRITERION, id: 'c-low', importance: 1 },
    ]
    const scores = [
      { criterionId: 'c-high', actualTimeMinutes: 0, rawScore: 1, weightedContribution: 5 },
      { criterionId: 'c-low', actualTimeMinutes: 30, rawScore: 0, weightedContribution: 0 },
    ]
    expect(aggregateScore(scores, criteria)).toBeCloseTo(83.33, 1)
  })
})

// --- evaluateCandidate ---

describe('evaluateCandidate', () => {
  const config: EvaluationConfig = {
    criteria: [BASE_CRITERION],
    penaltyFactor: 2,
  }

  it('marks isComplete = false when a criterion has null time', () => {
    const result = evaluateCandidate(CANDIDATE_A, config, { 'crit-1': null })
    expect(result.isComplete).toBe(false)
    expect(result.totalScore).toBe(0)
  })

  it('marks isComplete = true when all criteria have times', () => {
    const result = evaluateCandidate(CANDIDATE_A, config, { 'crit-1': 15 })
    expect(result.isComplete).toBe(true)
    // rawScore = 0.5, importance = 3 → totalScore = (0.5×3)/3 × 100 = 50
    expect(result.totalScore).toBeCloseTo(50)
  })

  it('stores candidateId and h3Index correctly', () => {
    const result = evaluateCandidate(CANDIDATE_A, config, { 'crit-1': 0 })
    expect(result.candidateId).toBe('cand-a')
    expect(result.h3Index).toBe('88dd6b8151fffff')
  })

  it('handles missing criterionId in timesMap as null', () => {
    // No key 'crit-1' in map → treated as null
    const result = evaluateCandidate(CANDIDATE_A, config, {})
    expect(result.breakdown[0].actualTimeMinutes).toBeNull()
  })
})

// --- evaluateAndRankCandidates ---

describe('evaluateAndRankCandidates', () => {
  const config: EvaluationConfig = {
    criteria: [BASE_CRITERION],
    penaltyFactor: 2,
  }

  it('ranks candidates by totalScore descending', () => {
    const timesMap: Record<string, Record<string, number | null>> = {
      'cand-a': { 'crit-1': 5 },  // close → high score
      'cand-b': { 'crit-1': 25 }, // far → lower score
    }
    const results = evaluateAndRankCandidates([CANDIDATE_A, CANDIDATE_B], config, timesMap)
    expect(results[0].candidateId).toBe('cand-a')
    expect(results[1].candidateId).toBe('cand-b')
    expect(results[0].totalScore).toBeGreaterThan(results[1].totalScore)
  })

  it('handles empty candidates list', () => {
    expect(evaluateAndRankCandidates([], config, {})).toEqual([])
  })
})
