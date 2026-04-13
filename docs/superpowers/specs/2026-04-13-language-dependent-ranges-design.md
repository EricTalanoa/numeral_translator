# Language-Dependent Ranges Design

**Date:** 2026-04-13
**Status:** Approved — ready for implementation planning

---

## Goal

Each numeral system displays only values within its own historical/natural range. Values outside a system's range show a clear "out of range" indicator rather than an error. A range reference panel lets users see all system limits at a glance.

---

## Data Model

### Converter interface change

Add `maxValue: number` to the existing `Converter` interface in `src/converters/index.ts`.

```ts
export interface Converter {
  id: string
  label: string
  maxValue: number          // ← new field
  fromArabic: (n: number) => string
  toArabic: (s: string) => number
}
```

### Registry values

| System | id | maxValue |
|--------|----|----------|
| Roman | roman | 3,999 |
| Attic Greek | attic | 9,999 |
| Ionian Greek | ionian | 9,999 |
| Egyptian | egyptian | 9,999,999 |
| Babylonian | babylonian | 999,999 |
| Mayan | mayan | 999,999 |
| Chinese Rod | chineseRod | 999,999 |

---

## Input Field

`parseInputValue` in `InputPanel.tsx`:
- Upper cap raised from 3,999 to 9,999,999
- Error message changes from `"Range: 0–3999"` to `"Max: 9,999,999"`
- Lower bound (0) unchanged

---

## Tile Out-of-Range State

### NumeralTile preflight check

Before calling `system.fromArabic(value)`, check:

```ts
if (value > system.maxValue) → render out-of-range state
```

No `fromArabic` call is made for out-of-range values.

### Normal tile

Renders the same muted italic style as "No representation":
```
out of range
```

Tile remains fully visible and clickable (same hover/expand behavior).

### Expanded modal (on click)

Top line: `Out of range`
Second line: `Valid range: 0 – X,XXX,XXX` (number formatted with commas)

System name appears at the top of the modal as usual.

---

## Range Reference Panel

A small `ⓘ` icon button sits inline with the "Numeral Translator" title in the sidebar.

Clicking opens a modal overlay (same visual style as tile expand modal) containing:

```
SYSTEM            RANGE
─────────────────────────
Roman             0 – 3,999
Attic Greek       0 – 9,999
Ionian Greek      0 – 9,999
Egyptian          0 – 9,999,999
Babylonian        0 – 999,999
Mayan             0 – 999,999
Chinese Rod       0 – 999,999
```

Built by mapping over `CONVERTERS` and reading `system.label` + `system.maxValue` — no hardcoded values. Closes on `Esc` or click outside.

---

## Converter Changes

### Egyptian (`src/converters/egyptian.ts`)

Prepend three entries to the `SYMBOLS` table (greedy algorithm handles any symbol set, no logic change):

| Value | Gardiner | Description |
|-------|----------|-------------|
| 1,000,000 | C11 | Heh god (kneeling man with arms raised) |
| 100,000 | I8 | Tadpole |
| 10,000 | D50 | Finger |

Codepoints verified during implementation from the Noto Sans Egyptian Hieroglyphs block (U+13000–U+1342F).

Range guard: `n > 3999` → `n > 9_999_999`

### Ionian Greek (`src/converters/ionian.ts`)

Extend `THOUSANDS` from 4 entries (0–3) to 10 entries (0–9):

```ts
// Before
const THOUSANDS = ['', '͵α', '͵β', '͵γ']

// After
const THOUSANDS = ['', '͵α', '͵β', '͵γ', '͵δ', '͵ε', '͵ϛ', '͵ζ', '͵η', '͵θ']
```

`fromArabic` logic unchanged — already uses `Math.floor(n / 1000)` as index.

Range guard: `n > 3999` → `n > 9999`

### All other converters

Range guard updated to match each system's `maxValue`:

| Converter | New guard |
|-----------|-----------|
| roman.ts | `n > 3999` — unchanged |
| attic.ts | `n > 9999` |
| babylonian.ts | `n > 999_999` |
| mayan.ts | `n > 999_999` |
| chinese-rod.ts | `n > 999_999` |

---

## Egyptian Font Size

In `src/styles/main.css`, `.egyptian` rule:

```css
/* Before */
font-size: 24px;

/* After */
font-size: 28px;
```

---

## CSS Additions

### Out-of-range tile label

Reuses existing `.tile-no-rep` style (muted italic). No new CSS class needed.

### Range reference modal

New component `RangeModal.tsx`. Shares `.tile-modal-overlay` and `.tile-modal-card` styles from the tile expand modal. Additional styles needed for the table layout inside the card.

---

## New Component

### `RangeModal.tsx`

```
Props: { onClose: () => void }
```

Maps over `CONVERTERS`, renders a two-column table of label + formatted maxValue range. Closes on overlay click or `Esc`.

---

## Files Changed

| File | Change |
|------|--------|
| `src/converters/index.ts` | Add `maxValue` to `Converter` interface; add field to each registry entry |
| `src/converters/egyptian.ts` | Add 3 higher symbols; update range guard |
| `src/converters/ionian.ts` | Extend THOUSANDS; update range guard |
| `src/converters/attic.ts` | Update range guard |
| `src/converters/babylonian.ts` | Update range guard |
| `src/converters/mayan.ts` | Update range guard |
| `src/converters/chinese-rod.ts` | Update range guard |
| `src/components/NumeralTile.tsx` | Add preflight check; update modal out-of-range display |
| `src/components/App.tsx` | Pass `ⓘ` button handler; render `RangeModal` |
| `src/components/RangeModal.tsx` | New component |
| `src/styles/main.css` | Increase Egyptian font size; add range modal table styles |
| `src/components/InputPanel.tsx` | Raise input cap to 9,999,999; update error message |
| `tests/converters/egyptian.test.ts` | Add tests for 10,000 / 100,000 / 1,000,000 |
| `tests/converters/ionian.test.ts` | Add tests for 4,000–9,999 |

---

## Definition of Done

- `npm test` passes (all existing tests + new converter tests)
- `npx tsc --noEmit` clean
- Typing 5,000: Roman tile shows "out of range", all others show values
- Typing 10,000: Roman + Attic + Ionian tiles show "out of range"
- Typing 1,000,000: Egyptian tile shows Heh god glyph; Roman/Attic/Ionian/Babylonian/Mayan/ChineseRod show "out of range"
- Clicking an out-of-range tile shows modal with range info
- `ⓘ` button opens range reference panel with all 7 systems listed
- Egyptian hieroglyphs render slightly larger than before
