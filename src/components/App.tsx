import { useState } from 'react'
import { ControlPanel } from './ControlPanel'
import { OutputGrid } from './OutputGrid'

export default function App() {
  const [value, setValue] = useState<number | null>(null)

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="app-title">Numeral Translator</div>
        <ControlPanel onResult={setValue} />
      </aside>
      <main className="tile-area">
        <OutputGrid value={value} />
      </main>
    </div>
  )
}
