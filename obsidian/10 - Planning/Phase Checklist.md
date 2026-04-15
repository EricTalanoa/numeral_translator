# Phase Checklist

Build phases from scaffolding to quiz mode. Each phase has a clear definition of done.

Complexity estimates: S = simple (< 1 hour), M = moderate (1-3 hours), L = complex (3+ hours)

---

## Phase 0 — Interface Lock & Scaffolding ✅ COMPLETE
*Completed 2026-04-12*

- [x] Initialize Vite + React + TypeScript project — **S**
- [x] Install dependencies: React, Vitest, @vitejs/plugin-react — **S**
- [x] Configure `vite.config.ts` with React plugin and test config — **S**
- [x] Configure `tsconfig.json` — **S**
- [x] Create `.gitignore` (includes `.env.local`) — **S**
- [x] Create `.env.local.example` with `VITE_CLAUDE_API_KEY=your_key_here` — **S**
- [x] Create directory structure — **S**
- [x] Write `src/converters/index.ts` — CONVERTERS registry — **S**
- [x] Create 7 converter stub files — **S**
- [x] Create renderer stubs (MayanSvg, BabylonianSvg) — **S**
- [x] Create `vision-client.ts` stub — **S**
- [x] Create `public/fonts/.gitkeep` (slot for Egyptian font) — **S**
- [x] Registry smoke test passes (3/3) — **S**
- [x] `npx tsc --noEmit` clean — **S**
- [x] Initial commit pushed to GitHub — **S**

**Note:** Noto Sans Egyptian Hieroglyphs font not yet downloaded — needed before Phase 2 (UI). Download from Google Fonts and place at `public/fonts/NotoSansEgyptianHieroglyphs-Regular.ttf`.

---

## Phase 1 — Converters + Renderer + Vision (Parallel) ✅ COMPLETE
*Completed 2026-04-12*

### Converter Agents (7, run in parallel)

- [x] Egyptian Hieroglyphic converter + tests — **M**
- [x] Ionian Greek converter + tests — **M**
- [x] Attic Greek converter + tests — **M**
- [x] Babylonian converter + tests — **M**
- [x] Roman converter + tests — **S**
- [x] Mayan converter + tests — **M**
- [x] Chinese Rod converter + tests — **M**

### Renderer Agent (parallel with converters)

- [x] `MayanSvg.tsx` — renders dots, bars, shell for each vigesimal digit — **M**
- [x] `BabylonianSvg.tsx` — renders vertical wedges and corner wedges per group — **M**
- [ ] Renderer snapshot tests — **S** *(deferred to Phase 3 QA)*

### Vision Agent (parallel with converters)

- [x] `vision-client.ts` — `recognizeNumeral` function — **M**
- [x] Prompt engineering for each supported system — **M**
- [x] Confidence check logic + error handling — **S**

**Definition of done:** ✅ 225/225 tests passing. Both renderer components compile without errors. `vision-client.ts` exports the correct function signature. `npx tsc --noEmit` clean.

**Implementation note:** Chinese Rod `fromArabic(10)` returns `𝍩〇` (horiz-1 + zero-placeholder) — trailing zeros are required for `toArabic` round-trips to work correctly via decimal accumulation.

---

## Phase 2 — UI ✅ COMPLETE
*Smoke test done 2026-04-13. Language-dependent ranges complete 2026-04-14.*

- [x] `App.tsx` — root component, state management — **S**
- [x] `InputPanel.tsx` — text input with range validation — **S**
- [x] `PhotoPanel.tsx` — file upload, system selector, loading state — **M**
- [x] `OutputGrid.tsx` — fan-out, renders 7 tiles — **S**
- [x] `NumeralTile.tsx` — unicode/svg/text render modes, "∅" handling, font loading gate, click-to-expand modal — **M**
- [x] `VisionOverride.tsx` — manual entry on Vision failure — **S**
- [x] `main.css` — layout, tile styling, font-face declarations, loading states — **M**
- [x] Wire up CONVERTERS registry to OutputGrid — **S**
- [x] Wire up Vision flow: PhotoPanel → vision-client → App state → OutputGrid — **M**
- [x] Verify font loading behavior for Egyptian Hieroglyphics — **S**
- [x] Manual smoke test: type 1, 9, 42, 100, 1000, 3999 — verify all 7 tiles render — **S**
- [x] Manual smoke test: type 0 — verify "No representation" tiles (and Mayan shell) — **S**
- [x] Fix Mayan/Babylonian SVG colors (were invisible on dark background) — **S**
- [x] Fix Babylonian unit wedge shape (now points downward, matching cuneiform) — **S**
- [x] Add click-to-expand modal to NumeralTile (3× scale, Esc to close) — **S**

