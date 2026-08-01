/**
 * Calculation Signature module (Section 9 of ideas.md).
 * Computes a deterministic canonical string signature for a calculation request.
 *
 * Reusability strictly requires identical signatures (Section 7).
 */

export interface CalculationSignatureParams {
  readonly criterionType: string
  readonly travelMode?: string
  readonly destinationLat: number
  readonly destinationLng: number
  readonly dayOfWeek?: number // 0 = Sunday, 1 = Monday, etc.
  readonly timeOfDayMinutes?: number // Minutes from midnight
  readonly departureOrArrival?: 'DEPARTURE' | 'ARRIVAL'
  readonly provider: string
  readonly timezone?: string
  readonly category?: string
  readonly searchQuery?: string
  readonly customParams?: Record<string, unknown>
}

/**
 * Recursively sorts keys of an object to ensure deterministic JSON serialization.
 */
function sortObjectKeys(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys)
  }
  const record = obj as Record<string, unknown>
  const sortedKeys = Object.keys(record).sort()
  const result: Record<string, unknown> = {}
  for (const key of sortedKeys) {
    const val = record[key]
    if (val !== undefined) {
      result[key] = sortObjectKeys(val)
    }
  }
  return result
}

/**
 * Computes a deterministic canonical signature string for calculation request.
 */
export function computeCalculationSignature(params: CalculationSignatureParams): string {
  const canonicalParams = sortObjectKeys(params)
  return JSON.stringify(canonicalParams)
}
