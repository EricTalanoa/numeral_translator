import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { NumeralDisplay } from '../../src/components/NumeralDisplay'
import { CONVERTERS } from '../../src/converters/index'
import type { Converter } from '../../src/converters/index'

const roman      = CONVERTERS.find(c => c.id === 'roman')!
const mayan      = CONVERTERS.find(c => c.id === 'mayan')!
const babylonian = CONVERTERS.find(c => c.id === 'babylonian')!
const chineseRod = CONVERTERS.find(c => c.id === 'chineseRod')!
const egyptian   = CONVERTERS.find(c => c.id === 'egyptian')!

describe('NumeralDisplay', () => {
  it('renders a span with system class for a text system', () => {
    const { container } = render(<NumeralDisplay system={roman} value={42} />)
    const span = container.querySelector('.tile-numeral.roman')
    expect(span).not.toBeNull()
    expect(span!.textContent).toBe('XLII')
  })

  it('renders an SVG for mayan', () => {
    const { container } = render(<NumeralDisplay system={mayan} value={1} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('renders an SVG for babylonian', () => {
    const { container } = render(<NumeralDisplay system={babylonian} value={1} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('renders an SVG for chineseRod', () => {
    const { container } = render(<NumeralDisplay system={chineseRod} value={1} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('renders tile-no-rep for ∅ output', () => {
    const nullSystem: Converter = { ...roman, fromArabic: () => '∅' }
    const { container } = render(<NumeralDisplay system={nullSystem} value={1} />)
    expect(container.querySelector('.tile-no-rep')).not.toBeNull()
  })

  it('renders loading text for egyptian when fontReady is false', () => {
    const { getByText } = render(
      <NumeralDisplay system={egyptian} value={1} fontReady={false} />
    )
    expect(getByText('Loading font…')).toBeInTheDocument()
  })

  it('renders a span with system class for egyptian when fontReady is true', () => {
    const { container } = render(
      <NumeralDisplay system={egyptian} value={1} fontReady={true} />
    )
    expect(container.querySelector('.tile-numeral.egyptian')).not.toBeNull()
  })
})
