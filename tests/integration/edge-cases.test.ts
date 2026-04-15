import { describe, it, expect } from 'vitest'
import { CONVERTERS } from '../../src/converters/index'

// Zero: fromArabic(0) returns ∅ for all systems except Mayan (shell glyph).
describe('Zero edge case — fromArabic(0)', () => {
  for (const converter of CONVERTERS) {
    if (converter.id === 'mayan') {
      it(`${converter.label}: fromArabic(0) returns shell glyph`, () => {
        expect(converter.fromArabic(0)).toBe('shell')
      })
    } else {
      it(`${converter.label}: fromArabic(0) returns ∅ sentinel`, () => {
        expect(converter.fromArabic(0)).toBe('\u2205')
      })
    }
  }
})

// Max value: fromArabic(maxValue) is valid (no throw) for each system.
describe('Max value edge case — fromArabic(maxValue)', () => {
  for (const converter of CONVERTERS) {
    it(`${converter.label}: fromArabic(${converter.maxValue}) does not throw`, () => {
      expect(() => converter.fromArabic(converter.maxValue)).not.toThrow()
    })
  }
})

// Out of range: fromArabic(maxValue + 1) throws for each system.
describe('Out of range — fromArabic(maxValue + 1)', () => {
  for (const converter of CONVERTERS) {
    it(`${converter.label}: fromArabic(${converter.maxValue + 1}) throws`, () => {
      expect(() => converter.fromArabic(converter.maxValue + 1)).toThrow()
    })
  }
})

// Fraction error: toArabic('3.5') throws for all systems.
describe('Fraction error — toArabic("3.5")', () => {
  for (const converter of CONVERTERS) {
    it(`${converter.label}: toArabic("3.5") throws`, () => {
      expect(() => converter.toArabic('3.5')).toThrow()
    })
  }
})
