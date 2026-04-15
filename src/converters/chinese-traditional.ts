// Classical Chinese literary numerals (文言數字) — multiplicative additive
// Digit characters (一–九) multiply place-value characters (十/百/千/萬).
// 零 bridges a run of zero digits between non-zero digits.
// Leading-一 rule: the output never starts with 一十 — that 一 is dropped.
// fromArabic(0) → "∅"   Range: 0–9,999,999

const DIGITS = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九']
const ZERO_CHAR = '零'   // U+96F6
const WAN       = '萬'   // U+842C — 10,000 group separator

const CHAR_TO_DIGIT = new Map<string, number>([
  ['一', 1], ['二', 2], ['三', 3], ['四', 4], ['五', 5],
  ['六', 6], ['七', 7], ['八', 8], ['九', 9],
])

const PLACE_VALUE = new Map<string, number>([
  ['千', 1000], ['百', 100], ['十', 10],
])

// Convert a sub-group (1–9999) to Chinese characters (no 萬 suffix).
// Zero gaps between non-zero digits get exactly one 零.
function convertSubGroup(n: number): string {
  if (n === 0) return ''

  const t = Math.floor(n / 1000)
  const h = Math.floor((n % 1000) / 100)
  const d = Math.floor((n % 100) / 10)
  const u = n % 10

  let result = ''
  let needZero = false

  for (const [digit, placeChar] of [
    [t, '千'], [h, '百'], [d, '十'], [u, ''],
  ] as [number, string][]) {
    if (digit > 0) {
      if (needZero) { result += ZERO_CHAR; needZero = false }
      result += DIGITS[digit] + placeChar
    } else if (result.length > 0) {
      needZero = true
    }
  }

  return result
}

// Parse a sub-group string (no 萬) back to a number.
function parseSubGroup(s: string): number {
  let total = 0
  let currentDigit = 0

  for (const char of s) {
    if (CHAR_TO_DIGIT.has(char)) {
      currentDigit = CHAR_TO_DIGIT.get(char)!
    } else if (PLACE_VALUE.has(char)) {
      total += currentDigit * PLACE_VALUE.get(char)!
      currentDigit = 0
    } else if (char === ZERO_CHAR) {
      currentDigit = 0  // bridge character — no-op for parsing
    } else {
      throw new Error(`Cannot parse: ${s}`)
    }
  }

  total += currentDigit  // trailing ones digit (no place char follows it)
  return total
}

export function fromArabic(n: number): string {
  if (!Number.isInteger(n)) throw new Error('Input must be an integer')
  if (n < 0 || n > 9_999_999) throw new Error(`Out of range: ${n}`)
  if (n === 0) return '\u2205'  // ∅

  const wanPart  = Math.floor(n / 10_000)
  const remainder = n % 10_000

  let result = ''

  if (wanPart > 0) {
    result += convertSubGroup(wanPart) + WAN
  }

  if (remainder > 0) {
    // Zero bridge: needed when the thousands digit of the remainder is 0
    if (wanPart > 0 && remainder < 1_000) result += ZERO_CHAR
    result += convertSubGroup(remainder)
  }

  // Leading-一 rule: drop 一 when 十 opens the string (e.g. 10→十, 100000→十萬)
  if (result.startsWith('一十')) result = result.slice(1)

  return result
}

export function toArabic(s: string): number {
  if (s.includes('.')) throw new Error('Fractions not supported')

  // Restore the 一 that fromArabic stripped before a leading 十
  const normalized = s.startsWith('十') ? '一' + s : s

  const wanIdx = normalized.indexOf(WAN)

  if (wanIdx === -1) {
    return parseSubGroup(normalized)
  }

  const wanValue      = parseSubGroup(normalized.slice(0, wanIdx)) * 10_000
  const remainderStr  = normalized.slice(wanIdx + 1)  // WAN is a single char
  const remainderValue = remainderStr.length > 0 ? parseSubGroup(remainderStr) : 0

  return wanValue + remainderValue
}
