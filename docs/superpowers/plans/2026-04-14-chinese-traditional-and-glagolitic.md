# Chinese Traditional & Glagolitic Converters — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two new numeral system converters (Chinese Traditional and Glagolitic) as tiles 8 and 9 in the app.

**Architecture:** Each converter is a self-contained TypeScript module exporting `fromArabic` and `toArabic`. Both follow the existing `Converter` interface and are wired into the shared `CONVERTERS` registry, `vision-client.ts` hints, and `main.css` font rules. Tasks 1–2 (Chinese Traditional) and Tasks 3–4 (Glagolitic) are independent and touch different files — they can be implemented in either order. Task 5 integrates both into shared files.

**Tech Stack:** TypeScript, Vitest, React 18, Vite. Working directory: `.worktrees/phase2-ui`.

---

## File map

| Action | Path |
|---|---|
| Create | `src/converters/chinese-traditional.ts` |
| Create | `src/converters/glagolitic.ts` |
| Create | `tests/converters/chinese-traditional.test.ts` |
| Create | `tests/converters/glagolitic.test.ts` |
| Modify | `src/converters/index.ts` |
| Modify | `src/vision/vision-client.ts` |
| Modify | `src/styles/main.css` |

---

## Task 1: Chinese Traditional — failing tests

**Files:**
- Create: `tests/converters/chinese-traditional.test.ts`

- [ ] **Step 1.1: Create the test file**

```typescript
import { describe, it, expect } from 'vitest'
import { fromArabic, toArabic } from '../../src/converters/chinese-traditional'

describe('Chinese Traditional — fromArabic', () => {
  it('0 returns ∅',                    () => expect(fromArabic(0)).toBe('\u2205'))
  it('1 returns 一',                   () => expect(fromArabic(1)).toBe('一'))
  it('9 returns 九',                   () => expect(fromArabic(9)).toBe('九'))
  it('10 returns 十 (no leading 一)',  () => expect(fromArabic(10)).toBe('十'))
  it('11 returns 十一',                () => expect(fromArabic(11)).toBe('十一'))
  it('42 returns 四十二',              () => expect(fromArabic(42)).toBe('四十二'))
  it('100 returns 一百',               () => expect(fromArabic(100)).toBe('一百'))
  it('103 returns 一百零三',           () => expect(fromArabic(103)).toBe('一百零三'))
  it('110 returns 一百一十',           () => expect(fromArabic(110)).toBe('一百一十'))
  it('999 returns 九百九十九',         () => expect(fromArabic(999)).toBe('九百九十九'))
  it('1000 returns 一千',              () => expect(fromArabic(1000)).toBe('一千'))
  it('1001 returns 一千零一',          () => expect(fromArabic(1001)).toBe('一千零一'))
  it('1030 returns 一千零三十',        () => expect(fromArabic(1030)).toBe('一千零三十'))
  it('9999 returns 九千九百九十九',    () => expect(fromArabic(9999)).toBe('九千九百九十九'))
  it('10000 returns 一萬',             () => expect(fromArabic(10000)).toBe('一萬'))
  it('10003 returns 一萬零三',         () => expect(fromArabic(10003)).toBe('一萬零三'))
  it('100000 returns 十萬',            () => expect(fromArabic(100000)).toBe('十萬'))
  it('110000 returns 十一萬',          () => expect(fromArabic(110000)).toBe('十一萬'))
  it('1000000 returns 一百萬',         () => expect(fromArabic(1000000)).toBe('一百萬'))
  it('1234567 returns 一百二十三萬四千五百六十七', () =>
    expect(fromArabic(1234567)).toBe('一百二十三萬四千五百六十七'))
  it('9999999 returns 九百九十九萬九千九百九十九', () =>
    expect(fromArabic(9999999)).toBe('九百九十九萬九千九百九十九'))

  it('throws on -1',       () => expect(() => fromArabic(-1)).toThrow())
  it('throws on 10000000', () => expect(() => fromArabic(10000000)).toThrow())
  it('throws on 3.5',      () => expect(() => fromArabic(3.5)).toThrow())
})

describe('Chinese Traditional — toArabic', () => {
  const roundTrips = [
    1, 9, 10, 11, 42, 100, 103, 110, 999,
    1000, 1001, 1030, 9999, 10000, 10003,
    100000, 110000, 1000000, 1234567, 9999999,
  ]
  roundTrips.forEach(n => {
    it(`round-trip ${n}`, () => expect(toArabic(fromArabic(n))).toBe(n))
  })

  it('throws on fractions', () => expect(() => toArabic('三.五')).toThrow())
})
```

- [ ] **Step 1.2: Run the test file to confirm it fails**

```bash
cd ".worktrees/phase2-ui" && npm run test -- --run tests/converters/chinese-traditional.test.ts
```

Expected: all tests FAIL with `Cannot find module '../../src/converters/chinese-traditional'`.

---

## Task 2: Chinese Traditional — implementation

**Files:**
- Create: `src/converters/chinese-traditional.ts`

- [ ] **Step 2.1: Create the converter**

```typescript
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
```

- [ ] **Step 2.2: Run the Chinese Traditional tests**

