import { describe, it, expect } from 'vitest'
import { fromArabic, toArabic } from '../../src/converters/attic'
import { explain } from '../../src/converters/attic'

// Unicode constants for Attic symbols
const I  = '\u0399' // Ι = 1
const P  = '\u03A0' // Π = 5
const D  = '\u0394' // Δ = 10
const PD = P + D    // ΠΔ = 50
const H  = '\u0397' // Η = 100
const PH = P + H    // ΠΗ = 500
const X  = '\u03A7' // Χ = 1000
const EMPTY = '\u2205' // ∅

describe('Attic — fromArabic', () => {
  it('0 → ∅', () => expect(fromArabic(0)).toBe(EMPTY))
  it('1 → Ι', () => expect(fromArabic(1)).toBe(I))
  it('5 → Π', () => expect(fromArabic(5)).toBe(P))
  it('9 → ΠΙΙΙΙ', () => expect(fromArabic(9)).toBe(P + I.repeat(4)))
  it('10 → Δ', () => expect(fromArabic(10)).toBe(D))
  it('50 → ΠΔ', () => expect(fromArabic(50)).toBe(PD))
  it('99 → ΠΔΔΔΔΠΙΙΙΙ', () => expect(fromArabic(99)).toBe(PD + D.repeat(4) + P + I.repeat(4)))
  it('100 → Η', () => expect(fromArabic(100)).toBe(H))
  it('500 → ΠΗ', () => expect(fromArabic(500)).toBe(PH))
  it('999 → ΠΗΗΗΗΠΔΔΔΔΠΙΙΙΙ', () => expect(fromArabic(999)).toBe(PH + H.repeat(4) + PD + D.repeat(4) + P + I.repeat(4)))
  it('1000 → Χ', () => expect(fromArabic(1000)).toBe(X))
  it('1776 → ΧΠΗΗΗΠΔΔΠΙ', () => {
    // 1000 + 500 + 200 + 50 + 20 + 5 + 1
    expect(fromArabic(1776)).toBe(X + PH + H.repeat(2) + PD + D.repeat(2) + P + I)
  })
  it('3999 → ΧΧΧΠΗΗΗΗΠΔΔΔΔΠΙΙΙΙ', () =>
    expect(fromArabic(3999)).toBe(X.repeat(3) + PH + H.repeat(4) + PD + D.repeat(4) + P + I.repeat(4)))
  it('throws on non-integer', () => expect(() => fromArabic(1.5)).toThrow('Input must be an integer'))
  it('4000 → ΧΧΧΧ', () => expect(fromArabic(4000)).toBe(X.repeat(4)))
  it('9999 → 9×Χ + ΠΗ + 4×Η + ΠΔ + 4×Δ + Π + 4×Ι', () =>
    expect(fromArabic(9999)).toBe(X.repeat(9) + PH + H.repeat(4) + PD + D.repeat(4) + P + I.repeat(4)))
  it('throws on 10000', () => expect(() => fromArabic(10000)).toThrow('Out of range: 10000'))
  it('throws on -1', () => expect(() => fromArabic(-1)).toThrow('Out of range: -1'))
})

describe('Attic — toArabic', () => {
  it('Ι → 1', () => expect(toArabic(I)).toBe(1))
  it('Π → 5', () => expect(toArabic(P)).toBe(5))
  it('Δ → 10', () => expect(toArabic(D)).toBe(10))
  it('ΠΔ → 50 (composite)', () => expect(toArabic(PD)).toBe(50))
  it('Η → 100', () => expect(toArabic(H)).toBe(100))
  it('ΠΗ → 500 (composite)', () => expect(toArabic(PH)).toBe(500))
  it('Χ → 1000', () => expect(toArabic(X)).toBe(1000))
  it('ΠΔΔ → 60 (composite ΠΔ=50 + single Δ=10)', () => expect(toArabic(PD + D)).toBe(60))
  it('ΠΔΔΔ → 70 (composite + two singles)', () => expect(toArabic(PD + D + D)).toBe(70))
  it('throws on fractional "3.5"', () => expect(() => toArabic('3.5')).toThrow('Fractions not supported'))
  it('throws on unknown char', () => expect(() => toArabic('ABC')).toThrow('Cannot parse'))
})

describe('Attic — round-trips', () => {
  const cases = [1, 5, 9, 50, 99, 500, 999, 1000, 1776, 3999, 4000, 9999]
  for (const n of cases) {
    it(`round-trip ${n}`, () => expect(toArabic(fromArabic(n))).toBe(n))
  }
})

describe('Attic — explain', () => {
  it('returns [] for 0', () => expect(explain(0)).toEqual([]))
  it('1 → [{Ι,1}]', () => expect(explain(1)).toEqual([{ display: '\u0399', value: 1 }]))
  it('42 → [{ΔΔΔΔ,40},{ΙΙ,2}]', () => expect(explain(42)).toEqual([
    { display: '\u0394\u0394\u0394\u0394', value: 40 },
    { display: '\u0399\u0399', value: 2 },
  ]))
  it('tokens sum to 1492', () => {
    expect(explain(1492).reduce((a, t) => a + t.value, 0)).toBe(1492)
  })
  it('tokens sum to 9999', () => {
    expect(explain(9999).reduce((a, t) => a + t.value, 0)).toBe(9999)
  })
  it('throws on out-of-range', () => expect(() => explain(10000)).toThrow('Out of range'))
})
