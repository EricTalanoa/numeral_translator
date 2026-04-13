
# Language-Dependent Ranges Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each numeral system its own natural upper limit, display "out of range" in tiles that can't represent a value, and provide a range reference panel via an ⓘ button in the sidebar.

**Architecture:** `maxValue: number` added to the `Converter` interface; each registry entry declares its limit. `NumeralTile` pre-checks `value > system.maxValue` before calling `fromArabic` — no try/catch needed. A new `RangeModal` component (opened from App via an ⓘ button) maps over `CONVERTERS` to build the reference table.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, plain CSS.

**Branch:** Continue on `feature/phase2-ui` in `.worktrees/phase2-ui`.

---

## File Map

| File | Action | What changes |
|---|---|---|
| `src/converters/index.ts` | **Modify** | Add `maxValue` to `Converter` interface; add field to all 7 registry entries |
| `src/converters/attic.ts` | **Modify** | Range guard `n > 3999` → `n > 9999` |
| `src/converters/babylonian.ts` | **Modify** | Range guard `n > 3999` → `n > 999_999` |
| `src/converters/mayan.ts` | **Modify** | Range guard `n > 3999` → `n > 999_999` |
| `src/converters/chinese-rod.ts` | **Modify** | Range guard `n > 3999` → `n > 999_999` |
| `src/converters/egyptian.ts` | **Modify** | Add 3 higher symbols (10k/100k/1M); range guard → `n > 9_999_999` |
| `src/converters/ionian.ts` | **Modify** | Extend `THOUSANDS` from index 3 to index 9; range guard → `n > 9999` |
| `src/components/InputPanel.tsx` | **Modify** | Cap `parseInputValue` at 9,999,999; update error message |
| `src/components/NumeralTile.tsx` | **Modify** | Add out-of-range preflight; separate modal content for out-of-range |
| `src/components/RangeModal.tsx` | **Create** | Range reference table modal, driven by `CONVERTERS` |
| `src/components/App.tsx` | **Modify** | Add `showRanges` state; ⓘ button in sidebar header; render `RangeModal` |
| `src/styles/main.css` | **Modify** | Egyptian font 24px→28px; sidebar header flex row; ⓘ button; range table |
| `tests/converters/attic.test.ts` | **Modify** | Replace "throws on 4000" with "4000 → ΧΧΧΧ"; add 9999 test |
| `tests/converters/babylonian.test.ts` | **Modify** | Replace "throws on 4000" with "4000 → valid"; add large-value tests |
| `tests/converters/mayan.test.ts` | **Modify** | Replace "throws on 4000" with "4000 → valid"; add large-value tests |
| `tests/converters/chinese-rod.test.ts` | **Modify** | Replace "throws on 4000" with "4000 → valid"; add large-value tests |
| `tests/converters/egyptian.test.ts` | **Modify** | Replace "throws on 4000"; add 10k/100k/1M symbol tests |
| `tests/converters/ionian.test.ts` | **Modify** | Replace "throws on 4000"; add 4000–9999 tests |
| `tests/components/inputPanel.test.ts` | **Modify** | Update cap test: 4000 valid; 10000000 errors |

---

## Task 1: Add `maxValue` to Converter interface and registry

**Files:**
- Modify: `src/converters/index.ts`

- [ ] **Step 1: Add `maxValue` to the `Converter` interface and all registry entries**

Replace the entire contents of `src/converters/index.ts` with:

