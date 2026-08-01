/**
 * Domain types for the Audit Log system.
 * Strictly follows Section 19 of notes/inbox/ideas.md.
 *
 * No UI, API, or infrastructure dependencies.
 * Sensitive data (API keys, credentials, tokens) MUST NEVER appear in any event.
 */

/** Event severity level. */
export type AuditLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

/**
 * Enumeration of all auditable event types in the system (Section 19.1).
 * Covers the full lifecycle: app start, zone, grid, reuse, scoring, provider, etc.
 */
export type AuditEventType =
  // Application lifecycle
  | 'APP_START'
  | 'PROJECT_OPENED'
  | 'PROJECT_CREATED'
  | 'CONFIG_CHANGED'
  // Spatial
  | 'ZONE_CHANGED'
  | 'GRID_GENERATED'
  | 'CANDIDATES_GENERATED'
  | 'CANDIDATE_DISCARDED'
  // Signature & reuse engine
  | 'SIGNATURE_CREATED'
  | 'REUSE_SEARCH'
  | 'RESULT_REUSED'
  | 'RESULT_REJECTED'
  // Provider / external API
  | 'PROVIDER_REQUEST_SENT'
  | 'PROVIDER_RESPONSE_RECEIVED'
  | 'PROVIDER_TIMEOUT'
  | 'PROVIDER_RETRY'
  | 'PROVIDER_ERROR'
  // Evaluation execution
  | 'EVALUATION_STARTED'
  | 'EVALUATION_PAUSED'
  | 'EVALUATION_RESUMED'
  | 'EVALUATION_CANCELLED'
  | 'EVALUATION_STATE_CHANGED'
  | 'SCORING_CALCULATED'
  | 'EVALUATION_COMPLETED'
  | 'EVALUATION_PARTIAL'
  | 'EVALUATION_FAILED'
  // Data
  | 'DATA_EXPORTED'
  | 'DATA_IMPORTED'

/**
 * Execution context propagated across layers (Section 19.5).
 * All IDs are optional — only include those available at the call site.
 */
export interface AuditContext {
  readonly projectId?: string
  readonly evaluationId?: string
  readonly operationId?: string
  readonly correlationId?: string
  readonly candidateId?: string
  readonly criterionId?: string
  readonly provider?: string
}

/**
 * Source location for best-effort technical reference (Section 19.3).
 * Populated from Error().stack when available.
 */
export interface AuditSourceLocation {
  readonly module?: string
  readonly function?: string
  readonly file?: string
  readonly line?: number
  readonly column?: number
}

/**
 * A single immutable audit event (Section 19.2 & 19.4).
 * Once created, an event MUST NOT be modified.
 */
export interface AuditEvent {
  /** Monotonic sequential ID for ordering. */
  readonly id: string
  readonly timestamp: string
  readonly level: AuditLevel
  readonly eventType: AuditEventType
  readonly message: string
  readonly context: AuditContext
  readonly source?: AuditSourceLocation
  /** Duration in milliseconds, when applicable. */
  readonly durationMs?: number
  /** Non-sensitive structured details. Never include secrets. */
  readonly details?: Record<string, unknown>
  /** Error message (never stack traces with credentials). */
  readonly error?: string
  /** Status label for display (e.g. RUNNING, REUSED, TIMEOUT). */
  readonly status?: string
}
