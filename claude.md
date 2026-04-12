# Numeral Translator — Claude Code Session Guide

## Current Status
**Phase 1 complete.** All 7 converters + 2 SVG renderers + vision client implemented.
225/225 tests passing. TypeScript clean. **Next: Phase 2** — UI layer.

## What this project is
A React + Vite + TypeScript web app that translates Arabic integers (1–3,999) into
seven ancient numeral systems. Two input modes: typed number and photo (Claude Vision).

**Repo:** https://github.com/EricTalanoa/numeral_translator.git

## Before doing anything, read the Obsidian vault
Open `obsidian/` as a vault in Obsidian, or read these files in order:
1. `obsidian/00 - Project Home.md` — status dashboard and session log
2. `obsidian/10 - Planning/Architecture.md` — system design
3. `obsidian/10 - Planning/Agent Map.md` — who owns what, spawn order
4. `obsidian/10 - Planning/Phase Checklist.md` — what's done, what's next
5. `obsidian/30 - Dev Notes/Converter Interface.md` — locked toArabic/fromArabic contract

## Key decisions (locked)
- Input range: 1–3,999 (Roman numeral ceiling)
- Zero: "No representation" (∅ sentinel) for all systems except Mayan (shell glyph)
- Fractions: out of scope for v1
- Vision model: `claude-sonnet-4-6`
- Vision UX: user selects system before uploading photo
- Chinese: counting rod numerals (U+1D360–U+1D371)
- Rendering: SVG for Mayan and Babylonian; Unicode for all others
- API key: `.env.local` only — never committed

## Phase summary
- **Phase 0** ✅ Scaffold, stubs, registry, git setup
- **Phase 1** ✅ Converters (×7) + Renderer + Vision — 225 tests passing
- **Phase 2** ⬜ UI (blocked until Phase 1 complete)
- **Phase 3** ⬜ QA + integration tests
- **Phase 4** ⬜ Quiz mode (stretch goal)

## Plans live here
`docs/superpowers/plans/` — implementation plans for each phase
