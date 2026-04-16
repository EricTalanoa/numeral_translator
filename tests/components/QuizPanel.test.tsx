import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuizPanel, generateQuestion } from '../../src/components/QuizPanel'
import { CONVERTERS } from '../../src/converters/index'

const allIds = CONVERTERS.map(c => c.id)
const roman = CONVERTERS.find(c => c.id === 'roman')!

describe('generateQuestion', () => {
  it('returns a system from the checked pool', () => {
    const result = generateQuestion(['roman'])
    expect(result.system.id).toBe('roman')
  })

  it('returns value between 1 and system.maxValue inclusive', () => {
    for (let i = 0; i < 30; i++) {
      const { system, value } = generateQuestion(['roman'])
      expect(value).toBeGreaterThanOrEqual(1)
      expect(value).toBeLessThanOrEqual(system.maxValue)
    }
  })

  it('never returns value 0', () => {
    for (let i = 0; i < 30; i++) {
      expect(generateQuestion(['roman']).value).not.toBe(0)
    }
  })

  it('only picks systems from the checked pool', () => {
    for (let i = 0; i < 30; i++) {
      const { system } = generateQuestion(['roman', 'egyptian'])
      expect(['roman', 'egyptian']).toContain(system.id)
    }
  })
})

describe('QuizPanel', () => {
  // Lock Math.random to 0 → roman system (pool[0]), value = floor(0 × 3999)+1 = 1
  // roman.fromArabic(1) = 'I'

  it('renders the system name', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    render(<QuizPanel checkedIds={['roman']} />)
    expect(screen.getByText('Roman')).toBeInTheDocument()
    vi.restoreAllMocks()
  })

  it('shows score 0 / 0 initially', () => {
    render(<QuizPanel checkedIds={['roman']} />)
    expect(screen.getByText('0 / 0')).toBeInTheDocument()
  })

  it('shows correct feedback and increments score for correct answer', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)  // roman, value = 1
    render(<QuizPanel checkedIds={['roman']} />)
    fireEvent.change(screen.getByPlaceholderText('Arabic value'), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    expect(screen.getByText(/✓ Correct — 1/)).toBeInTheDocument()
    expect(screen.getByText('1 / 1')).toBeInTheDocument()
    vi.restoreAllMocks()
  })

  it('shows wrong feedback with the correct value for a wrong answer', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)  // roman, value = 1
    render(<QuizPanel checkedIds={['roman']} />)
    fireEvent.change(screen.getByPlaceholderText('Arabic value'), { target: { value: '99' } })
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    expect(screen.getByText(/✗ Wrong — answer: 1/)).toBeInTheDocument()
    expect(screen.getByText('0 / 1')).toBeInTheDocument()
    vi.restoreAllMocks()
  })

  it('shows Next Question button in feedback phase', () => {
    render(<QuizPanel checkedIds={['roman']} />)
    fireEvent.change(screen.getByPlaceholderText('Arabic value'), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    expect(screen.getByRole('button', { name: /next question/i })).toBeInTheDocument()
  })

  it('returns to question phase after Next Question', () => {
    render(<QuizPanel checkedIds={['roman']} />)
    fireEvent.change(screen.getByPlaceholderText('Arabic value'), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    fireEvent.click(screen.getByRole('button', { name: /next question/i }))
    expect(screen.queryByText(/✓|✗/)).not.toBeInTheDocument()
    expect(screen.getByPlaceholderText('Arabic value')).toBeInTheDocument()
  })

  it('submits on Enter keydown', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)  // roman, value = 1
    render(<QuizPanel checkedIds={['roman']} />)
    fireEvent.change(screen.getByPlaceholderText('Arabic value'), { target: { value: '1' } })
    fireEvent.keyDown(screen.getByPlaceholderText('Arabic value'), { key: 'Enter' })
    expect(screen.getByText(/✓ Correct — 1/)).toBeInTheDocument()
    vi.restoreAllMocks()
  })

  it('score resets on remount', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)  // roman, value = 1
    const { unmount } = render(<QuizPanel checkedIds={['roman']} />)
    fireEvent.change(screen.getByPlaceholderText('Arabic value'), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    expect(screen.getByText('1 / 1')).toBeInTheDocument()
    unmount()
    render(<QuizPanel checkedIds={['roman']} />)
    expect(screen.getByText('0 / 0')).toBeInTheDocument()
    vi.restoreAllMocks()
  })
})