```ts
import * as egyptian from './egyptian'
import * as ionian from './ionian'
import * as attic from './attic'
import * as babylonian from './babylonian'
import * as roman from './roman'
import * as mayan from './mayan'
import * as chineseRod from './chinese-rod'

export interface Converter {
  id: string
  label: string
  maxValue: number
  toArabic: (input: string) => number
  fromArabic: (n: number) => string
}

export const CONVERTERS: Converter[] = [
  { id: 'egyptian',   label: 'Egyptian Hieroglyphic', maxValue: 9_999_999, ...egyptian },
  { id: 'ionian',     label: 'Ionian Greek',          maxValue: 9_999,     ...ionian },
  { id: 'attic',      label: 'Attic Greek',           maxValue: 9_999,     ...attic },
  { id: 'babylonian', label: 'Babylonian',            maxValue: 999_999,   ...babylonian },
  { id: 'roman',      label: 'Roman',                 maxValue: 3_999,     ...roman },
  { id: 'mayan',      label: 'Mayan',                 maxValue: 999_999,   ...mayan },
  { id: 'chineseRod', label: 'Chinese Rod',           maxValue: 999_999,   ...chineseRod },
]
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: TypeScript errors — each converter file still exports `fromArabic` with old `n > 3999` guards, but the interface change doesn't break anything yet. If there are unexpected errors, investigate before continuing.

- [ ] **Step 3: Run tests to confirm nothing broken yet**

```bash
npm test -- --run
```

Expected: 232 passed (registry change is data-only; tests don't test `maxValue`).

- [ ] **Step 4: Commit**

```bash
cd /c/Users/erict/Desktop/Personal\ Projs/numeral-translator/.worktrees/phase2-ui
git add src/converters/index.ts
git commit -m "feat: add maxValue to Converter interface and registry"
```

---

## Task 2: Lift range guard — Attic Greek (3,999 → 9,999)

**Files:**
- Modify: `tests/converters/attic.test.ts`
- Modify: `src/converters/attic.ts`

- [ ] **Step 1: Update the out-of-range test in `tests/converters/attic.test.ts`**

Replace line 33:
```ts
it('throws on 4000', () => expect(() => fromArabic(4000)).toThrow('Out of range: 4000'))
```
with:
```ts
it('4000 → ΧΧΧΧ', () => expect(fromArabic(4000)).toBe(X.repeat(4)))
it('9999 → ΧΧΧΧΧΧΧΧΧΠΗΗΗΗΠΔΔΔΔΠΙΙΙΙ', () =>
  expect(fromArabic(9999)).toBe(X.repeat(9) + PH + H.repeat(4) + PD + D.repeat(4) + P + I.repeat(4)))
