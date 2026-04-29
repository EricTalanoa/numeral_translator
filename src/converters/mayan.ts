import type { BreakdownToken } from './types'

// Mayan Long Count positional system.
// Place values: 1 (k'in) · 20 (winal) · 360 (tun) · 7,200 (k'atun) · 144,000 (b'ak'tun)
// The winal position uses base 18 (18 winals = 1 tun), all others use base 20.
// fromArabic returns comma-separated digits, highest first: e.g. "11,1,19" for 3999.
// Special: fromArabic(0) → "shell" (Mayan has a genuine zero).
// toArabic parses that encoding back to an integer.
// Rendering (SVG dots/bars/shell) is handled by MayanSvg.tsx.

// Long Count place value for a given position from the right (0 = k'in).
function placeValue(posFromRight: number): number {
  if (posFromRight === 0) return 1
  if (posFromRight === 1) return 20
  return 360 * Math.pow(20, posFromRight - 2)
}

// Human-readable place name.
function placeName(posFromRight: number): string {
  const names = ["1s", "20s", "360s", "7,200s", "144,000s"]
  const pv = placeValue(posFromRight)
  return names[posFromRight] ?? `${pv.toLocaleString()}s`
}

export function fromArabic(n: number): string {
  if (!Number.isInteger(n)) throw new Error('Input must be an integer')
  if (n < 0 || n > 999_999) throw new Error(`Out of range: ${n}`)
  if (n === 0) return 'shell'

  const digits: number[] = []
  let remaining = n

  // k'in (pos 0): base 20
  digits.unshift(remaining % 20)
  remaining = Math.floor(remaining / 20)

  if (remaining > 0) {
    // winal (pos 1): base 18
    digits.unshift(remaining % 18)
    remaining = Math.floor(remaining / 18)

    // tun and higher (pos 2+): base 20
    while (remaining > 0) {
      digits.unshift(remaining % 20)
      remaining = Math.floor(remaining / 20)
    }
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
  const n = digits.length

  for (let i = 0; i < n; i++) {
    const posFromRight = n - 1 - i
    const max = posFromRight === 1 ? 17 : 19
    if (digits[i] < 0 || digits[i] > max) throw new Error(`Cannot parse: ${input}`)
  }

  return digits.reduce((sum, d, i) => sum + d * placeValue(n - 1 - i), 0)
}

export function explain(n: number): BreakdownToken[] {
  if (!Number.isInteger(n)) throw new Error('Input must be an integer')
  if (n < 0 || n > 999_999) throw new Error(`Out of range: ${n}`)
  if (n === 0) return []

  const digits: number[] = []
  let remaining = n

  digits.unshift(remaining % 20)
  remaining = Math.floor(remaining / 20)

  if (remaining > 0) {
    digits.unshift(remaining % 18)
    remaining = Math.floor(remaining / 18)

    while (remaining > 0) {
      digits.unshift(remaining % 20)
      remaining = Math.floor(remaining / 20)
    }
  }

  const len = digits.length
  return digits.map((digit, i) => {
    const posFromRight = len - 1 - i
    const pv = placeValue(posFromRight)
    const bars = Math.floor(digit / 5)
    const dots = digit % 5
    const parts: string[] = []
    if (bars > 0) parts.push(`${bars} bar${bars > 1 ? 's' : ''}`)
    if (dots > 0) parts.push(`${dots} dot${dots > 1 ? 's' : ''}`)
    if (digit === 0) parts.push('shell (0)')
    return {
      display: `${parts.join(' + ')} in the ${placeName(posFromRight)} place`,
      value: digit * pv,
    }
  }).filter(t => t.value > 0)
}
