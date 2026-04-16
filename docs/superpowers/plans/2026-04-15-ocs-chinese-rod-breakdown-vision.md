# OCS, Chinese Rod SVG, Breakdown Panel, Vision Diagnostics — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Old Church Slavonic numeral system (with Ponomar font), fix Chinese Rod rendering with an SVG renderer, add a per-system breakdown tab to the expanded tile modal, and add diagnostic logging to the Vision photo mode.

**Architecture:** Four independent streams. OCS and Breakdown share a dependency — OCS must be registered and its `explain()` written before the Breakdown UI is wired. Chinese Rod SVG and Vision are fully independent. A shared `src/converters/types.ts` holds `BreakdownToken` to avoid circular imports between converters and the registry.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, SVG (inline React components)

---

## File Map

| Action | Path | Purpose |
|---|---|---|
| Create | `src/converters/types.ts` | `BreakdownToken` interface shared by all converters |
| Create | `src/converters/old-church-slavonic.ts` | OCS fromArabic / toArabic / explain |
| Create | `tests/converters/old-church-slavonic.test.ts` | OCS unit tests |
| Create | `src/renderers/ChineseRodSvg.tsx` | SVG renderer for counting rod numerals |
| Create | `tests/renderers/ChineseRodSvg.test.tsx` | renderer smoke tests |
| Modify | `src/converters/index.ts` | Add BreakdownToken + explain to Converter; register OCS |
| Modify | `src/converters/roman.ts` | Add explain() |
| Modify | `src/converters/egyptian.ts` | Add explain() |
| Modify | `src/converters/ionian.ts` | Add explain() |
| Modify | `src/converters/attic.ts` | Add explain() |
| Modify | `src/converters/babylonian.ts` | Add explain() |
| Modify | `src/converters/mayan.ts` | Add explain() |
| Modify | `src/converters/chinese-rod.ts` | Add explain() |
| Modify | `src/converters/chinese-traditional.ts` | Add explain() |
| Modify | `src/converters/glagolitic.ts` | Add explain() |
| Modify | `src/components/NumeralTile.tsx` | Breakdown tab, ChineseRodSvg dispatch |
| Modify | `src/styles/main.css` | OCS @font-face, OCS tile font rule, breakdown table styles |
| Modify | `src/vision/vision-client.ts` | failureReason diagnostic field + logging |
| Modify | `src/components/PhotoPanel.tsx` | Reason-specific error messages |
| Modify | `tests/converters/*.test.ts` | Add explain() tests to each existing converter test file |
| Download | `public/fonts/PonomarUnicode.ttf` | Church Slavonic font (manual step) |

---

## Task 1: Add BreakdownToken type and extend Converter interface

**Files:**
- Create: `src/converters/types.ts`
- Modify: `src/converters/index.ts`

- [ ] **Step 1: Create `src/converters/types.ts`**

```ts
export interface BreakdownToken {
  display: string  // glyph(s) for text systems; text description for SVG systems
  value: number    // numeric contribution of this token
}
```

- [ ] **Step 2: Update `src/converters/index.ts`**

Replace the existing content with:

```ts
import * as egyptian from './egyptian'
import * as ionian from './ionian'
import * as attic from './attic'
import * as babylonian from './babylonian'
import * as roman from './roman'
import * as mayan from './mayan'
import * as chineseRod from './chinese-rod'
import * as chineseTraditional from './chinese-traditional'
import * as glagolitic from './glagolitic'
import * as oldChurchSlavonic from './old-church-slavonic'
import type { BreakdownToken } from './types'

export type { BreakdownToken } from './types'

export interface Converter {
  id: string
  label: string
  maxValue: number
  toArabic: (input: string) => number
  fromArabic: (n: number) => string
  explain: (n: number) => BreakdownToken[]
}

export const CONVERTERS: Converter[] = [
  { id: 'egyptian',           label: 'Egyptian Hieroglyphic', maxValue: 9_999_999, ...egyptian },
  { id: 'ionian',             label: 'Ionian Greek',          maxValue: 9_999,     ...ionian },
  { id: 'attic',              label: 'Attic Greek',           maxValue: 9_999,     ...attic },
  { id: 'babylonian',         label: 'Babylonian',            maxValue: 999_999,   ...babylonian },
  { id: 'roman',              label: 'Roman',                 maxValue: 3_999,     ...roman },
  { id: 'mayan',              label: 'Mayan',                 maxValue: 999_999,   ...mayan },
  { id: 'chineseRod',         label: 'Chinese Rod',           maxValue: 999_999,   ...chineseRod },
  { id: 'chineseTraditional', label: 'Chinese Traditional',   maxValue: 9_999_999, ...chineseTraditional },
  { id: 'glagolitic',         label: 'Glagolitic',            maxValue: 9_999,     ...glagolitic },
  { id: 'oldChurchSlavonic',  label: 'Old Church Slavonic',   maxValue: 9_999,     ...oldChurchSlavonic },
]
```

- [ ] **Step 3: Run TypeScript check — expect errors about missing `explain` on every converter**

```
npx tsc --noEmit
```

Expected: errors like `Property 'explain' is missing in type ...` for each converter. This confirms the interface is wired. We will fix these one task at a time.

---

## Task 2: Old Church Slavonic converter

**Files:**
- Create: `src/converters/old-church-slavonic.ts`
- Create: `tests/converters/old-church-slavonic.test.ts`

- [ ] **Step 1: Write the failing tests first**

Create `tests/converters/old-church-slavonic.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { fromArabic, toArabic, explain } from '../../src/converters/old-church-slavonic'

describe('Old Church Slavonic — fromArabic', () => {
  it('converts 1 → А', () => expect(fromArabic(1)).toBe('\u0410'))
  it('converts 9 → Ѳ', () => expect(fromArabic(9)).toBe('\u0472'))
  it('converts 10 → І', () => expect(fromArabic(10)).toBe('\u0406'))
  it('converts 42 → МВ', () => expect(fromArabic(42)).toBe('\u041C\u0412'))
  it('converts 100 → Р', () => expect(fromArabic(100)).toBe('\u0420'))
  it('converts 900 → Ц', () => expect(fromArabic(900)).toBe('\u0426'))
  it('converts 999 → ЦЧѲ', () => expect(fromArabic(999)).toBe('\u0426\u0427\u0472'))
  it('converts 1000 → ҂А', () => expect(fromArabic(1000)).toBe('\u0482\u0410'))
  it('converts 1492 → ҂АУПВ', () => expect(fromArabic(1492)).toBe('\u0482\u0410\u0423\u041F\u0412'))
  it('converts 9999 → ҂ѲЦЧѲ', () => expect(fromArabic(9999)).toBe('\u0482\u0472\u0426\u0427\u0472'))
  it('converts 0 → ∅', () => expect(fromArabic(0)).toBe('\u2205'))
  it('throws on 10000', () => expect(() => fromArabic(10000)).toThrow('Out of range'))
  it('throws on -1', () => expect(() => fromArabic(-1)).toThrow('Out of range'))
  it('throws on 1.5', () => expect(() => fromArabic(1.5)).toThrow('integer'))
})

describe('Old Church Slavonic — toArabic', () => {
  it('parses А → 1', () => expect(toArabic('\u0410')).toBe(1))
  it('parses МВ → 42', () => expect(toArabic('\u041C\u0412')).toBe(42))
  it('parses ҂А → 1000', () => expect(toArabic('\u0482\u0410')).toBe(1000))
  it('parses ҂АУПВВ → 1492', () => expect(toArabic('\u0482\u0410\u0423\u041F\u0412')).toBe(1492))
  it('throws on fractions', () => expect(() => toArabic('3.5')).toThrow('Fractions'))
  it('throws on unknown char', () => expect(() => toArabic('X')).toThrow('Cannot parse'))
})

describe('Old Church Slavonic — explain', () => {
  it('returns [] for 0', () => expect(explain(0)).toEqual([]))
  it('returns one token for 42', () => {
    const tokens = explain(42)
    expect(tokens).toEqual([
      { display: '\u041C', value: 40 },
      { display: '\u0412', value: 2 },
    ])
  })
  it('returns thousands token with ҂ prefix for 1000', () => {
    const tokens = explain(1000)
    expect(tokens).toEqual([{ display: '\u0482\u0410', value: 1000 }])
  })
  it('tokens sum to n', () => {
    const n = 1492
    const sum = explain(n).reduce((acc, t) => acc + t.value, 0)
    expect(sum).toBe(n)
  })
  it('throws on out-of-range', () => expect(() => explain(10000)).toThrow('Out of range'))
})
```

