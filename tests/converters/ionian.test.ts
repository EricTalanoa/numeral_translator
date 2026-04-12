import { describe, it, expect } from 'vitest'
import { fromArabic, toArabic } from '../../src/converters/ionian'

// Unicode constants
const KERAIA = '\u02B9'             // ʹ
const PREFIX = '\u0375'             // ͵ (thousands prefix)

// Lookup helpers
const alpha   = '\u03B1'; const beta  = '\u03B2'; const gamma = '\u03B3'
const theta   = '\u03B8'; const iota  = '\u03B9'
const stigma  = '\u03DB'; const koppa = '\u03DF'; const sampi  = '\u03E1'
const rho     = '\u03C1'; const psi   = '\u03C8'; const omicron = '\u03BF'

describe('Ionian — fromArabic', () => {
  it('0 → ∅', () => expect(fromArabic(0)).toBe('\u2205'))
  it('1 → αʹ', () => expect(fromArabic(1)).toBe(alpha + KERAIA))
  it('6 → ϛʹ (archaic stigma)', () => expect(fromArabic(6)).toBe(stigma + KERAIA))
  it('9 → θʹ', () => expect(fromArabic(9)).toBe(theta + KERAIA))
  it('10 → ιʹ', () => expect(fromArabic(10)).toBe(iota + KERAIA))
  it('90 → ϟʹ (archaic koppa)', () => expect(fromArabic(90)).toBe(koppa + KERAIA))
  it('99 → ϟθʹ', () => expect(fromArabic(99)).toBe(koppa + theta + KERAIA))
  it('100 → ρʹ', () => expect(fromArabic(100)).toBe(rho + KERAIA))
  it('900 → ϡʹ (archaic sampi)', () => expect(fromArabic(900)).toBe(sampi + KERAIA))
  it('1000 → ͵αʹ', () => expect(fromArabic(1000)).toBe(PREFIX + alpha + KERAIA))
  it('1776 → ͵αψοϛʹ', () =>
    expect(fromArabic(1776)).toBe(PREFIX + alpha + psi + omicron + stigma + KERAIA))
  it('3999 → ͵γϡϟθʹ', () =>
    expect(fromArabic(3999)).toBe(PREFIX + gamma + sampi + koppa + theta + KERAIA))
  it('throws on non-integer', () => expect(() => fromArabic(1.5)).toThrow('Input must be an integer'))
  it('throws on 4000', () => expect(() => fromArabic(4000)).toThrow('Out of range: 4000'))
  it('throws on -1', () => expect(() => fromArabic(-1)).toThrow('Out of range: -1'))
})

describe('Ionian — toArabic', () => {
  it('with keraia: αʹ → 1', () => expect(toArabic(alpha + KERAIA)).toBe(1))
  it('without keraia: α → 1', () => expect(toArabic(alpha)).toBe(1))
  it('archaic ϛ works: ϛʹ → 6', () => expect(toArabic(stigma + KERAIA)).toBe(6))
  it('archaic ϟ works: ϟʹ → 90', () => expect(toArabic(koppa + KERAIA)).toBe(90))
  it('archaic ϡ works: ϡʹ → 900', () => expect(toArabic(sampi + KERAIA)).toBe(900))
  it('thousands: ͵αʹ → 1000', () => expect(toArabic(PREFIX + alpha + KERAIA)).toBe(1000))
  it('throws on fractional "3.5"', () => expect(() => toArabic('3.5')).toThrow('Fractions not supported'))
  it('throws on unknown char', () => expect(() => toArabic('ZZZ')).toThrow('Cannot parse'))
})

describe('Ionian — round-trips', () => {
  const cases = [1, 6, 9, 90, 900, 1000, 1776, 3999]
  for (const n of cases) {
    it(`round-trip ${n}`, () => expect(toArabic(fromArabic(n))).toBe(n))
  }
})

describe('Ionian — uppercase input', () => {
  // Uppercase Greek α→Α, toArabic should handle it
  it('uppercase alpha: Αʹ → 1', () => {
    // U+0391 is uppercase alpha — same value as alpha
    expect(toArabic('\u0391' + KERAIA)).toBe(1)
  })
  it('lowercase beta: βʹ → 2', () => {
    expect(toArabic(beta + KERAIA)).toBe(2)
  })
})
