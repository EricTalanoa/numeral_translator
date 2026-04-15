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
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (system.id !== 'egyptian') return
    if (document.fonts.check('1em NotoSansEgyptianHieroglyphs')) {
      setFontReady(true)
      return
    }
    document.fonts.load('1em NotoSansEgyptianHieroglyphs')
      .then(() => setFontReady(true))
      .catch(() => setFontReady(true))
  }, [system.id])

  useEffect(() => {
    if (!expanded) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setExpanded(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [expanded])

  const outOfRange = value !== null && value > system.maxValue

  function renderContent(scale = 1): JSX.Element {
    if (value === null) {
      return <span className="tile-placeholder">—</span>
    }

    if (outOfRange) {
      return <span className="tile-no-rep">out of range</span>
    }

    const output = system.fromArabic(value)

    // ∅ check first — all systems except Mayan return '∅' for zero
    if (output === '∅') {
      return <span className="tile-no-rep">No representation</span>
    }

    if (system.id === 'mayan') {
      return <MayanSvg encoded={output} scale={scale} />
    }

    if (system.id === 'babylonian') {
      return <BabylonianSvg encoded={output} scale={scale} />
    }

    if (system.id === 'egyptian' && !fontReady) {
      return <span className="tile-loading">Loading font…</span>
    }

    return <span className={`tile-numeral ${system.id}`}>{output}</span>
  }

  function renderModalContent(): JSX.Element {
    if (outOfRange) {
      return (
        <div className="tile-modal-out-of-range">
          <span className="tile-no-rep" style={{ fontSize: '16px' }}>Out of range</span>
          <span className="tile-modal-range">
            Valid range: 0 – {system.maxValue.toLocaleString('en-US')}
          </span>
        </div>
      )
    }
    return renderContent(3)
  }

  const isClickable = value !== null

  return (
    <>
      <div
        className={`numeral-tile${isClickable ? ' clickable' : ''}`}
        onClick={() => isClickable && setExpanded(true)}
      >
        <div className="tile-system-name">{system.label}</div>
        <div className="tile-content">
          {renderContent()}
        </div>
      </div>

      {expanded && (
        <div className="tile-modal-overlay" onClick={() => setExpanded(false)}>
          <div className="tile-modal-card" onClick={e => e.stopPropagation()}>
            <div className="tile-modal-system-name">{system.label}</div>
            <div className="tile-modal-content">
              {renderModalContent()}
            </div>
            <button className="tile-modal-close" onClick={() => setExpanded(false)}>
              close ×
            </button>
          </div>
        </div>
      )}
    </>
  )
}
