import { useState, useEffect } from 'react'
import type { Converter } from '../converters/index'
import { MayanSvg } from '../renderers/MayanSvg'
import { BabylonianSvg } from '../renderers/BabylonianSvg'

interface NumeralTileProps {
  system: Converter
  value: number | null
}

export function NumeralTile({ system, value }: NumeralTileProps) {
  const [fontReady, setFontReady] = useState(false)

  useEffect(() => {
    if (system.id !== 'egyptian') return
    if (document.fonts.check('1em NotoSansEgyptianHieroglyphs')) {
      setFontReady(true)
      return
    }
    document.fonts.load('1em NotoSansEgyptianHieroglyphs')
      .then(() => setFontReady(true))
      .catch(() => setFontReady(true)) // degrade gracefully — fallback font renders
  }, [system.id])

  function renderContent(): JSX.Element {
    if (value === null) {
      return <span className="tile-placeholder">—</span>
    }

    const output = system.fromArabic(value)

    // ∅ check must come first — all systems except Mayan return '∅' for zero.
    // Mayan returns 'shell' for zero, so the SVG path below is safe.
    if (output === '∅') {
      return <span className="tile-no-rep">No representation</span>
    }

    if (system.id === 'mayan') {
      return <MayanSvg encoded={output} />
    }

    if (system.id === 'babylonian') {
      return <BabylonianSvg encoded={output} />
    }

    if (system.id === 'egyptian' && !fontReady) {
      return <span className="tile-loading">Loading font…</span>
    }

    return <span className={`tile-numeral ${system.id}`}>{output}</span>
  }

  return (
    <div className="numeral-tile">
      <div className="tile-system-name">{system.label}</div>
      <div className="tile-content">
        {renderContent()}
      </div>
    </div>
  )
}