it('throws on 10000', () => expect(() => fromArabic(10000)).toThrow('Out of range: 10000'))
```

Also update the round-trip cases array (line 52) to include new values:
```ts
const cases = [1, 5, 9, 50, 99, 500, 999, 1000, 1776, 3999, 4000, 9999]
```

- [ ] **Step 2: Run the Attic test to confirm it fails**

```bash
npm test -- --run tests/converters/attic.test.ts
```

Expected: FAIL — "4000 → ΧΧΧΧ" fails because `fromArabic(4000)` still throws.

- [ ] **Step 3: Update the range guard in `src/converters/attic.ts` line 28**

Replace:
```ts
if (n < 0 || n > 3999) throw new Error(`Out of range: ${n}`)
```
with:
```ts
if (n < 0 || n > 9999) throw new Error(`Out of range: ${n}`)
```

- [ ] **Step 4: Run the Attic test to confirm it passes**

```bash
npm test -- --run tests/converters/attic.test.ts
```

Expected: all Attic tests pass.

- [ ] **Step 5: Run full suite**

```bash
npm test -- --run
```

Expected: 234 passed (2 new Attic tests added).

- [ ] **Step 6: Commit**

```bash
git add src/converters/attic.ts tests/converters/attic.test.ts
git commit -m "feat: lift Attic Greek range to 9,999"
```

---

## Task 3: Lift range guards — Babylonian, Mayan, Chinese Rod (3,999 → 999,999)

**Files:**
- Modify: `tests/converters/babylonian.test.ts`
- Modify: `tests/converters/mayan.test.ts`
- Modify: `tests/converters/chinese-rod.test.ts`
- Modify: `src/converters/babylonian.ts`
- Modify: `src/converters/mayan.ts`
- Modify: `src/converters/chinese-rod.ts`

### Babylonian

- [ ] **Step 1: Update `tests/converters/babylonian.test.ts`**

Replace line 16:
```ts
it('throws on 4000', () => expect(() => fromArabic(4000)).toThrow('Out of range: 4000'))
```
with:
```ts
it('4000 → "1|6|40"', () => expect(fromArabic(4000)).toBe('1|6|40'))
it('999999 → "4|37|46|39"', () => expect(fromArabic(999999)).toBe('4|37|46|39'))
it('throws on 1000000', () => expect(() => fromArabic(1000000)).toThrow('Out of range: 1000000'))
```

Update the round-trip cases array to:
```ts
const cases = [1, 59, 60, 61, 120, 3600, 3661, 3999, 4000, 999999]
```

- [ ] **Step 2: Update `src/converters/babylonian.ts` line 8**

Replace:
```ts
if (n < 0 || n > 3999) throw new Error(`Out of range: ${n}`)
```
with:
```ts
if (n < 0 || n > 999_999) throw new Error(`Out of range: ${n}`)
```

### Mayan

- [ ] **Step 3: Update `tests/converters/mayan.test.ts`**

Replace line 16:
```ts
it('throws on 4000', () => expect(() => fromArabic(4000)).toThrow('Out of range: 4000'))
```
with:
```ts
it('4000 → "10,0,0"', () => expect(fromArabic(4000)).toBe('10,0,0'))
it('999999 → "6,4,19,19,19"', () => expect(fromArabic(999999)).toBe('6,4,19,19,19'))
it('throws on 1000000', () => expect(() => fromArabic(1000000)).toThrow('Out of range: 1000000'))
```

Update the round-trip cases array to:
```ts
const cases = [0, 1, 19, 20, 40, 400, 819, 3999, 4000, 999999]
```

- [ ] **Step 4: Update `src/converters/mayan.ts`**

Replace:
```ts
if (n < 0 || n > 3999) throw new Error(`Out of range: ${n}`)
```
with:
```ts
if (n < 0 || n > 999_999) throw new Error(`Out of range: ${n}`)
```

### Chinese Rod

- [ ] **Step 5: Update `tests/converters/chinese-rod.test.ts`**

First, add `H4` to the horizontal constants block (line 9). Replace:
```ts
const H1 = '\u{1D369}'; const H3 = '\u{1D36B}'; const H9 = '\u{1D371}'
```
with:
```ts
const H1 = '\u{1D369}'; const H3 = '\u{1D36B}'; const H4 = '\u{1D36C}'; const H9 = '\u{1D371}'
```

Then replace line 30:
```ts
it('throws on 4000', () => expect(() => fromArabic(4000)).toThrow('Out of range: 4000'))
```
with:
```ts
it('4000 → horiz-4 + 3 zeros', () => expect(fromArabic(4000)).toBe(H4 + ZERO + ZERO + ZERO))
it('throws on 1000000', () => expect(() => fromArabic(1000000)).toThrow('Out of range: 1000000'))
```

Update the round-trip cases array to:
```ts
const cases = [1, 9, 10, 11, 99, 100, 101, 1000, 1234, 3999, 4000, 999999]
```

- [ ] **Step 6: Update `src/converters/chinese-rod.ts`**

Replace:
```ts
if (n < 0 || n > 3999) throw new Error(`Out of range: ${n}`)
```
with:
```ts
if (n < 0 || n > 999_999) throw new Error(`Out of range: ${n}`)
```

- [ ] **Step 7: Run the three converter tests**

```bash
npm test -- --run tests/converters/babylonian.test.ts tests/converters/mayan.test.ts tests/converters/chinese-rod.test.ts
```

Expected: all pass.

- [ ] **Step 8: Run full suite**

```bash
npm test -- --run
```

Expected: ~241 passed (7 new tests across the three converters).

- [ ] **Step 9: Commit**

```bash
git add src/converters/babylonian.ts src/converters/mayan.ts src/converters/chinese-rod.ts \
        tests/converters/babylonian.test.ts tests/converters/mayan.test.ts tests/converters/chinese-rod.test.ts
