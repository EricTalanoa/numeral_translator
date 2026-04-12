1 q1# Architecture

## Overview

A single-page React + Vite application. Users type an Arabic integer (1–3,999) or photograph a number written in an ancient system. The app converts and displays the value in all seven supported numeral systems simultaneously.

**The central constraint: all conversion flows through a plain Arabic integer.** No converter ever calls another. Every system exports only `toArabic` and `fromArabic`. See [[Converter Interface]].

---

## Data Flow

```
[User types integer]
        |
        v
  [InputPanel validates 1–3999]
        |
        v
  [Fan-out: call fromArabic(n) on all 7 converters]
        |
        v
  [OutputGrid renders 7 NumeralTiles]


[User uploads photo]
        |
        v
  [PhotoPanel: user selects system, then uploads image]
        |
        v
  [vision-client.ts: send image + system hint to Claude API]
        |
        v
  [Claude returns Arabic integer (or uncertainty)]
        |
        v
  [If confident: populate input field, fan-out as above]
  [If uncertain: show VisionOverride for manual entry]
```

---

## Accepted Input Range

**1 to 3,999 (inclusive).**

Roman numerals (standard notation) cap at 3,999. All other systems can go higher, but Roman is the binding constraint. See [[Design Decisions#DD-001]].

Zero is accepted as input: Mayan displays its shell glyph; all other systems display "No representation". See [[Design Decisions#DD-002]].

Fractions are rejected by validation before any converter is called. See [[Design Decisions#DD-003]].

---

## Directory Structure

```
numeral-translator/
├── public/
│   └── fonts/
│       └── NotoSansEgyptianHieroglyphs-Regular.ttf   ← self-hosted
├── src/
│   ├── converters/
│   │   ├── index.ts          ← CONVERTERS registry array
│   │   ├── egyptian.ts
│   │   ├── ionian.ts
│   │   ├── attic.ts
│   │   ├── babylonian.ts
│   │   ├── roman.ts
│   │   ├── mayan.ts
│   │   └── chinese-rod.ts
│   ├── renderers/
│   │   ├── MayanSvg.tsx      ← SVG renderer: dots, bars, shell
│   │   └── BabylonianSvg.tsx ← SVG renderer: vertical and corner wedges
│   ├── vision/
│   │   └── vision-client.ts  ← Claude API call, returns number | null
│   ├── components/
│   │   ├── App.tsx
│   │   ├── InputPanel.tsx    ← text input, mode toggle
│   │   ├── PhotoPanel.tsx    ← upload, system selector, loading state
│   │   ├── OutputGrid.tsx    ← fan-out, 7 tiles
│   │   ├── NumeralTile.tsx   ← single system output
│   │   └── VisionOverride.tsx ← manual entry on Vision failure
│   ├── styles/
│   │   └── main.css
│   └── main.tsx
├── tests/
│   ├── converters/
│   │   ├── egyptian.test.ts
│   │   ├── ionian.test.ts
│   │   ├── attic.test.ts
│   │   ├── babylonian.test.ts
│   │   ├── roman.test.ts
│   │   ├── mayan.test.ts
│   │   └── chinese-rod.test.ts
│   └── renderers/
│       ├── MayanSvg.test.tsx
│       └── BabylonianSvg.test.tsx
├── .env.local              ← NEVER COMMITTED (gitignored)
├── .env.local.example      ← committed, placeholder value only
├── .gitignore
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Components

### App.tsx
Root component. Holds `currentValue: number | null` state. Passes it to `OutputGrid`. Renders `InputPanel` and `PhotoPanel` based on mode toggle.

### InputPanel
- Text field: accepts digits, validates range [0, 3999] on change
- Mode toggle: "Type" vs "Photo"
- On valid input: sets `currentValue` in App

### PhotoPanel
- System selector dropdown (required before upload enabled)
- File input (`accept="image/*"`)
- Calls `vision-client.ts` with image + selected system name
- Loading spinner while awaiting API response
- On success: calls `onResult(arabicInt)` to set `currentValue`
- On failure: renders `<VisionOverride>`

### OutputGrid
- Receives `value: number | null`
- Maps over `CONVERTERS` registry
- Calls `fromArabic(value)` on each
- Renders `<NumeralTile>` per system
- Shows empty/placeholder state when `value === null`

### NumeralTile
- Props: `system` (converter metadata), `output: string`, `renderMode: 'unicode' | 'svg'`
- For Mayan: renders `<MayanSvg digits={...} />`
- For Babylonian: renders `<BabylonianSvg groups={...} />`
- For others: renders `<span className={system.id}>{output}</span>`
- Maps `"∅"` to a styled "No representation" display
- Shows font loading placeholder for Egyptian until `document.fonts.ready` resolves

### VisionOverride
- Appears after Vision failure
- Text input for manual Arabic integer entry
- Submit sets `currentValue` and clears the error state

---

## Font Loading

Egyptian Hieroglyphics (U+13000–U+1342F) require **Noto Sans Egyptian Hieroglyphs**. Chinese Rod (U+1D360–U+1D371) needs a font with that block (Noto Sans or system).

Strategy:
1. Self-host `NotoSansEgyptianHieroglyphs-Regular.ttf` in `public/fonts/`
2. Declare `@font-face` in `main.css`
3. In `NumeralTile` for Egyptian: check `document.fonts.check('1em NotoSansEgyptianHieroglyphs')` and show a "Loading font…" placeholder until true
4. Use `document.fonts.load(...)` on mount to trigger the font load proactively

See [[Rendering Strategy]] for per-system font details.

---

## Vision Integration

See [[Vision API Notes]] for full prompt engineering details.

- Model: `claude-sonnet-4-6`
- Image: base64-encoded, sent in the `image_url` content block
- System name is passed as context in the prompt
- Response parsing: extract the first integer from Claude's response text
- Failure: if no integer found, treat as failure and show `<VisionOverride>`
- API key: `import.meta.env.VITE_CLAUDE_API_KEY` — only accessed in `vision-client.ts`

---

## Security

See [[Design Decisions#DD-007]].

- `.env.local` is gitignored (Vite default — verify `.gitignore` contains `.env.local`)
- `.env.local.example` is committed with value `VITE_CLAUDE_API_KEY=your_key_here`
- API key is only referenced in `src/vision/vision-client.ts`
- No backend; API key is visible in browser network traffic (acceptable for personal local use)

---

## Testing

Framework: **Vitest**

- Converter tests: pure unit tests per file in `tests/converters/`
- Renderer tests: snapshot tests for `MayanSvg` and `BabylonianSvg`
- No Vision integration tests (requires live API key); covered by manual checklist in [[Bugs and Fixes]]
- Run: `npx vitest`

---

## Tech Stack Summary

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite |
| Language | TypeScript |
| Styling | Plain CSS (no framework) |
| Vision AI | Claude API (`claude-sonnet-4-6`) |
| Testing | Vitest |
| Fonts | Noto Sans Egyptian Hieroglyphs (self-hosted) |
| Deployment | Local only (personal use); see security note |