```bash
cd ".worktrees/phase2-ui" && npm run test -- --run tests/converters/chinese-traditional.test.ts
```

Expected: all 45 tests PASS.

- [ ] **Step 2.3: Commit**

```bash
cd ".worktrees/phase2-ui" && git add tests/converters/chinese-traditional.test.ts src/converters/chinese-traditional.ts && git commit -m "feat: add Chinese Traditional numeral converter (45 tests)"
```

---

## Task 3: Glagolitic — failing tests

**Files:**
- Create: `tests/converters/glagolitic.test.ts`

- [ ] **Step 3.1: Create the test file**

```typescript
import { describe, it, expect } from 'vitest'
import { fromArabic, toArabic } from '../../src/converters/glagolitic'

describe('Glagolitic — fromArabic', () => {
  it('0 returns ∅',        () => expect(fromArabic(0)).toBe('\u2205'))
  it('1 returns ⰰ',        () => expect(fromArabic(1)).toBe('\u2C30'))
  it('9 returns ⰸ',        () => expect(fromArabic(9)).toBe('\u2C38'))
  it('10 returns ⰹ',       () => expect(fromArabic(10)).toBe('\u2C39'))
  it('42 returns ⰼⰲ',      () => expect(fromArabic(42)).toBe('\u2C3C\u2C32'))
  it('100 returns ⱂ',      () => expect(fromArabic(100)).toBe('\u2C42'))
  it('999 returns ⱊⱁⰸ',   () => expect(fromArabic(999)).toBe('\u2C4A\u2C41\u2C38'))
  it('1000 returns ⱋ',     () => expect(fromArabic(1000)).toBe('\u2C4B'))
  it('9000 returns ⱓ',     () => expect(fromArabic(9000)).toBe('\u2C53'))
  it('9999 returns ⱓⱊⱁⰸ', () => expect(fromArabic(9999)).toBe('\u2C53\u2C4A\u2C41\u2C38'))

  it('throws on -1',    () => expect(() => fromArabic(-1)).toThrow())
  it('throws on 10000', () => expect(() => fromArabic(10000)).toThrow())
  it('throws on 3.5',   () => expect(() => fromArabic(3.5)).toThrow())
})

describe('Glagolitic — toArabic', () => {
  const roundTrips = [1, 9, 10, 42, 100, 999, 1000, 9000, 9999]
  roundTrips.forEach(n => {
    it(`round-trip ${n}`, () => expect(toArabic(fromArabic(n))).toBe(n))
  })

  it('throws on fractions',    () => expect(() => toArabic('\u2C30.\u2C31')).toThrow())
  it('throws on unknown char', () => expect(() => toArabic('X')).toThrow())
})
```

- [ ] **Step 3.2: Run the test file to confirm it fails**

```bash
cd ".worktrees/phase2-ui" && npm run test -- --run tests/converters/glagolitic.test.ts
```

Expected: all tests FAIL with `Cannot find module '../../src/converters/glagolitic'`.

---

## Task 4: Glagolitic — implementation

**Files:**
- Create: `src/converters/glagolitic.ts`

- [ ] **Step 4.1: Create the converter**

```typescript
// Glagolitic numerals — alphabetic additive
// 36 lowercase letters U+2C30–U+2C53 represent values 1–9000.
// Largest-to-smallest concatenation; fromArabic(0) → "∅"   Range: 0–9,999

// Units 1–9: U+2C30–U+2C38
const UNITS = ['', '\u2C30', '\u2C31', '\u2C32', '\u2C33', '\u2C34',
                    '\u2C35', '\u2C36', '\u2C37', '\u2C38']

// Tens 10–90: U+2C39–U+2C41
const TENS = ['', '\u2C39', '\u2C3A', '\u2C3B', '\u2C3C', '\u2C3D',
                   '\u2C3E', '\u2C3F', '\u2C40', '\u2C41']

// Hundreds 100–900: U+2C42–U+2C4A
const HUNDREDS = ['', '\u2C42', '\u2C43', '\u2C44', '\u2C45', '\u2C46',
                       '\u2C47', '\u2C48', '\u2C49', '\u2C4A']

// Thousands 1000–9000: U+2C4B–U+2C53
const THOUSANDS = ['', '\u2C4B', '\u2C4C', '\u2C4D', '\u2C4E', '\u2C4F',
                        '\u2C50', '\u2C51', '\u2C52', '\u2C53']

// Reverse map for toArabic
const GLYPH_VALUE = new Map<string, number>()
UNITS.slice(1).forEach((g, i)     => GLYPH_VALUE.set(g, i + 1))
TENS.slice(1).forEach((g, i)      => GLYPH_VALUE.set(g, (i + 1) * 10))
HUNDREDS.slice(1).forEach((g, i)  => GLYPH_VALUE.set(g, (i + 1) * 100))
THOUSANDS.slice(1).forEach((g, i) => GLYPH_VALUE.set(g, (i + 1) * 1000))

export function fromArabic(n: number): string {
  if (!Number.isInteger(n)) throw new Error('Input must be an integer')
  if (n < 0 || n > 9_999) throw new Error(`Out of range: ${n}`)
  if (n === 0) return '\u2205'  // ∅

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
```

