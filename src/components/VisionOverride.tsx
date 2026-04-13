import { useState } from 'react'
import { parseInputValue } from './InputPanel'

interface VisionOverrideProps {
  onResult: (n: number) => void
}

export function VisionOverride({ onResult }: VisionOverrideProps) {
  const [raw, setRaw] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = parseInputValue(raw)
    if (result.error) {
      setError(result.error)
      return
    }
    if (result.value !== null) onResult(result.value)
  }

  return (
    <div className="vision-override">
      <p className="vision-override-message">
        Vision couldn't read the image — enter the value manually.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className={`numeral-input${error ? ' has-error' : ''}`}
          value={raw}
          onChange={e => { setRaw(e.target.value); setError(null) }}
          placeholder="Enter number"
          autoComplete="off"
        />
        {error && <p className="input-error">{error}</p>}
        <button type="submit" className="submit-btn" style={{ marginTop: '8px' }}>
          Use this number
        </button>
      </form>
    </div>
  )
}
