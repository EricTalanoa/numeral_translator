# Numeral Translator — Project Home

## Status: Planning Phase
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
*None — awaiting user approval of plan before Phase 0 scaffolding.*

---

## Session Log
*(Newest at top — append only)*

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
- Status: vault complete, awaiting user review before implementation
