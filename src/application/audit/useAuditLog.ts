import { useEffect, useState } from 'react'
import type { AuditEvent, AuditLevel } from '../../domain/audit/types'
import { auditLogStore } from '../../infrastructure/audit/AuditLogStore'
import { formatEventAsText } from '../../domain/audit/logger'

export interface UseAuditLogOptions {
  /** Filter by severity level. */
  level?: AuditLevel
  /** Filter by evaluationId. */
  evaluationId?: string
  /** Max number of events to expose to the component. */
  limit?: number
}

export interface UseAuditLogResult {
  events: readonly AuditEvent[]
  exportAsText: () => string
}

/**
 * React hook that subscribes to the global AuditLogStore and re-renders
 * whenever new events are appended.
 *
 * Supports filtering by level and evaluationId (Section 19.6).
 * The exportAsText function formats all visible events for copy/export (Section 19.6).
 */
export function useAuditLog(options: UseAuditLogOptions = {}): UseAuditLogResult {
  const [events, setEvents] = useState<readonly AuditEvent[]>([])

  useEffect(() => {
    const unsubscribe = auditLogStore.subscribe((allEvents) => {
      let filtered = allEvents

      if (options.level) {
        filtered = filtered.filter((e) => e.level === options.level)
      }
      if (options.evaluationId) {
        filtered = filtered.filter(
          (e) => e.context.evaluationId === options.evaluationId
        )
      }
      if (options.limit !== undefined) {
        filtered = filtered.slice(-options.limit)
      }

      setEvents(filtered)
    })

    return unsubscribe
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.level, options.evaluationId, options.limit])

  const exportAsText = (): string => {
    return events.map(formatEventAsText).join('\n\n---\n\n')
  }

  return { events, exportAsText }
}
