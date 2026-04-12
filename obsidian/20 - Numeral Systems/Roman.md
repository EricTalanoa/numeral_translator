# Roman Numerals

## How the System Works

Roman numerals are a decimal additive/subtractive system using seven letter symbols. Numbers are formed by writing symbols from largest to smallest, left to right. Subtractive notation allows a smaller symbol placed before a larger one to represent their difference.

**Symbols:**
| Symbol | Value |
|---|---|
| I | 1 |
| V | 5 |
| X | 10 |
| L | 50 |
| C | 100 |
| D | 500 |
| M | 1000 |

**Subtractive pairs (the only legal subtractive combinations):**
| Notation | Value |
|---|---|
| IV | 4 |
| IX | 9 |
| XL | 40 |
| XC | 90 |
| CD | 400 |
| CM | 900 |

Rules:
- I, X, C, M can repeat up to 3 times in a row
- V, L, D never repeat
- Only I before V/X, X before L/C, and C before D/M are valid subtractive pairs

---

## Conversion Algorithm

### fromArabic (Arabic → Roman)

Greedy subtraction using a value table (descending order):

```
[(1000,'M'), (900,'CM'), (500,'D'), (400,'CD'),
 (100,'C'), (90,'XC'), (50,'L'), (40,'XL'),
 (10,'X'), (9,'IX'), (5,'V'), (4,'IV'), (1,'I')]
```

```
result = ""
for each (value, symbol) in table:
    while n >= value:
        result += symbol
        n -= value
return result
```

### toArabic (Roman → Arabic)

```
map = {I:1, V:5, X:10, L:50, C:100, D:500, M:1000}
result = 0
for i in range(len(s)):
    if i+1 < len(s) and map[s[i]] < map[s[i+1]]:
        result -= map[s[i]]   // subtractive
    else:
        result += map[s[i]]   // additive
return result
```

Input should be uppercased before parsing.

---

## Known Edge Cases

- **No zero**: Roman has no representation for 0. Return `"∅"` sentinel.
- **Maximum**: 3,999 = MMMCMXCIX. This is the upper bound for our app.
- **Minimum**: I (1). Zero is not representable.
- **Subtractive pairs only**: `IC` for 99 is invalid; correct form is `XCIX`.
- **Case insensitivity**: Accept both uppercase and lowercase in `toArabic`.
- **Invalid input**: `toArabic("IIII")` — technically invalid by classical rules, but some medieval uses allowed it. For strict v1: reject strings not produced by `fromArabic`.

---

## Test Cases

| Arabic | Roman | Notes |
|---|---|---|
| 1 | I | minimum |
| 4 | IV | subtractive I |
| 9 | IX | subtractive I |
| 14 | XIV | |
| 40 | XL | subtractive X |
| 44 | XLIV | |
| 90 | XC | subtractive X |
| 400 | CD | subtractive C |
| 900 | CM | subtractive C |
| 1994 | MCMXCIV | classic test case |
| 3999 | MMMCMXCIX | maximum |
| 0 | ∅ | no representation |

---

## Unicode / Rendering

Roman numerals use standard ASCII Latin letters (I, V, X, L, C, D, M). No special font needed. Render in any monospace or serif font.

Unicode does have Roman numeral codepoints (U+2160–U+2188: Ⅰ, Ⅱ, Ⅲ, etc.) but these are compatibility characters for legacy encodings. Do not use them — they're single characters for composed forms and would complicate `toArabic` parsing.

---

## Related Notes

- [[Converter Interface]] — function signatures
- [[Architecture]] — where roman.ts lives
- [[Design Decisions#DD-001]] — why max is 3,999
