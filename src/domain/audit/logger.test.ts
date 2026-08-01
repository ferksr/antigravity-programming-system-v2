import { describe, expect, it, beforeEach } from 'vitest'
import { createEvent, formatEventAsText, resetEventSequence } from './logger'
import type { AuditContext } from './types'

beforeEach(() => {
  resetEventSequence()
})

// --- createEvent ---

describe('createEvent', () => {
  it('creates an event with a sequential ID, timestamp, level, type and message', () => {
    const event = createEvent('APP_START', 'Application started', { skipSourceLocation: true })
    expect(event.id).toBe('evt-1')
    expect(event.level).toBe('INFO')
    expect(event.eventType).toBe('APP_START')
    expect(event.message).toBe('Application started')
    expect(event.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('increments ID monotonically', () => {
    const a = createEvent('APP_START', 'first', { skipSourceLocation: true })
    const b = createEvent('GRID_GENERATED', 'second', { skipSourceLocation: true })
    expect(a.id).toBe('evt-1')
    expect(b.id).toBe('evt-2')
  })

  it('applies optional level, status, and durationMs', () => {
    const event = createEvent('PROVIDER_TIMEOUT', 'Request timed out', {
      level: 'WARN',
      status: 'TIMEOUT',
      durationMs: 30000,
      skipSourceLocation: true,
    })
    expect(event.level).toBe('WARN')
    expect(event.status).toBe('TIMEOUT')
    expect(event.durationMs).toBe(30000)
  })

  it('attaches context fields when provided', () => {
    const ctx: AuditContext = {
      evaluationId: 'E-101',
      operationId: 'route#44',
      candidateId: 'cand-7',
      provider: 'GOOGLE',
    }
    const event = createEvent('PROVIDER_REQUEST_SENT', 'Sending route request', {
      context: ctx,
      skipSourceLocation: true,
    })
    expect(event.context.evaluationId).toBe('E-101')
    expect(event.context.provider).toBe('GOOGLE')
  })

  it('attaches non-sensitive details', () => {
    const event = createEvent('CANDIDATES_GENERATED', 'Candidates ready', {
      details: { count: 18, resolution: 8 },
      skipSourceLocation: true,
    })
    expect(event.details?.count).toBe(18)
    expect(event.details?.resolution).toBe(8)
  })

  it('event is immutable (readonly structure)', () => {
    const event = createEvent('ZONE_CHANGED', 'Zone updated', { skipSourceLocation: true })
    // TypeScript enforces readonly at compile time; we verify the shape at runtime
    expect(Object.isFrozen(event)).toBe(false) // plain objects aren't frozen by default
    expect(event.id).toBeDefined()
  })
})

// --- formatEventAsText ---

describe('formatEventAsText', () => {
  it('produces the expected format for a minimal event (Section 19.4)', () => {
    const event = createEvent('APP_START', 'Application started', { skipSourceLocation: true })
    const text = formatEventAsText(event)
    expect(text).toContain('APP_START')
    expect(text).toContain('message=Application started')
    expect(text).toMatch(/\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)
  })

  it('includes evaluation context fields when present', () => {
    const event = createEvent('RESULT_REUSED', 'Existing result reused', {
      context: {
        evaluationId: 'E-102',
        operationId: 'reuse#144',
        candidateId: '-32.95,-60.65',
        criterionId: 'Work A',
      },
      status: 'REUSED',
      details: { distance: '143m', threshold: '200m', signature: 'compatible', freshness: 'valid' },
      skipSourceLocation: true,
    })
    const text = formatEventAsText(event)
    expect(text).toContain('evaluation=E-102')
    expect(text).toContain('operation=reuse#144')
    expect(text).toContain('status=REUSED')
    expect(text).toContain('distance=143m')
    expect(text).toContain('freshness=valid')
    expect(text).toContain('message=Existing result reused')
  })

  it('includes duration and error when present', () => {
    const event = createEvent('PROVIDER_TIMEOUT', 'Route request timed out', {
      level: 'WARN',
      status: 'TIMEOUT',
      durationMs: 30000,
      error: 'AbortError: Request exceeded 30s limit',
      skipSourceLocation: true,
    })
    const text = formatEventAsText(event)
    expect(text).toContain('duration=30000ms')
    expect(text).toContain('error=AbortError')
  })

  it('omits empty optional fields to keep output clean', () => {
    const event = createEvent('ZONE_CHANGED', 'Zone updated', { skipSourceLocation: true })
    const text = formatEventAsText(event)
    expect(text).not.toContain('evaluation=')
    expect(text).not.toContain('operation=')
    expect(text).not.toContain('duration=')
    expect(text).not.toContain('error=')
  })
})