git commit -m "feat: lift Babylonian, Mayan, Chinese Rod ranges to 999,999"
```

---

## Task 4: Egyptian converter — add symbols for 10,000 / 100,000 / 1,000,000

**Files:**
- Modify: `tests/converters/egyptian.test.ts`
- Modify: `src/converters/egyptian.ts`

**Background:** The Noto Sans Egyptian Hieroglyphs font is already loaded at `public/fonts/NotoSansEgyptianHieroglyphs-Regular.ttf`. The three new symbols are:

| Value | Gardiner | Unicode name | Codepoint |
|-------|----------|--------------|-----------|
| 10,000 | D50 | EGYPTIAN HIEROGLYPH D050 | `\u{130AD}` |
| 100,000 | I8 | EGYPTIAN HIEROGLYPH I008 | `\u{130F2}` |
| 1,000,000 | C11 | EGYPTIAN HIEROGLYPH C011 | `\u{13068}` |

> **Important:** Verify these codepoints visually in Step 6. If a glyph renders as a box (tofu), the codepoint is wrong — look it up in the Unicode chart PDF (search "Unicode Egyptian Hieroglyphs chart U13000").

- [ ] **Step 1: Add symbol constants and new tests to `tests/converters/egyptian.test.ts`**

Add constants after the existing ones at the top (lines 5–9):
```ts
const FINGER = '\u{130AD}'  // 10,000  — D50
const TADPOLE = '\u{130F2}' // 100,000 — I8
const HEH    = '\u{13068}'  // 1,000,000 — C11
```

Replace line 24:
```ts
it('throws on 4000', () => expect(() => fromArabic(4000)).toThrow('Out of range: 4000'))
```
with:
```ts
it('4000 → 4 lotus', () => expect(fromArabic(4000)).toBe(LOTUS.repeat(4)))
it('10000 → single finger', () => expect(fromArabic(10000)).toBe(FINGER))
it('100000 → single tadpole', () => expect(fromArabic(100000)).toBe(TADPOLE))
it('1000000 → single Heh god', () => expect(fromArabic(1000000)).toBe(HEH))
it('1234567 → HEH + 2 tadpole + 3 finger + 4 lotus + 5 rope + 6 hobble + 7 stroke', () =>
  expect(fromArabic(1234567)).toBe(
    HEH + TADPOLE.repeat(2) + FINGER.repeat(3) + LOTUS.repeat(4) +
    ROPE.repeat(5) + HOBBLE.repeat(6) + STROKE.repeat(7)
  ))
it('throws on 10000000', () => expect(() => fromArabic(10000000)).toThrow('Out of range: 10000000'))
```

Update the round-trip cases array to:
```ts
const cases = [1, 10, 100, 1000, 23, 305, 1492, 3999, 10000, 100000, 1000000, 1234567]
```

Also add `toArabic` round-trip tests for the new symbols:
```ts
it('single finger → 10000', () => expect(toArabic(FINGER)).toBe(10000))
it('single tadpole → 100000', () => expect(toArabic(TADPOLE)).toBe(100000))
it('single Heh god → 1000000', () => expect(toArabic(HEH)).toBe(1000000))
```

- [ ] **Step 2: Run the Egyptian test to confirm it fails**

```bash
npm test -- --run tests/converters/egyptian.test.ts
```

Expected: FAIL — `fromArabic(10000)` throws "Out of range: 10000".

- [ ] **Step 3: Update `src/converters/egyptian.ts`**

Replace the SYMBOLS table and range guard:

```ts
// SMP codepoints: U+13068 (Heh=1M), U+130F2 (tadpole=100k), U+130AD (finger=10k),
// U+131BC (lotus=1k), U+13362 (rope=100), U+13386 (hobble=10), U+133FA (stroke=1)
const SYMBOLS: [number, string][] = [
  [1_000_000, '\u{13068}'],  // C11 — Heh god
  [100_000,   '\u{130F2}'],  // I8  — tadpole
  [10_000,    '\u{130AD}'],  // D50 — finger
  [1_000,     '\u{131BC}'],  // M12 — lotus
  [100,        '\u{13362}'],  // V1  — coiled rope
  [10,         '\u{13386}'],  // V20 — hobble
  [1,          '\u{133FA}'],  // Z1  — stroke
]
```

Update range guard (same file, `fromArabic` function):
```ts
if (n < 0 || n > 9_999_999) throw new Error(`Out of range: ${n}`)
```

- [ ] **Step 4: Run the Egyptian tests**

```bash
npm test -- --run tests/converters/egyptian.test.ts
```

Expected: all pass.

- [ ] **Step 5: Run full suite**

```bash
npm test -- --run
```

Expected: all pass (new tests added).

- [ ] **Step 6: Visually verify glyphs in the browser**

Start the dev server if not already running:
```bash
npm run dev
```

Type `10000` in the input. The Egyptian tile should show a finger-shaped hieroglyph (not a box). Type `100000` — tadpole glyph. Type `1000000` — kneeling Heh god.

If any tile shows a box/rectangle instead of a glyph, the codepoint for that symbol is wrong. Find the correct codepoint in the Unicode 13.0 Egyptian Hieroglyphs chart (search "Unicode chart U13000 PDF") under the Gardiner code noted above, update the constant in both `egyptian.ts` and `egyptian.test.ts`, and re-run.

- [ ] **Step 7: Commit**

```bash
git add src/converters/egyptian.ts tests/converters/egyptian.test.ts
git commit -m "feat: extend Egyptian to 9,999,999 with finger, tadpole, and Heh god symbols"
```

---

## Task 5: Ionian Greek — extend THOUSANDS to ͵θ (9,000)

**Files:**
- Modify: `tests/converters/ionian.test.ts`
- Modify: `src/converters/ionian.ts`

- [ ] **Step 1: Add new tests to `tests/converters/ionian.test.ts`**

Replace line 30:
```ts
it('throws on 4000', () => expect(() => fromArabic(4000)).toThrow('Out of range: 4000'))
```
with:
```ts
it('4000 → ͵δʹ', () =>
  expect(fromArabic(4000)).toBe('\u0375\u03B4\u02B9'))
