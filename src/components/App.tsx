import { useState } from 'react'
import { ControlPanel } from './ControlPanel'
import { OutputGrid } from './OutputGrid'
import { RangeModal } from './RangeModal'

export default function App() {
  const [value, setValue] = useState<number | null>(null)
  const [showRanges, setShowRanges] = useState(false)

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
        <ControlPanel onResult={setValue} />
      </aside>
      <main className="tile-area">
        <OutputGrid value={value} />
      </main>
      {showRanges && <RangeModal onClose={() => setShowRanges(false)} />}
    </div>
  )
}
