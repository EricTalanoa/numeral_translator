import { useState } from 'react'
import { InputPanel } from './InputPanel'

interface ControlPanelProps {
  onResult: (n: number) => void
}

// Placeholder until PhotoPanel is implemented in Task 8
function PhotoPanelPlaceholder() {
  return (
    <div className="photo-panel">
      <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
        Photo mode coming soon…
      </p>
    </div>
  )
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
        : <PhotoPanelPlaceholder />
      }
    </div>
  )
}
