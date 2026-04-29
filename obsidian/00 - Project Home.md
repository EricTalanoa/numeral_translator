# Numeral Translator — Project Home

## Status: Phase 6 Complete + Mayan Long Count bugfix — 575/575 tests passing; Phase 7 (history pages) next
**Last updated:** 2026-04-29

---

## Quick Links

### Planning
- [[Architecture]] — definitive system design
- [[Agent Map]] — multi-agent execution plan and spawn order
- [[Phase Checklist]] — phased build plan with checkbox tasks
- [[Design Decisions]] — log of why choices were made

### Numeral Systems
- [[Egyptian Hieroglyphic]] · [[Ionian Greek]] · [[Attic Greek]] · [[Babylonian]]
- [[Roman]] · [[Mayan]] · [[Chinese Rod]] · [[Chinese Traditional]] · [[Glagolitic]]

### Dev Notes
- [[Converter Interface]] — locked toArabic/fromArabic contract
- [[Vision API Notes]] — Claude Vision prompt engineering and failure modes
- [[Rendering Strategy]] — Unicode vs SVG decisions per system
- [[Bugs and Fixes]] — running issue log

---

## Repository
`https://github.com/EricTalanoa/numeral_translator.git`

## Current Blockers
- None. Mayan Long Count bugfix complete. 575/575 tests passing.
  Next: Phase 7 — Per-language history pages (stretch goal, not yet planned).

---

## Session Log
*(Newest at top — append only)*

### 2026-04-29 — Mayan Long Count bugfix
- **Bug:** Mayan converter used pure base-20 (place values 1, 20, 400, …) — historically incorrect
- **Fix:** Switched to Long Count positional system (1 · 20 · 360 · 7,200 · 144,000): winal→tun step is ×18, all others ×20
- Updated `src/converters/mayan.ts` — `fromArabic`, `toArabic`, `explain`
- Updated `tests/converters/mayan.test.ts` — all test cases corrected; winal-max-17 validation test added; round-trip set extended
- Updated DD-010, Mayan.md, and CLAUDE.md to reflect Long Count decision
- **575/575 tests passing. TypeScript clean. Pushed to main.**

### 2026-04-16 — Phase 6 Quiz Mode complete and merged to main
- **NumeralDisplay** extracted from NumeralTile into shared component — 7 tests
- **QuizControls** sidebar: 10 system checkboxes, at-least-one enforcement, Reset Score button — 5 tests
- **QuizPanel**: question/feedback state machine, score tracking, `generateQuestion` pure export, Enter-key submit — 12 tests
- **App.tsx** wired: mode tab strip (Translate / Quiz), conditional sidebar + main area, `key={quizResetKey}` reset pattern
- **Quiz CSS** added: mode tabs, quiz card layout, score, feedback (green/red), input, Next Question button
- All 4 tasks reviewed (spec compliance + code quality) via subagent-driven-development
- **571/571 tests passing. TypeScript clean. Merged to main via PR.**
- Next: Phase 7 — Per-language history pages (stretch goal, no plan yet)

### 2026-04-15 — Phase 3 QA complete: integration tests, edge cases, code review
- **Integration tests added:** `tests/integration/round-trips.test.ts` (63 tests) — cross-system `toArabic(fromArabic(n))` for n in [1, 10, 42, 100, 999, 1000, 3999] across all 9 converters
- **Edge-case tests added:** `tests/integration/edge-cases.test.ts` (36 tests) — zero (∅/shell), maxValue valid, maxValue+1 throws, `toArabic("3.5")` throws for all 9 systems
- **Code review passed:** No converter imports from another; no converter touches DOM; `.env.local` in `.gitignore` and not tracked
- **Vision test checklist updated:** Added Chinese Traditional and Glagolitic test cases; updated 7→9 tile counts in override tests
- **435/435 tests passing. Phase 3 fully complete.**
- **Next: Phase 4 Quiz Mode** (begin only after Phase 3 signed off — it is)