- [ ] **Step 2: Run tests — expect failures (file not created yet)**

```
npx vitest run tests/converters/old-church-slavonic.test.ts
```

Expected: import error / all tests fail.

- [ ] **Step 3: Create `src/converters/old-church-slavonic.ts`**

```ts
// Old Church Slavonic Cyrillic numerals — alphabetic additive.
// ҂ (U+0482) prefixes thousands digits; no titlo mark used.
// fromArabic(0) → "∅"   Range: 0–9,999

import type { BreakdownToken } from './types'

const THOU_MARK = '\u0482'  // ҂

// index 1–9 maps to the letter; index 0 unused
const UNITS    = ['', '\u0410', '\u0412', '\u0413', '\u0414', '\u0404',
                      '\u0405', '\u0417', '\u0418', '\u0472']
// А  В  Г  Д  Є  Ѕ  З  И  Ѳ

const TENS     = ['', '\u0406', '\u041A', '\u041B', '\u041C', '\u041D',
                      '\u046E', '\u041E', '\u041F', '\u0427']
// І  К  Л  М  Н  Ѯ  О  П  Ч

const HUNDREDS = ['', '\u0420', '\u0421', '\u0422', '\u0423', '\u0424',
                      '\u0425', '\u0470', '\u047E', '\u0426']
// Р  С  Т  У  Ф  Х  Ѱ  Ѿ  Ц

// Reverse lookup for toArabic
const GLYPH_VALUE = new Map<string, number>()
UNITS.slice(1).forEach((g, i) => GLYPH_VALUE.set(g, i + 1))
TENS.slice(1).forEach((g, i) => GLYPH_VALUE.set(g, (i + 1) * 10))
HUNDREDS.slice(1).forEach((g, i) => GLYPH_VALUE.set(g, (i + 1) * 100))

export function fromArabic(n: number): string {
  if (!Number.isInteger(n)) throw new Error('Input must be an integer')
  if (n < 0 || n > 9_999) throw new Error(`Out of range: ${n}`)
  if (n === 0) return '\u2205' // ∅

  const t = Math.floor(n / 1000)
  const h = Math.floor((n % 1000) / 100)
  const d = Math.floor((n % 100) / 10)
  const u = n % 10

  let result = ''
  if (t > 0) result += THOU_MARK + UNITS[t]
  result += HUNDREDS[h] + TENS[d] + UNITS[u]
  return result
}

export function toArabic(s: string): number {
  if (s.includes('.')) throw new Error('Fractions not supported')

  let total = 0
  const chars = [...s]  // Unicode-safe codepoint iteration
  let i = 0
  while (i < chars.length) {
    if (chars[i] === THOU_MARK) {
      i++
      if (i >= chars.length) throw new Error(`Cannot parse: ${s}`)
      const val = GLYPH_VALUE.get(chars[i])
      if (val === undefined) throw new Error(`Cannot parse: ${s}`)
      total += val * 1000
    } else {
      const val = GLYPH_VALUE.get(chars[i])
      if (val === undefined) throw new Error(`Cannot parse: ${s}`)
      total += val
    }
    i++
  }
  return total
}

export function explain(n: number): BreakdownToken[] {
  if (!Number.isInteger(n)) throw new Error('Input must be an integer')
  if (n < 0 || n > 9_999) throw new Error(`Out of range: ${n}`)
  if (n === 0) return []

  const t = Math.floor(n / 1000)
  const h = Math.floor((n % 1000) / 100)
  const d = Math.floor((n % 100) / 10)
  const u = n % 10

  const tokens: BreakdownToken[] = []
  if (t > 0) tokens.push({ display: THOU_MARK + UNITS[t], value: t * 1000 })
  if (h > 0) tokens.push({ display: HUNDREDS[h], value: h * 100 })
  if (d > 0) tokens.push({ display: TENS[d], value: d * 10 })
  if (u > 0) tokens.push({ display: UNITS[u], value: u })
  return tokens
}
```

- [ ] **Step 4: Run tests — expect all pass**

```
npx vitest run tests/converters/old-church-slavonic.test.ts
```

Expected: all tests green.

- [ ] **Step 5: Commit**

```bash
git add src/converters/old-church-slavonic.ts tests/converters/old-church-slavonic.test.ts
git commit -m "feat: add Old Church Slavonic converter with explain()"
```

---

## Task 3: OCS font setup

**Files:**
- Download: `public/fonts/PonomarUnicode.ttf` (manual step — see instructions)
- Modify: `src/styles/main.css`
- Modify: `src/components/NumeralTile.tsx`

- [ ] **Step 1: Download the Ponomar Unicode font**

Visit `ponomar.net` → Fonts → download `PonomarUnicode.ttf`. Place it at:
```
public/fonts/PonomarUnicode.ttf
```

This covers all archaic Cyrillic characters used by OCS numerals (Ѳ, Ѯ, Ѱ, Ѿ, ҂).

- [ ] **Step 2: Add @font-face and OCS rule to `src/styles/main.css`**

After the existing `@font-face` block for Egyptian (after line 31), add:

```css
@font-face {
  font-family: 'PonomarUnicode';
  src: url('/fonts/PonomarUnicode.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: block;
}
```

After the `.glagolitic` rule (after line 302), add:

```css
.oldChurchSlavonic {
  font-family: 'PonomarUnicode', var(--font-display);
  font-size: 22px;
}
```

- [ ] **Step 3: Add font-loading gate in `src/components/NumeralTile.tsx`**

In the existing `useEffect` for font loading (lines 15–24), extend the condition to also watch for `oldChurchSlavonic`:

```tsx
useEffect(() => {
  if (system.id !== 'egyptian' && system.id !== 'oldChurchSlavonic') return
  const fontName = system.id === 'egyptian'
    ? 'NotoSansEgyptianHieroglyphs'
    : 'PonomarUnicode'
  if (document.fonts.check(`1em ${fontName}`)) {
    setFontReady(true)
    return
  }
  document.fonts.load(`1em ${fontName}`)
    .then(() => setFontReady(true))
    .catch(() => setFontReady(true))
}, [system.id])
```

In `renderContent()`, extend the font-loading guard (currently lines 61–63):

```tsx
if ((system.id === 'egyptian' || system.id === 'oldChurchSlavonic') && !fontReady) {
  return <span className="tile-loading">Loading font…</span>
}
```

- [ ] **Step 4: Verify TypeScript is clean**

```
npx tsc --noEmit
```

Expected: same errors as before Task 3 (missing `explain` on other converters) — no new errors.

- [ ] **Step 5: Commit**

```bash
git add src/styles/main.css src/components/NumeralTile.tsx
git commit -m "feat: add Ponomar Unicode font-face and OCS font gate in NumeralTile"
```

---

## Task 4: Register OCS + vision hint

**Files:**
- Modify: `src/vision/vision-client.ts`

The `index.ts` already has OCS in the CONVERTERS array from Task 1. This task wires the vision hint.

- [ ] **Step 1: Add OCS vision hint in `src/vision/vision-client.ts`**

In the `systemHint()` switch statement, add a case before `default`:

```ts
case 'Old Church Slavonic':
  return 'Old Church Slavonic numerals use Cyrillic letters additively, largest to smallest. А=1 В=2 Г=3 Д=4 Є=5 Ѕ=6 З=7 И=8 Ѳ=9, then І=10 К=20…Ч=90, Р=100…Ц=900, and ҂ prefixes thousands (҂А=1000).'
```

