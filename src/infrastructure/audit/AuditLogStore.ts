import type { AuditEvent, AuditLevel } from '../../domain/audit/types'

type AuditLogSubscriber = (events: readonly AuditEvent[]) => void

/**
 * In-memory append-only store for AuditEvents.
 *
 * Design decisions (Section 19 of ideas.md):
 * - Append-only: events are never modified or removed retroactively.
 * - Bounded: configurable maxEvents limit prevents unbounded memory growth.
 * - Reactive: subscribers are notified synchronously on every append.
 * - No framework dependency: uses a simple pub/sub pattern.
 */
export class AuditLogStore {
  private events: AuditEvent[] = []
  private subscribers: Set<AuditLogSubscriber> = new Set()
  private readonly maxEvents: number

  constructor(maxEvents = 5000) {
    this.maxEvents = maxEvents
  }

  /**
   * Appends an event to the store and notifies all subscribers.
   * If the limit is exceeded, the oldest event is dropped (FIFO).
   */
  append(event: AuditEvent): void {
    if (this.events.length >= this.maxEvents) {
      this.events.shift()
    }
    this.events.push(event)
    this.notifySubscribers()
  }

  /**
   * Subscribes to changes. Callback is called immediately with current events
   * and on every future append. Returns an unsubscribe function.
   */
  subscribe(callback: AuditLogSubscriber): () => void {
    this.subscribers.add(callback)
    callback([...this.events])
    return () => {
      this.subscribers.delete(callback)
    }
  }

  /** Returns a shallow copy of the current event list. */
  getEvents(): readonly AuditEvent[] {
    return [...this.events]
  }

  /**
   * Returns events filtered by level, evaluationId, and/or eventType prefix.
   * Supports the filtering requirements of Section 19.6.
   */
  filter(opts: {
    level?: AuditLevel
    evaluationId?: string
    operationId?: string
    provider?: string
    status?: string
  }): readonly AuditEvent[] {
    return this.events.filter((e) => {
      if (opts.level && e.level !== opts.level) return false
      if (opts.evaluationId && e.context.evaluationId !== opts.evaluationId) return false
      if (opts.operationId && e.context.operationId !== opts.operationId) return false
      if (opts.provider && e.context.provider !== opts.provider) return false
      if (opts.status && e.status !== opts.status) return false
      return true
    })
  }

  /** Total number of events currently in store. */
  get size(): number {
    return this.events.length
  }

  /** Clears all events. For testing only. */
  clear(): void {
    this.events = []
    this.notifySubscribers()
  }

  private notifySubscribers(): void {
    const snapshot = [...this.events]
    for (const sub of this.subscribers) {
      sub(snapshot)
    }
  }
}

/** Singleton store for the current application session. */
export const auditLogStore = new AuditLogStore()
