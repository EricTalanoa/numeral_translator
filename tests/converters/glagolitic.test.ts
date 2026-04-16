import { describe, it, expect } from 'vitest'
import { fromArabic, toArabic } from '../../src/converters/glagolitic'
import { explain } from '../../src/converters/glagolitic'

describe('Glagolitic — fromArabic', () => {
  it('0 returns ∅',        () => expect(fromArabic(0)).toBe('\u2205'))
  it('1 returns ⰰ',        () => expect(fromArabic(1)).toBe('\u2C30'))
  it('9 returns ⰸ',        () => expect(fromArabic(9)).toBe('\u2C38'))
  it('10 returns ⰹ',       () => expect(fromArabic(10)).toBe('\u2C39'))
  it('42 returns ⰼⰱ',      () => expect(fromArabic(42)).toBe('\u2C3C\u2C31'))
  it('100 returns ⱂ',      () => expect(fromArabic(100)).toBe('\u2C42'))
  it('999 returns ⱊⱁⰸ',   () => expect(fromArabic(999)).toBe('\u2C4A\u2C41\u2C38'))
  it('1000 returns ⱋ',     () => expect(fromArabic(1000)).toBe('\u2C4B'))
  it('9000 returns ⱓ',     () => expect(fromArabic(9000)).toBe('\u2C53'))
  it('9999 returns ⱓⱊⱁⰸ', () => expect(fromArabic(9999)).toBe('\u2C53\u2C4A\u2C41\u2C38'))

  it('throws on -1',    () => expect(() => fromArabic(-1)).toThrow())
  it('throws on 10000', () => expect(() => fromArabic(10000)).toThrow())
  it('throws on 3.5',   () => expect(() => fromArabic(3.5)).toThrow())
})

describe('Glagolitic — toArabic', () => {
  const roundTrips = [1, 9, 10, 42, 100, 999, 1000, 9000, 9999]
  roundTrips.forEach(n => {
    it(`round-trip ${n}`, () => expect(toArabic(fromArabic(n))).toBe(n))
  })

  it('throws on fractions',    () => expect(() => toArabic('\u2C30.\u2C31')).toThrow())
  it('throws on unknown char', () => expect(() => toArabic('X')).toThrow())
})

describe('Glagolitic — explain', () => {
  it('returns [] for 0', () => expect(explain(0)).toEqual([]))
  it('1 → one token', () => expect(explain(1)).toHaveLength(1))
  it('tokens sum to 42', () => {
    expect(explain(42).reduce((a, t) => a + t.value, 0)).toBe(42)
  })
  it('tokens sum to 9999', () => {
    expect(explain(9999).reduce((a, t) => a + t.value, 0)).toBe(9999)
  })
  it('1000 → one token, value 1000', () => {
    const tokens = explain(1000)
    expect(tokens).toHaveLength(1)
    expect(tokens[0].value).toBe(1000)
  })
  it('throws on out-of-range', () => expect(() => explain(10000)).toThrow('Out of range'))
})