- [ ] **Step 2: Run the full test suite — expect TypeScript errors but no test regressions**

```
npx vitest run
```

Note: TypeScript compilation may warn but Vitest runs transpiled — check that all previously passing tests still pass. Any test failures here are regressions to fix before continuing.

- [ ] **Step 3: Commit**

```bash
git add src/vision/vision-client.ts
git commit -m "feat: add OCS vision hint"
```

---

## Task 5: ChineseRodSvg renderer

**Files:**
- Create: `src/renderers/ChineseRodSvg.tsx`
- Create: `tests/renderers/ChineseRodSvg.test.tsx`

- [ ] **Step 1: Write failing render tests**

Create `tests/renderers/ChineseRodSvg.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ChineseRodSvg } from '../../src/renderers/ChineseRodSvg'
import { fromArabic } from '../../src/converters/chinese-rod'

describe('ChineseRodSvg', () => {
  it('renders without crashing for 1', () => {
    const { container } = render(<ChineseRodSvg encoded={fromArabic(1)} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })
  it('renders without crashing for 9', () => {
    const { container } = render(<ChineseRodSvg encoded={fromArabic(9)} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })
  it('renders without crashing for 42', () => {
    const { container } = render(<ChineseRodSvg encoded={fromArabic(42)} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })
  it('renders without crashing for 1492', () => {
    const { container } = render(<ChineseRodSvg encoded={fromArabic(1492)} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })
  it('renders without crashing for 101 (has zero placeholder)', () => {
    const { container } = render(<ChineseRodSvg encoded={fromArabic(101)} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })
  it('SVG width scales with scale prop', () => {
    const { container: c1 } = render(<ChineseRodSvg encoded={fromArabic(42)} scale={1} />)
    const { container: c3 } = render(<ChineseRodSvg encoded={fromArabic(42)} scale={3} />)
    const w1 = Number(c1.querySelector('svg')!.getAttribute('width'))
    const w3 = Number(c3.querySelector('svg')!.getAttribute('width'))
    expect(w3).toBe(w1 * 3)
  })
})
```

- [ ] **Step 2: Run tests — expect failures**

```
npx vitest run tests/renderers/ChineseRodSvg.test.tsx
```

Expected: import error (file not created).

- [ ] **Step 3: Create `src/renderers/ChineseRodSvg.tsx`**

```tsx
// Renders Chinese counting rod numerals as SVG.
// Vertical rods (white #e0e0e0): even decimal positions (ones, hundreds, …)
// Horizontal rods (gold #f0c060): odd decimal positions (tens, thousands, …)

const W = 48        // cell width px
const H = 80        // cell height px
const PAD = 6       // inner padding
const STROKE = 3
const VERT_COLOR  = '#e0e0e0'
const HORIZ_COLOR = '#f0c060'
const ZERO_CP     = 0x3007   // 〇

interface Props {
  encoded: string
  scale?: number
}

type RodCell =
  | { type: 'vert';  digit: number }
  | { type: 'horiz'; digit: number }
  | { type: 'zero' }

function cpToCell(cp: number): RodCell | null {
  if (cp >= 0x1D360 && cp <= 0x1D368) return { type: 'vert',  digit: cp - 0x1D35F }
  if (cp >= 0x1D369 && cp <= 0x1D371) return { type: 'horiz', digit: cp - 0x1D368 }
  if (cp === ZERO_CP)                  return { type: 'zero' }
  return null
}

/** Evenly-spaced x positions for n vertical lines, centred in [PAD, W-PAD]. */
function xPos(n: number): number[] {
  if (n === 1) return [W / 2]
  return Array.from({ length: n }, (_, i) => PAD + (i * (W - 2 * PAD)) / (n - 1))
}

/** Centred y positions for n horizontal lines, spaced 12 px apart. */
function yPos(n: number): number[] {
  const spacing = 12
  const start = H / 2 - (spacing * (n - 1)) / 2
  return Array.from({ length: n }, (_, i) => start + i * spacing)
}

function renderCell(cell: RodCell, idx: number): React.ReactElement {
  const ox = idx * W   // x offset for this cell

  if (cell.type === 'zero') {
    return (
      <circle key={idx} cx={ox + W / 2} cy={H / 2} r={10}
        fill="none" stroke="#888888" strokeWidth={2} />
    )
  }

  const lines: React.ReactElement[] = []

  if (cell.type === 'vert') {
    const { digit } = cell
    if (digit <= 5) {
      xPos(digit).forEach((x, i) =>
        lines.push(<line key={i}
          x1={ox + x} y1={PAD} x2={ox + x} y2={H - PAD}
          stroke={VERT_COLOR} strokeWidth={STROKE} strokeLinecap="round" />))
    } else {
      // 1 horizontal crossbar near top + (digit−5) verticals below
      lines.push(<line key="xbar"
        x1={ox + PAD} y1={PAD + 8} x2={ox + W - PAD} y2={PAD + 8}
        stroke={VERT_COLOR} strokeWidth={STROKE} strokeLinecap="round" />)
      xPos(digit - 5).forEach((x, i) =>
        lines.push(<line key={i}
          x1={ox + x} y1={PAD + 16} x2={ox + x} y2={H - PAD}
          stroke={VERT_COLOR} strokeWidth={STROKE} strokeLinecap="round" />))
    }
  }

  if (cell.type === 'horiz') {
    const { digit } = cell
    if (digit <= 5) {
      yPos(digit).forEach((y, i) =>
        lines.push(<line key={i}
          x1={ox + PAD} y1={y} x2={ox + W - PAD} y2={y}
          stroke={HORIZ_COLOR} strokeWidth={STROKE} strokeLinecap="round" />))
    } else {
      // 1 vertical crossbar at top + (digit−5) horizontals below
      const numH = digit - 5
      const vertY2 = 48 - (digit - 6) * 6   // shrinks as more horiz lines added
      const firstY = vertY2 + 8
      lines.push(<line key="xbar"
        x1={ox + W / 2} y1={PAD + 6} x2={ox + W / 2} y2={vertY2}
        stroke={HORIZ_COLOR} strokeWidth={STROKE} strokeLinecap="round" />)
      for (let i = 0; i < numH; i++) {
        lines.push(<line key={i}
          x1={ox + PAD} y1={firstY + i * 12} x2={ox + W - PAD} y2={firstY + i * 12}
          stroke={HORIZ_COLOR} strokeWidth={STROKE} strokeLinecap="round" />)
      }
    }
  }

  return <g key={idx}>{lines}</g>
}

export function ChineseRodSvg({ encoded, scale = 1 }: Props): React.ReactElement {
  const cells: RodCell[] = []
  for (const char of encoded) {
    const cp = char.codePointAt(0)!
    const cell = cpToCell(cp)
    if (cell) cells.push(cell)
  }

  const totalW = cells.length * W

  return (
    <svg
      width={totalW * scale}
      height={H * scale}
      viewBox={`0 0 ${totalW} ${H}`}
    >
      {cells.map((cell, i) => renderCell(cell, i))}
    </svg>
  )
}
```

- [ ] **Step 4: Run tests — expect all pass**

```
npx vitest run tests/renderers/ChineseRodSvg.test.tsx
```

Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add src/renderers/ChineseRodSvg.tsx tests/renderers/ChineseRodSvg.test.tsx
git commit -m "feat: ChineseRodSvg SVG renderer for counting rod numerals"
```

---

## Task 6: Wire ChineseRodSvg into NumeralTile

**Files:**
- Modify: `src/components/NumeralTile.tsx`
- Modify: `src/styles/main.css`

- [ ] **Step 1: Update imports and dispatch in `src/components/NumeralTile.tsx`**

Add the import at the top (after the BabylonianSvg import):

```tsx
import { ChineseRodSvg } from '../renderers/ChineseRodSvg'
```

In `renderContent()`, add the ChineseRodSvg dispatch immediately after the Babylonian block:

```tsx
if (system.id === 'babylonian') {
  return <BabylonianSvg encoded={output} scale={scale} />
}

