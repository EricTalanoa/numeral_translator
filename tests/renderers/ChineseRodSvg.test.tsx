import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ChineseRodSvg } from '../../src/renderers/ChineseRodSvg'
import { fromArabic } from '../../src/converters/chinese-rod'

describe('ChineseRodSvg', () => {
  it('renders without crashing for 1', () => {
    const { container } = render(<ChineseRodSvg encoded={fromArabic(1)} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })
  it('renders without crashing for 9', () => {
    const { container } = render(<ChineseRodSvg encoded={fromArabic(9)} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })
  it('renders without crashing for 42', () => {
    const { container } = render(<ChineseRodSvg encoded={fromArabic(42)} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })
  it('renders without crashing for 1492', () => {
    const { container } = render(<ChineseRodSvg encoded={fromArabic(1492)} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })
  it('renders without crashing for 101 (has zero placeholder)', () => {
    const { container } = render(<ChineseRodSvg encoded={fromArabic(101)} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })
  it('SVG width scales with scale prop', () => {
    const { container: c1 } = render(<ChineseRodSvg encoded={fromArabic(42)} scale={1} />)
    const { container: c3 } = render(<ChineseRodSvg encoded={fromArabic(42)} scale={3} />)
    const w1 = Number(c1.querySelector('svg')!.getAttribute('width'))
    const w3 = Number(c3.querySelector('svg')!.getAttribute('width'))
    expect(w3).toBe(w1 * 3)
  })
})
