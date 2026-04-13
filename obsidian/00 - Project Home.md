# Numeral Translator — Project Home

## Status: Phase 2 Smoke Test Done — Language-Dependent Ranges In Progress
**Last updated:** 2026-04-13

---

## Quick Links

### Planning
- [[Architecture]] — definitive system design
- [[Agent Map]] — multi-agent execution plan and spawn order
- [[Phase Checklist]] — phased build plan with checkbox tasks
- [[Design Decisions]] — log of why choices were made

### Numeral Systems
- [[Egyptian Hieroglyphic]] · [[Ionian Greek]] · [[Attic Greek]] · [[Babylonian]]
- [[Roman]] · [[Mayan]] · [[Chinese Rod]]

### Dev Notes
- [[Converter Interface]] — locked toArabic/fromArabic contract
- [[Vision API Notes]] — Claude Vision prompt engineering and failure modes
- [[Rendering Strategy]] — Unicode vs SVG decisions per system
- [[Bugs and Fixes]] — running issue log

---

## Repository
`https://github.com/EricTalanoa/numeral_translator.git`

## Current Blockers
- None — resume next session with Task 3 of language-dependent ranges plan
  (`docs/superpowers/plans/2026-04-13-language-dependent-ranges.md`)
  Working in `.worktrees/phase2-ui`, branch `feature/phase2-ui`, 236/236 tests passing

---

## Session Log
*(Newest at top — append only)*

### 2026-04-13 — Phase 2 smoke test done; language-dependent ranges started
- Manual smoke test run on `feature/phase2-ui` at `http://localhost:5174`
- **Fixes from smoke test feedback:**
  - Mayan SVG color changed to `#7ecf7e` (was invisible dark green on dark background)
  - Babylonian SVG color changed to `#c8a97d` (was invisible dark brown)
  - Babylonian unit wedge shape fixed: now points downward (▽) matching cuneiform nail in clay
  - Click-to-expand feature added to NumeralTile: click any populated tile → modal at 3× scale; SVG components now accept `scale` prop with `viewBox` for clean scaling; Esc or click-outside to close
  - Photo mode confirmed working: VisionOverride appears correctly when no API key
- **Language-dependent ranges feature:**
  - Input range was universal 3,999 → now system-dependent (Roman 3,999 · Attic/Ionian 9,999 · Babylonian/Mayan/Chinese Rod 999,999 · Egyptian 9,999,999)
  - Spec: `docs/superpowers/specs/2026-04-13-language-dependent-ranges-design.md`
  - Plan: `docs/superpowers/plans/2026-04-13-language-dependent-ranges.md`
  - ✅ Task 1 done: `maxValue` added to Converter interface + registry (commit e92a293)
  - ✅ Task 2 done: Attic Greek range lifted to 9,999 (commit f3d52fc, 236 tests)
  - ⬜ Tasks 3–11 pending (Babylonian/Mayan/ChineseRod, Egyptian symbols, Ionian, InputPanel, NumeralTile, RangeModal, App, CSS, smoke test)
- **Next session:** Resume language-dependent ranges at Task 3

### 2026-04-12 — Phase 2 implementation complete (smoke test pending)
- Brainstormed + designed Phase 2 UI: dark/scholarly style, sidebar layout, tabs, minimal App state
- Spec written: `docs/superpowers/specs/2026-04-12-phase2-ui-design.md`
- Plan written: `docs/superpowers/plans/2026-04-12-phase2-ui.md`
- All 8 components implemented via subagent-driven development on branch `feature/phase2-ui`
  - `main.css` — full dark/scholarly design system with custom properties, @font-face
  - `NumeralTile.tsx` — 6 render cases (null, ∅, Mayan SVG, Babylonian SVG, font-loading, unicode)
  - `OutputGrid.tsx` — CONVERTERS fan-out
  - `InputPanel.tsx` — live text validation with exported `parseInputValue` (TDD, 7 tests)
  - `ControlPanel.tsx` — Type/Photo tab switching
  - `App.tsx` — sidebar + tile grid, value state only
  - `VisionOverride.tsx` — manual fallback, reuses `parseInputValue`
  - `PhotoPanel.tsx` — base64 upload, `recognizeNumeral`, loading + error states
- Bug caught by final code review: ∅ sentinel check moved before SVG dispatch in NumeralTile (Babylonian zero was rendering SVG ∅ instead of "No representation")
- 232/232 tests passing. TypeScript clean.
- **Next: start next session with manual smoke test** — run `npm run dev` from `.worktrees/phase2-ui`, test values 0, 1, 42, 100, 3999, photo flow, Egyptian font loading

### 2026-04-12 — Phase 1 complete
- All 7 converters implemented with full test suites (225 tests total, all passing)
- Egyptian, Ionian, Attic, Babylonian, Roman, Mayan, Chinese Rod converters done
- MayanSvg.tsx and BabylonianSvg.tsx SVG renderers implemented
- vision-client.ts implemented (recognizeNumeral with prompt engineering for all 7 systems)
- TypeScript clean (`npx tsc --noEmit` zero errors)
- Note on Chinese Rod: `fromArabic(10)` returns `𝍩〇` (H1+ZERO) — trailing zero needed for round-trips
- **Next: Phase 2** — UI layer (App, InputPanel, PhotoPanel, OutputGrid, NumeralTile, etc.)

### 2026-04-12 — Phase 0 complete
- Phase 0 scaffolding done: Vite + React + TypeScript + Vitest set up
- All 7 converter stubs, renderer stubs, vision stub created
- CONVERTERS registry locked, 3/3 smoke tests passing
- TypeScript clean, dev server running
- Initial commit pushed to GitHub (merged with existing README)
- `claude.md` trimmed to brief status doc — full detail in Obsidian
- **Next: Phase 1** — spawn all converter + renderer + vision agents in parallel

### 2026-04-12 — Planning session
- Read and understood full project brief (CLAUDE.md)
- Clarified and locked the following decisions:
  - Input range: **1–3,999** (Roman numeral upper bound)
  - Zero: "No representation" sentinel for all systems except Mayan (shell glyph)
  - Fractions: explicitly out of scope for v1
  - Vision model: **claude-sonnet-4-6** (latest available Sonnet)
  - Vision UX: user selects numeral system before uploading photo (Option B)
  - Chinese system: **counting rod numerals** (U+1D360–U+1D371), not regular Chinese numerals
  - Security: repo is public; API key lives in `.env.local` (gitignored), never committed
- Built Obsidian vault (all folders and notes populated)
- Egyptian hieroglyph codepoints verified against Unicode names list
