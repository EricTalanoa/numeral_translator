// Chinese Rod Numerals (算籌, suànchóu) — decimal positional with alternating orientation.
// Even positions (ones=0, hundreds=2, ...): VERTICAL rods (U+1D360–U+1D368)
// Odd positions  (tens=1, thousands=3, ...): HORIZONTAL rods (U+1D369–U+1D371)
// Zero digit within a number: 〇 (U+3007 IDEOGRAPHIC NUMBER ZERO)
// fromArabic(0) → "∅" (whole-number zero has no rod representation)

// Vertical rod glyphs (index = value 1–9)
const VERT = ['', '\u{1D360}', '\u{1D361}', '\u{1D362}', '\u{1D363}', '\u{1D364}',
                   '\u{1D365}', '\u{1D366}', '\u{1D367}', '\u{1D368}']

// Horizontal rod glyphs (index = value 1–9)
const HORIZ = ['', '\u{1D369}', '\u{1D36A}', '\u{1D36B}', '\u{1D36C}', '\u{1D36D}',
                    '\u{1D36E}', '\u{1D36F}', '\u{1D370}', '\u{1D371}']

const ZERO_PLACEHOLDER = '\u3007' // 〇

const VERT_MAP = new Map<string, number>(VERT.slice(1).map((g, i) => [g, i + 1]))
const HORIZ_MAP = new Map<string, number>(HORIZ.slice(1).map((g, i) => [g, i + 1]))

export function fromArabic(n: number): string {
  if (!Number.isInteger(n)) throw new Error('Input must be an integer')
  if (n < 0 || n > 999_999) throw new Error(`Out of range: ${n}`)
  if (n === 0) return '\u2205' // ∅

  const digits: number[] = []
  let temp = n
  while (temp > 0) {
    digits.unshift(temp % 10)
    temp = Math.floor(temp / 10)
  }

  let result = ''
  for (let i = 0; i < digits.length; i++) {
    const position = digits.length - 1 - i  // 0 = ones (rightmost)
    const digit = digits[i]
    if (digit === 0) {
      result += ZERO_PLACEHOLDER
    } else if (position % 2 === 0) {  // even position → vertical
      result += VERT[digit]
    } else {                           // odd position → horizontal
      result += HORIZ[digit]
    }
  }
  return result
}

export function toArabic(input: string): number {
  if (input.includes('.')) throw new Error('Fractions not supported')

  let result = 0
  // for...of iterates Unicode codepoints (handles SMP surrogate pairs correctly)
  for (const char of input) {
    result *= 10
    if (char === ZERO_PLACEHOLDER || char === ' ') {
      // zero digit within number — result += 0
    } else if (VERT_MAP.has(char)) {
      result += VERT_MAP.get(char)!
    } else if (HORIZ_MAP.has(char)) {
      result += HORIZ_MAP.get(char)!
    } else {
      throw new Error(`Cannot parse: ${input}`)
    }
  }
  return result
}
