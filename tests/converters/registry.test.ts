import { describe, it, expect } from 'vitest'
import { CONVERTERS } from '../../src/converters/index'

const EXPECTED_IDS = [
  'egyptian',
  'ionian',
  'attic',
  'babylonian',
  'roman',
  'mayan',
  'chineseRod',
  'chineseTraditional',
  'glagolitic',
  'oldChurchSlavonic',
]

describe('CONVERTERS registry', () => {
  it('contains exactly 10 converters', () => {
    expect(CONVERTERS).toHaveLength(10)
  })

  it('has the correct system IDs in order', () => {
    expect(CONVERTERS.map(c => c.id)).toEqual(EXPECTED_IDS)
  })

  it('each entry has id, label, toArabic, and fromArabic', () => {
    for (const c of CONVERTERS) {
      expect(typeof c.id, `${c.id}.id`).toBe('string')
      expect(typeof c.label, `${c.id}.label`).toBe('string')
      expect(typeof c.toArabic, `${c.id}.toArabic`).toBe('function')
      expect(typeof c.fromArabic, `${c.id}.fromArabic`).toBe('function')
    }
  })
})
