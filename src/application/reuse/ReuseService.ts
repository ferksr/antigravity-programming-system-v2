import type { ResultRepository } from '../../infrastructure/persistence/repositories/ResultRepository'
import { auditLogStore } from '../../infrastructure/audit/AuditLogStore'
import { createEvent } from '../../domain/audit/logger'
import { evaluateReuse } from '../../domain/reuse/engine'
import type { ReuseConfig, ReuseDecision, ReuseQuery } from '../../domain/reuse/types'

export class ReuseService {
  private resultRepo: ResultRepository

  constructor(resultRepo: ResultRepository) {
    this.resultRepo = resultRepo
  }

  /**
   * Processes a calculation requirement: searches stored results, evaluates reusability,
   * emits structured AuditEvents, and returns the decision.
   */
  async processRequirement(
    query: ReuseQuery,
    config: ReuseConfig,
    evaluationId?: string
  ): Promise<ReuseDecision> {
    auditLogStore.append(
      createEvent('REUSE_SEARCH', `Searching reusable results for criterion ${query.criterionId}`, {
        context: {
          evaluationId,
          candidateId: query.candidateId,
          criterionId: query.criterionId,
        },
        details: {
          signature: query.signature,
          thresholdMeters: config.thresholdMeters,
        },
      })
    )

    // 1. Fetch candidate results with exact signature & criterion match
    const storedResults = await this.resultRepo.findBySignatureAndCriterion(query.signature, query.criterionId)

    // 2. Evaluate reusability
    const decision = evaluateReuse(query, storedResults, config)

    // 3. Emit Audit Event according to Section 19.4
    if (decision.action === 'REUSE' && decision.matchedResult) {
      auditLogStore.append(
        createEvent('RESULT_REUSED', 'Existing calculation result reused', {
          status: 'REUSED',
          context: {
            evaluationId,
            candidateId: query.candidateId,
            criterionId: query.criterionId,
            provider: decision.matchedResult.provider,
          },
          details: {
            distance: `${Math.round(decision.distanceMeters ?? 0)}m`,
            threshold: `${config.thresholdMeters}m`,
            signature: 'compatible',
            freshness: 'valid',
          },
        })
      )
    } else {
      auditLogStore.append(
        createEvent('RESULT_REJECTED', `Reuse rejected: ${decision.rejectionReason}`, {
          status: 'REJECTED',
          context: {
            evaluationId,
            candidateId: query.candidateId,
            criterionId: query.criterionId,
          },
          details: {
            reason: decision.rejectionReason,
            thresholdMeters: config.thresholdMeters,
          },
        })
      )
    }

    return decision
  }
}
