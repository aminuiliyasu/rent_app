/**
 * Parse a manually entered price like "USD 25.00", "EUR 19,50", "$ 100", or plain "25".
 * Prefers currency-first input; also accepts "25 USD".
 */

function normalizeNumberToken(token: string): number | null {
  const t = token.replace(/\s/g, '')
  if (!t) return null
  const lastComma = t.lastIndexOf(',')
  const lastDot = t.lastIndexOf('.')
  let n = t
  if (lastComma > lastDot) {
    n = t.replace(/\./g, '').replace(',', '.')
  } else if (lastDot > lastComma) {
    n = t.replace(/,/g, '')
  } else if (lastComma >= 0) {
    n = t.replace(',', '.')
  }
  const v = parseFloat(n)
  return Number.isFinite(v) ? v : null
}

export function parsePriceWithCurrency(raw: string): { amount: number | null; original: string } {
  const s = raw.trim()
  if (!s) return { amount: null, original: '' }

  const currencyFirst = s.match(/^([^\d\s,.-]+(?:\s+[^\d\s,.-]+)*)\s*(-?[\d][\d\s.,]*)\s*$/)
  if (currencyFirst) {
    const amount = normalizeNumberToken(currencyFirst[2])
    return { amount, original: s }
  }

  const amountFirst = s.match(/^(-?[\d][\d\s.,]*)\s*([^\d\s,.-]+(?:\s+[^\d\s,.-]+)*)\s*$/)
  if (amountFirst) {
    const amount = normalizeNumberToken(amountFirst[1])
    return { amount, original: s }
  }

  const numberOnly = s.match(/^(-?[\d][\d\s.,]*)\s*$/)
  if (numberOnly) {
    const amount = normalizeNumberToken(numberOnly[1])
    return { amount, original: s }
  }

  return { amount: null, original: s }
}
