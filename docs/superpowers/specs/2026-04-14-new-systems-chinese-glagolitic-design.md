# Design: Chinese Traditional & Glagolitic Numeral Systems
**Date:** 2026-04-14
**Phase:** 3 (alongside QA)
**Status:** Approved

---

## Summary

Add two new numeral systems as tiles 8 and 9 in the OutputGrid:

1. **Chinese Traditional** — literary multiplicative notation used in classical Chinese mathematics (Qin Jiushao, 13th c.). Digit characters multiply place-value characters; 零 bridges internal zero runs.
2. **Glagolitic** — alphabetic additive numeral system of the earliest Slavic script. Each of 36 Glagolitic letters represents a positional value (units/tens/hundreds/thousands), concatenated largest-to-smallest.

Both systems follow the existing `Converter` interface with no interface changes. No new SVG renderers are needed; all glyphs are BMP Unicode.

---

## Architecture

### Files added
| File | Purpose |
|---|---|
| `src/converters/chinese-traditional.ts` | `fromArabic` / `toArabic` for Chinese Traditional |
| `src/converters/glagolitic.ts` | `fromArabic` / `toArabic` for Glagolitic |
| `tests/converters/chinese-traditional.test.ts` | Converter test suite (TDD) |
| `tests/converters/glagolitic.test.ts` | Converter test suite (TDD) |

### Files modified
| File | Change |
|---|---|
| `src/converters/index.ts` | Append two entries to CONVERTERS array |
| `src/vision/vision-client.ts` | Add `systemHint` cases for both systems |
| `src/styles/main.css` | Add font-family rules for `.chineseTraditional` and `.glagolitic` CSS classes |

### OutputGrid
The grid uses `auto-fill minmax(160px, 1fr)`. Going from 7 → 9 tiles requires no layout changes.

### RangeModal
Driven entirely by CONVERTERS. No changes needed; new rows appear automatically.

---

## Chinese Traditional Numeral System

### Identity
- **id:** `chineseTraditional`
- **label:** `Chinese Traditional`
- **maxValue:** `9_999_999`
- **zero:** `"∅"` (no representation)

### Character set
```
DIGITS     = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九']
ONES_PLACE = ['', '', '十', '百', '千']   // index = digit count in sub-group
ZERO_CHAR  = '零'   // U+96F6
WAN        = '萬'   // U+842C  — 10,000 group separator
```

### `fromArabic(n)` algorithm
1. Guard: `n < 0 || n > 9_999_999` → throw. `n === 0` → `"∅"`.
2. Split into two 4-digit groups: `wanPart = floor(n / 10_000)`, `remainder = n % 10_000`.
3. Convert each 4-digit group with `convertSubGroup(g)`:
   - Extract thousands, hundreds, tens, ones digits.
   - For each non-zero digit, append `DIGITS[digit] + place_char` (千/百/十/nothing for ones).
   - If there is a zero gap between two non-zero digits within the group, insert exactly one 零.
   - **Leading-一 rule:** drop 一 before 十 only when 十 is the very first character of the entire output string (e.g., 10 → 十, 100,000 → 十萬; but 110 → 一百一十 keeps the 一).
4. If `wanPart > 0`: result = `convertSubGroup(wanPart) + '萬'`.
5. If `remainder > 0`:
   - If `wanPart > 0` and the leading digit of `remainder` is zero (i.e., `remainder < 1000`), prepend one 零.
   - Append `convertSubGroup(remainder)`.
6. Return result.

### `fromArabic` examples
| Arabic | Chinese Traditional |
|---|---|
| 1 | 一 |
| 10 | 十 |
| 42 | 四十二 |
| 100 | 一百 |
| 103 | 一百零三 |
| 1000 | 一千 |
| 1001 | 一千零一 |
| 9999 | 九千九百九十九 |
| 10000 | 一萬 |
| 10003 | 一萬零三 |
| 100000 | 十萬 |
| 1000000 | 一百萬 |
| 1234567 | 一百二十三萬四千五百六十七 |
| 9999999 | 九百九十九萬九千九百九十九 |

### `toArabic(s)` algorithm
Build a reverse map of character → value, covering all DIGITS × ONES_PLACE pairs and 萬. Scan left-to-right, accumulating with standard multiplicative parsing:
- Maintain a running subtotal within the current 萬-group.
- On seeing 萬: multiply running subtotal by 10,000 and add to total; reset subtotal.
- On seeing 零: skip (no-op).
- On seeing a place character (千/百/十): multiply the last digit by its place value.
- On seeing a digit character alone (ones): add directly.

Throw on unknown characters or fractions.

### Font
Chinese Traditional glyphs (一–九, 十, 百, 千, 萬, 零) are in the CJK Unified Ideographs block (U+4E00–U+9FFF, all BMP). Every system font on Windows, macOS, and Linux includes them. No `@font-face` needed.

