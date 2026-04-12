import type { JSX } from 'react'

const CELL_WIDTH  = 60
const CELL_HEIGHT = 50
const DOT_RADIUS  = 6
const BAR_HEIGHT  = 8
const BAR_WIDTH   = 50
const CELL_GAP    = 6

interface MayanSvgProps {
  encoded: string
}

function renderShell(offsetY: number): JSX.Element {
  return (
    <>
      <ellipse cx={30} cy={offsetY + 25} rx={20} ry={12}
        fill="none" stroke="#2d4a1e" strokeWidth={2} />
      <ellipse cx={30} cy={offsetY + 21} rx={12} ry={6}
        fill="none" stroke="#2d4a1e" strokeWidth={1.5} />
    </>
  )
}

function renderDigitCell(digit: number, cellY: number, key: number): JSX.Element {
  if (digit === 0) {
    return <g key={key}>{renderShell(cellY)}</g>
  }

  const numBars = Math.floor(digit / 5)
  const numDots = digit % 5

  const bars = Array.from({ length: numBars }, (_, b) => {
    const barY = cellY + CELL_HEIGHT - BAR_HEIGHT - 6 - b * (BAR_HEIGHT + 3)
    return (
      <rect key={`bar${b}`} x={5} y={barY} width={BAR_WIDTH} height={BAR_HEIGHT}
        rx={2} fill="#2d4a1e" />
    )
  })

  let dotsY: number
  if (numBars > 0) {
    const topBarY = cellY + CELL_HEIGHT - BAR_HEIGHT - 6 - (numBars - 1) * (BAR_HEIGHT + 3)
    dotsY = topBarY - DOT_RADIUS - 4
  } else {
    dotsY = cellY + CELL_HEIGHT / 2
  }

  const dots = numDots > 0
    ? Array.from({ length: numDots }, (_, d) => {
        const totalW = numDots * DOT_RADIUS * 2 + (numDots - 1) * 4
        const startX = (CELL_WIDTH - totalW) / 2 + DOT_RADIUS
        return (
          <circle key={`dot${d}`} cx={startX + d * (DOT_RADIUS * 2 + 4)}
            cy={dotsY} r={DOT_RADIUS} fill="#2d4a1e" />
        )
      })
    : []

  return <g key={key}>{bars}{dots}</g>
}

export function MayanSvg({ encoded }: MayanSvgProps): JSX.Element {
  if (encoded === 'shell') {
    return (
      <svg width={CELL_WIDTH} height={CELL_HEIGHT} data-testid="mayan-svg">
        {renderShell(0)}
      </svg>
    )
  }

  const digits = encoded.split(',').map(Number)
  const totalHeight = digits.length * CELL_HEIGHT + Math.max(0, digits.length - 1) * CELL_GAP

  return (
    <svg width={CELL_WIDTH} height={totalHeight} data-testid="mayan-svg">
      {digits.map((digit, i) =>
        renderDigitCell(digit, i * (CELL_HEIGHT + CELL_GAP), i)
      )}
    </svg>
  )
}
