# Chinese Rod Numerals

## How the System Works

Chinese rod numerals (算籌, suànchóu) were the positional decimal system used by Chinese mathematicians from at least the Warring States period (475–221 BCE) through the Ming dynasty. Numbers were computed using physical counting rods laid on a flat surface.

**Key property:** The system alternates orientation between adjacent digit positions to visually distinguish them. Ones, hundreds, ten-thousands... use **vertical** rods. Tens, thousands, hundred-thousands... use **horizontal** rods.

**Vertical digits (odd positions: 1s, 100s, 10000s...):**
| Value | Description | Unicode |
|---|---|---|
| 1 | One vertical rod | 𝍠 (U+1D360) |
| 2 | Two vertical rods | 𝍡 (U+1D361) |
| 3 | Three vertical rods | 𝍢 (U+1D362) |
| 4 | Four vertical rods | 𝍣 (U+1D363) |
| 5 | Five vertical rods (bundle) | 𝍤 (U+1D364) |
| 6 | One horizontal rod on top + one vertical below | 𝍥 (U+1D365) |
| 7 | One horizontal + two vertical | 𝍦 (U+1D366) |
| 8 | One horizontal + three vertical | 𝍧 (U+1D367) |
| 9 | One horizontal + four vertical | 𝍨 (U+1D368) |

**Horizontal digits (even positions: 10s, 1000s, 100000s...):**
| Value | Description | Unicode |
|---|---|---|
| 1 | One horizontal rod | 𝍩 (U+1D369) |
| 2 | Two horizontal rods | 𝍪 (U+1D36A) |
| 3 | Three horizontal rods | 𝍫 (U+1D36B) |
| 4 | Four horizontal rods | 𝍬 (U+1D36C) |
| 5 | Five horizontal rods | 𝍭 (U+1D36D) |
| 6 | One vertical rod on top + one horizontal below | 𝍮 (U+1D36E) |
| 7 | One vertical + two horizontal | 𝍯 (U+1D36F) |
| 8 | One vertical + three horizontal | 𝍰 (U+1D370) |
| 9 | One vertical + four horizontal | 𝍱 (U+1D371) |

**Unicode block:** Counting Rod Numerals — U+1D360 to U+1D371 (Supplementary Multilingual Plane)

---

## Conversion Algorithm

### fromArabic (Arabic → rod numeral string)

```
verticalGlyphs   = ['', '𝍠', '𝍡', '𝍢', '𝍣', '𝍤', '𝍥', '𝍦', '𝍧', '𝍨']
horizontalGlyphs = ['', '𝍩', '𝍪', '𝍫', '𝍬', '𝍭', '𝍮', '𝍯', '𝍰', '𝍱']

// Zero digit: use a middle dot or space placeholder
ZERO_PLACEHOLDER = '〇'  // U+3007 IDEOGRAPHIC NUMBER ZERO

digits = []
temp = n
while temp > 0:
    digits.unshift(temp % 10)
    temp = Math.floor(temp / 10)

result = ""
for i in range(len(digits)):
    position = len(digits) - 1 - i    // position 0 = ones (rightmost)
    digit = digits[i]
    if digit === 0:
        result += ZERO_PLACEHOLDER
    elif position % 2 === 0:           // even position: vertical
        result += verticalGlyphs[digit]
    else:                              // odd position: horizontal
        result += horizontalGlyphs[digit]

return result
```

### toArabic (rod string → Arabic)

Build reverse lookup maps:

```
vertMap   = { '𝍠':1,'𝍡':2,'𝍢':3,'𝍣':4,'𝍤':5,'𝍥':6,'𝍦':7,'𝍧':8,'𝍨':9 }
horizMap  = { '𝍩':1,'𝍪':2,'𝍫':3,'𝍬':4,'𝍭':5,'𝍮':6,'𝍯':7,'𝍰':8,'𝍱':9 }
ZERO_CHARS = new Set(['〇', ' '])  // accept both

result = 0
for i, char in enumerate(s):
    result *= 10
    if char in ZERO_CHARS:
        result += 0
    elif char in vertMap:
        result += vertMap[char]
    elif char in horizMap:
        result += horizMap[char]
    else:
        throw Error("Cannot parse: " + char)
return result
```

