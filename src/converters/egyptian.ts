// SMP codepoints: U+131BC (lotus=1000), U+13362 (rope=100), U+13386 (hobble=10), U+133FA (stroke=1)
const SYMBOLS: [number, string][] = [
  [1000, '\u{131BC}'],
  [100,  '\u{13362}'],
  [10,   '\u{13386}'],
  [1,    '\u{133FA}'],
]

const GLYPH_VALUES = new Map<string, number>([
  ['\u{131BC}', 1000],
  ['\u{13362}',  100],
  ['\u{13386}',   10],
  ['\u{133FA}',    1],
])

export function fromArabic(n: number): string {
  if (!Number.isInteger(n)) throw new Error('Input must be an integer')
  if (n < 0 || n > 3999) throw new Error(`Out of range: ${n}`)
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
