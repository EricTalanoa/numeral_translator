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

## Phase 2 — UI
*All components implemented on branch `feature/phase2-ui`. Pending manual smoke test to close out.*

- [x] `App.tsx` — root component, state management — **S**
- [x] `InputPanel.tsx` — text input with range validation — **S**
- [x] `PhotoPanel.tsx` — file upload, system selector, loading state — **M**
- [x] `OutputGrid.tsx` — fan-out, renders 7 tiles — **S**
- [x] `NumeralTile.tsx` — unicode/svg/text render modes, "∅" handling, font loading gate — **M**
- [x] `VisionOverride.tsx` — manual entry on Vision failure — **S**
- [x] `main.css` — layout, tile styling, font-face declarations, loading states — **M**
- [x] Wire up CONVERTERS registry to OutputGrid — **S**
- [x] Wire up Vision flow: PhotoPanel → vision-client → App state → OutputGrid — **M**
- [ ] Verify font loading behavior for Egyptian Hieroglyphics — **S**
- [ ] Manual smoke test: type 1, 9, 42, 100, 1000, 3999 — verify all 7 tiles render — **S**
- [ ] Manual smoke test: type 0 — verify "No representation" tiles (and Mayan shell) — **S**

**Definition of done:** `npm run dev` shows a working UI. All 7 systems display correctly for the smoke test values. Photo flow shows loading state, success state, and error+override state.

**Implementation note:** ∅ sentinel check moved before SVG dispatch in NumeralTile — Babylonian zero correctly shows "No representation" (not an SVG ∅). Fix committed on `feature/phase2-ui`.

---

## Phase 3 — QA & Integration
*Spawn QA agent after Phase 2.*

- [ ] Cross-system integration test: n in [1, 10, 42, 100, 999, 1000, 3999] all round-trip — **M**
- [ ] Zero edge case: `fromArabic(0)` returns `"∅"` for 6 systems, shell string for Mayan — **S**
- [ ] Max value edge case: `fromArabic(3999)` produces valid output for all systems — **S**
- [ ] Out-of-range error: `fromArabic(4000)` throws for all systems — **S**
- [ ] Fraction error: `toArabic("3.5")` throws for all systems — **S**
- [ ] Manual Vision test checklist (append to [[Bugs and Fixes]]) — **M**
- [ ] Code review: verify no converter imports from another, no converter touches DOM — **S**
- [ ] Verify `.env.local` is in `.gitignore` and not tracked by git — **S**

**Definition of done:** All automated tests pass. Manual checklist complete. No converter cross-imports. Security verified.

---

## Phase 4 — Quiz Mode (Stretch Goal)
*Begin only after Phase 3 is fully signed off.*

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
