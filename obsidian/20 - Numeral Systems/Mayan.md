# Mayan Numerals

## How the System Works

The Maya used a **vigesimal (base-20) positional** numeral system with one irregularity — one of the earliest fully positional systems with a genuine zero. The system was used for arithmetic, astronomical calculations, and the Long Count calendar.

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

**Positional structure — Long Count place values:**

| Position | Name | Place value | Base step |
|---|---|---|---|
| 0 (bottom) | k'in | 1 | — |
| 1 | winal | 20 | ×20 |
| 2 | tun | 360 | ×18 (18 winals = 1 tun) |
| 3 | k'atun | 7,200 | ×20 |
| 4 | b'ak'tun | 144,000 | ×20 |

The winal→tun step is **×18**, not ×20 — this is the key irregularity. All other steps are ×20.

Numbers are written **vertically**, with the lowest place at the bottom and higher places stacked above.

See [[Design Decisions#DD-010]].

---

## Converter Output Format

`fromArabic` returns a **comma-separated string of digits**, highest place first:

```
fromArabic(3999)   → "11,1,19"        // 11×360 + 1×20 + 19
fromArabic(360)    → "1,0,0"          // 1 tun
fromArabic(400)    → "1,2,0"          // 1×360 + 2×20 + 0
fromArabic(20)     → "1,0"            // 1×20 + 0
fromArabic(19)     → "19"             // just ones place
fromArabic(0)      → "shell"          // special zero sentinel
fromArabic(999999) → "6,18,17,13,19" // max value
```

The `MayanSvg` component parses this and renders each digit as dots-and-bars, stacking them vertically.

---

## Conversion Algorithm

### fromArabic (Arabic → encoded string)

```
if n === 0: return "shell"

digits = []
remaining = n

// k'in (pos 0): base 20
digits.unshift(remaining % 20)
remaining = floor(remaining / 20)

if remaining > 0:
    // winal (pos 1): base 18
    digits.unshift(remaining % 18)
    remaining = floor(remaining / 18)

    // tun and higher (pos 2+): base 20
    while remaining > 0:
        digits.unshift(remaining % 20)
        remaining = floor(remaining / 20)

return digits.join(',')
```

### toArabic (encoded string → Arabic)

```
if input === "shell": return 0

digits = input.split(',').map(Number)
n = digits.length

place_value(pos_from_right):
    if pos == 0: return 1
    if pos == 1: return 20
    return 360 * 20^(pos - 2)

return sum of digits[i] * place_value(n - 1 - i)
```

Validation: winal digit (second from right) must be 0–17; all others 0–19.

---

## Known Edge Cases

- **Zero exists**: Mayan is the only system in this app with a genuine zero. `fromArabic(0)` returns `"shell"` (not `"∅"`).
- **No fractions**: out of scope for v1. See [[Design Decisions#DD-003]].
- **Winal max is 17**: Unlike all other positions (max digit 19), the winal position caps at 17. `toArabic` throws on winal ≥ 18.
- **Intermediate zeros**: 360 = [1][0][0] → `"1,0,0"`. `MayanSvg` renders a shell glyph for 0-digits inside multi-digit numbers.
- **Max single digit**: 19 (3 bars + 4 dots). No digit can be 20 or above.

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
- Gap between digit cells
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
| 0 | shell | zero — genuine Mayan zero |
| 1 | "1" | single dot |
| 5 | "5" | single bar |
| 19 | "19" | three bars + four dots |
| 20 | "1,0" | 1×20 + 0 |
| 21 | "1,1" | 1×20 + 1 |
| 40 | "2,0" | 2×20 + 0 |
| 360 | "1,0,0" | 1 tun (1×360) |
| 400 | "1,2,0" | 1×360 + 2×20 + 0 |
| 819 | "2,4,19" | 2×360 + 4×20 + 19 |
| 3999 | "11,1,19" | 11×360 + 1×20 + 19 |
| 999999 | "6,18,17,13,19" | maximum value |

---

## Unicode Details

Mayan numerals have no reliable Unicode representation. The Unicode character U+1D2E0–U+1D2F3 block (Mayan Numerals) was added in Unicode 11.0, but font support is nearly nonexistent.

**Rendering approach:** SVG only. See [[Rendering Strategy]] and [[Design Decisions]] for rationale.

---

## Related Notes

- [[Rendering Strategy]] — dot/bar/shell SVG geometry
- [[Agent Map]] — Renderer agent owns MayanSvg.tsx
- [[Converter Interface]] — comma-separated output format contract
- [[Design Decisions#DD-010]] — Long Count positional system
