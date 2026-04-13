# Phase 2 UI — Design Spec
**Date:** 2026-04-12  
**Status:** Approved

---

## Overview

Phase 2 builds the complete UI layer for the Numeral Translator. Phase 1 (all 7 converters, 2 SVG renderers, vision client) is complete with 225 passing tests. This spec covers the React component tree, visual design system, component behaviour, and CSS structure.

---

## Visual Design

**Style:** Dark & Scholarly — dark background with gold accents and serif display type. Feels like a museum exhibit or ancient manuscript.

**CSS custom properties (defined in `src/styles/main.css`):**

```css
--bg-base:      #1a1a2e   /* page background */
--bg-card:      #2a2a4a   /* tile / panel background */
--gold:         #c9a84c   /* primary accent, headings, active state */
--gold-dim:     #c9a84c44 /* borders, inactive elements */
--text-main:    #e8e0cc   /* body text */
--text-muted:   #888888   /* labels, system names */
--radius:       6px
--font-ui:      system-ui, sans-serif
--font-display: Georgia, 'Times New Roman', serif
```

---

## Layout

**Page structure:** CSS grid with a fixed sidebar and a fluid tile area.

```
[ Sidebar 240px ] [ OutputGrid 1fr ]
```

- Sidebar contains `ControlPanel` (tab bar + active input panel)
- Tile area contains `OutputGrid` with `grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))`
- 7 tiles reflow naturally at any viewport width
- Sidebar scrolls independently if content overflows

---

## Component Tree

```
App
├── state: value: number | null   ← only state App owns
│
├── ControlPanel   (owns: mode: 'type' | 'photo')
│   ├── [tab bar: "✎ Type" | "📷 Photo"]
│   ├── InputPanel   (rendered when mode === 'type')
│   └── PhotoPanel   (rendered when mode === 'photo')
│       └── VisionOverride   (rendered on vision failure)
│
└── OutputGrid   (receives value: number | null)
    └── NumeralTile × 7
```

---

## Component Specs

### `App.tsx`
- State: `value: number | null`, initialised to `null`
- Renders `<ControlPanel onResult={setValue} />` and `<OutputGrid value={value} />`
- No other logic

### `ControlPanel.tsx`
- State: `mode: 'type' | 'photo'`, initialised to `'type'`
- Renders a two-tab bar (underline style, gold on active)
- Conditionally renders `<InputPanel>` or `<PhotoPanel>` based on mode
- Passes `onResult` through to whichever panel is active
- ~25 lines

