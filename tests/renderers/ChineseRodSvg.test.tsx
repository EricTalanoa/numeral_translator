import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ChineseRodSvg } from '../../src/renderers/ChineseRodSvg'
import { fromArabic } from '../../src/converters/chinese-rod'

describe('ChineseRodSvg', () => {
  it('SVG height is always 80 at scale 1', () => {
    const { container } = render(<ChineseRodSvg encoded={fromArabic(1)} />)
    expect(container.querySelector('svg')!.getAttribute('height')).toBe('80')
  })

  it('vert-1 cell renders exactly 1 line', () => {
    // fromArabic(1) → single vert-1 glyph = 1 vertical line
    const { container } = render(<ChineseRodSvg encoded={fromArabic(1)} />)
    expect(container.querySelectorAll('line')).toHaveLength(1)
  })

  it('vert-9 cell renders 5 lines (1 crossbar + 4 verticals)', () => {
    // fromArabic(9) → single vert-9 glyph = 1 horizontal crossbar + 4 vertical lines
    const { container } = render(<ChineseRodSvg encoded={fromArabic(9)} />)
    expect(container.querySelectorAll('line')).toHaveLength(5)
  })

  it('101 renders a circle for the zero placeholder', () => {
    // fromArabic(101) → 3 cells: vert-1, zero (〇), vert-1
    const { container } = render(<ChineseRodSvg encoded={fromArabic(101)} />)
    expect(container.querySelector('circle')).not.toBeNull()
  })

  it('42 renders both vertical (white) and horizontal (gold) stroke colors', () => {
    // 42 = horiz-4 (tens) + vert-2 (ones) → both colors present
    const { container } = render(<ChineseRodSvg encoded={fromArabic(42)} />)
    const lines = container.querySelectorAll('line')
    const strokes = Array.from(lines).map(l => l.getAttribute('stroke'))
    expect(strokes).toContain('#e0e0e0')  // vertical (white)
    expect(strokes).toContain('#f0c060')  // horizontal (gold)
  })

  it('SVG width is 48 × cell count at scale 1', () => {
    // 42 → 2 cells → width 96
    const { container } = render(<ChineseRodSvg encoded={fromArabic(42)} />)
    expect(container.querySelector('svg')!.getAttribute('width')).toBe('96')
  })

  it('SVG width scales with scale prop', () => {
    const { container: c1 } = render(<ChineseRodSvg encoded={fromArabic(42)} scale={1} />)
    const { container: c3 } = render(<ChineseRodSvg encoded={fromArabic(42)} scale={3} />)
    const w1 = Number(c1.querySelector('svg')!.getAttribute('width'))
    const w3 = Number(c3.querySelector('svg')!.getAttribute('width'))
    expect(w3).toBe(w1 * 3)
  })

  it('renders without crashing for 1492 (4 cells)', () => {
    const { container } = render(<ChineseRodSvg encoded={fromArabic(1492)} />)
    expect(container.querySelector('svg')!.getAttribute('width')).toBe('192')
  })
})
