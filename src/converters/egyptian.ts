// SMP codepoints: U+13068 (Heh=1M), U+13190 (tadpole=100k), U+130AD (finger=10k),
// U+131BC (lotus=1k), U+13362 (rope=100), U+13386 (hobble=10), U+133FA (stroke=1)
const SYMBOLS: [number, string][] = [
  [1_000_000, '\u{13068}'],  // C11  — Heh god
  [100_000,   '\u{13190}'],  // I008 — tadpole
  [10_000,    '\u{130AD}'],  // D50  — finger
  [1_000,     '\u{131BC}'],  // M12 — lotus
  [100,        '\u{13362}'],  // V1  — coiled rope
  [10,         '\u{13386}'],  // V20 — hobble
  [1,          '\u{133FA}'],  // Z1  — stroke
]

const GLYPH_VALUES = new Map<string, number>([
  ['\u{13068}', 1_000_000],
  ['\u{13190}',   100_000],
  ['\u{130AD}',    10_000],
  ['\u{131BC}',     1_000],
  ['\u{13362}',       100],
  ['\u{13386}',        10],
  ['\u{133FA}',         1],
])

export function fromArabic(n: number): string {
  if (!Number.isInteger(n)) throw new Error('Input must be an integer')
  if (n < 0 || n > 9_999_999) throw new Error(`Out of range: ${n}`)
  if (n === 0) return '\u2205' // ∅

  let result = ''
  let remaining = n
  for (const [value, glyph] of SYMBOLS) {
    const count = Math.floor(remaining / value)
    result += glyph.repeat(count)
    remaining %= value
  }
  return result
}

export function toArabic(input: string): number {
  if (input.includes('.')) throw new Error('Fractions not supported')

  // Use spread for SMP-safe codepoint iteration (each glyph is a surrogate pair)
  let result = 0
  for (const char of input) {
    const val = GLYPH_VALUES.get(char)
    if (val === undefined) throw new Error(`Cannot parse: ${input}`)
    result += val
  }
  return result
}
