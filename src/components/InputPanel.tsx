import { useState } from 'react'

interface InputPanelProps {
  onResult: (n: number) => void
}

export function parseInputValue(raw: string): { value: number | null; error: string | null } {
  const digits = raw.replace(/\D/g, '')
  if (digits === '') return { value: null, error: null }
  const n = parseInt(digits, 10)
  if (n > 9_999_999) return { value: null, error: 'Max: 9,999,999' }
  return { value: n, error: null }
}

export function InputPanel({ onResult }: InputPanelProps) {
  const [raw, setRaw] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target.value
    setRaw(input)
    const result = parseInputValue(input)
    setError(result.error)
    if (result.value !== null) onResult(result.value)
  }

  return (
    <div className="input-panel">
      <label className="input-label" htmlFor="numeral-input">
        ENTER NUMBER (0–9,999,999)
      </label>
      <input
        id="numeral-input"
        type="text"
        className={`numeral-input${error ? ' has-error' : ''}`}
        value={raw}
        onChange={handleChange}
        placeholder="e.g. 42"
        autoComplete="off"
      />
      {error && <p className="input-error">{error}</p>}
    </div>
  )
}
