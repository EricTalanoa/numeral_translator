# Rendering Strategy

Per-system decisions on how to display numeral output.

---

## Summary Table

| System | Approach | Font Required | Notes |
|---|---|---|---|
| Egyptian Hieroglyphic | Unicode | Noto Sans Egyptian Hieroglyphs | Font loading gate required |
| Ionian Greek | Unicode | System font | Standard Greek + a few archaic chars |
| Attic Greek | Unicode | System font | Standard Greek capital letters |
| Babylonian | SVG | None | Unicode exists but no font support |
| Roman | Plain text (ASCII) | None | Simple ASCII letters |
| Mayan | SVG | None | No reliable Unicode |
| Chinese Rod | Unicode | Noto Sans (SMP) | Block U+1D360–U+1D371 |

---

## Egyptian Hieroglyphic

**Approach:** Unicode characters from the Egyptian Hieroglyphs block (U+13000–U+1342F).

**Font setup:**
```css
@font-face {
  font-family: 'NotoSansEgyptianHieroglyphs';
  src: url('/fonts/NotoSansEgyptianHieroglyphs-Regular.ttf') format('truetype');
  font-display: swap;
}

.tile-egyptian span {
  font-family: 'NotoSansEgyptianHieroglyphs', serif;
  font-size: 1.8rem;
}
```

**Font loading gate (in NumeralTile):**
```ts
const [fontReady, setFontReady] = useState(false)

useEffect(() => {
  document.fonts.load('1em NotoSansEgyptianHieroglyphs').then(() => {
    setFontReady(true)
  })
}, [])

// Render:
if (system.id === 'egyptian' && !fontReady) {
  return <span className="font-loading">Loading font…</span>
}
```

**File:** Self-host `NotoSansEgyptianHieroglyphs-Regular.ttf` in `public/fonts/`.
Download from Google Fonts (Noto fonts, open source, OFL licensed).

---

## Ionian Greek

**Approach:** Unicode — all characters in the standard Greek block (U+0370–U+03FF) plus a few special chars.

**Special characters needed:**
- ϛ U+03DB (stigma, = 6)
- ϟ U+03DF (koppa, = 90)
- ϡ U+03E1 (sampi, = 900)
- ͵ U+0375 (lower numeral sign, thousands marker)
- ʹ U+02B9 (modifier letter prime, keraia)

**Font:** System fonts (Arial, Times, or any Greek-enabled font) cover U+0370–U+03FF. No special font loading needed. Test on Windows/Mac/Linux to confirm stigma, koppa, sampi render — these are less common but present in most Unicode-capable fonts.

**CSS:**
```css
.tile-ionian span {
  font-family: 'Noto Serif', 'Times New Roman', Georgia, serif;
  font-size: 1.6rem;
}
```

---

## Attic Greek

**Approach:** Unicode — standard Greek capital letters only.

**Characters used:** Ι (U+0399), Π (U+03A0), Δ (U+0394), Η (U+0397), Χ (U+03A7)

**Font:** Any system font. These are among the most universally supported Greek characters.

**UI note:** The tile should include a legend: "Composite: ΠΔ=50, ΠΗ=500" so the user understands the Π-multiplier convention. Add this as a `<details>` element or tooltip below the numeral output.

**CSS:**
```css
.tile-attic span {
  font-family: 'Noto Serif', 'Times New Roman', Georgia, serif;
  font-size: 1.8rem;
  letter-spacing: 0.1em;
}
```

---

## Babylonian

**Approach:** SVG rendered by `BabylonianSvg.tsx`.

**Input format:** Pipe-separated sexagesimal groups from the converter (e.g., `"1|6|39"`).

**SVG geometry spec:**

*Vertical wedge (value 1):*
- Shape: narrow downward-pointing wedge
- SVG polygon: approximately `"8,0 4,16 12,16"` (triangle, 8px wide, 16px tall)
- Fill: `#4a3728` (dark brown/clay color)

