import { describe, it, expect } from 'vitest'
import { fromArabic, toArabic } from '../../src/converters/mayan'

describe('Mayan — fromArabic', () => {
  it('0 → "shell" (genuine zero)', () => expect(fromArabic(0)).toBe('shell'))
  it('1 → "1"', () => expect(fromArabic(1)).toBe('1'))
  it('5 → "5"', () => expect(fromArabic(5)).toBe('5'))
  it('19 → "19"', () => expect(fromArabic(19)).toBe('19'))
  it('20 → "1,0"', () => expect(fromArabic(20)).toBe('1,0'))
  it('21 → "1,1"', () => expect(fromArabic(21)).toBe('1,1'))
  it('40 → "2,0"', () => expect(fromArabic(40)).toBe('2,0'))
  it('400 → "1,0,0" (intermediate zeros)', () => expect(fromArabic(400)).toBe('1,0,0'))
  it('819 → "2,0,19" (zero in middle)', () => expect(fromArabic(819)).toBe('2,0,19'))
  it('3999 → "9,19,19" (max)', () => expect(fromArabic(3999)).toBe('9,19,19'))
  it('throws on non-integer', () => expect(() => fromArabic(1.5)).toThrow('Input must be an integer'))
  it('4000 → "10,0,0"', () => expect(fromArabic(4000)).toBe('10,0,0'))
  it('999999 → "6,4,19,19,19"', () => expect(fromArabic(999999)).toBe('6,4,19,19,19'))
  it('throws on 1000000', () => expect(() => fromArabic(1000000)).toThrow('Out of range: 1000000'))
  it('throws on -1', () => expect(() => fromArabic(-1)).toThrow('Out of range: -1'))
})

describe('Mayan — toArabic', () => {
  it('"shell" → 0', () => expect(toArabic('shell')).toBe(0))
  it('"1" → 1', () => expect(toArabic('1')).toBe(1))
  it('"19" → 19', () => expect(toArabic('19')).toBe(19))
  it('"1,0" → 20', () => expect(toArabic('1,0')).toBe(20))
  it('"1,0,0" → 400', () => expect(toArabic('1,0,0')).toBe(400))
  it('"9,19,19" → 3999', () => expect(toArabic('9,19,19')).toBe(3999))
  it('throws on fractional "3.5"', () => expect(() => toArabic('3.5')).toThrow('Fractions not supported'))
  it('throws on invalid input "bad"', () => expect(() => toArabic('bad')).toThrow('Cannot parse'))
})

describe('Mayan — round-trips', () => {
  const cases = [0, 1, 19, 20, 40, 400, 819, 3999, 4000, 999999]
  for (const n of cases) {
    it(`round-trip ${n}`, () => expect(toArabic(fromArabic(n))).toBe(n))
  }
})
