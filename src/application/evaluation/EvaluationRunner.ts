import type { CandidatePoint, QuadrilateralZone } from '../../domain/spatial/types'
import type { Criterion, Destination, EvaluationConfig, CandidateEvaluationResult } from '../../domain/evaluation/types'
import { evaluateAndRankCandidates } from '../../domain/evaluation/scoring'
import { computeCalculationSignature } from '../../domain/reuse/signature'
import { ReuseService } from '../reuse/ReuseService'
import { ResultRepository } from '../../infrastructure/persistence/repositories/ResultRepository'
import { EvaluationRepository } from '../../infrastructure/persistence/repositories/EvaluationRepository'
import { db } from '../../infrastructure/persistence/db'
import { simulatedRoutingProvider } from '../../infrastructure/providers/simulated/SimulatedRoutingProvider'
import { auditLogStore } from '../../infrastructure/audit/AuditLogStore'
import { createEvent } from '../../domain/audit/logger'
import type { ReuseConfig } from '../../domain/reuse/types'

export interface EvaluationRunnerInput {
  readonly projectId?: string
  readonly evaluationName?: string
  readonly zone: QuadrilateralZone
  readonly candidates: CandidatePoint[]
  readonly criteria: Criterion[]
  readonly destinationsMap: Record<string, Destination>
  readonly penaltySlider: number
  readonly thresholdMeters?: number
  readonly maxFreshnessMs?: number
}

export interface EvaluationRunnerResult {
  readonly evaluationId: string
  readonly rankedCandidates: CandidateEvaluationResult[]
  readonly totalCandidates: number
  readonly reusedCount: number
  readonly calculatedCount: number
}

export class EvaluationRunner {
  private reuseService: ReuseService
  private resultRepo: ResultRepository
  private evalRepo: EvaluationRepository

  constructor() {
    this.resultRepo = new ResultRepository(db)
    this.evalRepo = new EvaluationRepository(db)
    this.reuseService = new ReuseService(this.resultRepo)
  }

  async run(input: EvaluationRunnerInput): Promise<EvaluationRunnerResult> {
    const evaluationId = `eval-${Date.now()}`
    const projectId = input.projectId ?? 'proj-default'

    const config: EvaluationConfig = {
      criteria: input.criteria,
      penaltySlider: input.penaltySlider,
    }

    const reuseConfig: ReuseConfig = {
      thresholdMeters: input.thresholdMeters ?? 200,
      maxFreshnessMs: input.maxFreshnessMs ?? 30 * 24 * 60 * 60 * 1000,
    }

    auditLogStore.append(
      createEvent('EVALUATION_STARTED', `Started evaluation ${evaluationId} with ${input.candidates.length} candidates`, {
        context: { projectId, evaluationId },
        details: {
          candidatesCount: input.candidates.length,
          criteriaCount: input.criteria.length,
          penaltySlider: input.penaltySlider,
        },
      })
    )

    const valuesMap: Record<string, Record<string, number | null>> = {}
    let reusedCount = 0
    let calculatedCount = 0

    // Initialize valuesMap structure
    for (const cand of input.candidates) {
      valuesMap[cand.id] = {}
    }

    // Process all candidate/criterion pairs
    for (const cand of input.candidates) {
      for (const criterion of input.criteria) {
        const dest = input.destinationsMap[criterion.destinationId]
        if (!dest) continue

        const signature = computeCalculationSignature({
          criterionType: criterion.travelMode,
          travelMode: criterion.travelMode,
          destinationLat: dest.lat,
          destinationLng: dest.lng,
          provider: 'SIMULATED',
        })

        const decision = await this.reuseService.processRequirement(
          {
            candidateId: cand.id,
            lat: cand.lat,
            lng: cand.lng,
            signature,
            criterionId: criterion.id,
          },
          reuseConfig,
          evaluationId
        )

        if (decision.action === 'REUSE' && decision.matchedResult) {
          valuesMap[cand.id][criterion.id] = decision.matchedResult.rawValue
          reusedCount += 1
        } else {
          // Calculate using simulated provider
          const routeResult = simulatedRoutingProvider.estimateRoute({
            originLat: cand.lat,
            originLng: cand.lng,
            destinationLat: dest.lat,
            destinationLng: dest.lng,
            travelMode: criterion.travelMode,
          })

          valuesMap[cand.id][criterion.id] = routeResult.durationMinutes
          calculatedCount += 1

          // Save new result to global cache
          await this.resultRepo.saveResults([
            {
              id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              signature,
              lat: cand.lat,
              lng: cand.lng,
              criterionId: criterion.id,
              rawValue: routeResult.durationMinutes,
              provider: routeResult.provider,
            },
          ])
        }
      }
    }

    // Perform scoring and ranking
    const rankedCandidates = evaluateAndRankCandidates(input.candidates, config, valuesMap)

    // Persist evaluation snapshot
    await this.evalRepo.createEvaluation(
      {
        id: evaluationId,
        projectId,
        name: input.evaluationName ?? `Evaluación ${new Date().toLocaleTimeString()}`,
        config,
        zone: input.zone,
        status: 'COMPLETED',
      },
      input.candidates.map((c) => ({ id: c.id, h3Index: c.h3Index, lat: c.lat, lng: c.lng }))
    )

    auditLogStore.append(
      createEvent('EVALUATION_COMPLETED', `Evaluation ${evaluationId} completed successfully`, {
        context: { projectId, evaluationId },
        details: {
          totalCandidates: input.candidates.length,
          reusedCount,
          calculatedCount,
          topCandidateId: rankedCandidates[0]?.candidateId,
          topScore: rankedCandidates[0]?.totalScore,
        },
      })
    )

    return {
      evaluationId,
      rankedCandidates,
      totalCandidates: input.candidates.length,
      reusedCount,
      calculatedCount,
    }
  }
}

export const evaluationRunner = new EvaluationRunner()
