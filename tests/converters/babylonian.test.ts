import { describe, it, expect } from 'vitest'
import { fromArabic, toArabic } from '../../src/converters/babylonian'

describe('Babylonian — fromArabic', () => {
  it('0 → ∅', () => expect(fromArabic(0)).toBe('\u2205'))
  it('1 → "1"', () => expect(fromArabic(1)).toBe('1'))
  it('10 → "10"', () => expect(fromArabic(10)).toBe('10'))
  it('59 → "59"', () => expect(fromArabic(59)).toBe('59'))
  it('60 → "1|0"', () => expect(fromArabic(60)).toBe('1|0'))
  it('61 → "1|1"', () => expect(fromArabic(61)).toBe('1|1'))
  it('120 → "2|0"', () => expect(fromArabic(120)).toBe('2|0'))
  it('3600 → "1|0|0"', () => expect(fromArabic(3600)).toBe('1|0|0'))
  it('3661 → "1|1|1"', () => expect(fromArabic(3661)).toBe('1|1|1'))
  it('3999 → "1|6|39"', () => expect(fromArabic(3999)).toBe('1|6|39'))
  it('throws on non-integer', () => expect(() => fromArabic(1.5)).toThrow('Input must be an integer'))
  it('4000 → "1|6|40"', () => expect(fromArabic(4000)).toBe('1|6|40'))
  it('999999 → "4|37|46|39"', () => expect(fromArabic(999999)).toBe('4|37|46|39'))
  it('throws on 1000000', () => expect(() => fromArabic(1000000)).toThrow('Out of range: 1000000'))
  it('throws on -1', () => expect(() => fromArabic(-1)).toThrow('Out of range: -1'))
})

describe('Babylonian — toArabic', () => {
  it('∅ → 0', () => expect(toArabic('\u2205')).toBe(0))
  it('"1" → 1', () => expect(toArabic('1')).toBe(1))
  it('"10" → 10', () => expect(toArabic('10')).toBe(10))
  it('"59" → 59', () => expect(toArabic('59')).toBe(59))
  it('"1|0" → 60', () => expect(toArabic('1|0')).toBe(60))
  it('"1|1" → 61', () => expect(toArabic('1|1')).toBe(61))
  it('"2|0" → 120', () => expect(toArabic('2|0')).toBe(120))
  it('"1|0|0" → 3600', () => expect(toArabic('1|0|0')).toBe(3600))
  it('"1|1|1" → 3661', () => expect(toArabic('1|1|1')).toBe(3661))
  it('"1|6|39" → 3999', () => expect(toArabic('1|6|39')).toBe(3999))
  it('throws on fractional "3.5"', () => expect(() => toArabic('3.5')).toThrow('Fractions not supported'))
  it('throws on invalid input "bad"', () => expect(() => toArabic('bad')).toThrow('Cannot parse'))
})

describe('Babylonian — round-trips', () => {
  const cases = [1, 59, 60, 61, 120, 3600, 3661, 3999, 4000, 999999]
  for (const n of cases) {
    it(`round-trip ${n}`, () => expect(toArabic(fromArabic(n))).toBe(n))
  }
})