if (system.id === 'chineseRod') {
  return <ChineseRodSvg encoded={output} scale={scale} />
}
```

- [ ] **Step 2: Remove the `.chineseRod` font rule from `src/styles/main.css`**

Delete these lines (they were a font fallback that is now replaced by SVG):

```css
.chineseRod {
  font-family: 'Noto Sans', var(--font-display);
  font-size: 24px;
}
```

- [ ] **Step 3: Verify TypeScript is clean (ignoring the still-missing explain errors)**

```
npx tsc --noEmit 2>&1 | grep -v "explain"
```

Expected: no errors other than the known missing-explain errors on converters not yet updated.

- [ ] **Step 4: Commit**

```bash
git add src/components/NumeralTile.tsx src/styles/main.css
git commit -m "feat: dispatch ChineseRodSvg in NumeralTile, remove font fallback"
```

---

## Task 7: Roman explain()

**Files:**
- Modify: `src/converters/roman.ts`
- Modify: `tests/converters/roman.test.ts`

- [ ] **Step 1: Add failing tests to `tests/converters/roman.test.ts`**

Append to the existing test file:

```ts
import { explain } from '../../src/converters/roman'
import type { BreakdownToken } from '../../src/converters/types'

describe('Roman — explain', () => {
  it('returns [] for 0', () => expect(explain(0)).toEqual([]))
  it('1 → [{I,1}]', () => expect(explain(1)).toEqual([{ display: 'I', value: 1 }]))
  it('4 → [{IV,4}]', () => expect(explain(4)).toEqual([{ display: 'IV', value: 4 }]))
  it('1492 tokens sum to 1492', () => {
    const sum = explain(1492).reduce((a, t) => a + t.value, 0)
    expect(sum).toBe(1492)
  })
  it('1492 → [{M,1000},{CD,400},{XC,90},{II,2}]', () => {
    expect(explain(1492)).toEqual([
      { display: 'M',  value: 1000 },
      { display: 'CD', value: 400  },
      { display: 'XC', value: 90   },
      { display: 'II', value: 2    },
    ])
  })
  it('throws on out-of-range', () => expect(() => explain(4000)).toThrow('Out of range'))
})
```

- [ ] **Step 2: Run — expect failures**

```
npx vitest run tests/converters/roman.test.ts
```

- [ ] **Step 3: Add `explain()` to `src/converters/roman.ts`**

Add at the top of the file:

```ts
import type { BreakdownToken } from './types'
```

Append to the bottom of the file:

```ts
export function explain(n: number): BreakdownToken[] {
  if (!Number.isInteger(n)) throw new Error('Input must be an integer')
  if (n < 0 || n > 3_999) throw new Error(`Out of range: ${n}`)
  if (n === 0) return []

  const tokens: BreakdownToken[] = []
  let remaining = n
  for (const [value, symbol] of TABLE) {
    if (remaining >= value) {
      const count = Math.floor(remaining / value)
      tokens.push({ display: symbol.repeat(count), value: value * count })
      remaining -= value * count
    }
  }
  return tokens
}
```

- [ ] **Step 4: Run — expect all green**

```
npx vitest run tests/converters/roman.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/converters/roman.ts tests/converters/roman.test.ts
git commit -m "feat: add explain() to Roman converter"
```

---

## Task 8: Egyptian explain()

**Files:**
- Modify: `src/converters/egyptian.ts`
- Modify: `tests/converters/egyptian.test.ts`

- [ ] **Step 1: Add failing tests to `tests/converters/egyptian.test.ts`**

```ts
import { explain } from '../../src/converters/egyptian'

describe('Egyptian — explain', () => {
  it('returns [] for 0', () => expect(explain(0)).toEqual([]))
  it('1 → one stroke token', () => {
    expect(explain(1)).toEqual([{ display: '\u{133FA}', value: 1 }])
  })
  it('42 tokens sum to 42', () => {
    expect(explain(42).reduce((a, t) => a + t.value, 0)).toBe(42)
  })
  it('42 → hobbles + strokes', () => {
    expect(explain(42)).toEqual([
      { display: '\u{13386}'.repeat(4), value: 40 },
      { display: '\u{133FA}'.repeat(2), value: 2 },
    ])
  })
  it('tokens sum to 1000', () => {
    expect(explain(1000).reduce((a, t) => a + t.value, 0)).toBe(1000)
  })
  it('throws on out-of-range', () => expect(() => explain(10_000_000)).toThrow('Out of range'))
})
```

- [ ] **Step 2: Run — expect failures**

```
npx vitest run tests/converters/egyptian.test.ts
```

- [ ] **Step 3: Add `explain()` to `src/converters/egyptian.ts`**

Add at the top:

```ts
import type { BreakdownToken } from './types'
```

Append:

```ts
export function explain(n: number): BreakdownToken[] {
  if (!Number.isInteger(n)) throw new Error('Input must be an integer')
  if (n < 0 || n > 9_999_999) throw new Error(`Out of range: ${n}`)
  if (n === 0) return []

  const tokens: BreakdownToken[] = []
  let remaining = n
  for (const [value, glyph] of SYMBOLS) {
    const count = Math.floor(remaining / value)
    if (count > 0) {
      tokens.push({ display: glyph.repeat(count), value: value * count })
      remaining %= value
    }
  }
  return tokens
}
```

- [ ] **Step 4: Run — expect all green**

```
npx vitest run tests/converters/egyptian.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/converters/egyptian.ts tests/converters/egyptian.test.ts
git commit -m "feat: add explain() to Egyptian converter"
```

---

## Task 9: Ionian explain()

**Files:**
- Modify: `src/converters/ionian.ts`
- Modify: `tests/converters/ionian.test.ts`

- [ ] **Step 1: Add failing tests to `tests/converters/ionian.test.ts`**

```ts
import { explain } from '../../src/converters/ionian'

describe('Ionian — explain', () => {
  it('returns [] for 0', () => expect(explain(0)).toEqual([]))
  it('1 → [{α, 1}]', () => expect(explain(1)).toEqual([{ display: '\u03B1', value: 1 }]))
  it('42 → [{μ,40},{β,2}]', () => expect(explain(42)).toEqual([
    { display: '\u03BC', value: 40 },  // μ=40 (TENS[4])
    { display: '\u03B2', value: 2 },   // β=2  (UNITS[2])
  ]))
  it('tokens sum to 1000', () => {
    expect(explain(1000).reduce((a, t) => a + t.value, 0)).toBe(1000)
  })
  it('tokens sum to 9999', () => {
    expect(explain(9999).reduce((a, t) => a + t.value, 0)).toBe(9999)
  })
  it('throws on out-of-range', () => expect(() => explain(10000)).toThrow('Out of range'))
})
```

- [ ] **Step 2: Run — expect failures**

```
npx vitest run tests/converters/ionian.test.ts
```

- [ ] **Step 3: Add `explain()` to `src/converters/ionian.ts`**

Add at top:

```ts
import type { BreakdownToken } from './types'
```

Append:

```ts
export function explain(n: number): BreakdownToken[] {
  if (!Number.isInteger(n)) throw new Error('Input must be an integer')
  if (n < 0 || n > 9_999) throw new Error(`Out of range: ${n}`)
  if (n === 0) return []

  const t = Math.floor(n / 1000)
  const h = Math.floor((n % 1000) / 100)
  const d = Math.floor((n % 100) / 10)
  const u = n % 10

  const tokens: BreakdownToken[] = []
  if (t > 0) tokens.push({ display: THOUSANDS[t], value: t * 1000 })
  if (h > 0) tokens.push({ display: HUNDREDS[h], value: h * 100 })
  if (d > 0) tokens.push({ display: TENS[d], value: d * 10 })
  if (u > 0) tokens.push({ display: UNITS[u], value: u })
  return tokens
}
```

- [ ] **Step 4: Run — expect all green**

```
npx vitest run tests/converters/ionian.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/converters/ionian.ts tests/converters/ionian.test.ts
git commit -m "feat: add explain() to Ionian converter"
```

---

## Task 10: Attic explain()

**Files:**
- Modify: `src/converters/attic.ts`
- Modify: `tests/converters/attic.test.ts`

- [ ] **Step 1: Add failing tests to `tests/converters/attic.test.ts`**

```ts
import { explain } from '../../src/converters/attic'

