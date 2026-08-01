import type { AuditEvent } from '../../domain/audit/types'
import { db } from '../persistence/db'
import type { AuditEventEntity } from '../persistence/db'

/**
 * Persists selected audit events to IndexedDB.
 *
 * Not every in-memory event needs to be persisted — only events
 * that are relevant for historical audit review (Section 19.7).
 * Transient debug-level events are typically kept in memory only.
 */
export class AuditRepository {
  /**
   * Persists a single audit event to IndexedDB.
   */
  async save(event: AuditEvent): Promise<void> {
    const entity: AuditEventEntity = {
      id: event.id,
      evaluationId: event.context.evaluationId,
      timestamp: event.timestamp,
      level: event.level,
      eventType: event.eventType,
      message: event.message,
      details: {
        status: event.status,
        durationMs: event.durationMs,
        error: event.error,
        context: event.context,
        source: event.source,
        ...event.details,
      },
    }
    await db.auditEvents.add(entity)
  }

  /**
   * Persists a batch of events atomically.
   */
  async saveMany(events: AuditEvent[]): Promise<void> {
    const entities: AuditEventEntity[] = events.map((event) => ({
      id: event.id,
      evaluationId: event.context.evaluationId,
      timestamp: event.timestamp,
      level: event.level,
      eventType: event.eventType,
      message: event.message,
      details: {
        status: event.status,
        durationMs: event.durationMs,
        error: event.error,
        context: event.context,
        source: event.source,
        ...event.details,
      },
    }))
    await db.auditEvents.bulkAdd(entities)
  }

  /**
   * Returns all persisted events for a given evaluation (Section 19.7).
   * Results are ordered by timestamp ascending.
   */
  async getByEvaluationId(evaluationId: string): Promise<AuditEventEntity[]> {
    return db.auditEvents
      .where('evaluationId')
      .equals(evaluationId)
      .sortBy('timestamp')
  }
}

export const auditRepository = new AuditRepository()
