import type { Converter } from '../converters/index'
import { MayanSvg } from '../renderers/MayanSvg'
import { BabylonianSvg } from '../renderers/BabylonianSvg'
import { ChineseRodSvg } from '../renderers/ChineseRodSvg'

interface NumeralDisplayProps {
  system: Converter
  value: number        // caller guarantees: valid, in-range, not null
  scale?: number
  fontReady?: boolean  // required for egyptian and oldChurchSlavonic
}

export function NumeralDisplay({
  system,
  value,
  scale = 1,
  fontReady = false,
}: NumeralDisplayProps): React.ReactElement {
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
