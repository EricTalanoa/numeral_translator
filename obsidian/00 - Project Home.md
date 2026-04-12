# Numeral Translator — Project Home

## Status: Phase 1 Complete
**Last updated:** 2026-04-12

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
- Download Noto Sans Egyptian Hieroglyphs font before Phase 2 starts (see [[Phase Checklist]])

---

## Session Log
*(Newest at top — append only)*

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
