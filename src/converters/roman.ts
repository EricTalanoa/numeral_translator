import type { BreakdownToken } from './types'

const TABLE: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
  [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
]

const MAP: Record<string, number> = {
  I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000,
}

export function fromArabic(n: number): string {
  if (!Number.isInteger(n)) throw new Error('Input must be an integer')
  if (n < 0 || n > 3999) throw new Error(`Out of range: ${n}`)
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

  const upper = input.toUpperCase()

  for (const ch of upper) {
    if (!(ch in MAP)) throw new Error(`Cannot parse: ${input}`)
  }

  let result = 0
  for (let i = 0; i < upper.length; i++) {
    const curr = MAP[upper[i]]
    const next = i + 1 < upper.length ? MAP[upper[i + 1]] : 0
    if (curr < next) {
      result -= curr
    } else {
      result += curr
    }
  }

  // Strict canonical validation: only accept forms produced by fromArabic
  if (fromArabic(result) !== upper) {
    throw new Error(`Cannot parse: ${input}`)
  }

  return result
}

export function explain(n: number): BreakdownToken[] {
  if (!Number.isInteger(n)) throw new Error('Input must be an integer')
  if (n < 0 || n > 3_999) throw new Error(`Out of range: ${n}`)
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
