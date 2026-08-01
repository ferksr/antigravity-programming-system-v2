import 'fake-indexeddb/auto'
import { describe, expect, it, beforeEach } from 'vitest'
import { calculateGeodesicDistanceMeters } from './geodesic'
import { computeCalculationSignature } from './signature'
import { evaluateReuse, isResultFresh } from './engine'
import { GeoZoneDatabase, type ResultEntity } from '../../infrastructure/persistence/db'
import { ResultRepository } from '../../infrastructure/persistence/repositories/ResultRepository'
import { ReuseService } from '../../application/reuse/ReuseService'
import { auditLogStore } from '../../infrastructure/audit/AuditLogStore'
import type { ReuseConfig, ReuseQuery } from './types'

describe('Geodesic Distance (Section 6)', () => {
  it('calculates 0 meters for identical points', () => {
    const dist = calculateGeodesicDistanceMeters(-34.59, -58.40, -34.59, -58.40)
    expect(dist).toBe(0)
  })

  it('calculates approximately 111 km for 1 degree latitude difference', () => {
    const dist = calculateGeodesicDistanceMeters(-34.59, -58.40, -33.59, -58.40)
    // 1 deg lat is ~111.1 km
    expect(dist / 1000).toBeCloseTo(111.1, 0)
  })
})

describe('Calculation Signature (Section 9)', () => {
  it('produces deterministic output regardless of key order', () => {
    const sig1 = computeCalculationSignature({
      criterionType: 'TRANSIT',
      destinationLat: -34.60,
      destinationLng: -58.38,
      provider: 'GOOGLE',
      travelMode: 'TRANSIT',
    })

    const sig2 = computeCalculationSignature({
      travelMode: 'TRANSIT',
      provider: 'GOOGLE',
      destinationLng: -58.38,
      destinationLat: -34.60,
      criterionType: 'TRANSIT',
    })

    expect(sig1).toBe(sig2)
  })
})

describe('Reuse Engine Core (Section 5, 6, 7, 23)', () => {
  const config: ReuseConfig = {
    thresholdMeters: 200,
    maxFreshnessMs: 30 * 24 * 60 * 60 * 1000, // 30 days
  }

  const query: ReuseQuery = {
    candidateId: 'cand-1',
    lat: -34.5900,
    lng: -58.4000,
    signature: 'sig-transit-work',
    criterionId: 'crit-work',
  }

  const validResult: ResultEntity = {
    id: 'res-1',
    signature: 'sig-transit-work',
    lat: -34.5905, // ~55m away
    lng: -58.4000,
    criterionId: 'crit-work',
    rawValue: 22,
    provider: 'GOOGLE',
    createdAt: new Date().toISOString(),
  }

  it('approves reuse when signature matches, distance <= threshold, and result is fresh', () => {
    const decision = evaluateReuse(query, [validResult], config)
    expect(decision.action).toBe('REUSE')
    expect(decision.matchedResult?.id).toBe('res-1')
  })

  it('rejects reuse when distance exceeds threshold', () => {
    const farResult: ResultEntity = {
      ...validResult,
      lat: -34.6000, // ~1.1km away
    }
    const decision = evaluateReuse(query, [farResult], config)
    expect(decision.action).toBe('CALCULATE')
    expect(decision.rejectionReason).toBe('EXCEEDS_DISTANCE_THRESHOLD')
  })

  it('rejects reuse when result is stale', () => {
    const staleDate = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() // 40 days old
    const staleResult: ResultEntity = {
      ...validResult,
      createdAt: staleDate,
    }
    const decision = evaluateReuse(query, [staleResult], config)
    expect(decision.action).toBe('CALCULATE')
    expect(decision.rejectionReason).toBe('STALE_FRESHNESS')
  })

  it('validates isResultFresh helper correctly', () => {
    const now = Date.now()
    const tenDaysAgo = new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString()
    expect(isResultFresh(tenDaysAgo, 30 * 24 * 60 * 60 * 1000, now)).toBe(true)

    const fortyDaysAgo = new Date(now - 40 * 24 * 60 * 60 * 1000).toISOString()
    expect(isResultFresh(fortyDaysAgo, 30 * 24 * 60 * 60 * 1000, now)).toBe(false)
  })
})

describe('ReuseService Integration', () => {
  let db: GeoZoneDatabase
  let resultRepo: ResultRepository
  let service: ReuseService

  beforeEach(async () => {
    db = new GeoZoneDatabase()
    await db.open()
    await db.results.clear()

    resultRepo = new ResultRepository(db)
    service = new ReuseService(resultRepo)
    auditLogStore.clear()
  })

  it('emits AuditEvents when evaluating requirement', async () => {
    await resultRepo.saveResults([
      {
        id: 'res-10',
        signature: 'sig-test',
        lat: -34.59,
        lng: -58.40,
        criterionId: 'crit-test',
        rawValue: 15,
        provider: 'GOOGLE',
      },
    ])

    const query: ReuseQuery = {
      candidateId: 'cand-1',
      lat: -34.59,
      lng: -58.40,
      signature: 'sig-test',
      criterionId: 'crit-test',
    }

    const decision = await service.processRequirement(
      query,
      { thresholdMeters: 200, maxFreshnessMs: 86400000 },
      'eval-100'
    )

    expect(decision.action).toBe('REUSE')

    const events = auditLogStore.getEvents()
    expect(events.some((e) => e.eventType === 'REUSE_SEARCH')).toBe(true)
    expect(events.some((e) => e.eventType === 'RESULT_REUSED')).toBe(true)
  })
})