it('9000 → ͵θʹ', () =>
  expect(fromArabic(9000)).toBe('\u0375\u03B8\u02B9'))
it('9999 → ͵θϡϟθʹ', () =>
  expect(fromArabic(9999)).toBe('\u0375\u03B8\u03E1\u03DF\u03B8\u02B9'))
it('throws on 10000', () => expect(() => fromArabic(10000)).toThrow('Out of range: 10000'))
```

Update the round-trip cases array to:
```ts
const cases = [1, 6, 9, 90, 900, 1000, 1776, 3999, 4000, 9000, 9999]
```

- [ ] **Step 2: Run Ionian tests to confirm they fail**

```bash
npm test -- --run tests/converters/ionian.test.ts
```

Expected: FAIL — `fromArabic(4000)` throws.

- [ ] **Step 3: Update `src/converters/ionian.ts`**

Replace the `THOUSANDS` constant:
```ts
const THOUSANDS = [
  '',
  '\u0375\u03B1',  // ͵α = 1,000
  '\u0375\u03B2',  // ͵β = 2,000
  '\u0375\u03B3',  // ͵γ = 3,000
  '\u0375\u03B4',  // ͵δ = 4,000
  '\u0375\u03B5',  // ͵ε = 5,000
  '\u0375\u03DB',  // ͵ϛ = 6,000 (stigma/digamma)
  '\u0375\u03B6',  // ͵ζ = 7,000
  '\u0375\u03B7',  // ͵η = 8,000
  '\u0375\u03B8',  // ͵θ = 9,000
]
```

Update the range guard in `fromArabic`:
```ts
if (n < 0 || n > 9999) throw new Error(`Out of range: ${n}`)
```

- [ ] **Step 4: Run Ionian tests**

```bash
npm test -- --run tests/converters/ionian.test.ts
```

Expected: all pass.

- [ ] **Step 5: Run full suite**

```bash
npm test -- --run
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/converters/ionian.ts tests/converters/ionian.test.ts
git commit -m "feat: extend Ionian Greek range to 9,999 with full THOUSANDS array"
```

---

## Task 6: InputPanel — raise validation cap to 9,999,999

**Files:**
- Modify: `tests/components/inputPanel.test.ts`
- Modify: `src/components/InputPanel.tsx`

- [ ] **Step 1: Update `tests/components/inputPanel.test.ts`**

Replace the existing "returns error for value above 3999" test:
```ts
it('returns error for value above 3999', () => {
  const result = parseInputValue('4000')
  expect(result.value).toBeNull()
  expect(result.error).toBe('Range: 0–3999')
})
```
with:
```ts
it('returns valid value for 4000', () => {
  expect(parseInputValue('4000')).toEqual({ value: 4000, error: null })
})

