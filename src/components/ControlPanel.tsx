import { InputPanel } from './InputPanel'

interface ControlPanelProps {
  onResult: (n: number) => void
}

export function ControlPanel({ onResult }: ControlPanelProps) {
  return (
    <div className="control-panel">
      <InputPanel onResult={onResult} />
    </div>
  )
}
