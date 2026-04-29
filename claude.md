# Numeral Translator — Claude Code Session Guide

## Current Status
**Phases 4+5+6 complete + Mayan Long Count bugfix.** 575 tests passing. TypeScript clean.
On `main` branch.
**Next: Phase 7** — Per-language history pages with images (stretch goal, not yet planned).

## What this project is
A React + Vite + TypeScript web app that translates Arabic integers into
ten ancient numeral systems. Input mode: typed number (photo/vision mode removed).

**Repo:** https://github.com/EricTalanoa/numeral_translator.git

## Before doing anything, read the Obsidian vault
Open `obsidian/` as a vault in Obsidian, or read these files in order:
1. `obsidian/00 - Project Home.md` — status dashboard and session log
2. `obsidian/10 - Planning/Architecture.md` — system design
3. `obsidian/10 - Planning/Agent Map.md` — who owns what, spawn order
4. `obsidian/10 - Planning/Phase Checklist.md` — what's done, what's next
5. `obsidian/30 - Dev Notes/Converter Interface.md` — locked toArabic/fromArabic contract

## Key decisions (locked)
- Input range: system-dependent (Roman 3,999 · Attic/Ionian/Glagolitic/OCS 9,999 · Babylonian/Mayan/ChineseRod 999,999 · Egyptian/ChineseTraditional 9,999,999)
- Zero: "No representation" (∅ sentinel) for all systems except Mayan (shell glyph)
- Fractions: out of scope for v1
- Photo/Vision mode: removed
- Chinese: counting rod numerals (U+1D360–U+1D371), rendered as SVG
- Rendering: SVG for Mayan, Babylonian, Chinese Rod; Unicode for all others
- OCS font: Ponomar-Regular.ttf (covers archaic Cyrillic: Ѳ Ѯ Ѱ Ѿ ҂)

## Phase summary
- **Phase 0** ✅ Scaffold, stubs, registry, git setup
- **Phase 1** ✅ Converters (×7) + Renderer + Vision — 225 tests passing
- **Phase 2** ✅ UI — complete; 267 tests; language-dependent ranges shipped
- **Phase 3** ✅ QA + new systems — 9 systems, 435 tests, all QA tasks complete
- **Phase 4** ✅ Breakdown tab (explain() on all 10 converters) + OCS converter + Chinese Rod SVG — 547 tests
- **Phase 5** ✅ Photo/Vision mode removed; modal layout fixed
- **Phase 6** ✅ Quiz mode — NumeralDisplay extraction, QuizControls, QuizPanel, App wiring — 571 tests
- **Phase 7** ⬜ Per-language history pages with images (stretch goal)

## Plans live here
`docs/superpowers/plans/` — implementation plans for each phase