Note: `toArabic` doesn't need to check alternating orientation — both maps cover all values 1–9, and position is tracked implicitly by the decimal multiplication.

---

## Known Edge Cases

- **No zero in original system**: The classical rod system had no zero glyph — an empty space was left. We use 〇 (U+3007, IDEOGRAPHIC NUMBER ZERO) as a zero-digit placeholder within a multi-digit number for legibility.
- **`fromArabic(0)`**: Returns `"∅"` (the sentinel) since the number zero itself has no rod representation.
- **Alternating orientation is per digit position, not per digit value**: 3,999 has digits [3,9,9,9] at positions [thousands, hundreds, tens, ones]. Positions: ones (0) = vertical, tens (1) = horizontal, hundreds (2) = vertical, thousands (3) = horizontal.
- **Max in range**: 3,999 → digits [3,9,9,9]:
  - 3 at position 3 (thousands, horizontal): 𝍫
  - 9 at position 2 (hundreds, vertical): 𝍨
  - 9 at position 1 (tens, horizontal): 𝍱
  - 9 at position 0 (ones, vertical): 𝍨
  - Result: 𝍫𝍨𝍱𝍨
- **Intermediate zeros**: 101 → [1,0,1] at positions [hundreds, tens, ones] = 𝍠 〇 𝍠. The zero placeholder is essential for maintaining positional meaning.
- **Font support**: U+1D360–U+1D371 requires a font with SMP (Supplementary Multilingual Plane) coverage. Noto Sans supports this block. Fallback gracefully if not available (render using CSS or image fallback).

---

## Test Cases

| Arabic | Rod Numerals | Notes |
|---|---|---|
| 1 | 𝍠 | single vertical rod (ones position) |
| 9 | 𝍨 | nine in vertical orientation |
| 10 | 𝍩 | single horizontal rod (tens position) |
| 11 | 𝍩𝍠 | 1 horizontal + 1 vertical |
| 99 | 𝍱𝍨 | 9 horizontal + 9 vertical |
| 100 | 𝍢〇 | 3 vertical (hundreds) + zero (tens) — wait, 100 is just the hundreds digit |
| 100 | 𝍢〇〇 | actually: 100 = [1,0,0] → 𝍩〇〇? No: hundreds position is position 2 (even = vertical). 100 = 1 at position 2 → 𝍠, then two zeros → 𝍠〇〇 |
| 101 | 𝍠〇𝍠 | 1(H:vert) 0(T:horiz) 1(O:vert) |
| 1000 | 𝍩〇〇〇 | 1 at thousands (position 3, horizontal): 𝍩 |
| 1234 | 𝍩𝍢𝍫𝍣 | 1(horiz) 2(vert) 3(horiz) 4(vert) |
| 3999 | 𝍫𝍨𝍱𝍨 | maximum — 3(horiz) 9(vert) 9(horiz) 9(vert) |
| 0 | ∅ | no representation (zero as a number has no rod form) |

---

## Unicode Details

- **Block:** Counting Rod Numerals, U+1D360–U+1D371
- Vertical digits: U+1D360–U+1D368 (values 1–9)
- Horizontal digits: U+1D369–U+1D371 (values 1–9)
- Zero digit placeholder: U+3007 (〇, IDEOGRAPHIC NUMBER ZERO) — widely supported
- No Unicode character for "zero rods" in the Counting Rod block itself

**Font:** Noto Sans or any font covering the SMP Counting Rod block. Unlike Egyptian Hieroglyphics, this block is small (18 characters) and loading overhead is minimal.

---

## Historical Note

Chinese rod numerals directly influenced the development of Chinese written mathematics and are the precursor to the decimal positional system that spread globally. The alternating orientation rule was a clever solution to positional ambiguity without a zero symbol — similar to how Babylonian scribes left gaps. The zero placeholder 〇 came later (Tang dynasty, ~600 CE) and resolved the ambiguity completely.

---

## Related Notes

- [[Converter Interface]] — function signatures and alternating orientation contract
- [[Design Decisions#DD-006]] — why counting rods (not Suzhou or standard Chinese)
- [[Rendering Strategy]] — font loading for SMP characters