*Corner wedge (value 10):*
- Shape: L-shaped notch (looks like a right-angle bracket ⌐ or angular C)
- SVG path: `"M 0,0 L 12,0 L 12,4 L 4,4 L 4,14 L 0,14 Z"` (approximately)
- Fill: `#4a3728`

*Layout per group:*
- Tens row: up to 5 corner wedges, displayed left to right (max: 5 × 10 = 50)
- Ones row: up to 9 vertical wedges, displayed left to right
- Row spacing: 4px gap between tens and ones rows
- Group cell: fixed width ~80px, height ~40px

*Multi-group layout:*
- Groups laid out left to right (highest group on left)
- Separator between groups: 12px gap or thin vertical line

*Whole component:* Returns an inline `<svg>` that expands width based on group count.

---

## Roman

**Approach:** Plain ASCII text. No special rendering needed.

```css
.tile-roman span {
  font-family: 'Times New Roman', Georgia, serif;
  font-size: 2rem;
  letter-spacing: 0.05em;
}
```

---

## Mayan

**Approach:** SVG rendered by `MayanSvg.tsx`.

**Input format:** Comma-separated vigesimal digits, highest first (e.g., `"9,19,19"`). Special value `"shell"` for zero.

**SVG geometry spec:**

*Constants:*
- `CELL_WIDTH = 60`
- `CELL_HEIGHT = 50`
- `DOT_RADIUS = 6`
- `BAR_HEIGHT = 8`
- `BAR_WIDTH = 50`

*Shell glyph (digit 0):*
- Outer ellipse: cx=30, cy=25, rx=20, ry=12, fill none, stroke dark
- Inner crescent: arc path creating a curved gap inside the ellipse

*Bar (represents 5):*
- `<rect x=5 y={baseY} width=50 height=8 rx=2 fill="#2d4a1e" />`
- Bars stack upward; bottommost bar at cell baseline

*Dot (represents 1):*
- `<circle cx={x} cy={y} r=6 fill="#2d4a1e" />`
- Dots arranged left to right in row(s) above the bars
- Max 4 dots per row

*Per-digit cell layout:*
1. Start at cell bottom
2. Draw `Math.floor(digit / 5)` bars, stacking upward (each bar 8px + 3px gap)
3. Draw `digit % 5` dots in a row above the bars (centered)

*Multi-digit layout:*
- Digits stacked vertically, highest place at top
- 6px separator gap between digit cells
- Total SVG height = `(number of digits) × CELL_HEIGHT + gaps`

---

## Chinese Rod Numerals

**Approach:** Unicode from the Counting Rod Numerals block (U+1D360–U+1D371).

**Font:** Noto Sans (or similar font with SMP Counting Rod coverage). Unlike Egyptian, this block is tiny (18 characters), so a full Noto Sans load is practical. Alternatively, load a subset font.

**Zero digit placeholder:** 〇 (U+3007, IDEOGRAPHIC NUMBER ZERO) — widely supported in CJK fonts.

**CSS:**
```css
.tile-chinese-rod span {
  font-family: 'Noto Sans', 'Arial Unicode MS', sans-serif;
  font-size: 1.8rem;
  letter-spacing: 0.2em;
}
```

**Font loading:** Use `document.fonts.load('1em "Noto Sans"')` if needed. Counting rod glyphs may display as boxes on systems without SMP font coverage; add a note to the tile: "Requires a Unicode SMP font (Noto Sans)."

---

## SVG Color Palette

For visual consistency across SVG-rendered systems:
- Babylonian wedges: `#4a3728` (clay tablet brown)
- Mayan dots/bars: `#2d4a1e` (dark forest green, referencing bark paper/jade)
- Background of SVG tiles: transparent (inherits tile background)

---

## Related Notes

- [[Architecture#Font Loading]]
- [[Design Decisions#DD-008]] — Babylonian SVG rationale
- [[Design Decisions#DD-009]] — Attic letter sequences
- [[Babylonian]] — converter output format for BabylonianSvg
- [[Mayan]] — converter output format for MayanSvg
