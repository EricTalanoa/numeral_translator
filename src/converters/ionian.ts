import type { BreakdownToken } from './types'

// Ionian (Milesian/Alphabetic) Greek numerals
// ͵ = U+0375 (GREEK LOWER NUMERAL SIGN, thousands prefix)
// ʹ = U+02B9 (MODIFIER LETTER PRIME, keraia, appended after numeral)

const THOUSANDS = [
  '',
  '\u0375\u03B1',  // ͵α = 1,000
  '\u0375\u03B2',  // ͵β = 2,000
  '\u0375\u03B3',  // ͵γ = 3,000
  '\u0375\u03B4',  // ͵δ = 4,000
  '\u0375\u03B5',  // ͵ε = 5,000
  '\u0375\u03DB',  // ͵ϛ = 6,000 (stigma/digamma)
  '\u0375\u03B6',  // ͵ζ = 7,000
  '\u0375\u03B7',  // ͵η = 8,000
  '\u0375\u03B8',  // ͵θ = 9,000
]
const HUNDREDS  = ['', '\u03C1', '\u03C3', '\u03C4', '\u03C5', '\u03C6', '\u03C7', '\u03C8', '\u03C9', '\u03E1']
const TENS      = ['', '\u03B9', '\u03BA', '\u03BB', '\u03BC', '\u03BD', '\u03BE', '\u03BF', '\u03C0', '\u03DF']
const UNITS     = ['', '\u03B1', '\u03B2', '\u03B3', '\u03B4', '\u03B5', '\u03DB', '\u03B6', '\u03B7', '\u03B8']

const KERAIA       = '\u02B9'
const NUMERAL_SIGN = '\u0375'

const LETTER_TO_VALUE: Record<string, number> = {
  '\u03B1': 1,   '\u03B2': 2,   '\u03B3': 3,   '\u03B4': 4,   '\u03B5': 5,
  '\u03DB': 6,   '\u03B6': 7,   '\u03B7': 8,   '\u03B8': 9,
  '\u03B9': 10,  '\u03BA': 20,  '\u03BB': 30,  '\u03BC': 40,  '\u03BD': 50,
  '\u03BE': 60,  '\u03BF': 70,  '\u03C0': 80,  '\u03DF': 90,
  '\u03C1': 100, '\u03C3': 200, '\u03C4': 300, '\u03C5': 400, '\u03C6': 500,
  '\u03C7': 600, '\u03C8': 700, '\u03C9': 800, '\u03E1': 900,
}

export function fromArabic(n: number): string {
  if (!Number.isInteger(n)) throw new Error('Input must be an integer')
  if (n < 0 || n > 9999) throw new Error(`Out of range: ${n}`)
  if (n === 0) return '\u2205' // ∅

  const t = Math.floor(n / 1000)
  const h = Math.floor((n % 1000) / 100)
  const d = Math.floor((n % 100) / 10)
  const u = n % 10

  return THOUSANDS[t] + HUNDREDS[h] + TENS[d] + UNITS[u] + KERAIA
}

export function toArabic(input: string): number {
  if (input.includes('.')) throw new Error('Fractions not supported')

  // Strip trailing keraia
  let s = input.endsWith(KERAIA) ? input.slice(0, -1) : input
  // Normalize to lowercase (accepts uppercase Greek input)
  s = s.toLowerCase()

  let result = 0
  let i = 0
  while (i < s.length) {
    if (s[i] === NUMERAL_SIGN) {
      i++
      if (i >= s.length) throw new Error(`Cannot parse: ${input}`)
      const val = LETTER_TO_VALUE[s[i]]
      if (val === undefined) throw new Error(`Cannot parse: ${input}`)
      result += val * 1000
    } else {
      const val = LETTER_TO_VALUE[s[i]]
      if (val === undefined) throw new Error(`Cannot parse: ${input}`)
      result += val
    }
    i++
  }
  return result
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
  if (t > 0) tokens.push({ display: THOUSANDS[t], value: t * 1000 })
  if (h > 0) tokens.push({ display: HUNDREDS[h], value: h * 100 })
  if (d > 0) tokens.push({ display: TENS[d], value: d * 10 })
  if (u > 0) tokens.push({ display: UNITS[u], value: u })
  return tokens
}
