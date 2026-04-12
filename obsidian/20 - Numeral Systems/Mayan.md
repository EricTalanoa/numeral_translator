# Mayan Numerals

## How the System Works

The Maya used a **vigesimal (base-20) positional** numeral system — one of the earliest fully positional systems with a genuine zero. The system was used for arithmetic, astronomical calculations, and the Long Count calendar.

**Basic symbols:**
| Symbol | Value | Appearance |
|---|---|---|
| Shell/egg glyph | 0 | An oval with an internal curl/crescent; represents zero |
| Dot | 1 | A filled circle (•) |
| Bar | 5 | A horizontal thick bar (—) |

Numbers 0–19 are composed from dots and bars:
| Value | Composition |
|---|---|
| 0 | shell glyph |
| 1–4 | 1–4 dots |
| 5 | 1 bar |
| 6–9 | 1 bar + 1–4 dots |
| 10 | 2 bars |
| 11–14 | 2 bars + 1–4 dots |
| 15 | 3 bars |
| 16–19 | 3 bars + 1–4 dots |

**Positional structure (pure mathematical system, base-20):**

| Position | Place value |
|---|---|
| 0 (bottom) | 1 |
| 1 | 20 |
| 2 | 400 |
| 3 | 8,000 (beyond range) |

Numbers are written **vertically**, with the lowest place at the bottom and higher places stacked above.

**This app uses the pure mathematical base-20 system** (not the Long Count calendar, which uses ×18 for the second position). See [[Design Decisions#DD-010]].

---

## Converter Output Format

`fromArabic` returns a **comma-separated string of vigesimal digits**, highest place first:

```
fromArabic(3999) → "9,19,19"    // 9×400 + 19×20 + 19
fromArabic(20)   → "1,0"        // 1×20 + 0
fromArabic(19)   → "19"         // just ones place
fromArabic(0)    → "shell"      // special zero sentinel
fromArabic(1)    → "1"
```

The `MayanSvg` component parses this and renders each digit as dots-and-bars, stacking them vertically.

---

## Conversion Algorithm

### fromArabic (Arabic → encoded string)

```
if n === 0: return "shell"

digits = []
remaining = n
while remaining > 0:
    digits.unshift(remaining % 20)    // prepend (highest place first)
    remaining = Math.floor(remaining / 20)

return digits.join(',')
```

### toArabic (encoded string → Arabic)

```
if input === "shell": return 0

digits = input.split(',').map(Number)
result = 0
for each digit in digits:
    result = result * 20 + digit
return result
```

---

## Known Edge Cases

- **Zero exists**: Mayan is the only system in this app with a genuine zero representation. `fromArabic(0)` returns `"shell"` (not `"∅"`).
- **No fractions**: Mayan did not use this system for fractions. See [[Design Decisions#DD-003]].
- **Maximum in range**: 3,999 = [9][19][19]₂₀ (three positions)
- **Intermediate zeros**: 400 = [1][0][0] → `"1,0,0"`. `MayanSvg` must render a shell glyph for a 0-digit within a multi-digit number.
- **Max single digit**: 19 (3 bars + 4 dots). No digit can be 20 or above.
- **Calendar confusion**: The Long Count uses ×18 for position 1, not ×20. Our system is purely mathematical. Tests should verify 360 ≠ 18×20 in our system (360 = 18×20 in calendar; in our system, 360 = [18][0]).

---

## SVG Rendering

See [[Rendering Strategy]] for complete SVG spec.

The `MayanSvg` component receives the comma-separated encoded string and renders each digit as a stacked glyph:

**Dot:** filled circle, ~8px diameter
**Bar:** filled rectangle, ~40px × 6px
**Shell:** oval outline with interior crescent (SVG path), ~40px × 24px

**Per-digit layout:**
- Bars rendered first (bottom of the digit cell), stacked upward
- Dots rendered above bars, in rows of up to 4 (left to right)
- Max 3 bars + 4 dots per digit = 19

**Multi-digit layout:**
- Digits stacked vertically, highest digit at top
- Separator line or gap between digits
- Container grows upward with digit count

**Digit cells** for reference:
| Digit | Bars | Dots |
|---|---|---|
| 0 | — | — (shell glyph) |
| 1 | 0 | 1 |
| 4 | 0 | 4 |
| 5 | 1 | 0 |
| 9 | 1 | 4 |
| 10 | 2 | 0 |
| 14 | 2 | 4 |
| 15 | 3 | 0 |
| 19 | 3 | 4 |

---

## Test Cases

| Arabic | Encoded | Breakdown |
|---|---|---|
| 0 | shell | zero — Mayan has genuine zero |
| 1 | "1" | single dot |
| 5 | "5" | single bar |
| 19 | "19" | three bars + four dots |
| 20 | "1,0" | 1×20 + 0 |
| 21 | "1,1" | 1×20 + 1 |
| 40 | "2,0" | 2×20 + 0 |
| 400 | "1,0,0" | 1×400 + 0 + 0 — tests intermediate zeros |
| 819 | "2,0,19" | 2×400 + 0×20 + 19 — tests zero in middle position |
| 3999 | "9,19,19" | maximum |

---

## Unicode Details

Mayan numerals have no reliable Unicode representation. The Unicode character U+1D2E0–U+1D2F3 block (Mayan Numerals) was added in Unicode 11.0, but font support is nearly nonexistent.

**Rendering approach:** SVG only. See [[Rendering Strategy]] and [[Design Decisions]] for rationale.

---

## Related Notes

- [[Rendering Strategy]] — dot/bar/shell SVG geometry
- [[Agent Map]] — Renderer agent owns MayanSvg.tsx
- [[Converter Interface]] — comma-separated output format contract
- [[Design Decisions#DD-010]] — pure base-20, not Long Count calendar
