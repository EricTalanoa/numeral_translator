# Design: OCS Converter, Chinese Rod SVG, Phase 4 Breakdown, Phase 5 Vision Fix
*Date: 2026-04-15*

## Overview

Four independent work streams built on top of Phase 3 (435 tests, 9 systems):

| Stream | Phase | New files | Extends |
|---|---|---|---|
| Old Church Slavonic converter | new system | `src/converters/old-church-slavonic.ts` + font | `CONVERTERS` registry |
| Chinese Rod SVG renderer | fix | `src/renderers/ChineseRodSvg.tsx` | `NumeralTile` dispatch |
| Breakdown panel | Phase 4 | `explain(n)` on all 10 converters, `NumeralTile` modal tabs | `Converter` interface |
| Vision diagnostics & fix | Phase 5 | `failureReason` type, `PhotoPanel` messages | `vision-client.ts` |

**Updated phase numbering:**
- Phase 4 — Breakdown / explanation panel (this doc)
- Phase 5 — Vision / photo mode fix (this doc)
- Phase 6 — Quiz mode (previously Phase 4)
- Phase 7 — Per-language history pages (previously Phase 5)

**Dependency:** OCS `explain(n)` must be implemented before the Breakdown feature is complete (all 10 converters need `explain`). Chinese Rod SVG and Vision are fully independent of each other and of the above.

---

## Stream 1 — Old Church Slavonic Converter

### Character map

| Tier | Letters → values |
|---|---|
| Units 1–9 | А=1 В=2 Г=3 Д=4 Є=5 Ѕ=6 З=7 И=8 Ѳ=9 |
| Tens 10–90 | І=10 К=20 Л=30 М=40 Н=50 Ѯ=60 О=70 П=80 Ч=90 |
| Hundreds 100–900 | Р=100 С=200 Т=300 У=400 Ф=500 Х=600 Ѱ=700 Ѿ=800 Ц=900 |
| Thousands 1000–9000 | ҂А=1000 ҂В=2000 … ҂Ѳ=9000 |

**Note on ҂ (U+0482):** The titlo combining mark was omitted (project context makes it clear all output is numeric). The thousands prefix ҂ is kept because it is structurally required to disambiguate А=1 from А=1000 — it is part of the encoding, not a disambiguation decoration.

### Spec

- **File:** `src/converters/old-church-slavonic.ts`
- **id:** `oldChurchSlavonic` · **label:** `Old Church Slavonic` · **maxValue:** 9999
- **fromArabic:** Largest-to-smallest concatenation (thousands → hundreds → tens → units). Zero returns `"∅"`.
- **toArabic:** Map lookup, summing values. ҂ followed by a unit letter = that letter's value × 1000.
- **Throws:** non-integer, n < 0, n > 9999, fractions, unrecognised character.
- **Tests:** ~24 tests — spot-checks per tier, edge cases at 999/1000/9999, zero, fractions, out-of-range.

### Font

Several archaic characters (Ѳ U+0472, Ѯ U+046E, Ѱ U+0470, Ѿ U+047E, ҂ U+0482) are not present in common system fonts and will render as boxes without a Church Slavonic font.

- **Font:** Ponomar Unicode (free, open-source, from the Ponomar Project at ponomar.net). Covers the full archaic Cyrillic range required.
- **Setup:** Same pattern as Egyptian — download `.ttf`, place at `public/fonts/PonomarUnicode.ttf`, declare `@font-face` in `main.css`, add font-loading gate in `NumeralTile` for `system.id === 'oldChurchSlavonic'`.
- **Fallback:** If font not loaded, common Cyrillic letters still render correctly; only the five archaic characters show as boxes. The font-loading gate shows "Loading font…" until ready, then renders.

### Registry entry

```ts
{ id: 'oldChurchSlavonic', label: 'Old Church Slavonic', maxValue: 9_999, ...oldChurchSlavonic }
```

---

## Stream 2 — Chinese Rod SVG Renderer

### Problem

The converter output (U+1D360–U+1D371, U+3007) is correct but the Counting Rod Numerals Unicode block has near-zero font coverage. Browsers render the characters as boxes.

### Solution

New `ChineseRodSvg.tsx` component — same pattern as `BabylonianSvg` and `MayanSvg`.

- **Props:** `encoded: string` · `scale?: number` (default 1)
- **Cell size:** 48 × 80 px at scale 1
- **Layout:** One SVG `<g>` cell per codepoint, laid out horizontally

### Cell rendering rules

| Codepoint range | Type | Rule |
|---|---|---|
| U+1D360–U+1D364 (vert 1–5) | Vertical | n evenly-spaced vertical lines, full cell height |
| U+1D365–U+1D368 (vert 6–9) | Vertical | 1 horizontal crossbar near top + (n−5) vertical lines below |
| U+1D369–U+1D36D (horiz 1–5) | Horizontal | n evenly-spaced horizontal lines |
| U+1D36E–U+1D371 (horiz 6–9) | Horizontal | 1 vertical crossbar at top + (n−5) horizontal lines below |
| U+3007 〇 | Zero | Small open circle, same cell width |

