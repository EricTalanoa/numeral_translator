import { useState, useEffect } from 'react'
import { CONVERTERS, type Converter } from '../converters/index'
import { NumeralDisplay } from './NumeralDisplay'

interface QuizPanelProps {
  checkedIds: string[]
}

type Phase =
  | { tag: 'question'; system: Converter; value: number }
  | { tag: 'feedback'; system: Converter; value: number; correct: boolean }

export function generateQuestion(checkedIds: string[]): { system: Converter; value: number } {
  const pool = CONVERTERS.filter(c => checkedIds.includes(c.id))
  const system = pool[Math.floor(Math.random() * pool.length)]
  const value = Math.floor(Math.random() * system.maxValue) + 1
  return { system, value }
}

export function QuizPanel({ checkedIds }: QuizPanelProps) {
  const [phase, setPhase] = useState<Phase>(() => {
    const q = generateQuestion(checkedIds)
    return { tag: 'question', ...q }
  })
  const [userInput, setUserInput] = useState('')
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [fontReady, setFontReady] = useState(false)

  useEffect(() => {
    const id = phase.system.id
    if (id !== 'egyptian' && id !== 'oldChurchSlavonic') return
    const fontName = id === 'egyptian' ? 'NotoSansEgyptianHieroglyphs' : 'PonomarUnicode'
    if (document.fonts.check(`1em ${fontName}`)) { setFontReady(true); return }
    document.fonts.load(`1em ${fontName}`)
      .then(() => setFontReady(true))
      .catch(() => setFontReady(true))
  }, [phase.system.id])

  function handleSubmit() {
    if (phase.tag !== 'question') return
    const parsed = parseInt(userInput.trim(), 10)
    const correct = !isNaN(parsed) && parsed === phase.value
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    setPhase({ tag: 'feedback', system: phase.system, value: phase.value, correct })
  }

  function handleNext() {
    const q = generateQuestion(checkedIds)
    setPhase({ tag: 'question', ...q })
    setUserInput('')
    setFontReady(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && phase.tag === 'question') handleSubmit()
  }

  return (
    <div className="quiz-panel">
      <div className="quiz-card">
        <div className="quiz-score">{score.correct} / {score.total}</div>
        <div className="quiz-system-name">{phase.system.label}</div>
        <div className="quiz-numeral-area">
          <NumeralDisplay
            system={phase.system}
            value={phase.value}
            scale={2}
            fontReady={fontReady}
          />
        </div>
        {phase.tag === 'question' && (
          <>
            <input
              className="quiz-input"
              type="text"
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Arabic value"
              autoComplete="off"
            />
            <button className="quiz-submit" onClick={handleSubmit}>
              Submit
            </button>
          </>
        )}
        {phase.tag === 'feedback' && (
          <>
            <div className={`quiz-feedback ${phase.correct ? 'correct' : 'wrong'}`}>
              {phase.correct
                ? `✓ Correct — ${phase.value}`
                : `✗ Wrong — answer: ${phase.value}`
              }
            </div>
            <button className="quiz-next" onClick={handleNext}>
              Next Question
            </button>
          </>
        )}
      </div>
    </div>
  )
}
