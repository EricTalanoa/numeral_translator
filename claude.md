# Numeral Translator — Claude Code Session Guide

## Current Status
**Phase 3 complete.** 435/435 tests passing. TypeScript clean.
Working in `.worktrees/phase2-ui`, branch `feature/phase2-ui`.
**Next: Phase 4 Quiz Mode** (stretch goal — see Phase Checklist).

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
- Input range: system-dependent (Roman 3,999 · Attic/Ionian 9,999 · Babylonian/Mayan/ChineseRod 999,999 · Egyptian 9,999,999)
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
- **Phase 2** ✅ UI — complete; 267 tests; language-dependent ranges shipped
- **Phase 3** ✅ QA + new systems — 9 systems, 435 tests, all QA tasks complete
- **Phase 4** ⬜ Quiz mode (stretch goal)
- **Phase 5** ⬜ Per-language history pages with images (stretch goal)

## Plans live here
`docs/superpowers/plans/` — implementation plans for each phase
