// Renders Chinese counting rod numerals as SVG.
// Vertical rods (white #e0e0e0): even decimal positions (ones, hundreds, …)
// Horizontal rods (gold #f0c060): odd decimal positions (tens, thousands, …)

import type { JSX } from 'react'

const W = 48        // cell width px
const H = 80        // cell height px
const PAD = 6       // inner padding
const STROKE = 3
const VERT_COLOR  = '#e0e0e0'
const HORIZ_COLOR = '#f0c060'
const ZERO_CP     = 0x3007   // 〇

interface Props {
  encoded: string
  scale?: number
}

type RodCell =
  | { type: 'vert';  digit: number }
  | { type: 'horiz'; digit: number }
  | { type: 'zero' }

function cpToCell(cp: number): RodCell | null {
  if (cp >= 0x1D360 && cp <= 0x1D368) return { type: 'vert',  digit: cp - 0x1D35F }
  if (cp >= 0x1D369 && cp <= 0x1D371) return { type: 'horiz', digit: cp - 0x1D368 }
  if (cp === ZERO_CP)                  return { type: 'zero' }
  return null
}

/** Evenly-spaced x positions for n vertical lines, centred in [PAD, W-PAD]. */
function xPos(n: number): number[] {
  if (n === 1) return [W / 2]
  return Array.from({ length: n }, (_, i) => PAD + (i * (W - 2 * PAD)) / (n - 1))
}

/** Centred y positions for n horizontal lines, spaced 12 px apart. */
function yPos(n: number): number[] {
  const spacing = 12
  const start = H / 2 - (spacing * (n - 1)) / 2
  return Array.from({ length: n }, (_, i) => start + i * spacing)
}

function renderCell(cell: RodCell, idx: number): JSX.Element {
  const ox = idx * W   // x offset for this cell

  if (cell.type === 'zero') {
    return (
      <circle key={idx} cx={ox + W / 2} cy={H / 2} r={10}
        fill="none" stroke="#888888" strokeWidth={2} />
    )
  }

  const lines: JSX.Element[] = []

  if (cell.type === 'vert') {
    const { digit } = cell
    if (digit <= 5) {
      xPos(digit).forEach((x, i) =>
        lines.push(<line key={i}
          x1={ox + x} y1={PAD} x2={ox + x} y2={H - PAD}
          stroke={VERT_COLOR} strokeWidth={STROKE} strokeLinecap="round" />))
    } else {
      // 1 horizontal crossbar near top + (digit−5) verticals below
      lines.push(<line key="xbar"
        x1={ox + PAD} y1={PAD + 8} x2={ox + W - PAD} y2={PAD + 8}
        stroke={VERT_COLOR} strokeWidth={STROKE} strokeLinecap="round" />)
      xPos(digit - 5).forEach((x, i) =>
        lines.push(<line key={i}
          x1={ox + x} y1={PAD + 16} x2={ox + x} y2={H - PAD}
          stroke={VERT_COLOR} strokeWidth={STROKE} strokeLinecap="round" />))
    }
  }

  if (cell.type === 'horiz') {
    const { digit } = cell
    if (digit <= 5) {
      yPos(digit).forEach((y, i) =>
        lines.push(<line key={i}
          x1={ox + PAD} y1={y} x2={ox + W - PAD} y2={y}
          stroke={HORIZ_COLOR} strokeWidth={STROKE} strokeLinecap="round" />))
    } else {
      // 1 vertical crossbar at top + (digit−5) horizontals below
      const numH = digit - 5
      const vertY2 = 48 - (digit - 6) * 6   // shrinks as more horiz lines added
      const firstY = vertY2 + 8
      lines.push(<line key="xbar"
        x1={ox + W / 2} y1={PAD + 6} x2={ox + W / 2} y2={vertY2}
        stroke={HORIZ_COLOR} strokeWidth={STROKE} strokeLinecap="round" />)
      for (let i = 0; i < numH; i++) {
        lines.push(<line key={i}
          x1={ox + PAD} y1={firstY + i * 12} x2={ox + W - PAD} y2={firstY + i * 12}
          stroke={HORIZ_COLOR} strokeWidth={STROKE} strokeLinecap="round" />)
      }
    }
  }

  return <g key={idx}>{lines}</g>
}

export function ChineseRodSvg({ encoded, scale = 1 }: Props): JSX.Element {
  const cells: RodCell[] = []
  for (const char of encoded) {
    const cp = char.codePointAt(0)!
    const cell = cpToCell(cp)
    if (cell) cells.push(cell)
  }

  const totalW = cells.length * W

  return (
    <svg
      width={totalW * scale}
      height={H * scale}
      viewBox={`0 0 ${totalW} ${H}`}
    >
      {cells.map((cell, i) => renderCell(cell, i))}
    </svg>
  )
}