### `InputPanel.tsx`
- Props: `onResult: (n: number) => void`
- Controlled `<input type="text">` (not `type="number"` — avoids browser spinner arrows)
- On change: strip non-digits → parse int → if 0–3999 call `onResult(n)`, else show inline error
- Inline error message below field: "Range: 0–3999"
- Translation fires live on valid input — no submit button needed
- Clearing the field back to empty: call `onResult` is not triggered; parent value stays at last valid (tiles don't reset). Empty string → local error cleared, value unchanged.

  > **Note:** Resetting to null when the field is cleared is a UX decision left to implementation — either keep the last value or reset. Default: keep last valid value until a new valid one is typed.

### `PhotoPanel.tsx`
- Props: `onResult: (n: number) => void`
- State: `selectedLabel: string | null`, `loading: boolean`, `error: boolean`
- `<select>` populated from `CONVERTERS` registry (`system.label` as option text and value — matches strings expected by `recognizeNumeral`)
- `<input type="file" accept="image/*">` — disabled until `selectedLabel !== null`
- On file select:
  1. Set `loading = true`
  2. Read file as base64 string and extract `mimeType` from `file.type` (e.g. `"image/jpeg"`)
  3. Call `recognizeNumeral(base64, mimeType, selectedLabel)` from `vision-client.ts`
  4. On success (`result.value !== null`): call `onResult(result.value)`, reset panel
  5. On failure (`result.value === null`): set `error = true`, `loading = false`
- `recognizeNumeral` already handles missing API key internally (returns `value: null`) — no separate check needed in `PhotoPanel`
- Loading state: disables selector + file input, shows gold spinner animation
- Error state: hides upload UI, renders `<VisionOverride onResult={onResult} />`

### `VisionOverride.tsx`
- Props: `onResult: (n: number) => void`
- Renders: explanatory message + text input + "Use this number" button
- Message: "Vision couldn't read the image — enter the value manually"
- Same 0–3999 validation as InputPanel
- On submit: calls `onResult(n)`

### `OutputGrid.tsx`
- Props: `value: number | null`
- Maps over `CONVERTERS` registry, renders `<NumeralTile system={converter} value={value} />` for each

### `NumeralTile.tsx`
- Props: `system: Converter`, `value: number | null`
- Calls `system.fromArabic(value)` internally when `value !== null`
- Render cases (checked in this order):
  1. `value === null` → dim `—` placeholder
  2. `system.id === 'mayan'` → `<MayanSvg encoded={output} />` (handles `'shell'` zero case internally)
  3. `system.id === 'babylonian'` → `<BabylonianSvg encoded={output} />` (handles `'∅'` zero case internally)
  4. `output === '∅'` → "No representation" in `--text-muted` italics
  5. default → `<span className={system.id}>{output}</span>`
- Egyptian font gate: on mount, call `document.fonts.load('1em NotoSansEgyptianHieroglyphs')`. Until `document.fonts.check(...)` returns true, render "Loading…" placeholder instead of the glyph string.
- Hover state: `border-color` transitions to `--gold`, subtle box-shadow glow

**Tile anatomy:**
```
┌──────────────────────────┐
│  ROMAN                   │  ← system.label, --text-muted, small-caps, 10px
│                          │
│    XLII                  │  ← output, --gold, --font-display, 28px+
│                          │
└──────────────────────────┘
border: 1px solid --gold-dim
padding: 16px
border-radius: --radius
```

---

## Data Flow

### Type mode
```
User types → InputPanel validates → onResult(n) → App.value → OutputGrid → NumeralTile × 7
```

### Photo mode
```
User selects system → enables file input
User uploads image → PhotoPanel reads as base64
→ recognizeNumeral(base64, system) → vision-client.ts → Claude API
→ success: onResult(n) → App.value → OutputGrid → NumeralTile × 7
→ failure: VisionOverride → onResult(n) → same fan-out
```

---

## Edge Cases

| Input | Expected behaviour |
|---|---|
| `value = 0` | Mayan shows shell glyph; 6 others show "No representation" |
| `value = 3999` | All 7 converters produce valid output |
| Field cleared to empty | Tiles keep last valid value (no reset to null) |
| Out-of-range input (e.g. 4000) | Inline error shown; `onResult` not called |
| Fraction input (e.g. "3.5") | Non-digit stripping removes the dot; treats as "35" |
| Vision returns null | PhotoPanel shows VisionOverride |
| API key missing | `recognizeNumeral` returns `value: null` → PhotoPanel shows VisionOverride |
| Egyptian font not loaded | NumeralTile shows "Loading…" until font ready |

---

## CSS File Structure (`src/styles/main.css`)

1. Custom properties
2. Reset / base styles
3. `@font-face` — NotoSansEgyptianHieroglyphs
4. Page layout (sidebar + grid shell)
5. ControlPanel tabs
6. InputPanel
7. PhotoPanel + loading spinner
8. VisionOverride
9. OutputGrid
10. NumeralTile (default, `∅`, font-loading, hover)
11. System-specific font rules (`.egyptian`, `.chineseRod`)

---

## Files to Create

All new files — no existing files modified except `src/main.tsx` (add CSS import) and `src/App.tsx` (replace stub):

| File | Size estimate |
|---|---|
| `src/components/App.tsx` | ~20 lines |
| `src/components/ControlPanel.tsx` | ~30 lines |
| `src/components/InputPanel.tsx` | ~40 lines |
| `src/components/PhotoPanel.tsx` | ~70 lines |
| `src/components/VisionOverride.tsx` | ~35 lines |
| `src/components/OutputGrid.tsx` | ~20 lines |
| `src/components/NumeralTile.tsx` | ~60 lines |
| `src/styles/main.css` | ~150 lines |

---

## Definition of Done

- `npm run dev` shows a working UI in the browser
- All 7 system tiles render correctly for smoke test values: 0, 1, 9, 42, 100, 1000, 3999
- Photo flow shows loading state → success state → error+override state (manual test)
- Egyptian font loading placeholder visible briefly on first load
- `npm run test` still passes (225 tests, all green)
- `npx tsc --noEmit` clean
