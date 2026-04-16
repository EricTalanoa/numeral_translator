import { describe, it, expect } from 'vitest'
import { fromArabic, toArabic } from '../../src/converters/roman'
import { explain } from '../../src/converters/roman'

describe('Roman — fromArabic', () => {
  it('0 → ∅', () => expect(fromArabic(0)).toBe('\u2205'))
  it('1 → I', () => expect(fromArabic(1)).toBe('I'))
  it('4 → IV', () => expect(fromArabic(4)).toBe('IV'))
  it('9 → IX', () => expect(fromArabic(9)).toBe('IX'))
  it('14 → XIV', () => expect(fromArabic(14)).toBe('XIV'))
  it('40 → XL', () => expect(fromArabic(40)).toBe('XL'))
  it('44 → XLIV', () => expect(fromArabic(44)).toBe('XLIV'))
  it('90 → XC', () => expect(fromArabic(90)).toBe('XC'))
  it('400 → CD', () => expect(fromArabic(400)).toBe('CD'))
  it('900 → CM', () => expect(fromArabic(900)).toBe('CM'))
  it('1994 → MCMXCIV', () => expect(fromArabic(1994)).toBe('MCMXCIV'))
  it('3999 → MMMCMXCIX', () => expect(fromArabic(3999)).toBe('MMMCMXCIX'))
  it('throws on non-integer', () => expect(() => fromArabic(1.5)).toThrow('Input must be an integer'))
  it('throws on 4000', () => expect(() => fromArabic(4000)).toThrow('Out of range: 4000'))
  it('throws on -1', () => expect(() => fromArabic(-1)).toThrow('Out of range: -1'))
})

describe('Roman — toArabic', () => {
  it('I → 1', () => expect(toArabic('I')).toBe(1))
  it('IV → 4', () => expect(toArabic('IV')).toBe(4))
  it('IX → 9', () => expect(toArabic('IX')).toBe(9))
  it('XIV → 14', () => expect(toArabic('XIV')).toBe(14))
  it('XL → 40', () => expect(toArabic('XL')).toBe(40))
  it('CD → 400', () => expect(toArabic('CD')).toBe(400))
  it('CM → 900', () => expect(toArabic('CM')).toBe(900))
  it('MCMXCIV → 1994', () => expect(toArabic('MCMXCIV')).toBe(1994))
  it('MMMCMXCIX → 3999', () => expect(toArabic('MMMCMXCIX')).toBe(3999))
  it('lowercase: mcmxciv → 1994', () => expect(toArabic('mcmxciv')).toBe(1994))
  it('throws on fractional "3.5"', () => expect(() => toArabic('3.5')).toThrow('Fractions not supported'))
  it('throws on invalid IIII', () => expect(() => toArabic('IIII')).toThrow('Cannot parse'))
  it('throws on unknown char', () => expect(() => toArabic('QQQQ')).toThrow('Cannot parse'))
})

describe('Roman — round-trips', () => {
  const cases = [1, 4, 9, 40, 400, 900, 1994, 3999]
  for (const n of cases) {
    it(`round-trip ${n}`, () => expect(toArabic(fromArabic(n))).toBe(n))
  }
})

describe('Roman — explain', () => {
  it('returns [] for 0', () => expect(explain(0)).toEqual([]))
  it('1 → [{I,1}]', () => expect(explain(1)).toEqual([{ display: 'I', value: 1 }]))
  it('4 → [{IV,4}]', () => expect(explain(4)).toEqual([{ display: 'IV', value: 4 }]))
  it('1492 tokens sum to 1492', () => {
    const sum = explain(1492).reduce((a, t) => a + t.value, 0)
    expect(sum).toBe(1492)
  })
  it('1492 → [{M,1000},{CD,400},{XC,90},{II,2}]', () => {
    expect(explain(1492)).toEqual([
      { display: 'M',  value: 1000 },
      { display: 'CD', value: 400  },
      { display: 'XC', value: 90   },
      { display: 'II', value: 2    },
    ])
  })
  it('throws on out-of-range', () => expect(() => explain(4000)).toThrow('Out of range'))
})
