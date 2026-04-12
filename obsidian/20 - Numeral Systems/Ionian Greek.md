# Ionian (Milesian) Greek Numerals

## How the System Works

The Ionian numeral system (also called Milesian or alphabetic) uses the 24 letters of the Greek alphabet plus 3 archaic letters as number symbols. Each letter represents a specific value; numbers are written as combinations of letters (one per decimal digit), with no repetition of a letter within a number.

**Units (ones):**
| Letter | Value | Unicode |
|---|---|---|
| α (alpha) | 1 | U+03B1 |
| β (beta) | 2 | U+03B2 |
| γ (gamma) | 3 | U+03B3 |
| δ (delta) | 4 | U+03B4 |
| ε (epsilon) | 5 | U+03B5 |
| ϛ (stigma/digamma) | 6 | U+03DB |
| ζ (zeta) | 7 | U+03B6 |
| η (eta) | 8 | U+03B7 |
| θ (theta) | 9 | U+03B8 |

**Tens:**
| Letter | Value | Unicode |
|---|---|---|
| ι (iota) | 10 | U+03B9 |
| κ (kappa) | 20 | U+03BA |
| λ (lambda) | 30 | U+03BB |
| μ (mu) | 40 | U+03BC |
| ν (nu) | 50 | U+03BD |
| ξ (xi) | 60 | U+03BE |
| ο (omicron) | 70 | U+03BF |
| π (pi) | 80 | U+03C0 |
| ϟ (qoppa/koppa) | 90 | U+03DF |

**Hundreds:**
| Letter | Value | Unicode |
|---|---|---|
| ρ (rho) | 100 | U+03C1 |
| σ (sigma) | 200 | U+03C3 |
| τ (tau) | 300 | U+03C4 |
| υ (upsilon) | 400 | U+03C5 |
| φ (phi) | 500 | U+03C6 |
| χ (chi) | 600 | U+03C7 |
| ψ (psi) | 700 | U+03C8 |
| ω (omega) | 800 | U+03C9 |
| ϡ (sampi) | 900 | U+03E1 |

**Thousands (1,000–3,000):**
Place the lower numeral sign ͵ (U+0375, GREEK LOWER NUMERAL SIGN) before the units letter:
- ͵α = 1,000
- ͵β = 2,000
- ͵γ = 3,000

**Keraia** (ʹ, U+02B9 MODIFIER LETTER PRIME): Appended after the final letter to mark the sequence as a numeral (not a word). E.g., αʹ = 1, not the word fragment "a".

---

## Conversion Algorithm

### fromArabic (Arabic → Ionian)

```
thousands  = ['', '͵α', '͵β', '͵γ']
hundreds   = ['', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω', 'ϡ']
tens       = ['', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ϟ']
units      = ['', 'α', 'β', 'γ', 'δ', 'ε', 'ϛ', 'ζ', 'η', 'θ']

t = Math.floor(n / 1000)
h = Math.floor((n % 1000) / 100)
d = Math.floor((n % 100) / 10)
u = n % 10

result = thousands[t] + hundreds[h] + tens[d] + units[u]
return result + 'ʹ'   // append keraia
```

### toArabic (Ionian → Arabic)

Build a reverse lookup map from letter to value:

```
letterToValue = {
  'α':1,'β':2,'γ':3,'δ':4,'ε':5,'ϛ':6,'ζ':7,'η':8,'θ':9,
  'ι':10,'κ':20,'λ':30,'μ':40,'ν':50,'ξ':60,'ο':70,'π':80,'ϟ':90,
  'ρ':100,'σ':200,'τ':300,'υ':400,'φ':500,'χ':600,'ψ':700,'ω':800,'ϡ':900
}
```

Strip the trailing keraia (ʹ) if present. Strip any leading ͵ signs and track the thousands multiplier. Sum values.

Parsing algorithm:
```
Strip trailing ʹ
result = 0
i = 0
while i < len(s):
    if s[i] == '͵':
        i++
        result += letterToValue[s[i]] * 1000
    else:
        result += letterToValue[s[i]]
    i++
return result
```

---

## Known Edge Cases

- **No zero**: No letter corresponds to zero. `fromArabic(0)` returns `"∅"`.
- **Archaic letters**: ϛ (stigma, U+03DB), ϟ (koppa, U+03DF), ϡ (sampi, U+03E1) must be included. These are not in everyday modern Greek but are in the Unicode Greek block.
- **Thousands notation**: The lower numeral sign ͵ is a combining-like character (U+0375). In `fromArabic`, prepend it directly before the units letter with no space.
- **Keraia placement**: Always the last character. Strip it before parsing in `toArabic`.
- **Max**: 3,999 = ͵γϡϟθʹ (3000 + 900 + 90 + 9)
- **Ambiguity with words**: Without the keraia, `αβ` could be a word beginning. The keraia is essential for `fromArabic` output; `toArabic` should accept input with or without it.
- **Case**: The system traditionally uses lowercase letters. `toArabic` should also accept uppercase (α→Α) with a case-insensitive map.

---

## Test Cases

| Arabic | Ionian | Notes |
|---|---|---|
| 1 | αʹ | minimum |
| 6 | ϛʹ | archaic stigma |
| 9 | θʹ | |
| 10 | ιʹ | |
| 90 | ϟʹ | archaic koppa |
| 99 | ϟθʹ | 90 + 9 |
| 100 | ρʹ | |
| 900 | ϡʹ | archaic sampi |
| 1000 | ͵αʹ | thousands prefix |
| 1776 | ͵αψοϛʹ | 1000+700+70+6 |
| 3999 | ͵γϡϟθʹ | maximum |
| 0 | ∅ | no representation |

---

## Unicode Details

All required characters are in the standard Greek Unicode block (U+0370–U+03FF) plus:
- U+0375 (͵) — GREEK LOWER NUMERAL SIGN (thousands marker)
- U+02B9 (ʹ) — MODIFIER LETTER PRIME (keraia)
- U+03DB (ϛ) — GREEK SMALL LETTER STIGMA
- U+03DF (ϟ) — GREEK SMALL LETTER KOPPA
- U+03E1 (ϡ) — GREEK SMALL LETTER SAMPI

These are all in the Basic Multilingual Plane and supported by standard system fonts. No special font loading required.

---

## Related Notes

- [[Attic Greek]] — the other Greek numeral system (acrophonic, not alphabetic)
- [[Converter Interface]] — function signatures
- [[Design Decisions#DD-002]] — zero handling