**Colors:** Vertical rods `#e0e0e0` (white), Horizontal rods `#f0c060` (gold). These differentiate the two rod types visually and match the project's dark tile background.

### NumeralTile change

Add `chineseRod` to the SVG dispatch block:

```tsx
if (system.id === 'chineseRod') {
  return <ChineseRodSvg encoded={output} scale={scale} />
}
```

Remove the existing unicode `<span>` path for `chineseRod` (it falls through to the generic span today).

### Tests

Snapshot/render tests for representative values: 1, 5, 6, 9, 42, 1492, a value with a zero placeholder (e.g. 101).

---

## Stream 3 — Phase 4: Breakdown Panel

### Data interface

Extend `Converter` interface:

```ts
export interface BreakdownToken {
  display: string   // glyph(s) for text systems; plain-text description for SVG systems
  value: number     // numeric contribution of this token
}

export interface Converter {
  id: string
  label: string
  maxValue: number
  toArabic: (input: string) => number
  fromArabic: (n: number) => string
  explain: (n: number) => BreakdownToken[]
}
```

### explain(n) contract

- Returns an array of tokens ordered largest-to-smallest by value
- Each token's `value` is the numeric contribution (e.g. CD = 400, not 500−100)
- For zero: returns `[]`
- For out-of-range or non-integer: throws (same as `fromArabic`)
- Sum of all token values === n

### Token examples by system

| System | n=42 | n=1492 (sample) |
|---|---|---|
| Roman | `[{XL,40},{II,2}]` | `[{M,1000},{CD,400},{XC,90},{II,2}]` |
| Egyptian | `[{𓎆𓎆𓎆𓎆,40},{𓏻𓏻,2}]` | symbol groups per tier |
| Glagolitic | `[{ⰿ,40},{ⰲ,2}]` | letter per tier |
| OCS | `[{М,40},{В,2}]` | letter per tier |
| Ionian | letter per tier | letter per tier |
| Attic | glyph per tier | glyph per tier |
| Chinese Trad. | character groups | character groups |
| Chinese Rod | `[{"horiz-4 (×10)",40},{"vert-2 (×1)",2}]` | positional digit descriptions |
| Babylonian | `[{"4 × ten-wedge",40},{"2 × unit-wedge",2}]` | base-60 group descriptions |
| Mayan | `[{"2 dots + 0 bars (ones)",2},{"2 bars (twenties × 20)",40}]` | vigesimal digit descriptions |

SVG systems (Mayan, Babylonian, Chinese Rod) use plain-text descriptions because their symbols require a renderer — no mini SVGs in the breakdown table.

### UI changes — NumeralTile

Add `view: 'numeral' | 'breakdown'` state (default `'numeral'`). Modal header gets two tab buttons. Tab state resets to `'numeral'` when the modal closes.

**Numeral tab:** unchanged from current behaviour.

**Breakdown tab:**
- Disabled (grayed out, non-clickable) when `value === null`, out-of-range, or zero
- Renders a table: `display` column (left) + value column (right, green `#7cc87c`)
- Total row at bottom (blue `#5c8db0`, bold)
- No new component file — all lives in `NumeralTile.tsx`

### Tests

Each converter's `explain`: ~5 unit tests — simple value, multi-tier value, zero (returns `[]`), out-of-range (throws), sum-equals-n assertion.

---

## Stream 4 — Phase 5: Vision Diagnostics & Fix

### Problem

The photo mode spins briefly then shows a generic error. The current code returns `value: null` in multiple failure paths with no logging or discrimination between failure types.

### Step 1 — Diagnostic types

Extend `RecognitionResult`:

```ts
export interface RecognitionResult {
  value: number | null
  confidence: 'high' | 'low'
  rawText: string
  failureReason?: 'no-key' | 'network-error' | 'api-error' | 'uncertain' | 'parse-failed'
}
```

Each failure path in `vision-client.ts` sets the appropriate reason. Add `console.error` with HTTP status and raw response text on any non-OK response.

### Step 2 — PhotoPanel messaging

Replace generic error message with reason-specific text:

| failureReason | Message |
|---|---|
| `no-key` | "API key not configured — add VITE_CLAUDE_API_KEY to .env.local" |
| `api-error` | "API error — check the browser console for details" |
| `uncertain` | "Claude couldn't confidently read this image — try a clearer photo" |
| `parse-failed` | "Unexpected API response — check the browser console" |
| `network-error` | "Network error — check your connection" |

### Step 3 — Fix root cause

After diagnostics reveal the actual failure mode, apply the targeted fix:

- **401 / invalid key:** Surface clearly in UI — user needs to check `.env.local`
- **`uncertain` too often:** Improve per-system vision prompts in `systemHint()`
- **CORS / header issue:** Adjust fetch config

**Definition of done:** A photo of a handwritten or printed numeral in a known system returns the correct Arabic value end-to-end.

---

## What is NOT in scope

- Quiz mode — Phase 6
- Per-language history pages — Phase 7
- Fraction support
- Any new converter beyond OCS
