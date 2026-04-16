import { useState, useEffect } from 'react'
import type { Converter, BreakdownToken } from '../converters/index'
import { MayanSvg } from '../renderers/MayanSvg'
import { BabylonianSvg } from '../renderers/BabylonianSvg'
import { ChineseRodSvg } from '../renderers/ChineseRodSvg'

interface NumeralTileProps {
  system: Converter
  value: number | null
}

export function NumeralTile({ system, value }: NumeralTileProps) {
  const [fontReady, setFontReady] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [view, setView] = useState<'numeral' | 'breakdown'>('numeral')

  useEffect(() => {
    if (system.id !== 'egyptian' && system.id !== 'oldChurchSlavonic') return
    const fontName = system.id === 'egyptian'
      ? 'NotoSansEgyptianHieroglyphs'
      : 'PonomarUnicode'
    if (document.fonts.check(`1em ${fontName}`)) {
      setFontReady(true)
      return
    }
    document.fonts.load(`1em ${fontName}`)
      .then(() => setFontReady(true))
      .catch(() => setFontReady(true))
  }, [system.id])

  useEffect(() => {
    if (!expanded) {
      setView('numeral')  // reset tab on close
      return
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setExpanded(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [expanded])

  const outOfRange = value !== null && value > system.maxValue
  const canBreakdown = value !== null && !outOfRange && value !== 0

  function renderContent(scale = 1): JSX.Element {
    if (value === null) {
      return <span className="tile-placeholder">—</span>
    }
    if (outOfRange) {
      return <span className="tile-no-rep">out of range</span>
    }
    const output = system.fromArabic(value)
    if (output === '∅') {
      return <span className="tile-no-rep">No representation</span>
    }
    if (system.id === 'mayan') {
      return <MayanSvg encoded={output} scale={scale} />
    }
    if (system.id === 'babylonian') {
      return <BabylonianSvg encoded={output} scale={scale} />
    }
    if (system.id === 'chineseRod') {
      return <ChineseRodSvg encoded={output} scale={scale} />
    }
    if ((system.id === 'egyptian' || system.id === 'oldChurchSlavonic') && !fontReady) {
      return <span className="tile-loading">Loading font…</span>
    }
    return <span className={`tile-numeral ${system.id}`}>{output}</span>
  }

  function renderModalNumeralContent(): JSX.Element {
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

  function renderBreakdown(): JSX.Element {
    if (!canBreakdown) return <span className="tile-no-rep">No breakdown available</span>
    const tokens: BreakdownToken[] = system.explain(value!)
    return (
      <table className="breakdown-table">
        <tbody>
          {tokens.map((t, i) => (
            <tr key={i}>
              <td className={system.id}>{t.display}</td>
              <td>{t.value.toLocaleString('en-US')}</td>
            </tr>
          ))}
          <tr className="breakdown-total">
            <td>total</td>
            <td>{value!.toLocaleString('en-US')}</td>
          </tr>
        </tbody>
      </table>
    )
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
            <div className="tile-modal-tabs">
              <button
                className={`tile-modal-tab${view === 'numeral' ? ' active' : ''}`}
                onClick={() => setView('numeral')}
              >
                Numeral
              </button>
              <button
                className={`tile-modal-tab${view === 'breakdown' ? ' active' : ''}`}
                onClick={() => setView('breakdown')}
                disabled={!canBreakdown}
              >
                Breakdown
              </button>
            </div>
            <div className="tile-modal-content">
              {view === 'numeral' ? renderModalNumeralContent() : renderBreakdown()}
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
