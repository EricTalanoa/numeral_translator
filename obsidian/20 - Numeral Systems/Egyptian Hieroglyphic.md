# Egyptian Hieroglyphic Numerals

## How the System Works

Egyptian hieroglyphic numerals are a **decimal, additive, non-positional** system. Each power of ten has its own symbol. To write a number, you write as many of each symbol as needed. Order doesn't matter mathematically, but Egyptians typically wrote from largest to smallest (right-to-left in most texts, though the system itself is symmetric).

**Symbols (within our range 1–3,999):**

| Value | Hieroglyph | Gardiner Ref | Unicode | Description |
|---|---|---|---|---|
| 1 | 𓏺 | Z1 | U+133FA | Single vertical stroke |
| 10 | 𓎆 | V20 | U+13386 | Cattle hobble / heel bone (arch shape) |
| 100 | 𓍢 | V1 | U+13362 | Coil of rope |
| 1,000 | 𓆼 | M12 | U+131BC | Lotus / water lily |

Higher values (10,000 = pointing finger D50; 100,000 = tadpole I8; 1,000,000 = man with raised arms A28) are beyond our 3,999 ceiling and not needed.

**Unicode block:** Egyptian Hieroglyphs — U+13000 to U+1342F (Supplementary Multilingual Plane)
**Required font:** Noto Sans Egyptian Hieroglyphs

---

## Conversion Algorithm

### fromArabic (Arabic → Hieroglyphic)

```
symbols = [(1000, '𓆼'), (100, '𓍢'), (10, '𓎆'), (1, '𓏺')]  // U+131BC, U+13362, U+13386, U+133FA
result = ""
for each (value, glyph) in symbols:
    count = Math.floor(n / value)
    result += glyph.repeat(count)
    n = n % value
return result
```

The maximum repetition is 9 (e.g., 9,000 = nine lotus flowers — but our ceiling is 3,999, so 3 lotus flowers max).

### toArabic (Hieroglyphic → Arabic)

```
glyphValues = { '𓆼': 1000, '𓍢': 100, '𓎆': 10, '𓏺': 1 }  // U+131BC, U+13362, U+13386, U+133FA
result = 0
for each char in input:
    if char in glyphValues:
        result += glyphValues[char]
    else:
        throw Error("Cannot parse: unexpected character")
return result
```

Because the system is purely additive, order doesn't matter — just sum all symbol values.

---

## Known Edge Cases

- **No zero**: Egyptian has no symbol or concept for zero. `fromArabic(0)` returns `"∅"`.
- **No place value**: 11 is 𓎆𓏻 (ten + one), not a positional digit. No confusion between digit 1 and value 1.
- **No subtraction**: Unlike Roman, there are no subtractive pairs. 9 is 𓎆𓏻𓏻𓏻𓏻𓏻𓏻𓏻𓏻𓏻 (one ten + nine ones).
- **Max in range**: 3,999 = 𓆼𓆼𓆼𓍢𓍢𓍢𓍢𓍢𓍢𓍢𓍢𓍢𓎆𓎆𓎆𓎆𓎆𓎆𓎆𓎆𓎆𓏻𓏻𓏻𓏻𓏻𓏻𓏻𓏻𓏻 (three thousand + nine hundred + nine ten + nine ones)
- **Font loading**: The hieroglyphic Unicode block requires Noto Sans Egyptian Hieroglyphs. See [[Architecture#Font Loading]] for the loading gate strategy.
- **Direction**: Hieroglyphs were written right-to-left, left-to-right, or boustrophedon depending on context. For display purposes, render left-to-right (largest to smallest).

---

## Test Cases

| Arabic | Hieroglyphic | Notes |
|---|---|---|
| 1 | 𓏺 | U+133FA single stroke |
| 10 | 𓎆 | U+13386 single hobble |
| 100 | 𓍢 | U+13362 single rope coil |
| 1000 | 𓆼 | U+131BC single lotus |
| 23 | 𓎆𓎆𓏺𓏺𓏺 | 2 tens + 3 ones |
| 305 | 𓍢𓍢𓍢𓏺𓏺𓏺𓏺𓏺 | 3 hundreds + 5 ones |
| 1492 | 𓆼𓍢𓍢𓍢𓍢𓎆𓎆𓎆𓎆𓎆𓎆𓎆𓎆𓎆𓏺𓏺 | 1492 CE (historical date) |
| 3999 | 𓆼𓆼𓆼𓍢𓍢𓍢𓍢𓍢𓍢𓍢𓍢𓍢𓎆𓎆𓎆𓎆𓎆𓎆𓎆𓎆𓎆𓏺𓏺𓏺𓏺𓏺𓏺𓏺𓏺𓏺 | maximum (3×1000 + 9×100 + 9×10 + 9×1) |
| 0 | ∅ | no representation |

---

## Unicode Details

- **Block:** Egyptian Hieroglyphs (U+13000–U+1342F)
- **Z1 (stroke = 1):** U+133FA 𓏺 — "logogram (one, sole) : wꜥ"
- **V20 (hobble = 10):** U+13386 𓎆 — "logogram (10) : mḏ"
- **V1 (rope coil = 100):** U+13362 𓍢 — "logogram (100) : šn.t"
- **M12 (lotus = 1,000):** U+131BC 𓆼 — "lotus/water lily : ḫꜣ"

Codepoints verified against the Unicode names list (unicode.org/charts/nameslist/n_13000.html).

**Font:** Self-host `NotoSansEgyptianHieroglyphs-Regular.ttf` in `public/fonts/`. Declare with `@font-face` in `main.css`. Use CSS Font Loading API to gate the tile display until the font is ready.

---

## Related Notes

- [[Converter Interface]] — function signatures
- [[Rendering Strategy]] — font loading details
- [[Architecture#Font Loading]]
- [[Design Decisions#DD-002]] — zero handling
