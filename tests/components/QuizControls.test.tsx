import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuizControls } from '../../src/components/QuizControls'
import { CONVERTERS } from '../../src/converters/index'

const allIds = CONVERTERS.map(c => c.id)

describe('QuizControls', () => {
  it('renders all 10 system checkboxes', () => {
    render(<QuizControls checkedIds={allIds} onToggle={vi.fn()} onReset={vi.fn()} />)
    expect(screen.getAllByRole('checkbox')).toHaveLength(10)
  })

  it('checked systems have checked checkboxes', () => {
    render(<QuizControls checkedIds={['roman']} onToggle={vi.fn()} onReset={vi.fn()} />)
    expect(screen.getByLabelText('Roman')).toBeChecked()
    expect(screen.getByLabelText('Mayan')).not.toBeChecked()
  })

  it('calls onToggle with system id when a checked checkbox is clicked', () => {
    const onToggle = vi.fn()
    render(<QuizControls checkedIds={allIds} onToggle={onToggle} onReset={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('Roman'))
    expect(onToggle).toHaveBeenCalledWith('roman')
  })

  it('does not call onToggle when clicking the last remaining checked system', () => {
    const onToggle = vi.fn()
    render(<QuizControls checkedIds={['roman']} onToggle={onToggle} onReset={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('Roman'))
    expect(onToggle).not.toHaveBeenCalled()
  })

  it('calls onReset when Reset Score button is clicked', () => {
    const onReset = vi.fn()
    render(<QuizControls checkedIds={allIds} onToggle={vi.fn()} onReset={onReset} />)
    fireEvent.click(screen.getByRole('button', { name: /reset score/i }))
    expect(onReset).toHaveBeenCalled()
  })
})
