import { describe, it, expect } from 'vitest'
import { fromArabic, toArabic } from '../../src/converters/egyptian'

// Use codepoint literals for SMP characters to avoid editor encoding issues
const LOTUS  = '\u{131BC}' // 1000
const ROPE   = '\u{13362}' // 100
const HOBBLE = '\u{13386}' // 10
const STROKE = '\u{133FA}' // 1
const EMPTY  = '\u2205'    // ∅
const FINGER  = '\u{130AD}' // 10,000  — D50
const TADPOLE = '\u{13190}' // 100,000 — I008 (tadpole)
const HEH     = '\u{13068}' // 1,000,000 — C11

describe('Egyptian — fromArabic', () => {
  it('0 → ∅', () => expect(fromArabic(0)).toBe(EMPTY))
  it('1 → single stroke', () => expect(fromArabic(1)).toBe(STROKE))
  it('10 → single hobble', () => expect(fromArabic(10)).toBe(HOBBLE))
  it('100 → single rope', () => expect(fromArabic(100)).toBe(ROPE))
  it('1000 → single lotus', () => expect(fromArabic(1000)).toBe(LOTUS))
  it('23 → 2 hobbles + 3 strokes', () => expect(fromArabic(23)).toBe(HOBBLE.repeat(2) + STROKE.repeat(3)))
  it('305 → 3 ropes + 5 strokes', () => expect(fromArabic(305)).toBe(ROPE.repeat(3) + STROKE.repeat(5)))
  it('1492 → 1 lotus + 4 ropes + 9 hobbles + 2 strokes', () =>
    expect(fromArabic(1492)).toBe(LOTUS + ROPE.repeat(4) + HOBBLE.repeat(9) + STROKE.repeat(2)))
  it('3999 → max: 3 lotus + 9 rope + 9 hobble + 9 stroke', () =>
    expect(fromArabic(3999)).toBe(LOTUS.repeat(3) + ROPE.repeat(9) + HOBBLE.repeat(9) + STROKE.repeat(9)))
  it('throws on non-integer', () => expect(() => fromArabic(1.5)).toThrow('Input must be an integer'))
  it('4000 → 4 lotus', () => expect(fromArabic(4000)).toBe(LOTUS.repeat(4)))
  it('10000 → single finger', () => expect(fromArabic(10000)).toBe(FINGER))
  it('100000 → single tadpole', () => expect(fromArabic(100000)).toBe(TADPOLE))
  it('1000000 → single Heh god', () => expect(fromArabic(1000000)).toBe(HEH))
  it('1234567 → HEH + 2 tadpole + 3 finger + 4 lotus + 5 rope + 6 hobble + 7 stroke', () =>
    expect(fromArabic(1234567)).toBe(
      HEH + TADPOLE.repeat(2) + FINGER.repeat(3) + LOTUS.repeat(4) +
      ROPE.repeat(5) + HOBBLE.repeat(6) + STROKE.repeat(7)
    ))
  it('throws on 10000000', () => expect(() => fromArabic(10000000)).toThrow('Out of range: 10000000'))
  it('throws on -1', () => expect(() => fromArabic(-1)).toThrow('Out of range: -1'))
})

describe('Egyptian — toArabic', () => {
  it('single stroke → 1', () => expect(toArabic(STROKE)).toBe(1))
  it('single hobble → 10', () => expect(toArabic(HOBBLE)).toBe(10))
  it('single rope → 100', () => expect(toArabic(ROPE)).toBe(100))
  it('single lotus → 1000', () => expect(toArabic(LOTUS)).toBe(1000))
  it('single finger → 10000', () => expect(toArabic(FINGER)).toBe(10000))
  it('single tadpole → 100000', () => expect(toArabic(TADPOLE)).toBe(100000))
  it('single Heh god → 1000000', () => expect(toArabic(HEH)).toBe(1000000))
  it('throws on fractional "3.5"', () => expect(() => toArabic('3.5')).toThrow('Fractions not supported'))
  it('throws on invalid character', () => expect(() => toArabic('X')).toThrow('Cannot parse'))
})

describe('Egyptian — round-trips', () => {
  const cases = [1, 10, 100, 1000, 23, 305, 1492, 3999, 10000, 100000, 1000000, 1234567]
  for (const n of cases) {
    it(`round-trip ${n}`, () => expect(toArabic(fromArabic(n))).toBe(n))
  }
})