it('returns valid value for 9999999', () => {
  expect(parseInputValue('9999999')).toEqual({ value: 9999999, error: null })
})

it('returns error for value above 9999999', () => {
  const result = parseInputValue('10000000')
  expect(result.value).toBeNull()
  expect(result.error).toBe('Max: 9,999,999')
})
```

- [ ] **Step 2: Run inputPanel tests to confirm they fail**

```bash
npm test -- --run tests/components/inputPanel.test.ts
```

Expected: FAIL — `parseInputValue('4000')` currently returns `{ value: null, error: 'Range: 0–3999' }`.

- [ ] **Step 3: Update `parseInputValue` in `src/components/InputPanel.tsx`**

Replace the validation inside `parseInputValue`:
```ts
export function parseInputValue(raw: string): { value: number | null; error: string | null } {
  const digits = raw.replace(/\D/g, '')
  if (digits === '') return { value: null, error: null }
  const n = parseInt(digits, 10)
  if (n > 9_999_999) return { value: null, error: 'Max: 9,999,999' }
  return { value: n, error: null }
}
```

Also update the `<label>` text in the JSX from `ENTER NUMBER (0–3999)` to `ENTER NUMBER (0–9,999,999)`.

- [ ] **Step 4: Run inputPanel tests**

```bash
npm test -- --run tests/components/inputPanel.test.ts
```

Expected: all pass (9 tests).

- [ ] **Step 5: Run full suite**

```bash
npm test -- --run
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/InputPanel.tsx tests/components/inputPanel.test.ts
git commit -m "feat: raise input cap to 9,999,999 to match highest system range"
```

---

## Task 7: NumeralTile — out-of-range preflight and modal display

**Files:**
- Modify: `src/components/NumeralTile.tsx`

No unit tests for this component (renderer tests are deferred to Phase 3). Verify visually after completing Task 9.

- [ ] **Step 1: Overwrite `src/components/NumeralTile.tsx`**

```tsx
import { useState, useEffect } from 'react'
import type { Converter } from '../converters/index'
import { MayanSvg } from '../renderers/MayanSvg'
import { BabylonianSvg } from '../renderers/BabylonianSvg'

interface NumeralTileProps {
  system: Converter
  value: number | null
}

