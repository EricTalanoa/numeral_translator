import type { JSX } from 'react'

const GROUP_WIDTH  = 80
const GROUP_HEIGHT = 50
const GAP          = 14

// Wedge dimensions
const CORNER_W = 10  // corner wedge (×10) width
const CORNER_H = 12  // corner wedge height
const VERT_W   = 6   // vertical wedge (×1) width
const VERT_H   = 12  // vertical wedge height
const WEDGE_GAP = 2  // gap between wedges within a row

interface BabylonianSvgProps {
  encoded: string
  scale?: number
}

function renderCornerWedge(x: number, y: number, k: number): JSX.Element {
  // L-shaped path representing value 10
  const d = `M ${x},${y} L ${x + CORNER_W},${y} L ${x + CORNER_W},${y + 4} L ${x + 4},${y + 4} L ${x + 4},${y + CORNER_H} L ${x},${y + CORNER_H} Z`
  return <path key={k} d={d} fill="#c8a97d" />
}

function renderVertWedge(x: number, y: number, k: number): JSX.Element {
  // Cuneiform nail shape: wide base at top, point at bottom (stylus pressed into clay)
  const pts = `${x},${y} ${x + VERT_W},${y} ${x + VERT_W / 2},${y + VERT_H}`
  return <polygon key={k} points={pts} fill="#c8a97d" />
}

function renderGroup(value: number, offsetX: number, key: number): JSX.Element {
  const numTens = Math.floor(value / 10)
  const numOnes = value % 10

  // Tens row: centered in group, y=4
  const tensRowW = numTens * (CORNER_W + WEDGE_GAP) - (numTens > 0 ? WEDGE_GAP : 0)
  const tensStartX = offsetX + (GROUP_WIDTH - tensRowW) / 2
  const tens = Array.from({ length: numTens }, (_, i) =>
    renderCornerWedge(tensStartX + i * (CORNER_W + WEDGE_GAP), 4, i)
  )

  // Ones row: centered in group, y=24
  const onesRowW = numOnes * (VERT_W + WEDGE_GAP) - (numOnes > 0 ? WEDGE_GAP : 0)
  const onesStartX = offsetX + (GROUP_WIDTH - onesRowW) / 2
  const ones = Array.from({ length: numOnes }, (_, i) =>
    renderVertWedge(onesStartX + i * (VERT_W + WEDGE_GAP), 24, i)
  )

  // Empty group (value 0): small centered circle
  const empty = (value === 0)
    ? [<circle key="empty" cx={offsetX + GROUP_WIDTH / 2} cy={GROUP_HEIGHT / 2}
        r={4} fill="none" stroke="#c8a97d" strokeWidth={1.5} />]
    : []

  return <g key={key}>{tens}{ones}{empty}</g>
}

export function BabylonianSvg({ encoded, scale = 1 }: BabylonianSvgProps): JSX.Element {
  if (encoded === '\u2205') {
    return (
      <svg
        width={GROUP_WIDTH * scale} height={GROUP_HEIGHT * scale}
        viewBox={`0 0 ${GROUP_WIDTH} ${GROUP_HEIGHT}`}
        data-testid="babylonian-svg"
      >
        <text x={GROUP_WIDTH / 2} y={GROUP_HEIGHT / 2 + 6}
          textAnchor="middle" fill="#c8a97d" fontSize={20}>∅</text>
      </svg>
    )
  }

  const groups = encoded.split('|').map(Number)
  const totalWidth = groups.length * GROUP_WIDTH + Math.max(0, groups.length - 1) * GAP

  return (
    <svg
      width={totalWidth * scale} height={GROUP_HEIGHT * scale}
      viewBox={`0 0 ${totalWidth} ${GROUP_HEIGHT}`}
      data-testid="babylonian-svg"
    >
      {groups.map((group, i) =>
        renderGroup(group, i * (GROUP_WIDTH + GAP), i)
      )}
    </svg>
  )
}