### 2026-04-15 — Phase 2.5 complete: smoke test + Egyptian tadpole fix
- **Smoke test passed:** Chinese Traditional and Glagolitic tiles (8+9) render correctly. All 9 systems display in expected ranges. ⓘ modal shows 9 rows.
- **Egyptian tadpole bug (re-opened and fixed):**
  - Previous session incorrectly concluded U+130F2 was the tadpole (I8). It is actually Gardiner E028, a mammal — hence the "goat."
  - Correct codepoint: **U+13190** (Gardiner I008, tadpole). Fixed in `src/converters/egyptian.ts` and `tests/converters/egyptian.test.ts`. Commit `0db4a78`.
  - 336/336 tests still pass after fix.
- **Phase 2.5 now fully complete.** Next: Phase 3 QA tasks.

### 2026-04-14 — Phase 3 started: two new numeral systems, bug fixes
- **Bug fixes (phase 2.5):**
  - `vision-client.ts` `parseResponse` range cap lifted from 3,999 → 9,999,999 (photo mode was silently rejecting larger values)
  - Added `anthropic-dangerous-direct-browser-access: true` header to Anthropic fetch (required for direct browser API calls)
  - Egyptian "goat": incorrectly concluded this was a rendering quirk — actual fix was in 2026-04-15 session (see above)
- **Planning — new systems:**
  - Spec written: `docs/superpowers/specs/2026-04-14-new-systems-chinese-glagolitic-design.md`
  - Plan written: `docs/superpowers/plans/2026-04-14-chinese-traditional-and-glagolitic.md`
  - Chinese Traditional: literary multiplicative notation, maxValue 9,999,999, 45 tests
  - Glagolitic: alphabetic additive (U+2C30–U+2C53), maxValue 9,999, 24 tests
  - Per-language history pages deferred to Phase 5
- **Chinese Traditional converter: ✅ complete**
  - `src/converters/chinese-traditional.ts` — convertSubGroup (needZero flag), fromArabic (萬 grouping + 零 bridge + leading-一 strip), toArabic
  - 45/45 tests passing. Spec + code quality reviews both approved.
  - 312/312 total tests (267 pre-existing + 45 new)
- **Glagolitic converter: ✅ complete** — `src/converters/glagolitic.ts`, 24/24 tests, commit `90592bc`
  - UNITS array bug caught by spec review: sequential U+2C30–U+2C38, test for 42 corrected to `'\u2C3C\u2C31'`
- **Task 5 (registry + vision hints + CSS): ✅ complete** — commit `00d2427`
  - `src/converters/index.ts` now has 9 entries; registry test updated to match
  - `systemHint()` has `case 'Chinese Traditional':` and `case 'Glagolitic':`
  - `.chineseTraditional { font-size: 20px }` and `.glagolitic { font-family: 'Segoe UI Historic'; font-size: 24px }`
- **336/336 tests passing. TypeScript clean.**
- **Next session:** Manual smoke test (Chinese Traditional + Glagolitic tiles), then Phase 3 QA tasks

### 2026-04-14 — Language-dependent ranges complete; Phase 2 done
- Completed Tasks 3–11 of `docs/superpowers/plans/2026-04-13-language-dependent-ranges.md`
- **Task 3:** Babylonian, Mayan, Chinese Rod range guards lifted to 999,999
- **Task 4:** Egyptian extended to 9,999,999 — added finger (D50, `\u{130AD}`), tadpole (I8, `\u{130F2}`), Heh god (C11, `\u{13068}`) symbols
- **Task 5:** Ionian Greek THOUSANDS array extended to ͵θ (9,000); range → 9,999
- **Task 6:** InputPanel cap raised to 9,999,999; label updated; error message updated
- **Task 7:** NumeralTile adds `outOfRange` preflight — tiles show "out of range" text; expand modal shows valid range for that system
- **Task 8:** `RangeModal.tsx` created — table of all 7 systems and their ranges, driven by CONVERTERS
- **Task 9:** App.tsx wired — `showRanges` state, ⓘ button in sidebar header row, RangeModal rendered
- **Task 10:** CSS — Egyptian font 24→28px; `.app-title` replaced with `.app-title-row` flex layout + `.range-info-btn`; range table and out-of-range modal styles added
- **Task 11:** Smoke test passed — out-of-range tiles, click-to-expand modal with range info, ⓘ range panel all verified
- 267/267 tests passing. TypeScript clean. 10 commits on `feature/phase2-ui`.
- User noted some additional changes to make — deferred to Phase 2.5 or Phase 3.
- **Next session:** Start Phase 3 QA (or Phase 2.5 fixes if user defines them)

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
