import { useState } from 'react'
import { CONVERTERS } from '../converters/index'
import { recognizeNumeral } from '../vision/vision-client'
import type { FailureReason } from '../vision/vision-client'
import { VisionOverride } from './VisionOverride'

interface PhotoPanelProps {
  onResult: (n: number) => void
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function errorMessage(reason: FailureReason | undefined): string {
  switch (reason) {
    case 'no-key':      return 'API key not configured — add VITE_CLAUDE_API_KEY to .env.local'
    case 'api-error':   return 'API error — check the browser console for details'
    case 'uncertain':   return "Claude couldn't confidently read this image — try a clearer photo"
    case 'parse-failed':return 'Unexpected API response — check the browser console'
    case 'network-error': return 'Network error — check your connection'
    default:            return "Vision couldn't read the image — enter the value manually"
  }
}

export function PhotoPanel({ onResult }: PhotoPanelProps) {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [failureReason, setFailureReason] = useState<FailureReason | undefined>(undefined)
  const [showError, setShowError] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !selectedLabel) return

    setLoading(true)
    setShowError(false)
    setFailureReason(undefined)

    try {
      const base64 = await fileToBase64(file)
      const mimeType = file.type || 'image/jpeg'
      const result = await recognizeNumeral(base64, mimeType, selectedLabel)

      if (result.value !== null) {
        onResult(result.value)
        e.target.value = ''
      } else {
        setFailureReason(result.failureReason)
        setShowError(true)
      }
    } catch {
      setShowError(true)
    } finally {
      setLoading(false)
    }
  }

  if (showError) {
    return (
      <div className="photo-panel">
        <p className="vision-override-message">{errorMessage(failureReason)}</p>
        <VisionOverride
          onResult={n => {
            setShowError(false)
            setFailureReason(undefined)
            onResult(n)
          }}
        />
      </div>
    )
  }

  return (
    <div className="photo-panel">
      <label className="input-label" htmlFor="system-select">SELECT SYSTEM</label>
      <select
        id="system-select"
        className="system-select"
        value={selectedLabel ?? ''}
        onChange={e => setSelectedLabel(e.target.value || null)}
        disabled={loading}
      >
        <option value="">Choose a system...</option>
        {CONVERTERS.map(c => (
          <option key={c.id} value={c.label}>{c.label}</option>
        ))}
      </select>

      <label
        className="input-label"
        htmlFor="photo-input"
        style={{ marginTop: '12px' }}
      >
        UPLOAD PHOTO
      </label>
      <input
        id="photo-input"
        type="file"
        accept="image/*"
        className="photo-input"
        disabled={!selectedLabel || loading}
        onChange={handleFile}
      />

      {loading && (
        <div className="loading-spinner-wrap">
          <div className="loading-spinner" />
          <span className="loading-text">Reading numeral...</span>
        </div>
      )}
    </div>
  )
}
