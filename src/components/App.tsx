import { useState } from 'react'
import { CONVERTERS } from '../converters/index'
import { ControlPanel } from './ControlPanel'
import { OutputGrid } from './OutputGrid'
import { RangeModal } from './RangeModal'
import { QuizControls } from './QuizControls'
import { QuizPanel } from './QuizPanel'

type Mode = 'translate' | 'quiz'

export default function App() {
  const [value, setValue] = useState<number | null>(null)
  const [showRanges, setShowRanges] = useState(false)
  const [mode, setMode] = useState<Mode>('translate')
  const [checkedSystemIds, setCheckedSystemIds] = useState<string[]>(
    CONVERTERS.map(c => c.id)
  )
  const [quizResetKey, setQuizResetKey] = useState(0)

  function toggleSystem(id: string) {
    setCheckedSystemIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function resetQuiz() {
    setQuizResetKey(k => k + 1)
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="app-title-row">
          <span className="app-title">Numeral Translator</span>
          <button
            className="range-info-btn"
            onClick={() => setShowRanges(true)}
            title="View system ranges"
          >
            ⓘ
          </button>
        </div>
        <div className="mode-tabs">
          <button
            className={`mode-tab${mode === 'translate' ? ' active' : ''}`}
            onClick={() => setMode('translate')}
          >
            Translate
          </button>
          <button
            className={`mode-tab${mode === 'quiz' ? ' active' : ''}`}
            onClick={() => setMode('quiz')}
          >
            Quiz
          </button>
        </div>
        {mode === 'translate'
          ? <ControlPanel onResult={setValue} />
          : <QuizControls
              checkedIds={checkedSystemIds}
              onToggle={toggleSystem}
              onReset={resetQuiz}
            />
        }
      </aside>
      <main className="tile-area">
        {mode === 'translate'
          ? <OutputGrid value={value} />
          : <QuizPanel key={quizResetKey} checkedIds={checkedSystemIds} />
        }
      </main>
      {showRanges && <RangeModal onClose={() => setShowRanges(false)} />}
    </div>
  )
}
