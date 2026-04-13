import { useState } from 'react'
import { InputPanel } from './InputPanel'
import { PhotoPanel } from './PhotoPanel'

interface ControlPanelProps {
  onResult: (n: number) => void
}

export function ControlPanel({ onResult }: ControlPanelProps) {
  const [mode, setMode] = useState<'type' | 'photo'>('type')

  return (
    <div className="control-panel">
      <div className="tab-bar">
        <button
          className={`tab${mode === 'type' ? ' active' : ''}`}
          onClick={() => setMode('type')}
        >
          ✎ Type
        </button>
        <button
          className={`tab${mode === 'photo' ? ' active' : ''}`}
          onClick={() => setMode('photo')}
        >
          📷 Photo
        </button>
      </div>
      {mode === 'type'
        ? <InputPanel onResult={onResult} />
        : <PhotoPanel onResult={onResult} />
      }
    </div>
  )
}
