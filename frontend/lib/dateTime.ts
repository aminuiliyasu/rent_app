/**
 * Parse timestamps from the API. New responses use ISO-8601 UTC instants (`…Z`).
 * Legacy values without a timezone are treated as local wall-clock times.
 */
export function parseApiDateTime(value: string | Date | null | undefined): Date {
  if (value == null) return new Date(Number.NaN)
  if (value instanceof Date) return value

  const trimmed = value.trim()
  if (!trimmed) return new Date(Number.NaN)

  if (/[zZ]$/.test(trimmed) || /[+-]\d{2}:\d{2}$/.test(trimmed)) {
    return new Date(trimmed)
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return new Date(`${trimmed}T00:00:00`)
  }

  // Legacy Spring LocalDateTime without offset — stored/sent as local wall clock.
  return new Date(trimmed)
}

export function formatMessageTime(value: string): string {
  const d = parseApiDateTime(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

export function formatMessageDateSeparator(value: string): string {
  const d = parseApiDateTime(value)
  if (Number.isNaN(d.getTime())) return ''

  const now = new Date()
  const startOf = (dt: Date) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime()
  const diffDays = Math.round((startOf(now) - startOf(d)) / (24 * 60 * 60 * 1000))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return d.toLocaleDateString(undefined, { weekday: 'long' })
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function compareApiDateTime(a: string, b: string): number {
  return parseApiDateTime(a).getTime() - parseApiDateTime(b).getTime()
}
