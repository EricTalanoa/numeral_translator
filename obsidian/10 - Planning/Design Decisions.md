# Design Decisions

A log of every non-obvious choice made during planning, with rationale. Decisions are locked here so agents don't re-litigate them.

---

## DD-001 — Input Range: 1 to 3,999

**Decision:** Accept integers 1–3,999 inclusive. Reject 0 (special display), reject anything outside this range with a validation error.

**Why:** Roman numerals in standard notation top out at MMMCMXCIX (3,999). Vinculum notation (M̄ = 4,000) exists but is non-standard, rarely taught, and would add significant complexity to the Roman converter for marginal pedagogical gain. Every other supported system (Egyptian, Mayan, Babylonian, Chinese Rod) handles numbers well above 3,999, so Roman is the binding constraint.

**How to apply:** The UI input field enforces this range client-side. Each converter can assume `n` is a valid integer in [1, 3999] when `fromArabic` is called. Converters do not need their own range guards.

---

## DD-002 — Zero Handling

**Decision:** The UI accepts 0 as typed input and displays it. For systems without a zero, the output tile shows "No representation". For Mayan (which has a genuine zero glyph), show the shell glyph.

**Why:** Zero is historically significant and a natural question in a History of Math context. Silently rejecting it would miss a teaching moment. Showing "No representation" explicitly communicates that these systems predate zero.

**How to apply:** `fromArabic(0)` in all non-Mayan converters returns the sentinel string `"∅"`. The `NumeralTile` component maps `"∅"` to a styled "No representation" display. Mayan's `fromArabic(0)` returns the shell glyph representation normally.

---

## DD-003 — Fractions: Explicitly Out of Scope

**Decision:** No converter handles fractional input. `toArabic` throws `Error("Fractions not supported")` if the input string contains a decimal point or slash. `fromArabic` only receives integers.

**Why:** Stated in the brief. Prevents scope creep. Some systems (Babylonian, Egyptian) did handle fractions historically, but implementing them correctly would double the complexity of those converters and is not needed for the course material.

**How to apply:** Validate input in the UI before calling any converter. `toArabic` implementations should still defensively throw on fractional strings.

---

## DD-004 — Vision Model

**Decision:** Use `claude-sonnet-4-6` (latest available Sonnet as of 2026-04-12).

**Why:** The brief originally specified `claude-sonnet-4-20250514`, but that model ID was from an earlier naming convention. Using the latest model gives better vision accuracy. Model ID is a single constant in `vision-client.ts` — easy to update.

**How to apply:** Set `model: "claude-sonnet-4-6"` in the Vision API call. If the model ID changes, update `src/vision/vision-client.ts` only.

---

## DD-005 — Vision UX: System Selection Before Upload

**Decision:** User must select the numeral system from a dropdown before the photo upload button is enabled.

**Why:** Pre-selecting the system dramatically narrows the recognition task for Claude. Ionian Greek (Greek letters), Attic Greek (Greek letters used differently), and Babylonian cuneiform are nearly indistinguishable from general Greek text or abstract marks without context. Asking "identify ANY ancient numeral in this photo" would produce unreliable results.

**How to apply:** The `PhotoPanel` component keeps the file input disabled until `selectedSystem !== null`. The selected system name is included in the Vision prompt. Future enhancement (Phase 4+): attempt auto-detection with context clues as a secondary pass.

---

## DD-006 — Chinese: Counting Rod Numerals

**Decision:** Implement the mathematical counting rod numeral system (Unicode U+1D360–U+1D371), not standard Chinese written numerals (一, 二, 三...) or Suzhou numerals.

**Why:** The brief specifies "Chinese rod numerals." Counting rod numerals are the historically significant mathematical tool used by Chinese mathematicians — the system that directly influenced the development of positional notation. Suzhou numerals are a later merchant shorthand.

**How to apply:** The Chinese Rod converter uses Unicode characters from U+1D360–U+1D371, alternating between vertical (odd positions) and horizontal (even positions) glyphs. See [[Chinese Rod]] for the full lookup table.

---

## DD-007 — Public Repo Security

**Decision:** API key lives in `.env.local` only. Never committed. `.env.local.example` with a placeholder is committed. No backend proxy in v1.

**Why:** The repo is public on GitHub. Committing a real API key would expose it to scrapers. `.env.local` is gitignored by Vite by default, so this is the standard safe approach for local-use tools.

**Limitation acknowledged:** The API key is visible in browser DevTools network traffic when making Vision calls. This is acceptable for personal local use. If the app is ever hosted publicly, a serverless proxy (e.g., Vercel Edge Function) should be added to keep the key server-side. Document this in the README.

---

## DD-008 — Babylonian Rendering: SVG Despite Unicode Availability

**Decision:** Render Babylonian numerals via SVG, not Unicode (even though the Cuneiform block U+12000–U+1247F exists).

**Why:** Cuneiform Unicode coverage in available fonts is near-zero on most systems. Noto Sans Cuneiform exists but is large and rarely installed. Users would see empty boxes. SVG rendering with simple wedge shapes gives reliable output with no font dependency.

**How to apply:** `babylonian-svg.tsx` renders each sexagesimal digit group as a cluster of vertical wedges (𒁹-shape) and corner wedges (𒌋-shape) using SVG `<path>` or `<polygon>` elements. See [[Rendering Strategy]] for SVG geometry spec.

---

## DD-009 — Attic Greek: Letter Sequences for Compound Symbols

**Decision:** Render Attic compound symbols (ΠΔ=50, ΠΗ=500, ΠΧ=5000) as letter sequences using standard Greek Unicode, not the Unicode Ancient Greek Numbers block (U+10140–U+1018F).

**Why:** The Ancient Greek Numbers block contains dedicated codepoints for Attic numerals but has essentially zero font support. Rendering as sequences of familiar capital Greek letters (Π, Δ, Η, Χ) is visually coherent and universally supported. A CSS note can explain the convention.

**How to apply:** The Attic converter returns strings like `"ΧΧΧ"`, `"ΠΗ"`, `"ΠΔ"` etc. The `NumeralTile` for Attic adds a small legend: "Π = 5× multiplier". See [[Attic Greek]] for the full symbol table.

---

## DD-010 — Mayan: Long Count Positional System (revised 2026-04-29)

**Decision:** The Mayan converter implements the Long Count positional system, not a hypothetical "pure base-20."

**Why:** The pure base-20 framing was historically incorrect. Mayan place values are 1 · 20 · 360 · 7,200 · 144,000 — the winal→tun step is ×18 (18 winals = 1 tun = 360 days), all other steps are ×20. This is the system actually used by the Maya for arithmetic and astronomy. Implementing "pure" base-20 would be a fictional construct.

**How to apply:** `fromArabic` extracts k'in (mod 20), then winal (mod 18), then tun and above (mod 20 each). `toArabic` reconstructs using place values 1, 20, 360, 7,200, 144,000. The winal digit is validated 0–17. Example: 3999 → `"11,1,19"` (11×360 + 1×20 + 19).
