// Glagolitic numerals — alphabetic additive
// 36 lowercase letters U+2C30–U+2C53 represent values 1–9000.
// Largest-to-smallest concatenation; fromArabic(0) → "∅"   Range: 0–9,999

// Units 1–9: U+2C30–U+2C38
const UNITS = ['', '\u2C30', '\u2C31', '\u2C32', '\u2C33', '\u2C34',
                    '\u2C35', '\u2C36', '\u2C37', '\u2C38']

// Tens 10–90: U+2C39–U+2C41
const TENS = [
  '',
  '\u2C39',
  '\u2C3A',
  '\u2C3B',
  '\u2C3C',
  '\u2C3D',
  '\u2C3E',
  '\u2C3F',
  '\u2C40',
  '\u2C41',
]

// Hundreds 100–900: U+2C42–U+2C4A
const HUNDREDS = [
  '',
  '\u2C42',
  '\u2C43',
  '\u2C44',
  '\u2C45',
  '\u2C46',
  '\u2C47',
  '\u2C48',
  '\u2C49',
  '\u2C4A',
]

// Thousands 1000–9000: U+2C4B–U+2C53
const THOUSANDS = [
  '',
  '\u2C4B',
  '\u2C4C',
  '\u2C4D',
  '\u2C4E',
  '\u2C4F',
  '\u2C50',
  '\u2C51',
  '\u2C52',
  '\u2C53',
]

// Reverse map for toArabic
const GLYPH_VALUE = new Map<string, number>()
UNITS.slice(1).forEach((g, i) => GLYPH_VALUE.set(g, i + 1))
TENS.slice(1).forEach((g, i) => GLYPH_VALUE.set(g, (i + 1) * 10))
HUNDREDS.slice(1).forEach((g, i) => GLYPH_VALUE.set(g, (i + 1) * 100))
THOUSANDS.slice(1).forEach((g, i) => GLYPH_VALUE.set(g, (i + 1) * 1000))

export function fromArabic(n: number): string {
  if (!Number.isInteger(n)) throw new Error('Input must be an integer')
  if (n < 0 || n > 9_999) throw new Error(`Out of range: ${n}`)
  if (n === 0) return '\u2205' // ∅

  const t = Math.floor(n / 1000)
  const h = Math.floor((n % 1000) / 100)
  const d = Math.floor((n % 100) / 10)
  const u = n % 10

  return THOUSANDS[t] + HUNDREDS[h] + TENS[d] + UNITS[u]
}

export function toArabic(s: string): number {
  if (s.includes('.')) throw new Error('Fractions not supported')

  let total = 0
  for (const char of s) {
    const val = GLYPH_VALUE.get(char)
    if (val === undefined) throw new Error(`Cannot parse: ${s}`)
    total += val
  }
  return total
}
