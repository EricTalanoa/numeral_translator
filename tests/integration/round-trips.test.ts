import { describe, it, expect } from 'vitest'
import { CONVERTERS } from '../../src/converters/index'

// Cross-system round-trips: toArabic(fromArabic(n)) === n for all converters.
// All probe values are within the minimum maxValue across all 9 systems (3,999 for Roman).
const PROBE_VALUES = [1, 10, 42, 100, 999, 1000, 3999]

for (const converter of CONVERTERS) {
  describe(`${converter.label} — cross-system round-trips`, () => {
    for (const n of PROBE_VALUES) {
      if (n > converter.maxValue) continue
      it(`round-trip ${n}`, () => {
        expect(converter.toArabic(converter.fromArabic(n))).toBe(n)
      })
    }
  })
}
