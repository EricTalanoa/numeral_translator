# Agent Map

Multi-agent execution plan for Claude Code. Defines who owns what, spawn order, and handoff conditions.

---

## Spawn Order

```
PHASE 0 — Interface Lock (main session, before spawning anything)
  |
  |-- Lock: Converter Interface (toArabic/fromArabic contract)
  |-- Lock: Directory structure
  |-- Lock: CONVERTERS registry shape
  |-- Create: package.json, vite.config.ts, tsconfig.json, .gitignore
  |-- Create: src/converters/index.ts (registry, stub exports)
  |-- Create: .env.local.example
  |
  v
PHASE 1 — Parallel spawn (all independent, no waiting on each other)
  |
  |-- [Converter:Egyptian]  |
  |-- [Converter:Ionian]    |
  |-- [Converter:Attic]     |-- all 7 run simultaneously
  |-- [Converter:Babylonian]|
  |-- [Converter:Roman]     |
  |-- [Converter:Mayan]     |
  |-- [Converter:ChineseRod]|
  |
  |-- [Renderer]             ← also runs in Phase 1, independent of converters
  |
  |-- [Vision]               ← also runs in Phase 1, independent of converters
  |
  v
PHASE 2 — UI Agent (blocked until all Phase 1 agents complete)
  |
  |-- Requires: all converter files passing tests
  |-- Requires: renderer components ready
  |-- Requires: vision-client.ts ready
  |
  v
PHASE 3 — QA Agent (blocked until UI complete)
  |
  |-- Cross-system integration tests
  |-- Edge case validation
  |-- Manual Vision test checklist
```

---

## Agent Definitions

### Phase 0 — Interface Lock (main session)

**Owner:** Main Claude Code session (not a spawned agent)
**Scope:** Project scaffolding and interface locking only. No converter logic.
**Produces:**
- `package.json` with React, Vite, Vitest, TypeScript dependencies
- `vite.config.ts`, `tsconfig.json`, `.gitignore`, `.env.local.example`
- `src/converters/index.ts` — CONVERTERS registry (stub; agents fill in implementations)
- Empty stub files for all converters (so agents have targets to fill)
- Vitest configuration

**Must NOT:** Write any converter logic, any UI components, any Vision code.

---

### Converter:Egyptian

**Owner:** Spawned agent
**Scope:** `src/converters/egyptian.ts` and `tests/converters/egyptian.test.ts` only.
**Inputs:** This note ([[Agent Map]]), [[Converter Interface]], [[Egyptian Hieroglyphic]]
**Outputs:** `toArabic` and `fromArabic` implementations + passing Vitest tests
**Dependencies:** Phase 0 complete (stub file exists, interface locked)
**Must NOT touch:** Any other converter, any renderer, any UI component, vision-client.ts

---

### Converter:Ionian

**Owner:** Spawned agent
**Scope:** `src/converters/ionian.ts` and `tests/converters/ionian.test.ts` only.
**Inputs:** [[Agent Map]], [[Converter Interface]], [[Ionian Greek]]
**Outputs:** `toArabic` and `fromArabic` + passing tests
**Dependencies:** Phase 0 complete
**Must NOT touch:** Anything outside its two files

---

### Converter:Attic

**Owner:** Spawned agent
**Scope:** `src/converters/attic.ts` and `tests/converters/attic.test.ts` only.
**Inputs:** [[Agent Map]], [[Converter Interface]], [[Attic Greek]]
**Outputs:** `toArabic` and `fromArabic` + passing tests
**Dependencies:** Phase 0 complete
**Must NOT touch:** Anything outside its two files

---

### Converter:Babylonian

**Owner:** Spawned agent
**Scope:** `src/converters/babylonian.ts` and `tests/converters/babylonian.test.ts` only.
**Inputs:** [[Agent Map]], [[Converter Interface]], [[Babylonian]]
**Outputs:** `toArabic` and `fromArabic` + passing tests. Output strings represent groups numerically (e.g., `"1|6|39"` or the Unicode wedge characters) — the Renderer agent handles visual display.
**Dependencies:** Phase 0 complete
**Must NOT touch:** `src/renderers/BabylonianSvg.tsx` (that belongs to Renderer agent)

---

### Converter:Roman

**Owner:** Spawned agent
**Scope:** `src/converters/roman.ts` and `tests/converters/roman.test.ts` only.
**Inputs:** [[Agent Map]], [[Converter Interface]], [[Roman]]
**Outputs:** `toArabic` and `fromArabic` + passing tests
**Dependencies:** Phase 0 complete
**Must NOT touch:** Anything outside its two files

---

### Converter:Mayan

**Owner:** Spawned agent
**Scope:** `src/converters/mayan.ts` and `tests/converters/mayan.test.ts` only.
**Inputs:** [[Agent Map]], [[Converter Interface]], [[Mayan]], [[Rendering Strategy]]
**Outputs:** `toArabic` and `fromArabic` + passing tests. `fromArabic` returns a structured string encoding the vigesimal digits (e.g., `"9,19,19"` for 3999) — the Renderer agent handles visual display.
**Dependencies:** Phase 0 complete
**Handoff note:** The Renderer agent must know the output format of `fromArabic`. Format is: comma-separated vigesimal digits, highest place first. E.g., `fromArabic(3999)` → `"9,19,19"`, `fromArabic(20)` → `"1,0"`, `fromArabic(0)` → `"shell"`.
**Must NOT touch:** `src/renderers/MayanSvg.tsx`

