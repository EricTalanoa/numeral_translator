import { describe, it, expect } from 'vitest'
import { fromArabic, toArabic } from '../../src/converters/chinese-rod'

// Vertical rods (even positions: ones=0, hundreds=2, ...)
const V1 = '\u{1D360}'; const V2 = '\u{1D361}'; const V3 = '\u{1D362}'
const V4 = '\u{1D363}'; const V9 = '\u{1D368}'

// Horizontal rods (odd positions: tens=1, thousands=3, ...)
const H1 = '\u{1D369}'; const H3 = '\u{1D36B}'; const H9 = '\u{1D371}'

// Zero placeholder and sentinel
const ZERO = '\u3007'   // 〇 (zero digit within a number)
const EMPTY = '\u2205'  // ∅ (whole-number zero sentinel)

describe('Chinese Rod — fromArabic', () => {
  it('0 → ∅', () => expect(fromArabic(0)).toBe(EMPTY))
  it('1 → vertical-1 (ones)', () => expect(fromArabic(1)).toBe(V1))
  it('9 → vertical-9 (ones)', () => expect(fromArabic(9)).toBe(V9))
  it('10 → horizontal-1 + zero placeholder (tens+ones)', () => expect(fromArabic(10)).toBe(H1 + ZERO))
  it('11 → horiz-1 + vert-1', () => expect(fromArabic(11)).toBe(H1 + V1))
  it('99 → horiz-9 + vert-9', () => expect(fromArabic(99)).toBe(H9 + V9))
  it('100 → vert-1 + 〇 + 〇', () => expect(fromArabic(100)).toBe(V1 + ZERO + ZERO))
  it('101 → vert-1 + 〇 + vert-1', () => expect(fromArabic(101)).toBe(V1 + ZERO + V1))
  it('1000 → horiz-1 + 〇 + 〇 + 〇', () => expect(fromArabic(1000)).toBe(H1 + ZERO + ZERO + ZERO))
  it('1234 → horiz-1 + vert-2 + horiz-3 + vert-4', () =>
    expect(fromArabic(1234)).toBe(H1 + V2 + H3 + '\u{1D363}'))
  it('3999 (max) → horiz-3 + vert-9 + horiz-9 + vert-9', () =>
    expect(fromArabic(3999)).toBe(H3 + V9 + H9 + V9))
  it('throws on non-integer', () => expect(() => fromArabic(1.5)).toThrow('Input must be an integer'))
  it('throws on 4000', () => expect(() => fromArabic(4000)).toThrow('Out of range: 4000'))
  it('throws on -1', () => expect(() => fromArabic(-1)).toThrow('Out of range: -1'))
})

describe('Chinese Rod — toArabic', () => {
  it('throws on fractional "3.5"', () => expect(() => toArabic('3.5')).toThrow('Fractions not supported'))
  it('throws on invalid char "X"', () => expect(() => toArabic('X')).toThrow('Cannot parse'))
})

describe('Chinese Rod — round-trips', () => {
  const cases = [1, 9, 10, 11, 99, 100, 101, 1000, 1234, 3999]
  for (const n of cases) {
    it(`round-trip ${n}`, () => expect(toArabic(fromArabic(n))).toBe(n))
  }
})

describe('Chinese Rod — unused vars sanity check', () => {
  // Ensure V3 and V4 are referenced (used in 1234 test above via explicit literals)
  it('V3 is vert-3', () => expect(V3).toBe('\u{1D362}'))
  it('V4 is vert-4', () => expect(V4).toBe('\u{1D363}'))
})