CSS class: `.chineseTraditional { font-family: var(--font-display); font-size: 20px; }`
(Smaller than Egyptian/Unicode default because CJK characters are intrinsically wider.)

---

## Glagolitic Numeral System

### Identity
- **id:** `glagolitic`
- **label:** `Glagolitic`
- **maxValue:** `9_999`
- **zero:** `"∅"` (no representation)

### Character set
36 lowercase Glagolitic letters in Unicode order (U+2C30–U+2C53):

```
UNITS     = ['', 'ⰰ', 'ⰱ', 'ⰲ', 'ⰳ', 'ⰴ', 'ⰵ', 'ⰶ', 'ⰷ', 'ⰸ']  // U+2C30–2C38 = 1–9
TENS      = ['', 'ⰹ', 'ⰺ', 'ⰻ', 'ⰼ', 'ⰽ', 'ⰾ', 'ⰿ', 'ⱀ', 'ⱁ']  // U+2C39–2C41 = 10–90
HUNDREDS  = ['', 'ⱂ', 'ⱃ', 'ⱄ', 'ⱅ', 'ⱆ', 'ⱇ', 'ⱈ', 'ⱉ', 'ⱊ']  // U+2C42–2C4A = 100–900
THOUSANDS = ['', 'ⱋ', 'ⱌ', 'ⱍ', 'ⱎ', 'ⱏ', 'ⱐ', 'ⱑ', 'ⱒ', 'ⱓ']  // U+2C4B–2C53 = 1000–9000
```

### `fromArabic(n)` algorithm
1. Guard: `n < 0 || n > 9_999` → throw. `n === 0` → `"∅"`.
2. Extract: `t = floor(n / 1000)`, `h = floor((n % 1000) / 100)`, `d = floor((n % 100) / 10)`, `u = n % 10`.
3. Return `THOUSANDS[t] + HUNDREDS[h] + TENS[d] + UNITS[u]` (empty strings for zero digits collapse automatically).

### `fromArabic` examples
| Arabic | Glagolitic |
|---|---|
| 1 | ⰰ |
| 9 | ⰸ |
| 10 | ⰹ |
| 42 | ⰼⰲ |
| 100 | ⱂ |
| 999 | ⱊⱁⰸ |
| 1000 | ⱋ |
| 9000 | ⱓ |
| 9999 | ⱓⱊⱁⰸ |

### `toArabic(s)` algorithm
Build a single reverse map from each glyph character → its value. Iterate over the string (standard `for...of` for codepoint safety), summing values. Throw on any unknown character or if input contains `.`.

### Font
Glagolitic U+2C30–U+2C5F is in the BMP and is covered by **Segoe UI Historic** (included with Windows 10/11) and **Noto Sans Glagolitic**. No bundled font file needed for Windows users. macOS/Linux users may see tofu without a web font.

CSS class: `.glagolitic { font-family: 'Segoe UI Historic', var(--font-display); font-size: 24px; }`

If rendering proves insufficient across platforms during QA, add a Google Fonts import for Noto Sans Glagolitic.

---

## Testing Strategy

Both converters use the existing TDD pattern: write all tests first (red), then implement (green). Tests live in `tests/converters/`.

### Chinese Traditional test cases
- `fromArabic`: 1, 9, 10, 42, 100, 103, 999, 1000, 1001, 9999, 10000, 10003, 99999, 100000, 1000000, 1234567, 9999999
- `fromArabic` error cases: -1, 10000000, 3.5
- `toArabic`: round-trip all `fromArabic` cases above

### Glagolitic test cases
- `fromArabic`: 1, 9, 10, 42, 100, 999, 1000, 9000, 9999
- `fromArabic` error cases: -1, 10000, 3.5
- `toArabic`: round-trip all `fromArabic` cases above

---

## Vision hints (vision-client.ts)

```
case 'Chinese Traditional':
  return 'Classical Chinese numerals use characters: 一(1) 二(2) 三(3) 四(4) 五(5) 六(6) 七(7) 八(8) 九(9) 十(10) 百(100) 千(1000) 萬(10000). Numbers are written largest-to-smallest; 零 marks a zero gap.'

case 'Glagolitic':
  return 'Glagolitic numerals use Glagolitic script letters additively, largest to smallest. The first 9 letters equal 1–9, the next 9 equal 10–90, the next 9 equal 100–900, and the next 9 equal 1000–9000.'
```

---

## Definition of Done
- 267 + N tests passing (N = new test count for both converters)
- TypeScript clean (`npx tsc --noEmit` zero errors)
- Both tiles visible in OutputGrid for any value in range
- Out-of-range tiles show "out of range" correctly (NumeralTile preflight uses `maxValue`)
- ⓘ RangeModal shows 9 rows automatically
- Photo mode has hints for both new systems