---

### Converter:ChineseRod

**Owner:** Spawned agent
**Scope:** `src/converters/chinese-rod.ts` and `tests/converters/chinese-rod.test.ts` only.
**Inputs:** [[Agent Map]], [[Converter Interface]], [[Chinese Rod]]
**Outputs:** `toArabic` and `fromArabic` + passing tests
**Dependencies:** Phase 0 complete
**Must NOT touch:** Anything outside its two files

---

### Renderer

**Owner:** Spawned agent
**Scope:** `src/renderers/MayanSvg.tsx` and `src/renderers/BabylonianSvg.tsx` only.
**Inputs:** [[Agent Map]], [[Rendering Strategy]], [[Mayan]], [[Babylonian]]
**Outputs:** Two React components that render their respective numerals as inline SVG.

**MayanSvg interface:**
```ts
// Input: comma-separated vigesimal digits from mayan converter
// E.g., "9,19,19" for 3999, "shell" for 0
interface MayanSvgProps { encoded: string }
export function MayanSvg({ encoded }: MayanSvgProps): JSX.Element
```

**BabylonianSvg interface:**
```ts
// Input: pipe-separated sexagesimal groups from babylonian converter
// E.g., "1|6|39" for 3999
interface BabylonianSvgProps { encoded: string }
export function BabylonianSvg({ encoded }: BabylonianSvgProps): JSX.Element
```

**Dependencies:** Phase 0 complete; knows the output format of Mayan and Babylonian converters (documented above — no need to wait for those agents to finish)
**Must NOT touch:** Any converter file, vision-client.ts, UI components

---

### Vision

**Owner:** Spawned agent
**Scope:** `src/vision/vision-client.ts` only.
**Inputs:** [[Agent Map]], [[Vision API Notes]], [[Converter Interface]]
**Outputs:** A single exported async function:
```ts
export async function recognizeNumeral(
  imageBase64: string,
  mimeType: string,
  systemName: string
): Promise<{ value: number | null; confidence: 'high' | 'low'; rawText: string }>
```
**Dependencies:** Phase 0 complete (directory exists)
**Must NOT touch:** Any converter, any renderer, any UI component

---

### UI

**Owner:** Spawned agent
**Scope:** All files in `src/components/` and `src/styles/main.css`.
**Inputs:** [[Agent Map]], [[Architecture]], [[Converter Interface]], [[Rendering Strategy]]
**Outputs:** Complete React UI — App.tsx, InputPanel, PhotoPanel, OutputGrid, NumeralTile, VisionOverride, main.css
**Dependencies (blocked until all are true):**
- All 7 converter files exist with exported `toArabic`/`fromArabic`
- `src/renderers/MayanSvg.tsx` exists with `MayanSvg` export
- `src/renderers/BabylonianSvg.tsx` exists with `BabylonianSvg` export
- `src/vision/vision-client.ts` exists with `recognizeNumeral` export
**Must NOT touch:** Any converter file, renderer files, vision-client.ts

---

### QA

**Owner:** Spawned agent
**Scope:** `tests/` directory — add cross-system integration tests; review existing converter tests for gaps; write manual Vision test checklist in [[Bugs and Fixes]].
**Inputs:** [[Agent Map]], [[Converter Interface]], all numeral system notes, [[Vision API Notes]]
**Outputs:**
- Cross-system integration test: for n in [1, 10, 100, 1000, 3999], verify all converters round-trip correctly
- Edge case tests: zero behavior, max value, invalid input error throwing
- Manual Vision test checklist appended to [[Bugs and Fixes]]
**Dependencies:** UI agent complete (or at minimum all converter tests passing)
**Must NOT touch:** Any converter implementation, any renderer, vision-client.ts, any UI component

---

## Interface Contracts That Must Be Locked Before Phase 1

1. `toArabic(input: string): number` and `fromArabic(n: number): string` — see [[Converter Interface]]
2. Mayan `fromArabic` output format: `"d,d,d"` (comma-separated digits, highest first), `"shell"` for zero
3. Babylonian `fromArabic` output format: `"g|g|g"` (pipe-separated sexagesimal groups, highest first)
4. `recognizeNumeral` return type (documented above)
5. `CONVERTERS` registry shape in `src/converters/index.ts`

These contracts are what allow Phase 1 agents to run in parallel without stepping on each other.

---

## Agent Prompt Template

When spawning a converter agent, include:
1. The contents of [[Converter Interface]] (the full interface spec)
2. The contents of the relevant numeral system note from `20 - Numeral Systems/`
3. This instruction: "Write `src/converters/<system>.ts` and `tests/converters/<system>.test.ts`. Do not touch any other file. Run `npx vitest run tests/converters/<system>.test.ts` to verify. Do not stop until all tests pass."