- [ ] **Step 4.2: Run the Glagolitic tests**

```bash
cd ".worktrees/phase2-ui" && npm run test -- --run tests/converters/glagolitic.test.ts
```

Expected: all 24 tests PASS.

- [ ] **Step 4.3: Commit**

```bash
cd ".worktrees/phase2-ui" && git add tests/converters/glagolitic.test.ts src/converters/glagolitic.ts && git commit -m "feat: add Glagolitic numeral converter (24 tests)"
```

---

## Task 5: Register both systems — index, vision hints, CSS

**Files:**
- Modify: `src/converters/index.ts`
- Modify: `src/vision/vision-client.ts`
- Modify: `src/styles/main.css`

- [ ] **Step 5.1: Update `src/converters/index.ts`**

Replace the entire file with:

```typescript
import * as egyptian from './egyptian'
import * as ionian from './ionian'
import * as attic from './attic'
import * as babylonian from './babylonian'
import * as roman from './roman'
import * as mayan from './mayan'
import * as chineseRod from './chinese-rod'
import * as chineseTraditional from './chinese-traditional'
import * as glagolitic from './glagolitic'

export interface Converter {
  id: string
  label: string
  maxValue: number
  toArabic: (input: string) => number
  fromArabic: (n: number) => string
}

export const CONVERTERS: Converter[] = [
  { id: 'egyptian',          label: 'Egyptian Hieroglyphic', maxValue: 9_999_999, ...egyptian },
  { id: 'ionian',            label: 'Ionian Greek',          maxValue: 9_999,     ...ionian },
  { id: 'attic',             label: 'Attic Greek',           maxValue: 9_999,     ...attic },
  { id: 'babylonian',        label: 'Babylonian',            maxValue: 999_999,   ...babylonian },
  { id: 'roman',             label: 'Roman',                 maxValue: 3_999,     ...roman },
  { id: 'mayan',             label: 'Mayan',                 maxValue: 999_999,   ...mayan },
  { id: 'chineseRod',        label: 'Chinese Rod',           maxValue: 999_999,   ...chineseRod },
  { id: 'chineseTraditional',label: 'Chinese Traditional',   maxValue: 9_999_999, ...chineseTraditional },
  { id: 'glagolitic',        label: 'Glagolitic',            maxValue: 9_999,     ...glagolitic },
]
```

- [ ] **Step 5.2: Add vision hints in `src/vision/vision-client.ts`**

In the `systemHint` function, add two new cases before the `default:` line:

```typescript
    case 'Chinese Traditional':
      return 'Classical Chinese numerals use characters: 一(1) 二(2) 三(3) 四(4) 五(5) 六(6) 七(7) 八(8) 九(9) 十(10) 百(100) 千(1000) 萬(10000). Numbers are written largest-to-smallest; 零 marks a zero gap between non-zero groups.'
    case 'Glagolitic':
      return 'Glagolitic numerals use Glagolitic script letters additively, largest to smallest. The first 9 letters equal 1\u20139, the next 9 equal 10\u201390, the next 9 equal 100\u2013900, and the next 9 equal 1000\u20139000.'
```

- [ ] **Step 5.3: Add CSS rules in `src/styles/main.css`**

Append to the end of the `/* 11. System-specific font rules */` section (after the `.chineseRod` rule):

```css
.chineseTraditional {
  font-family: var(--font-display);
  font-size: 20px;
}

.glagolitic {
  font-family: 'Segoe UI Historic', var(--font-display);
  font-size: 24px;
}
```

- [ ] **Step 5.4: Run the full test suite**

```bash
cd ".worktrees/phase2-ui" && npm run test -- --run
```

Expected: **336 tests pass** (267 existing + 45 Chinese Traditional + 24 Glagolitic). Zero failures.

- [ ] **Step 5.5: TypeScript check**

```bash
cd ".worktrees/phase2-ui" && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5.6: Commit**

```bash
cd ".worktrees/phase2-ui" && git add src/converters/index.ts src/vision/vision-client.ts src/styles/main.css && git commit -m "feat: register Chinese Traditional and Glagolitic in CONVERTERS, add vision hints and CSS"
```

---

## Smoke test checklist (manual, after dev server restart)

Run `npm run dev` from `.worktrees/phase2-ui`, open `http://localhost:5174`.

- [ ] Enter **42** — Chinese Traditional tile shows 四十二; Glagolitic tile shows ⰼⰲ
- [ ] Enter **10** — Chinese Traditional shows 十 (not 一十)
- [ ] Enter **10003** — Chinese Traditional shows 一萬零三
- [ ] Enter **100000** — Chinese Traditional shows 十萬; Glagolitic shows "out of range"
- [ ] Enter **10000** — Glagolitic tile shows "out of range"; Chinese Traditional shows 一萬
- [ ] Enter **0** — both tiles show "No representation"
- [ ] Click either new tile — expand modal opens and closes correctly
- [ ] Click ⓘ — RangeModal now shows 9 rows including Chinese Traditional (9,999,999) and Glagolitic (9,999)
