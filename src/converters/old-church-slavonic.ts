// Old Church Slavonic Cyrillic numerals — alphabetic additive.
// ҂ (U+0482) prefixes thousands digits; no titlo mark used.
// fromArabic(0) → "∅"   Range: 0–9,999

import type { BreakdownToken } from './types'

const THOU_MARK = '\u0482'  // ҂

// index 1–9 maps to the letter; index 0 unused
const UNITS    = ['', '\u0410', '\u0412', '\u0413', '\u0414', '\u0404',
                      '\u0405', '\u0417', '\u0418', '\u0472']
// А  В  Г  Д  Є  Ѕ  З  И  Ѳ

const TENS     = ['', '\u0406', '\u041A', '\u041B', '\u041C', '\u041D',
                      '\u046E', '\u041E', '\u041F', '\u0427']
// І  К  Л  М  Н  Ѯ  О  П  Ч

const HUNDREDS = ['', '\u0420', '\u0421', '\u0422', '\u0423', '\u0424',
                      '\u0425', '\u0470', '\u047E', '\u0426']
// Р  С  Т  У  Ф  Х  Ѱ  Ѿ  Ц

// Reverse lookup for toArabic
const GLYPH_VALUE = new Map<string, number>()
UNITS.slice(1).forEach((g, i) => GLYPH_VALUE.set(g, i + 1))
TENS.slice(1).forEach((g, i) => GLYPH_VALUE.set(g, (i + 1) * 10))
HUNDREDS.slice(1).forEach((g, i) => GLYPH_VALUE.set(g, (i + 1) * 100))

export function fromArabic(n: number): string {
  if (!Number.isInteger(n)) throw new Error('Input must be an integer')
  if (n < 0 || n > 9_999) throw new Error(`Out of range: ${n}`)
  if (n === 0) return '\u2205' // ∅

  const t = Math.floor(n / 1000)
  const h = Math.floor((n % 1000) / 100)
  const d = Math.floor((n % 100) / 10)
  const u = n % 10

  let result = ''
  if (t > 0) result += THOU_MARK + UNITS[t]
  result += HUNDREDS[h] + TENS[d] + UNITS[u]
  return result
}

export function toArabic(s: string): number {
  if (s.includes('.')) throw new Error('Fractions not supported')

  let total = 0
  const chars = [...s]  // Unicode-safe codepoint iteration
  let i = 0
  while (i < chars.length) {
    if (chars[i] === THOU_MARK) {
      i++
      if (i >= chars.length) throw new Error(`Cannot parse: ${s}`)
      const val = GLYPH_VALUE.get(chars[i])
      if (val === undefined) throw new Error(`Cannot parse: ${s}`)
      total += val * 1000
    } else {
      const val = GLYPH_VALUE.get(chars[i])
      if (val === undefined) throw new Error(`Cannot parse: ${s}`)
      total += val
    }
    i++
  }
  return total
}

export function explain(n: number): BreakdownToken[] {
  if (!Number.isInteger(n)) throw new Error('Input must be an integer')
  if (n < 0 || n > 9_999) throw new Error(`Out of range: ${n}`)
  if (n === 0) return []

  const t = Math.floor(n / 1000)
  const h = Math.floor((n % 1000) / 100)
  const d = Math.floor((n % 100) / 10)
  const u = n % 10

  const tokens: BreakdownToken[] = []
  if (t > 0) tokens.push({ display: THOU_MARK + UNITS[t], value: t * 1000 })
  if (h > 0) tokens.push({ display: HUNDREDS[h], value: h * 100 })
  if (d > 0) tokens.push({ display: TENS[d], value: d * 10 })
  if (u > 0) tokens.push({ display: UNITS[u], value: u })
  return tokens
}
