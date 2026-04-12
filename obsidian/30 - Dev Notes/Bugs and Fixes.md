# Bugs and Fixes

Running log of issues found and resolved. Append new entries at the top.

---

## Open Issues
*None yet — development not started.*

---

## Vision Manual Test Checklist
*(To be completed by QA agent after UI is built)*

### Setup
- [ ] `.env.local` exists with valid `VITE_CLAUDE_API_KEY`
- [ ] App runs at `localhost:5173`
- [ ] Photo mode is accessible and system selector is functional

### Happy Path Tests
- [ ] Roman: photo of "XIV" → correctly returns 14
- [ ] Roman: photo of "MMMCMXCIX" → correctly returns 3999
- [ ] Egyptian: photo of lotus + 3 strokes → correctly returns 1003
- [ ] Mayan: photo of two dots over one bar → correctly returns 7
- [ ] Attic Greek: photo of "ΧΔΙ" → correctly returns 1011
- [ ] Babylonian: photo of wedge clusters → returns plausible value
- [ ] Chinese Rod: photo of rod glyphs → returns plausible value

### Failure Path Tests
- [ ] Blurry photo → app shows "Could not identify" message (not a crash)
- [ ] Empty/blank image → app shows failure message
- [ ] Wrong system selected (e.g., Roman numerals but Mayan selected) → returns uncertain or wrong value, app handles gracefully
- [ ] API key missing: Photo mode tab is disabled, tooltip explains why
- [ ] Network offline: error message shown, VisionOverride offered

### Override Tests
- [ ] VisionOverride renders after failure
- [ ] Typing "42" in override and submitting populates all 7 output tiles
- [ ] Typing "0" in override shows "No representation" for 6 systems, shell for Mayan
- [ ] Typing "4000" in override shows validation error

---

## Resolved Issues
*(Append here as issues are found and fixed)*

---

## Notes on Known Fragile Areas

- **Ionian Greek parsing**: The three archaic letters (ϛ, ϟ, ϡ) are the most likely to cause encoding issues. If `toArabic` fails on valid Ionian input, check that the source file is saved as UTF-8 and that the archaic codepoints (U+03DB, U+03DF, U+03E1) are correctly encoded.

- **Egyptian codepoints**: The exact Unicode codepoints for the four numeral glyphs should be verified against the Gardiner sign list before the converter is written. If a glyph renders as a box, the codepoint may be wrong.

- **Chinese Rod zero placeholder**: If `toArabic` fails on a Chinese Rod string containing 〇, check that U+3007 is in the accepted zero character set.

- **Mayan shell parsing**: The converter outputs `"shell"` for zero; the Mayan SVG component and `toArabic` must both handle this special case.

- **Babylonian zero group**: When a sexagesimal group value is 0 (e.g., 60 = `"1|0"`), `BabylonianSvg` must render something for that position. An empty group cell (blank space) is correct historically.
