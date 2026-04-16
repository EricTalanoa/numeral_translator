import { describe, it, expect } from 'vitest'
import { fromArabic, toArabic, explain } from '../../src/converters/old-church-slavonic'

describe('Old Church Slavonic — fromArabic', () => {
  it('converts 1 → А', () => expect(fromArabic(1)).toBe('\u0410'))
  it('converts 9 → Ѳ', () => expect(fromArabic(9)).toBe('\u0472'))
  it('converts 10 → І', () => expect(fromArabic(10)).toBe('\u0406'))
  it('converts 42 → МВ', () => expect(fromArabic(42)).toBe('\u041C\u0412'))
  it('converts 100 → Р', () => expect(fromArabic(100)).toBe('\u0420'))
  it('converts 900 → Ц', () => expect(fromArabic(900)).toBe('\u0426'))
  it('converts 999 → ЦЧѲ', () => expect(fromArabic(999)).toBe('\u0426\u0427\u0472'))
  it('converts 1000 → ҂А', () => expect(fromArabic(1000)).toBe('\u0482\u0410'))
  it('converts 1492 → ҂АУЧВ', () => expect(fromArabic(1492)).toBe('\u0482\u0410\u0423\u0427\u0412'))
  it('converts 9999 → ҂ѲЦЧѲ', () => expect(fromArabic(9999)).toBe('\u0482\u0472\u0426\u0427\u0472'))
  it('converts 0 → ∅', () => expect(fromArabic(0)).toBe('\u2205'))
  it('throws on 10000', () => expect(() => fromArabic(10000)).toThrow('Out of range'))
  it('throws on -1', () => expect(() => fromArabic(-1)).toThrow('Out of range'))
  it('throws on 1.5', () => expect(() => fromArabic(1.5)).toThrow('integer'))
})

describe('Old Church Slavonic — toArabic', () => {
  it('parses А → 1', () => expect(toArabic('\u0410')).toBe(1))
  it('parses МВ → 42', () => expect(toArabic('\u041C\u0412')).toBe(42))
  it('parses ҂А → 1000', () => expect(toArabic('\u0482\u0410')).toBe(1000))
  it('parses ҂АУЧВ → 1492', () => expect(toArabic('\u0482\u0410\u0423\u0427\u0412')).toBe(1492))
  it('throws on fractions', () => expect(() => toArabic('3.5')).toThrow('Fractions'))
  it('throws on unknown char', () => expect(() => toArabic('X')).toThrow('Cannot parse'))
})

describe('Old Church Slavonic — explain', () => {
  it('returns [] for 0', () => expect(explain(0)).toEqual([]))
  it('returns two tokens for 42', () => {
    const tokens = explain(42)
    expect(tokens).toEqual([
      { display: '\u041C', value: 40 },
      { display: '\u0412', value: 2 },
    ])
  })
  it('returns thousands token with ҂ prefix for 1000', () => {
    const tokens = explain(1000)
    expect(tokens).toEqual([{ display: '\u0482\u0410', value: 1000 }])
  })
  it('tokens sum to n', () => {
    const n = 1492
    const sum = explain(n).reduce((acc, t) => acc + t.value, 0)
    expect(sum).toBe(n)
  })
  it('throws on out-of-range', () => expect(() => explain(10000)).toThrow('Out of range'))
})

describe('Old Church Slavonic — round-trips', () => {
  const cases = [1, 9, 10, 42, 100, 900, 999, 1000, 1492, 9999]
  cases.forEach(n => {
    it(`round-trip ${n}`, () => expect(toArabic(fromArabic(n))).toBe(n))
  })
})
