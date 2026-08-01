import type { ResultEntity } from '../../infrastructure/persistence/db'
import { calculateGeodesicDistanceMeters } from './geodesic'
import type { CandidateResultMatch, RejectionReason, ReuseConfig, ReuseDecision, ReuseQuery } from './types'

/**
 * Checks whether a saved result meets freshness criteria (Section 23 of ideas.md).
 */
export function isResultFresh(resultCreatedAt: string, maxFreshnessMs: number, nowMs = Date.now()): boolean {
  const createdAtMs = new Date(resultCreatedAt).getTime()
  if (isNaN(createdAtMs)) return false
  return nowMs - createdAtMs <= maxFreshnessMs
}

/**
 * Evaluates a single saved result against a calculation query (Section 5 & 6).
 */
export function evaluateCandidateResult(
  query: ReuseQuery,
  result: ResultEntity,
  config: ReuseConfig,
  nowMs = Date.now()
): CandidateResultMatch {
  const isSignatureMatch = result.signature === query.signature
  const distanceMeters = calculateGeodesicDistanceMeters(query.lat, query.lng, result.lat, result.lng)
  const isWithinThreshold = distanceMeters <= config.thresholdMeters
  const isFresh = isResultFresh(result.createdAt, config.maxFreshnessMs, nowMs)

  let rejectionReason: RejectionReason | undefined

  if (!isSignatureMatch) {
    rejectionReason = 'NO_MATCHING_SIGNATURE'
  } else if (!isWithinThreshold) {
    rejectionReason = 'EXCEEDS_DISTANCE_THRESHOLD'
  } else if (!isFresh) {
    rejectionReason = 'STALE_FRESHNESS'
  }

  return {
    result,
    distanceMeters,
    isSignatureMatch,
    isWithinThreshold,
    isFresh,
    rejectionReason,
  }
}

/**
 * Pure function: Evaluates a list of candidate stored results for a query and
 * returns the best decision (REUSE or CALCULATE) according to ideas.md rules.
 */
export function evaluateReuse(
  query: ReuseQuery,
  candidateResults: ResultEntity[],
  config: ReuseConfig,
  nowMs = Date.now()
): ReuseDecision {
  if (candidateResults.length === 0) {
    return {
      action: 'CALCULATE',
      query,
      rejectionReason: 'NO_RESULTS_FOUND',
    }
  }

  const matches = candidateResults.map((r) => evaluateCandidateResult(query, r, config, nowMs))

  // Filter valid reusable matches: signature match + distance <= threshold + fresh
  const validMatches = matches.filter((m) => m.isSignatureMatch && m.isWithinThreshold && m.isFresh)

  if (validMatches.length > 0) {
    // Pick the closest geographic match
    validMatches.sort((a, b) => a.distanceMeters - b.distanceMeters)
    const best = validMatches[0]

    return {
      action: 'REUSE',
      query,
      matchedResult: best.result,
      distanceMeters: best.distanceMeters,
    }
  }

  // If no valid match, find most descriptive rejection reason among signature-matching candidates
  const signatureMatches = matches.filter((m) => m.isSignatureMatch)
  let rejectionReason: RejectionReason = 'NO_MATCHING_SIGNATURE'

  if (signatureMatches.length > 0) {
    const freshExceeding = signatureMatches.filter((m) => m.isFresh && !m.isWithinThreshold)
    if (freshExceeding.length > 0) {
      rejectionReason = 'EXCEEDS_DISTANCE_THRESHOLD'
    } else {
      rejectionReason = 'STALE_FRESHNESS'
    }
  }

  return {
    action: 'CALCULATE',
    query,
    rejectionReason,
  }
}