**Language-dependent ranges (from smoke test feedback — in progress):**
- [x] Add `maxValue` to Converter interface + registry — Task 1 ✅
- [x] Lift Attic Greek range to 9,999 — Task 2 ✅
- [x] Lift Babylonian, Mayan, Chinese Rod to 999,999 — Task 3 ✅
- [x] Egyptian converter: add 10k/100k/1M symbols — Task 4 ✅
- [x] Ionian Greek: extend THOUSANDS to ͵θ — Task 5 ✅
- [x] InputPanel: raise cap to 9,999,999 — Task 6 ✅
- [x] NumeralTile: out-of-range state + modal range display — Task 7 ✅
- [x] RangeModal component (ⓘ button) — Tasks 8–9 ✅
- [x] CSS: Egyptian font 28px, sidebar header, range table — Task 10 ✅
- [x] Final smoke test — Task 11 ✅

**Definition of done:** ✅ `npm run dev` shows working UI. All 7 systems display within their natural ranges. Out-of-range tiles show "out of range". ⓘ button shows all system ranges. 267/267 tests passing.

**Implementation notes:**
- ∅ sentinel check moved before SVG dispatch in NumeralTile — Babylonian zero correctly shows "No representation"
- `maxValue` field added to Converter interface; each system declares its own ceiling
- SVG renderers (MayanSvg, BabylonianSvg) accept optional `scale` prop with viewBox for modal scaling

---

## Phase 3 — QA & Integration + New Systems
*In progress 2026-04-14*

**Bug fixes (Phase 2.5, complete):**
- [x] Fix `parseResponse` range cap in `vision-client.ts` (3,999 → 9,999,999)
- [x] Add `anthropic-dangerous-direct-browser-access` header to Anthropic API fetch

**New numeral systems:**
- [x] Design spec: `docs/superpowers/specs/2026-04-14-new-systems-chinese-glagolitic-design.md`
- [x] Implementation plan: `docs/superpowers/plans/2026-04-14-chinese-traditional-and-glagolitic.md`
- [x] Chinese Traditional converter + 45 tests — `src/converters/chinese-traditional.ts` ✅
- [ ] Glagolitic test file (TDD red) — Task 3
- [ ] Glagolitic converter + 24 tests — Task 4
- [ ] Register both in CONVERTERS, add vision hints + CSS — Task 5

**QA tasks:**
- [ ] Cross-system integration test: n in [1, 10, 42, 100, 999, 1000, 3999] all round-trip — **M**
- [ ] Zero edge case: `fromArabic(0)` returns `"∅"` for 8 systems, shell string for Mayan — **S**
- [ ] Max value edge case: each system valid at its ceiling — **S**
- [ ] Out-of-range error: each system throws at its own ceiling — **S**
- [ ] Fraction error: `toArabic("3.5")` throws for all systems — **S**
- [ ] Manual Vision test checklist (append to [[Bugs and Fixes]]) — **M**
- [ ] Code review: verify no converter imports from another, no converter touches DOM — **S**
- [ ] Verify `.env.local` is in `.gitignore` and not tracked by git — **S**

**Definition of done:** 336/336 tests passing. Both new tiles visible and working. All QA tasks checked. No converter cross-imports. Security verified.

---

## Phase 4 — Quiz Mode (Stretch Goal)
*Begin only after Phase 3 is fully signed off.*
*(quiz now covers 9 systems)*

**Concept:** The app displays a numeral in one system and asks the user to type the Arabic value. Immediate feedback (correct / incorrect + explanation).

### Scope

- [ ] Quiz mode toggle in the nav — **S**
- [ ] `QuizPanel.tsx` — generates a question, accepts an answer — **M**
  - Pick a random system and a random number (1–3999)
  - Display `fromArabic(n)` in that system
  - Text field for user's answer
  - On submit: compare to `n`, show correct/incorrect
  - "Show explanation" expands to show the correct value in all systems
- [ ] Configurable difficulty: easy (Roman, Egyptian), medium (Mayan, Attic), hard (Babylonian, Ionian, Chinese Rod) — **M**
- [ ] Score tracker (session-local, no persistence) — **S**
- [ ] Hint button: reveals system name if user has "system selection" hint mode off — **S**

### Definition of Done

Quiz mode generates valid questions for all 7 systems. Answer evaluation is correct. Score tracker increments. No new converter logic needed (quiz reuses existing `fromArabic`).

---

## Notes

- **Roman is easiest**, good for smoke-testing the converter interface.
- **Babylonian** has the most rendering complexity (SVG wedge geometry).
- **Ionian Greek** has the most parsing complexity (three special archaic letters + keraia markers).
- **Chinese Rod** has a subtle alternating-orientation rule — easy to get wrong, easy to test.
- All phases should be committed to git at the end of each phase.