describe('Attic — explain', () => {
  it('returns [] for 0', () => expect(explain(0)).toEqual([]))
  it('1 → [{Ι,1}]', () => expect(explain(1)).toEqual([{ display: '\u0399', value: 1 }]))
  it('42 → [{ΔΔΔΔ,40},{ΙΙ,2}]', () => expect(explain(42)).toEqual([
    { display: '\u0394\u0394\u0394\u0394', value: 40 },
    { display: '\u0399\u0399', value: 2 },
  ]))
  it('tokens sum to 1492', () => {
    expect(explain(1492).reduce((a, t) => a + t.value, 0)).toBe(1492)
  })
  it('tokens sum to 9999', () => {
    expect(explain(9999).reduce((a, t) => a + t.value, 0)).toBe(9999)
  })
  it('throws on out-of-range', () => expect(() => explain(10000)).toThrow('Out of range'))
})
```

- [ ] **Step 2: Run — expect failures**

```
npx vitest run tests/converters/attic.test.ts
```

- [ ] **Step 3: Add `explain()` to `src/converters/attic.ts`**

Add at top:

```ts
import type { BreakdownToken } from './types'
```

Append:

```ts
export function explain(n: number): BreakdownToken[] {
  if (!Number.isInteger(n)) throw new Error('Input must be an integer')
  if (n < 0 || n > 9_999) throw new Error(`Out of range: ${n}`)
  if (n === 0) return []

  const tokens: BreakdownToken[] = []
  let remaining = n
  for (const [value, symbol] of TABLE) {
    if (remaining >= value) {
      const count = Math.floor(remaining / value)
      tokens.push({ display: symbol.repeat(count), value: value * count })
      remaining -= value * count
    }
  }
  return tokens
}
```

- [ ] **Step 4: Run — expect all green**

```
npx vitest run tests/converters/attic.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/converters/attic.ts tests/converters/attic.test.ts
git commit -m "feat: add explain() to Attic converter"
```

---

## Task 11: Babylonian explain()

**Files:**
- Modify: `src/converters/babylonian.ts`
- Modify: `tests/converters/babylonian.test.ts`

- [ ] **Step 1: Add failing tests to `tests/converters/babylonian.test.ts`**

```ts
import { explain } from '../../src/converters/babylonian'

describe('Babylonian — explain', () => {
  it('returns [] for 0', () => expect(explain(0)).toEqual([]))
  it('1 → [{1 in the 1s place, 1}]', () => {
    expect(explain(1)).toEqual([{ display: '1 in the 1s place', value: 1 }])
  })
  it('60 → [{1 in the 60s place, 60}]', () => {
    expect(explain(60)).toEqual([{ display: '1 in the 60s place', value: 60 }])
  })
  it('tokens sum to 1492', () => {
    expect(explain(1492).reduce((a, t) => a + t.value, 0)).toBe(1492)
  })
  it('1492 has two groups (24×60 + 52)', () => {
    const tokens = explain(1492)
    expect(tokens).toHaveLength(2)
    expect(tokens[0]).toEqual({ display: '24 in the 60s place', value: 1440 })
    expect(tokens[1]).toEqual({ display: '52 in the 1s place', value: 52 })
  })
  it('throws on out-of-range', () => expect(() => explain(1_000_000)).toThrow('Out of range'))
})
```

- [ ] **Step 2: Run — expect failures**

```
npx vitest run tests/converters/babylonian.test.ts
```

- [ ] **Step 3: Add `explain()` to `src/converters/babylonian.ts`**

Add at top:

```ts
import type { BreakdownToken } from './types'
```

Append:

```ts
export function explain(n: number): BreakdownToken[] {
  if (!Number.isInteger(n)) throw new Error('Input must be an integer')
  if (n < 0 || n > 999_999) throw new Error(`Out of range: ${n}`)
  if (n === 0) return []

  const groups: number[] = []
  let remaining = n
  while (remaining > 0) {
    groups.unshift(remaining % 60)
    remaining = Math.floor(remaining / 60)
  }

  return groups.map((digit, i) => {
    const placeValue = Math.pow(60, groups.length - 1 - i)
    return {
      display: `${digit} in the ${placeValue}s place`,
      value: digit * placeValue,
    }
  }).filter(t => t.value > 0)
}
```

- [ ] **Step 4: Run — expect all green**

```
npx vitest run tests/converters/babylonian.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/converters/babylonian.ts tests/converters/babylonian.test.ts
git commit -m "feat: add explain() to Babylonian converter"
```

---

## Task 12: Mayan explain()

**Files:**
- Modify: `src/converters/mayan.ts`
- Modify: `tests/converters/mayan.test.ts`

- [ ] **Step 1: Add failing tests to `tests/converters/mayan.test.ts`**

```ts
import { explain } from '../../src/converters/mayan'

describe('Mayan — explain', () => {
  it('returns [] for 0', () => expect(explain(0)).toEqual([]))
  it('1 → [{1 dot in the 1s place, 1}]', () => {
    expect(explain(1)).toEqual([{ display: '1 dot in the 1s place', value: 1 }])
  })
  it('5 → [{1 bar in the 1s place, 5}]', () => {
    expect(explain(5)).toEqual([{ display: '1 bar in the 1s place', value: 5 }])
  })
  it('tokens sum to 42', () => {
    expect(explain(42).reduce((a, t) => a + t.value, 0)).toBe(42)
  })
  it('42 = 2×20 + 2 → two groups', () => {
    const tokens = explain(42)
    expect(tokens).toHaveLength(2)
    expect(tokens[0]).toEqual({ display: '2 dots in the 20s place', value: 40 })
    expect(tokens[1]).toEqual({ display: '2 dots in the 1s place', value: 2 })
  })
  it('tokens sum to 1492', () => {
    expect(explain(1492).reduce((a, t) => a + t.value, 0)).toBe(1492)
  })
  it('throws on out-of-range', () => expect(() => explain(1_000_000)).toThrow('Out of range'))
})
```

- [ ] **Step 2: Run — expect failures**

```
npx vitest run tests/converters/mayan.test.ts
```

- [ ] **Step 3: Add `explain()` to `src/converters/mayan.ts`**

Add at top:

```ts
import type { BreakdownToken } from './types'
```

Append:

```ts
export function explain(n: number): BreakdownToken[] {
  if (!Number.isInteger(n)) throw new Error('Input must be an integer')
  if (n < 0 || n > 999_999) throw new Error(`Out of range: ${n}`)
  if (n === 0) return []

  const digits: number[] = []
  let remaining = n
  while (remaining > 0) {
    digits.unshift(remaining % 20)
    remaining = Math.floor(remaining / 20)
  }

  return digits.map((digit, i) => {
    const placeValue = Math.pow(20, digits.length - 1 - i)
    const bars = Math.floor(digit / 5)
    const dots = digit % 5
    let parts: string[] = []
    if (bars > 0) parts.push(`${bars} bar${bars > 1 ? 's' : ''}`)
    if (dots > 0) parts.push(`${dots} dot${dots > 1 ? 's' : ''}`)
    if (digit === 0) parts.push('shell (0)')
    return {
      display: `${parts.join(' + ')} in the ${placeValue}s place`,
      value: digit * placeValue,
    }
  }).filter(t => t.value > 0)
}
```

- [ ] **Step 4: Run — expect all green**

```
npx vitest run tests/converters/mayan.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/converters/mayan.ts tests/converters/mayan.test.ts
git commit -m "feat: add explain() to Mayan converter"
```

---

## Task 13: Chinese Rod explain()

**Files:**
- Modify: `src/converters/chinese-rod.ts`
- Modify: `tests/converters/chinese-rod.test.ts`

- [ ] **Step 1: Add failing tests to `tests/converters/chinese-rod.test.ts`**

```ts
import { explain } from '../../src/converters/chinese-rod'

