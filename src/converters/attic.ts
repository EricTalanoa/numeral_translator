import type { BreakdownToken } from './types'

// Attic (Herodianic) Greek acrophonic numerals
// All characters are standard Greek capitals (BMP), no special font needed.
// Ι=U+0399, Π=U+03A0, Δ=U+0394, Η=U+0397, Χ=U+03A7

const TABLE: [number, string][] = [
  [1000, '\u03A7'],              // Χ
  [500,  '\u03A0\u0397'],        // ΠΗ (composite: 5×100)
  [100,  '\u0397'],              // Η
  [50,   '\u03A0\u0394'],        // ΠΔ (composite: 5×10)
  [10,   '\u0394'],              // Δ
  [5,    '\u03A0'],              // Π
  [1,    '\u0399'],              // Ι
]

// Composites must be checked before single-char symbols
const SYMBOL_VALUES: Record<string, number> = {
  '\u03A0\u0397': 500,   // ΠΗ
  '\u03A0\u0394': 50,    // ΠΔ
  '\u03A7': 1000,        // Χ
  '\u0397': 100,         // Η
  '\u0394': 10,          // Δ
  '\u03A0': 5,           // Π
  '\u0399': 1,           // Ι
}

export function fromArabic(n: number): string {
  if (!Number.isInteger(n)) throw new Error('Input must be an integer')
  if (n < 0 || n > 9999) throw new Error(`Out of range: ${n}`)
  if (n === 0) return '\u2205' // ∅

  let result = ''
  let remaining = n
  for (const [value, symbol] of TABLE) {
    while (remaining >= value) {
      result += symbol
      remaining -= value
    }
  }
  return result
}

export function toArabic(input: string): number {
  if (input.includes('.')) throw new Error('Fractions not supported')

  // Normalize to uppercase
  const s = input.toUpperCase()

  let result = 0
  let i = 0
  while (i < s.length) {
    // Try two-character composite first
    if (i + 1 < s.length && SYMBOL_VALUES[s[i] + s[i + 1]] !== undefined) {
      result += SYMBOL_VALUES[s[i] + s[i + 1]]
      i += 2
    } else if (SYMBOL_VALUES[s[i]] !== undefined) {
      result += SYMBOL_VALUES[s[i]]
      i += 1
    } else {
      throw new Error(`Cannot parse: ${input}`)
    }
  }
  return result
}

export function explain(n: number): BreakdownToken[] {
  if (!Number.isInteger(n)) throw new Error('Input must be an integer')
  if (n < 0 || n > 9_999) throw new Error(`Out of range: ${n}`)
  if (n === 0) return []

  const tokens: BreakdownToken[] = []
  let remaining = n
  for (const [value, symbol] of TABLE) {
    if (remaining >= value) {
      const count = Math.floor(remaining / value)
      tokens.push({ display: symbol.repeat(count), value: value * count })
      remaining -= value * count
    }
  }
  return tokens
}
