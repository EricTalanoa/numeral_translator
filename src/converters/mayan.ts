// Mayan vigesimal (base-20) numerals — pure mathematical system, NOT Long Count calendar.
// fromArabic returns comma-separated vigesimal digits, highest first: e.g. "9,19,19" for 3999.
// Special: fromArabic(0) → "shell" (Mayan has a genuine zero).
// toArabic parses that encoding back to an integer.
// Rendering (SVG dots/bars/shell) is handled by MayanSvg.tsx.

export function fromArabic(n: number): string {
  if (!Number.isInteger(n)) throw new Error('Input must be an integer')
  if (n < 0 || n > 3999) throw new Error(`Out of range: ${n}`)
  if (n === 0) return 'shell'

  const digits: number[] = []
  let remaining = n
  while (remaining > 0) {
    digits.unshift(remaining % 20)
    remaining = Math.floor(remaining / 20)
  }
  return digits.join(',')
}

export function toArabic(input: string): number {
  if (input === 'shell') return 0

  if (input.includes('.')) throw new Error('Fractions not supported')

  if (!/^\d+(?:,\d+)*$/.test(input)) {
    throw new Error(`Cannot parse: ${input}`)
  }

  const digits = input.split(',').map(Number)

  for (const d of digits) {
    if (d < 0 || d > 19) throw new Error(`Cannot parse: ${input}`)
  }

  let result = 0
  for (const digit of digits) {
    result = result * 20 + digit
  }
  return result
}
