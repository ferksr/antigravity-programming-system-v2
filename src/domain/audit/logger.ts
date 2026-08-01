import type {
  AuditEvent,
  AuditEventType,
  AuditLevel,
  AuditContext,
  AuditSourceLocation,
} from './types'

let eventSequence = 0

/**
 * Generates a monotonic event ID.
 */
function nextEventId(): string {
  eventSequence += 1
  return `evt-${eventSequence}`
}

/**
 * Best-effort extraction of source location from an Error stack trace (Section 19.3).
 * Returns undefined if no useful info can be extracted.
 */
function extractSourceLocation(): AuditSourceLocation | undefined {
  try {
    const stack = new Error().stack
    if (!stack) return undefined

    // Skip the top frames belonging to this logger module
    const lines = stack.split('\n').slice(3)
    const callerLine = lines.find((l) => l.includes('.ts') || l.includes('.js'))
    if (!callerLine) return undefined

    // Extract file, line, column from "at functionName (file:line:col)" or "at file:line:col"
    const match = callerLine.match(/at (?:(.+?) \()?(.+?):(\d+):(\d+)\)?$/)
    if (!match) return undefined

    const [, fnName, filePath, lineStr, colStr] = match
    const file = filePath?.split('/').pop() ?? filePath
    const module = filePath?.replace(/^.*?src\//, 'src/')

    return {
      module,
      function: fnName?.trim() || undefined,
      file,
      line: lineStr ? parseInt(lineStr, 10) : undefined,
      column: colStr ? parseInt(colStr, 10) : undefined,
    }
  } catch {
    return undefined
  }
}

export interface CreateEventOptions {
  level?: AuditLevel
  context?: AuditContext
  durationMs?: number
  details?: Record<string, unknown>
  error?: string
  status?: string
  /** If true, skips source location extraction (for performance-sensitive paths). */
  skipSourceLocation?: boolean
}

/**
 * Creates an immutable AuditEvent with a timestamp and best-effort source location.
 *
 * IMPORTANT: Never pass API keys, passwords, tokens, or credentials
 * in `details`, `message`, or `error`.
 */
export function createEvent(
  eventType: AuditEventType,
  message: string,
  options: CreateEventOptions = {}
): AuditEvent {
  return {
    id: nextEventId(),
    timestamp: new Date().toISOString(),
    level: options.level ?? 'INFO',
    eventType,
    message,
    context: options.context ?? {},
    source: options.skipSourceLocation ? undefined : extractSourceLocation(),
    durationMs: options.durationMs,
    details: options.details,
    error: options.error,
    status: options.status,
  }
}

/**
 * Formats an AuditEvent as human- and AI-readable plain text (Section 19.4).
 *
 * Example output:
 *   [10:32:15.120] INFO GRID_GENERATED
 *   evaluation=E-102 operation=grid#1
 *   module=src/infrastructure/h3/grid.ts
 *   message=Grid generated with 18 candidates
 */
export function formatEventAsText(event: AuditEvent): string {
  const time = event.timestamp.replace('T', ' ').replace('Z', '').slice(0, -4) // HH:mm:ss.mmm
  const lines: string[] = []

  lines.push(`[${time}] ${event.level} ${event.eventType}`)

  if (event.status) lines.push(`status=${event.status}`)
  if (event.context.projectId) lines.push(`project=${event.context.projectId}`)
  if (event.context.evaluationId) lines.push(`evaluation=${event.context.evaluationId}`)
  if (event.context.operationId) lines.push(`operation=${event.context.operationId}`)
  if (event.context.correlationId) lines.push(`correlation=${event.context.correlationId}`)
  if (event.context.candidateId) lines.push(`candidate=${event.context.candidateId}`)
  if (event.context.criterionId) lines.push(`criterion=${event.context.criterionId}`)
  if (event.context.provider) lines.push(`provider=${event.context.provider}`)

  if (event.source?.module) lines.push(`module=${event.source.module}`)
  if (event.source?.function) lines.push(`function=${event.source.function}`)
  if (event.source?.file) lines.push(`file=${event.source.file}`)
  if (event.source?.line !== undefined) {
    const col = event.source.column !== undefined ? `:${event.source.column}` : ''
    lines.push(`line=${event.source.line}${col}`)
  }

  lines.push(`message=${event.message}`)

  if (event.durationMs !== undefined) lines.push(`duration=${event.durationMs}ms`)
  if (event.error) lines.push(`error=${event.error}`)

  if (event.details) {
    for (const [k, v] of Object.entries(event.details)) {
      lines.push(`${k}=${String(v)}`)
    }
  }

  return lines.join('\n')
}

/**
 * Resets the event sequence counter.
 * For use in tests only — never call in production.
 */
export function resetEventSequence(): void {
  eventSequence = 0
}
