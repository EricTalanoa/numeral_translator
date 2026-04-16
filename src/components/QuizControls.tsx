import { CONVERTERS } from '../converters/index'

interface QuizControlsProps {
  checkedIds: string[]
  onToggle: (id: string) => void
  onReset: () => void
}

export function QuizControls({ checkedIds, onToggle, onReset }: QuizControlsProps) {
  return (
    <div className="quiz-controls">
      <div className="input-label">SYSTEMS</div>
      <div className="quiz-systems">
        {CONVERTERS.map(c => (
          <label key={c.id} className="quiz-system-label" htmlFor={`quiz-sys-${c.id}`}>
            <input
              id={`quiz-sys-${c.id}`}
              type="checkbox"
              checked={checkedIds.includes(c.id)}
              onChange={() => {
                if (checkedIds.length === 1 && checkedIds.includes(c.id)) return
                onToggle(c.id)
              }}
            />
            {c.label}
          </label>
        ))}
      </div>
      <button className="quiz-reset-btn" onClick={onReset}>Reset Score</button>
    </div>
  )
}
