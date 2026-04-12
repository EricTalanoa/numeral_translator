# Attic Greek Numerals

## How the System Works

The Attic (or Herodianic) numeral system is an **acrophonic** system — symbols are the first letters of the Greek words for those numbers. It predates the Ionian alphabetic system and was used in Athens through roughly the 3rd century BCE.

**Base symbols:**
| Symbol | Value | Greek word | Notes |
|---|---|---|---|
| Ι | 1 | — | iota (vertical stroke) |
| Π | 5 | πέντε (pente) | sometimes written as Γ in older inscriptions |
| Δ | 10 | δέκα (deka) | |
| Η | 100 | ἑκατόν (hekaton) | |
| Χ | 1,000 | χίλιοι (khilioi) | |
| Μ | 10,000 | μύριοι (myrioi) | beyond our range |

**Composite symbols (Π as multiplier):**
A special Π-composite symbol represents 5× the base value. In Unicode we render these as letter sequences:

| Sequence | Value | Meaning |
|---|---|---|
| ΠΔ | 50 | 5 × 10 |
| ΠΗ | 500 | 5 × 100 |
| ΠΧ | 5,000 | 5 × 1,000 — beyond our range |

The composite symbols historically look like a Π with a smaller Δ, Η, or Χ inside them. In our app we render them as two-letter sequences (see [[Design Decisions#DD-009]]).

**Numbers are written largest symbol first, left to right.**

---

## Conversion Algorithm

### fromArabic (Arabic → Attic)

Greedy subtraction. Values in descending order for range 1–3,999:

```
table = [
  (1000, 'Χ'),
  (500,  'ΠΗ'),
  (100,  'Η'),
  (50,   'ΠΔ'),
  (10,   'Δ'),
  (5,    'Π'),
  (1,    'Ι')
]

result = ""
for each (value, symbol) in table:
    while n >= value:
        result += symbol
        n -= value
return result
```

### toArabic (Attic → Arabic)

Parse the string, recognizing both single and two-character symbols. Check for two-character composites first:

```
symbolValues = {
  'ΠΧ': 5000,  // only needed if extending beyond 3999
  'ΠΗ': 500,
  'ΠΔ': 50,
  'Χ': 1000,
  'Η': 100,
  'Δ': 10,
  'Π': 5,
  'Ι': 1
}

result = 0
i = 0
while i < len(s):
    // Try two-character composite first
    if i+1 < len(s) and s[i:i+2] in symbolValues:
        result += symbolValues[s[i:i+2]]
        i += 2
    elif s[i] in symbolValues:
        result += symbolValues[s[i]]
        i += 1
    else:
        throw Error("Cannot parse: " + s[i])
return result
```

---

## Known Edge Cases

- **No zero**: Attic has no zero symbol. `fromArabic(0)` returns `"∅"`.
- **Max**: 3,999 = ΧΧΧΠΗΗΗΗΠΔΔΔΔΠΙΙΙΙ
  - 3×1000 = ΧΧΧ
  - 500 = ΠΗ
  - 4×100 = ΗΗΗΗ
  - 50 = ΠΔ
  - 4×10 = ΔΔΔΔ
  - 5 = Π
  - 4×1 = ΙΙΙΙ
- **Composite ambiguity**: When parsing, "ΠΗ" must be read as the composite (500) not as Π(5) + Η(100) = 105. The greedy two-character check solves this.
- **No subtractive notation**: Unlike Roman, Attic is purely additive.
- **Unicode overlap**: Attic uses standard capital Greek letters. These are the same code points as regular Greek capitals (Χ = chi = U+03A7, Η = eta = U+0397, etc.), so no special font is needed, but the context (tile label) makes clear these are numerals.
- **Tile legend**: The UI should display a small legend for the Attic tile explaining Π = 5× multiplier, since "ΠΗ" would otherwise look like Greek text.

---

## Test Cases

| Arabic | Attic | Breakdown |
|---|---|---|
| 1 | Ι | one stroke |
| 5 | Π | pente |
| 9 | ΠΙΙΙΙ | 5 + 4 |
| 10 | Δ | deka |
| 50 | ΠΔ | composite 50 |
| 99 | ΠΔΔΔΔΠΙΙΙΙ | 50+40+5+4 |
| 100 | Η | hekaton |
| 500 | ΠΗ | composite 500 |
| 999 | ΠΗΗΗΗΠΔΔΔΔΠΙΙΙΙ | 500+400+50+40+5+4 |
| 1000 | Χ | khilioi |
| 1776 | ΧΧΧΧΧΧΧΔΔΔΔΔΠΔΔΠΙ | wait, let me recalc: 1776 = 1000+700+70+6 = Χ + ΠΗ+ΗΗ + ΠΔ+ΔΔΔΔ + ΠΙ |
| 1776 | ΧΠΗΗΗΠΔΔΔΔΔΠΙ | 1000+500+200+50+20+5+1 |
| 3999 | ΧΧΧΠΗΗΗΗΠΔΔΔΔΠΙΙΙΙ | maximum |
| 0 | ∅ | no representation |

Note on 1776: 1776 = 1×1000 + 7×100 + 7×10 + 6×1 = Χ + ΗΗΗΗΗΗΗ + ΔΔΔΔΔΔΔ + ΠΙΙΙΙ... but greedy gives: Χ(1000) + ΠΗ(500) + ΗΗ(200) + ΠΔ(50) + ΔΔΔΔ(40) ... wait, 7×10=70 = ΠΔ + ΔΔΔΔ = 50+20 ✓; 6×1 = ΠΙ = 5+1 ✓. So 1776 = Χ ΠΗ ΗΗ ΠΔ ΔΔΔΔ Π Ι.

---

## Unicode Details

All symbols are standard capital Greek letters in U+0370–U+03FF:
- Ι (iota): U+0399
- Π (pi): U+03A0
- Δ (delta): U+0394
- Η (eta): U+0397
- Χ (chi): U+03A7

No special font needed. System fonts support these universally.

The Unicode Ancient Greek Numbers block (U+10140–U+1018F) contains dedicated Attic numeral codepoints (e.g., U+10140 = 1, U+10141 = 5, U+10142 = 10...) but these have essentially no font support and should not be used.

---

## Related Notes

- [[Ionian Greek]] — the alphabetic Greek numeral system (later, uses all 27 letters)
- [[Converter Interface]] — function signatures
- [[Design Decisions#DD-009]] — why we use letter sequences for compound symbols