export function NumeralTile({ system, value }: NumeralTileProps) {
  const [fontReady, setFontReady] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (system.id !== 'egyptian') return
    if (document.fonts.check('1em NotoSansEgyptianHieroglyphs')) {
      setFontReady(true)
      return
    }
    document.fonts.load('1em NotoSansEgyptianHieroglyphs')
      .then(() => setFontReady(true))
      .catch(() => setFontReady(true))
  }, [system.id])

  useEffect(() => {
    if (!expanded) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setExpanded(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [expanded])

  const outOfRange = value !== null && value > system.maxValue

  function renderContent(scale = 1): JSX.Element {
    if (value === null) {
      return <span className="tile-placeholder">—</span>
    }

    if (outOfRange) {
      return <span className="tile-no-rep">out of range</span>
    }

    const output = system.fromArabic(value)

    // ∅ check first — all systems except Mayan return '∅' for zero
    if (output === '∅') {
      return <span className="tile-no-rep">No representation</span>
    }

    if (system.id === 'mayan') {
      return <MayanSvg encoded={output} scale={scale} />
    }

    if (system.id === 'babylonian') {
      return <BabylonianSvg encoded={output} scale={scale} />
    }

    if (system.id === 'egyptian' && !fontReady) {
      return <span className="tile-loading">Loading font…</span>
    }

    return <span className={`tile-numeral ${system.id}`}>{output}</span>
  }

  function renderModalContent(): JSX.Element {
    if (outOfRange) {
      return (
        <div className="tile-modal-out-of-range">
          <span className="tile-no-rep" style={{ fontSize: '16px' }}>Out of range</span>
          <span className="tile-modal-range">
            Valid range: 0 – {system.maxValue.toLocaleString('en-US')}
          </span>
        </div>
      )
    }
    return renderContent(3)
  }

  const isClickable = value !== null

  return (
    <>
      <div
        className={`numeral-tile${isClickable ? ' clickable' : ''}`}
        onClick={() => isClickable && setExpanded(true)}
      >
        <div className="tile-system-name">{system.label}</div>
        <div className="tile-content">
          {renderContent()}
        </div>
      </div>

      {expanded && (
        <div className="tile-modal-overlay" onClick={() => setExpanded(false)}>
          <div className="tile-modal-card" onClick={e => e.stopPropagation()}>
            <div className="tile-modal-system-name">{system.label}</div>
            <div className="tile-modal-content">
              {renderModalContent()}
            </div>
            <button className="tile-modal-close" onClick={() => setExpanded(false)}>
              close ×
            </button>
          </div>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Run full suite**

```bash
npm test -- --run
```

Expected: all pass (no test changes needed for this step).

- [ ] **Step 4: Commit**

```bash
git add src/components/NumeralTile.tsx
git commit -m "feat: add out-of-range preflight to NumeralTile with range info in expand modal"
```

---

## Task 8: Create RangeModal component

**Files:**
- Create: `src/components/RangeModal.tsx`

- [ ] **Step 1: Create `src/components/RangeModal.tsx`**

```tsx
import { useEffect } from 'react'
import { CONVERTERS } from '../converters/index'

interface RangeModalProps {
  onClose: () => void
}

export function RangeModal({ onClose }: RangeModalProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="tile-modal-overlay" onClick={onClose}>
      <div className="tile-modal-card range-modal-card" onClick={e => e.stopPropagation()}>
        <div className="tile-modal-system-name">System Ranges</div>
        <table className="range-table">
          <thead>
            <tr>
              <th className="range-table-th">System</th>
              <th className="range-table-th range-table-th--right">Range</th>
            </tr>
          </thead>
          <tbody>
            {CONVERTERS.map(c => (
              <tr key={c.id} className="range-table-row">
                <td className="range-table-td">{c.label}</td>
                <td className="range-table-td range-table-td--right">
                  0 – {c.maxValue.toLocaleString('en-US')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="tile-modal-close" onClick={onClose}>
          close ×
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/RangeModal.tsx
git commit -m "feat: add RangeModal component with CONVERTERS-driven range table"
```

---

## Task 9: App — ⓘ button and RangeModal wiring

**Files:**
- Modify: `src/components/App.tsx`

- [ ] **Step 1: Overwrite `src/components/App.tsx`**

```tsx
import { useState } from 'react'
import { ControlPanel } from './ControlPanel'
import { OutputGrid } from './OutputGrid'
import { RangeModal } from './RangeModal'

export default function App() {
  const [value, setValue] = useState<number | null>(null)
  const [showRanges, setShowRanges] = useState(false)

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="app-title-row">
          <span className="app-title">Numeral Translator</span>
          <button
            className="range-info-btn"
            onClick={() => setShowRanges(true)}
            title="View system ranges"
          >
            ⓘ
          </button>
        </div>
        <ControlPanel onResult={setValue} />
      </aside>
      <main className="tile-area">
        <OutputGrid value={value} />
      </main>
      {showRanges && <RangeModal onClose={() => setShowRanges(false)} />}
    </div>
  )
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Run full suite**

```bash
npm test -- --run
```

Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/App.tsx
git commit -m "feat: add ⓘ range reference button and RangeModal to App"
```

---

## Task 10: CSS — Egyptian font size, sidebar header, range modal table

**Files:**
- Modify: `src/styles/main.css`

- [ ] **Step 1: Update `.egyptian` font size**

Find:
```css
.egyptian {
  font-family: 'NotoSansEgyptianHieroglyphs', var(--font-display);
  font-size: 24px;
}
```
Replace with:
```css
.egyptian {
  font-family: 'NotoSansEgyptianHieroglyphs', var(--font-display);
  font-size: 28px;
}
```

- [ ] **Step 2: Replace `.app-title` rule and add sidebar header row + ⓘ button styles**

Find:
```css
.app-title {
  font-family: var(--font-display);
  font-size: 16px;
  color: var(--gold);
  letter-spacing: 1px;
  text-align: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--gold-dim);
}
```
Replace with:
```css
.app-title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--gold-dim);
}

.app-title {
  font-family: var(--font-display);
  font-size: 16px;
  color: var(--gold);
  letter-spacing: 1px;
}

.range-info-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 14px;
  cursor: pointer;
  padding: 0 2px;
  line-height: 1;
  transition: color 0.15s;
  flex-shrink: 0;
}
.range-info-btn:hover { color: var(--gold); }
```

- [ ] **Step 3: Add range modal table styles and tile-modal-out-of-range styles**

Append at the end of `main.css`:
```css
/* 13. Range modal table */
.range-modal-card {
  min-width: 280px;
}

.range-table {
  border-collapse: collapse;
  width: 100%;
}

.range-table-th {
  font-size: 9px;
  letter-spacing: 1.5px;
  color: var(--text-muted);
  text-transform: uppercase;
  padding: 0 8px 10px;
  border-bottom: 1px solid var(--gold-dim);
}

.range-table-th--right,
.range-table-td--right {
  text-align: right;
}

.range-table-row:not(:last-child) td {
  border-bottom: 1px solid rgba(201, 168, 76, 0.1);
}

.range-table-td {
  font-size: 13px;
  color: var(--text-main);
  padding: 8px 8px;
}

/* 14. Out-of-range modal content */
.tile-modal-out-of-range {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.tile-modal-range {
  font-size: 13px;
  color: var(--text-muted);
}
```

- [ ] **Step 4: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors (CSS changes don't affect TypeScript).

- [ ] **Step 5: Run full suite**

```bash
npm test -- --run
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/styles/main.css
git commit -m "style: Egyptian font 28px, sidebar header row, range modal table, out-of-range modal"
```

---

## Task 11: Final Verification

**No new files.** Manual verification + final test run.

- [ ] **Step 1: Confirm dev server is running**

```bash
npm run dev
```

Open `http://localhost:5174` (or whichever port Vite reports).

- [ ] **Step 2: Run the full test suite**

```bash
npm test -- --run
```

Expected: all tests pass (count will be higher than the original 232).

- [ ] **Step 3: TypeScript final check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Smoke test — out-of-range tiles**

| Input | Expected |
|-------|----------|
| `5000` | Roman tile: "out of range" · All others: show value |
| `10000` | Roman, Attic, Ionian tiles: "out of range" · Egyptian: shows finger glyph · Others: show value |
| `100000` | Roman, Attic, Ionian, Babylonian tiles: actually Babylonian should show value (limit 999,999) · Egyptian shows tadpole |
| `1000000` | Roman, Attic, Ionian: "out of range" · Egyptian: shows Heh god · Babylonian/Mayan/ChineseRod: show value |
| `9999999` | Roman, Attic, Ionian: "out of range" · All others: show value |

- [ ] **Step 5: Smoke test — click out-of-range tile**

Type `5000`. Click the Roman tile. Modal should show:
```
ROMAN
Out of range
Valid range: 0 – 3,999
```

- [ ] **Step 6: Smoke test — ⓘ range reference panel**

Click the ⓘ button next to "Numeral Translator". A modal should appear with a table of all 7 systems and their ranges. Press `Esc` to close.

- [ ] **Step 7: Smoke test — Egyptian font size**

Type `1`. Egyptian tile should show the hieroglyph stroke slightly larger than before.

- [ ] **Step 8: Final commit**

```bash
git add -A
git commit -m "feat: Phase 2 smoke-test fixes complete — language-dependent ranges, visual improvements"
```

---

## Definition of Done

- [ ] All tests pass
- [ ] `npx tsc --noEmit` clean
- [ ] Typing `5000`: Roman shows "out of range", others show values
- [ ] Clicking an out-of-range tile shows modal with valid range
- [ ] ⓘ button opens range reference panel with all 7 systems
- [ ] Egyptian hieroglyphs render at 28px
- [ ] New higher Egyptian glyphs (finger, tadpole, Heh god) render visually correct
