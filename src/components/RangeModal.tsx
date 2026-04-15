import { useEffect } from 'react'
import { CONVERTERS } from '../converters/index'

interface RangeModalProps {
  onClose: () => void
}

export function RangeModal({ onClose }: RangeModalProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="tile-modal-overlay" onClick={onClose}>
      <div className="tile-modal-card range-modal-card" onClick={e => e.stopPropagation()}>
        <div className="tile-modal-system-name">System Ranges</div>
        <table className="range-table">
          <thead>
            <tr>
              <th className="range-table-th">System</th>
              <th className="range-table-th range-table-th--right">Range</th>
            </tr>
          </thead>
          <tbody>
            {CONVERTERS.map(c => (
              <tr key={c.id} className="range-table-row">
                <td className="range-table-td">{c.label}</td>
                <td className="range-table-td range-table-td--right">
                  0 – {c.maxValue.toLocaleString('en-US')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="tile-modal-close" onClick={onClose}>
          close ×
        </button>
      </div>
    </div>
  )
}