describe('Chinese Rod — explain', () => {
  it('returns [] for 0', () => expect(explain(0)).toEqual([]))
  it('1 → [{vertical-1 (×1), 1}]', () => {
    expect(explain(1)).toEqual([{ display: 'vertical-1 (×1)', value: 1 }])
  })
  it('10 → [{horizontal-1 (×10), 10}]', () => {
    expect(explain(10)).toEqual([{ display: 'horizontal-1 (×10)', value: 10 }])
  })
  it('tokens sum to 42', () => {
    expect(explain(42).reduce((a, t) => a + t.value, 0)).toBe(42)
  })
  it('1492 has four tokens', () => {
    const tokens = explain(1492)
    expect(tokens).toEqual([
      { display: 'horizontal-1 (×1000)', value: 1000 },
      { display: 'vertical-4 (×100)',   value: 400  },
      { display: 'horizontal-9 (×10)',  value: 90   },
      { display: 'vertical-2 (×1)',     value: 2    },
    ])
  })
  it('zero digit is skipped (101 has two tokens)', () => {
    expect(explain(101)).toHaveLength(2)
  })
  it('throws on out-of-range', () => expect(() => explain(1_000_000)).toThrow('Out of range'))
})
```

- [ ] **Step 2: Run — expect failures**

```
npx vitest run tests/converters/chinese-rod.test.ts
```

- [ ] **Step 3: Add `explain()` to `src/converters/chinese-rod.ts`**

Add at top:

```ts
import type { BreakdownToken } from './types'
```

Append:

```ts
export function explain(n: number): BreakdownToken[] {
  if (!Number.isInteger(n)) throw new Error('Input must be an integer')
  if (n < 0 || n > 999_999) throw new Error(`Out of range: ${n}`)
  if (n === 0) return []

  const digits: number[] = []
  let temp = n
  while (temp > 0) {
    digits.unshift(temp % 10)
    temp = Math.floor(temp / 10)
  }

  const tokens: BreakdownToken[] = []
  for (let i = 0; i < digits.length; i++) {
    const digit = digits[i]
    if (digit === 0) continue
    const position = digits.length - 1 - i   // 0 = ones (rightmost)
    const placeValue = Math.pow(10, position)
    const orientation = position % 2 === 0 ? 'vertical' : 'horizontal'
    tokens.push({
      display: `${orientation}-${digit} (×${placeValue})`,
      value: digit * placeValue,
    })
  }
  return tokens
}
```

- [ ] **Step 4: Run — expect all green**

```
npx vitest run tests/converters/chinese-rod.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/converters/chinese-rod.ts tests/converters/chinese-rod.test.ts
git commit -m "feat: add explain() to Chinese Rod converter"
```

---

## Task 14: Chinese Traditional explain()

**Files:**
- Modify: `src/converters/chinese-traditional.ts`
- Modify: `tests/converters/chinese-traditional.test.ts`

- [ ] **Step 1: Add failing tests to `tests/converters/chinese-traditional.test.ts`**

```ts
import { explain } from '../../src/converters/chinese-traditional'

describe('Chinese Traditional — explain', () => {
  it('returns [] for 0', () => expect(explain(0)).toEqual([]))
  it('1 → [{一, 1}]', () => expect(explain(1)).toEqual([{ display: '一', value: 1 }]))
  it('10 → [{十, 10}]', () => expect(explain(10)).toEqual([{ display: '十', value: 10 }]))
  it('42 → [{四十,40},{二,2}]', () => expect(explain(42)).toEqual([
    { display: '四十', value: 40 },
    { display: '二',   value: 2  },
  ]))
  it('tokens sum to 1492', () => {
    expect(explain(1492).reduce((a, t) => a + t.value, 0)).toBe(1492)
  })
  it('1492 → 4 tokens', () => expect(explain(1492)).toHaveLength(4))
  it('tokens sum to 10000', () => {
    expect(explain(10000).reduce((a, t) => a + t.value, 0)).toBe(10000)
  })
  it('throws on out-of-range', () => expect(() => explain(10_000_000)).toThrow('Out of range'))
})
```

- [ ] **Step 2: Run — expect failures**

```
npx vitest run tests/converters/chinese-traditional.test.ts
```

- [ ] **Step 3: Add `explain()` to `src/converters/chinese-traditional.ts`**

Add at top:

```ts
import type { BreakdownToken } from './types'
```

Append:

```ts
export function explain(n: number): BreakdownToken[] {
  if (!Number.isInteger(n)) throw new Error('Input must be an integer')
  if (n < 0 || n > 9_999_999) throw new Error(`Out of range: ${n}`)
  if (n === 0) return []

  const TIERS: [number, string][] = [
    [1_000_000, '百萬'],
    [100_000,   '十萬'],
    [10_000,    '萬'  ],
    [1_000,     '千'  ],
    [100,       '百'  ],
    [10,        '十'  ],
    [1,         ''    ],
  ]

  const tokens: BreakdownToken[] = []
  let remaining = n
  for (const [placeValue, placeChar] of TIERS) {
    const digit = Math.floor(remaining / placeValue)
    if (digit > 0) {
      tokens.push({ display: DIGITS[digit] + placeChar, value: digit * placeValue })
      remaining %= placeValue
    }
  }
  return tokens
}
```

- [ ] **Step 4: Run — expect all green**

```
npx vitest run tests/converters/chinese-traditional.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/converters/chinese-traditional.ts tests/converters/chinese-traditional.test.ts
git commit -m "feat: add explain() to Chinese Traditional converter"
```

---

## Task 15: Glagolitic explain()

**Files:**
- Modify: `src/converters/glagolitic.ts`
- Modify: `tests/converters/glagolitic.test.ts`

- [ ] **Step 1: Add failing tests to `tests/converters/glagolitic.test.ts`**

```ts
import { explain } from '../../src/converters/glagolitic'

describe('Glagolitic — explain', () => {
  it('returns [] for 0', () => expect(explain(0)).toEqual([]))
  it('1 → one token', () => expect(explain(1)).toHaveLength(1))
  it('tokens sum to 42', () => {
    expect(explain(42).reduce((a, t) => a + t.value, 0)).toBe(42)
  })
  it('tokens sum to 9999', () => {
    expect(explain(9999).reduce((a, t) => a + t.value, 0)).toBe(9999)
  })
  it('1000 → one token, value 1000', () => {
    const tokens = explain(1000)
    expect(tokens).toHaveLength(1)
    expect(tokens[0].value).toBe(1000)
  })
  it('throws on out-of-range', () => expect(() => explain(10000)).toThrow('Out of range'))
})
```

- [ ] **Step 2: Run — expect failures**

```
npx vitest run tests/converters/glagolitic.test.ts
```

- [ ] **Step 3: Add `explain()` to `src/converters/glagolitic.ts`**

Add at top:

```ts
import type { BreakdownToken } from './types'
```

Append:

```ts
export function explain(n: number): BreakdownToken[] {
  if (!Number.isInteger(n)) throw new Error('Input must be an integer')
  if (n < 0 || n > 9_999) throw new Error(`Out of range: ${n}`)
  if (n === 0) return []

  const t = Math.floor(n / 1000)
  const h = Math.floor((n % 1000) / 100)
  const d = Math.floor((n % 100) / 10)
  const u = n % 10

  const tokens: BreakdownToken[] = []
  if (t > 0) tokens.push({ display: THOUSANDS[t], value: t * 1000 })
  if (h > 0) tokens.push({ display: HUNDREDS[h], value: h * 100 })
  if (d > 0) tokens.push({ display: TENS[d], value: d * 10 })
  if (u > 0) tokens.push({ display: UNITS[u], value: u })
  return tokens
}
```

- [ ] **Step 4: Run — expect all green**

```
npx vitest run tests/converters/glagolitic.test.ts
```

- [ ] **Step 5: Run full test suite and verify TypeScript is now clean**

```
npx vitest run
npx tsc --noEmit
```

Expected: all tests pass. TypeScript clean (all converters now have `explain`).

- [ ] **Step 6: Commit**

```bash
git add src/converters/glagolitic.ts tests/converters/glagolitic.test.ts
git commit -m "feat: add explain() to Glagolitic converter — all 10 converters have explain()"
```

---

## Task 16: NumeralTile breakdown tab UI

**Files:**
- Modify: `src/components/NumeralTile.tsx`
- Modify: `src/styles/main.css`

- [ ] **Step 1: Add breakdown CSS to `src/styles/main.css`**

Append to the end of the file:

```css
/* 15. Breakdown tab */
.tile-modal-tabs {
  display: flex;
  gap: 8px;
  align-self: stretch;
  border-bottom: 1px solid var(--gold-dim);
  padding-bottom: 8px;
}

