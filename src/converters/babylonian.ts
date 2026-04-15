// Babylonian sexagesimal (base-60) numerals.
// fromArabic returns pipe-separated group values: e.g. "1|6|39" for 3999.
// toArabic parses that encoding back to an integer.
// Rendering (SVG wedges) is handled by BabylonianSvg.tsx.

export function fromArabic(n: number): string {
  if (!Number.isInteger(n)) throw new Error('Input must be an integer')
  if (n < 0 || n > 999_999) throw new Error(`Out of range: ${n}`)
  if (n === 0) return '\u2205' // ∅

  const groups: number[] = []
  let remaining = n
  while (remaining > 0) {
    groups.unshift(remaining % 60)
    remaining = Math.floor(remaining / 60)
  }
  return groups.join('|')
}

export function toArabic(input: string): number {
  if (input === '\u2205') return 0 // ∅ sentinel

  if (input.includes('.')) throw new Error('Fractions not supported')

  if (!/^\d+(\|\d+)*$/.test(input)) {
    throw new Error(`Cannot parse: ${input}`)
  }

  const groups = input.split('|').map(Number)
  let result = 0
  for (const group of groups) {
    result = result * 60 + group
  }
  return result
}
