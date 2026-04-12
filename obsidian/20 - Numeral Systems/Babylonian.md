# Babylonian Numerals

## How the System Works

Babylonian numerals are a **base-60 (sexagesimal) positional** system, developed in Mesopotamia during the Old Babylonian period (roughly 2000–1600 BCE). It is one of the earliest known positional numeral systems.

**Two basic symbols:**
| Symbol | Value | Cuneiform | Unicode |
|---|---|---|---|
| Vertical wedge (DIŠ) | 1 | 𒁹 | U+12079 |
| Corner wedge (U) | 10 | 𒌋 | U+1230B |

Each sexagesimal "digit" (group) can be 1–59, represented by combining up to five 10-symbols and up to nine 1-symbols:
- 1 = 𒁹
- 10 = 𒌋
- 11 = 𒌋𒁹
- 59 = 𒌋𒌋𒌋𒌋𒌋𒁹𒁹𒁹𒁹𒁹𒁹𒁹𒁹𒁹 (five 10s + nine 1s)

**Positional structure (within our range):**

| Position | Place value | Example |
|---|---|---|
| 0 (rightmost) | 1 | the ones group |
| 1 | 60 | the sixties group |
| 2 | 3,600 | the 3600s group |

3,999 uses three positions: 3999 = 1×3600 + 6×60 + 39×1

**Zero:** Early Babylonian had no zero — an empty group was represented by a gap or omission. Around 400 BCE a placeholder sign 𒑊 (U+1244A) appeared. For this app, `fromArabic(0)` returns `"∅"` since we represent the early classical system.

---

## Converter Output Format

Because rendering is handled by `BabylonianSvg` (not the converter), `fromArabic` returns a **pipe-separated string of sexagesimal group values**:

```
fromArabic(3999) → "1|6|39"    // [3600s group]|[60s group]|[1s group]
fromArabic(60)   → "1|0"       // 1×60 + 0×1
fromArabic(1)    → "1"         // just the ones group
fromArabic(0)    → "∅"
```

The `BabylonianSvg` component parses this string and renders each group as clusters of wedge shapes.

---

## Conversion Algorithm

### fromArabic (Arabic → encoded string)

```
if n === 0: return "∅"

groups = []
remaining = n
while remaining > 0:
    groups.unshift(remaining % 60)   // prepend (highest place first)
    remaining = Math.floor(remaining / 60)

return groups.join('|')
```

### toArabic (encoded string → Arabic)

The `toArabic` function parses the pipe-separated format back to an integer:

```
if input === "∅": return 0

groups = input.split('|').map(Number)
result = 0
for each group in groups:
    result = result * 60 + group
return result
```

For `toArabic` handling actual cuneiform characters (photo input path): count vertical wedges (𒁹) for ones and corner wedges (𒌋) for tens within each group, separated by the implicit positional structure.

---

## Known Edge Cases

- **No zero (classical)**: `fromArabic(0)` returns `"∅"`.
- **Positional ambiguity**: Without a zero placeholder, 60 and 3600+0+0 look the same (one wedge). In our encoding, the pipe-separated format makes groups explicit.
- **Max in range**: 3,999 = [1][6][39] — three sexagesimal groups
- **Single group numbers**: 1–59 have just one group: `"1"` through `"59"`
- **60**: `"1|0"` — two groups, with a zero in the ones place. Since we represent zero groups as the numeral 0 in our encoding, `BabylonianSvg` must handle a group value of 0 (render an empty/zero marker).
- **No fractions**: Babylonian did have sexagesimal fractions (like the Plimpton 322 tablet), but these are out of scope. See [[Design Decisions#DD-003]].

---

## SVG Rendering

See [[Rendering Strategy]] for full SVG spec.

The `BabylonianSvg` component receives the pipe-separated encoded string and renders each group as:
- Corner wedge symbols (𒌋-shape): one per 10 in the group (up to 5, arranged in rows of up to 3)
- Vertical wedge symbols (𒁹-shape): one per 1 in the group (up to 9)
- Groups separated by a visual gap/divider

SVG geometry:
- Vertical wedge: a narrow downward-pointing triangle or wedge polygon, ~4px wide × 16px tall
- Corner wedge: an L-shaped or angular notch, ~10px wide × 8px tall
- Groups laid out left to right, highest place first

Unicode cuneiform exists (U+12000–U+1247F) but is not used for rendering — font support is near-zero in practice. See [[Design Decisions#DD-008]].

---

## Test Cases

| Arabic | Encoded | Groups | Notes |
|---|---|---|---|
| 1 | "1" | [1] | minimum |
| 10 | "10" | [10] | |
| 59 | "59" | [59] | max single group |
| 60 | "1\|0" | [1,0] | first two-group number |
| 61 | "1\|1" | [1,1] | |
| 120 | "2\|0" | [2,0] | |
| 3600 | "1\|0\|0" | [1,0,0] | first three-group number |
| 3661 | "1\|1\|1" | [1,1,1] | 3600+60+1 |
| 3999 | "1\|6\|39" | [1,6,39] | 3600+360+39, maximum |
| 0 | ∅ | — | no representation |

---

## Unicode Details

The Cuneiform block (U+12000–U+12399) and Cuneiform Numbers block (U+12400–U+1247F) contain the relevant characters, but they are **not used for rendering** due to absent font support. SVG is used instead. The Unicode values are documented here for reference:
- U+12079 𒁹 = one vertical wedge (value 1)
- U+1230B 𒌋 = one corner wedge (value 10)
- U+1244A 𒑊 = zero placeholder (later period; not used in our app)

---

## Related Notes

- [[Rendering Strategy]] — SVG wedge geometry spec
- [[Agent Map]] — Renderer agent owns BabylonianSvg.tsx
- [[Converter Interface]] — pipe-separated output format contract
- [[Design Decisions#DD-008]] — why SVG over Unicode
