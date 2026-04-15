import { CONVERTERS } from '../converters/index'
import { NumeralTile } from './NumeralTile'

interface OutputGridProps {
  value: number | null
}

export function OutputGrid({ value }: OutputGridProps) {
  return (
    <div className="output-grid">
      {CONVERTERS.map(converter => (
        <NumeralTile key={converter.id} system={converter} value={value} />
      ))}
    </div>
  )
}
