import { describe, it, expect } from 'vitest'
import { parseInputValue } from '../../src/components/InputPanel'

describe('parseInputValue', () => {
  it('returns null value and no error for empty string', () => {
    expect(parseInputValue('')).toEqual({ value: null, error: null })
  })

  it('returns null value and no error for whitespace', () => {
    expect(parseInputValue('   ')).toEqual({ value: null, error: null })
  })

  it('parses a valid integer', () => {
    expect(parseInputValue('42')).toEqual({ value: 42, error: null })
  })

  it('parses 0 as valid', () => {
    expect(parseInputValue('0')).toEqual({ value: 0, error: null })
  })

  it('parses 3999 as valid', () => {
    expect(parseInputValue('3999')).toEqual({ value: 3999, error: null })
  })

  it('returns error for value above 3999', () => {
    const result = parseInputValue('4000')
    expect(result.value).toBeNull()
    expect(result.error).toBe('Range: 0–3999')
  })

  it('strips non-digit characters before parsing', () => {
    expect(parseInputValue('abc42xyz')).toEqual({ value: 42, error: null })
  })
})