.tile-modal-tab {
  flex: 1;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -9px;
  color: var(--text-muted);
  font-family: var(--font-ui);
  font-size: 12px;
  padding: 6px 4px;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.tile-modal-tab:hover:not(:disabled) { color: var(--text-main); }
.tile-modal-tab.active {
  color: var(--gold);
  border-bottom-color: var(--gold);
}
.tile-modal-tab:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.breakdown-table {
  width: 100%;
  min-width: 200px;
  border-collapse: collapse;
  font-family: var(--font-display);
}

.breakdown-table td {
  padding: 6px 8px;
  border-top: 1px solid rgba(201, 168, 76, 0.12);
  font-size: 16px;
  color: var(--text-main);
}

.breakdown-table td:last-child {
  text-align: right;
  color: #7cc87c;
  font-family: var(--font-ui);
  font-size: 14px;
}

.breakdown-total td {
  color: #5c8db0 !important;
  font-weight: bold;
  border-top: 1px solid var(--gold-dim) !important;
}
```

- [ ] **Step 2: Update `src/components/NumeralTile.tsx`**

Replace the entire file with:

```tsx
import { useState, useEffect } from 'react'
import type { Converter, BreakdownToken } from '../converters/index'
import { MayanSvg } from '../renderers/MayanSvg'
import { BabylonianSvg } from '../renderers/BabylonianSvg'
import { ChineseRodSvg } from '../renderers/ChineseRodSvg'

interface NumeralTileProps {
  system: Converter
  value: number | null
}

export function NumeralTile({ system, value }: NumeralTileProps) {
  const [fontReady, setFontReady] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [view, setView] = useState<'numeral' | 'breakdown'>('numeral')

  useEffect(() => {
    if (system.id !== 'egyptian' && system.id !== 'oldChurchSlavonic') return
    const fontName = system.id === 'egyptian'
      ? 'NotoSansEgyptianHieroglyphs'
      : 'PonomarUnicode'
    if (document.fonts.check(`1em ${fontName}`)) {
      setFontReady(true)
      return
    }
    document.fonts.load(`1em ${fontName}`)
      .then(() => setFontReady(true))
      .catch(() => setFontReady(true))
  }, [system.id])

  useEffect(() => {
    if (!expanded) {
      setView('numeral')  // reset tab on close
      return
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setExpanded(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [expanded])

  const outOfRange = value !== null && value > system.maxValue
  const canBreakdown = value !== null && !outOfRange && value !== 0

  function renderContent(scale = 1): JSX.Element {
    if (value === null) {
      return <span className="tile-placeholder">—</span>
    }
    if (outOfRange) {
      return <span className="tile-no-rep">out of range</span>
    }
    const output = system.fromArabic(value)
    if (output === '∅') {
      return <span className="tile-no-rep">No representation</span>
    }
    if (system.id === 'mayan') {
      return <MayanSvg encoded={output} scale={scale} />
    }
    if (system.id === 'babylonian') {
      return <BabylonianSvg encoded={output} scale={scale} />
    }
    if (system.id === 'chineseRod') {
      return <ChineseRodSvg encoded={output} scale={scale} />
    }
    if ((system.id === 'egyptian' || system.id === 'oldChurchSlavonic') && !fontReady) {
      return <span className="tile-loading">Loading font…</span>
    }
    return <span className={`tile-numeral ${system.id}`}>{output}</span>
  }

  function renderModalNumeralContent(): JSX.Element {
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

  function renderBreakdown(): JSX.Element {
    if (!canBreakdown) return <span className="tile-no-rep">No breakdown available</span>
    const tokens: BreakdownToken[] = system.explain(value!)
    return (
      <table className="breakdown-table">
        <tbody>
          {tokens.map((t, i) => (
            <tr key={i}>
              <td className={system.id}>{t.display}</td>
              <td>{t.value.toLocaleString('en-US')}</td>
            </tr>
          ))}
          <tr className="breakdown-total">
            <td>total</td>
            <td>{value!.toLocaleString('en-US')}</td>
          </tr>
        </tbody>
      </table>
    )
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
            <div className="tile-modal-tabs">
              <button
                className={`tile-modal-tab${view === 'numeral' ? ' active' : ''}`}
                onClick={() => setView('numeral')}
              >
                Numeral
              </button>
              <button
                className={`tile-modal-tab${view === 'breakdown' ? ' active' : ''}`}
                onClick={() => setView('breakdown')}
                disabled={!canBreakdown}
              >
                Breakdown
              </button>
            </div>
            <div className="tile-modal-content">
              {view === 'numeral' ? renderModalNumeralContent() : renderBreakdown()}
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

- [ ] **Step 3: Run full test suite**

```
npx vitest run
```

Expected: all tests pass (no new test failures — the tile changes are UI-only).

- [ ] **Step 4: TypeScript check**

```
npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add src/components/NumeralTile.tsx src/styles/main.css
git commit -m "feat: add Breakdown tab to NumeralTile modal"
```

---

## Task 17: Vision diagnostics — vision-client.ts

**Files:**
- Modify: `src/vision/vision-client.ts`

- [ ] **Step 1: Update `src/vision/vision-client.ts`**

Replace the file content with:

```ts
export type FailureReason = 'no-key' | 'network-error' | 'api-error' | 'uncertain' | 'parse-failed'

export interface RecognitionResult {
  value: number | null
  confidence: 'high' | 'low'
  rawText: string
  failureReason?: FailureReason
}

const MODEL = 'claude-sonnet-4-6'

interface ClaudeResponse {
  content: Array<{ type: string; text: string }>
}

function systemHint(systemName: string): string {
  switch (systemName) {
    case 'Roman':
      return 'Roman numerals use letters I (1), V (5), X (10), L (50), C (100), D (500), M (1000). Subtractive notation applies (IV=4, IX=9, etc.).'
    case 'Egyptian Hieroglyphic':
      return 'Egyptian numerals are additive. A vertical stroke = 1, a heel/hobble shape = 10, a coil of rope = 100, a lotus flower = 1000.'
    case 'Ionian Greek':
      return 'Ionian (Milesian) Greek numerals use Greek letters where α=1...θ=9 (ones), ι=10...ϟ=90 (tens), ρ=100...ϡ=900 (hundreds). A mark ʹ follows the number. Thousands use ͵ prefix.'
    case 'Attic Greek':
      return 'Attic Greek numerals are acrophonic: Ι=1, Π=5, Δ=10, ΠΔ=50, Η=100, ΠΗ=500, Χ=1000. Numbers are additive, largest symbol first.'
    case 'Babylonian':
      return 'Babylonian numerals use two cuneiform wedge marks: a vertical wedge = 1, a corner wedge = 10. The system is base-60 positional, read left to right from highest to lowest place.'
    case 'Mayan':
      return 'Mayan numerals use dots (each worth 1), horizontal bars (each worth 5), and a shell shape (= 0). Digits are stacked vertically, highest at top. The system is base-20 positional.'
    case 'Chinese Rod':
      return 'Chinese rod numerals alternate orientation: vertical rods for ones/hundreds/ten-thousands, horizontal rods for tens/thousands. Single rods are simple lines; 6–9 add a crossing rod.'
    case 'Chinese Traditional':
      return 'Classical Chinese numerals use characters: 一(1) 二(2) 三(3) 四(4) 五(5) 六(6) 七(7) 八(8) 九(9) 十(10) 百(100) 千(1000) 萬(10000). Numbers are written largest-to-smallest; 零 marks a zero gap between non-zero groups.'
    case 'Glagolitic':
      return 'Glagolitic numerals use Glagolitic script letters additively, largest to smallest. The first 9 letters equal 1–9, the next 9 equal 10–90, the next 9 equal 100–900, and the next 9 equal 1000–9000.'
    case 'Old Church Slavonic':
      return 'Old Church Slavonic numerals use Cyrillic letters additively, largest to smallest. А=1 В=2 Г=3 Д=4 Є=5 Ѕ=6 З=7 И=8 Ѳ=9, then І=10 К=20…Ч=90, Р=100…Ц=900, and ҂ prefixes thousands (҂А=1000).'
    default:
      return 'Identify the numeral value shown in the image.'
  }
}

function buildPrompt(systemName: string): string {
  return `You are analyzing an image of a number written in the ${systemName} numeral system.

Your task: identify the Arabic integer this numeral represents.

${systemHint(systemName)}

Respond with ONLY one of:
- A single integer (e.g., "42") if you are confident
- The word "uncertain" if you cannot confidently identify the numeral

Do not explain. Do not add any other text.`
}

function parseResponse(rawText: string): { value: number | null; confidence: 'high' | 'low'; failureReason?: FailureReason } {
  const trimmed = rawText.trim()

  if (trimmed.toLowerCase() === 'uncertain') {
    return { value: null, confidence: 'low', failureReason: 'uncertain' }
  }

  const match = trimmed.match(/^-?\d+$/)
  if (match) {
    const n = parseInt(match[0], 10)
    if (n >= 0 && n <= 9_999_999) {
      return { value: n, confidence: 'high' }
    }
  }

  return { value: null, confidence: 'low', failureReason: 'parse-failed' }
}

export async function recognizeNumeral(
  imageBase64: string,
  mimeType: string,
  systemName: string,
): Promise<RecognitionResult> {
  const apiKey = (import.meta.env as Record<string, string | undefined>)['VITE_CLAUDE_API_KEY']
  if (!apiKey) {
    console.warn('VITE_CLAUDE_API_KEY is not configured')
    return { value: null, confidence: 'low', rawText: 'API key not configured', failureReason: 'no-key' }
  }

  let data: ClaudeResponse
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType,
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: buildPrompt(systemName),
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      console.error(`[vision] API error ${response.status}:`, body)
      return { value: null, confidence: 'low', rawText: body, failureReason: 'api-error' }
    }

    data = (await response.json()) as ClaudeResponse
  } catch (err) {
    console.error('[vision] Network error:', err)
    return { value: null, confidence: 'low', rawText: '', failureReason: 'network-error' }
  }

  const rawText = data.content[0]?.text ?? ''
  const { value, confidence, failureReason } = parseResponse(rawText)
  if (value === null) {
    console.warn(`[vision] Could not parse response for ${systemName}:`, JSON.stringify(rawText))
  }
  return { value, confidence, rawText, failureReason }
}
```

- [ ] **Step 2: Run test suite**

```
npx vitest run
```

Expected: all tests pass (vision-client has no unit tests currently — regressions come from integration tests).

- [ ] **Step 3: TypeScript check**

```
npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/vision/vision-client.ts
git commit -m "feat: add failureReason diagnostics to vision-client"
```

---

## Task 18: Vision diagnostics — PhotoPanel error messages

**Files:**
- Modify: `src/components/PhotoPanel.tsx`

- [ ] **Step 1: Update `src/components/PhotoPanel.tsx`**

Replace the file content with:

```tsx
import { useState } from 'react'
import { CONVERTERS } from '../converters/index'
import { recognizeNumeral } from '../vision/vision-client'
import type { FailureReason } from '../vision/vision-client'
import { VisionOverride } from './VisionOverride'

interface PhotoPanelProps {
  onResult: (n: number) => void
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function errorMessage(reason: FailureReason | undefined): string {
  switch (reason) {
    case 'no-key':      return 'API key not configured — add VITE_CLAUDE_API_KEY to .env.local'
    case 'api-error':   return 'API error — check the browser console for details'
    case 'uncertain':   return "Claude couldn't confidently read this image — try a clearer photo"
    case 'parse-failed':return 'Unexpected API response — check the browser console'
    case 'network-error': return 'Network error — check your connection'
    default:            return "Vision couldn't read the image — enter the value manually"
  }
}

export function PhotoPanel({ onResult }: PhotoPanelProps) {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [failureReason, setFailureReason] = useState<FailureReason | undefined>(undefined)
  const [showError, setShowError] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !selectedLabel) return

    setLoading(true)
    setShowError(false)
    setFailureReason(undefined)

    try {
      const base64 = await fileToBase64(file)
      const mimeType = file.type || 'image/jpeg'
      const result = await recognizeNumeral(base64, mimeType, selectedLabel)

      if (result.value !== null) {
        onResult(result.value)
        e.target.value = ''
      } else {
        setFailureReason(result.failureReason)
        setShowError(true)
      }
    } catch {
      setShowError(true)
    } finally {
      setLoading(false)
    }
  }

  if (showError) {
    return (
      <div className="photo-panel">
        <p className="vision-override-message">{errorMessage(failureReason)}</p>
        <VisionOverride
          onResult={n => {
            setShowError(false)
            setFailureReason(undefined)
            onResult(n)
          }}
        />
      </div>
    )
  }

  return (
    <div className="photo-panel">
      <label className="input-label" htmlFor="system-select">SELECT SYSTEM</label>
      <select
        id="system-select"
        className="system-select"
        value={selectedLabel ?? ''}
        onChange={e => setSelectedLabel(e.target.value || null)}
        disabled={loading}
      >
        <option value="">Choose a system...</option>
        {CONVERTERS.map(c => (
          <option key={c.id} value={c.label}>{c.label}</option>
        ))}
      </select>

      <label
        className="input-label"
        htmlFor="photo-input"
        style={{ marginTop: '12px' }}
      >
        UPLOAD PHOTO
      </label>
      <input
        id="photo-input"
        type="file"
        accept="image/*"
        className="photo-input"
        disabled={!selectedLabel || loading}
        onChange={handleFile}
      />

      {loading && (
        <div className="loading-spinner-wrap">
          <div className="loading-spinner" />
          <span className="loading-text">Reading numeral...</span>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Run full test suite**

```
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 3: TypeScript check**

```
npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 4: Final commit**

```bash
git add src/components/PhotoPanel.tsx
git commit -m "feat: show specific vision failure reason in PhotoPanel"
```

---

## Final verification

- [ ] **Run full test suite one last time**

```
npx vitest run
```

Expected: all tests pass (should be 435 + ~70 new explain tests + 6 renderer tests ≈ 511+).

- [ ] **TypeScript clean**

```
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Smoke test the UI**

```
npm run dev
```

Verify manually:
1. Type 1492 — all 10 tiles render (OCS tile shows "Loading font…" briefly if font is loading, then Cyrillic letters)
2. Click any tile — modal opens with Numeral / Breakdown tabs
3. Click Breakdown — table shows symbol + value rows, total at bottom
4. Click Chinese Rod tile — SVG renders vertical/horizontal rod lines (no boxes)
5. Upload a photo in Photo mode — specific error message shown if it fails (not generic)
6. Breakdown tab is greyed out when value = 0
