import { describe, it, expect } from 'vitest'
import { fromArabic, toArabic } from '../../src/converters/chinese-traditional'

describe('Chinese Traditional — fromArabic', () => {
  it('0 returns ∅',                    () => expect(fromArabic(0)).toBe('\u2205'))
  it('1 returns 一',                   () => expect(fromArabic(1)).toBe('一'))
  it('9 returns 九',                   () => expect(fromArabic(9)).toBe('九'))
  it('10 returns 十 (no leading 一)',  () => expect(fromArabic(10)).toBe('十'))
  it('11 returns 十一',                () => expect(fromArabic(11)).toBe('十一'))
  it('42 returns 四十二',              () => expect(fromArabic(42)).toBe('四十二'))
  it('100 returns 一百',               () => expect(fromArabic(100)).toBe('一百'))
  it('103 returns 一百零三',           () => expect(fromArabic(103)).toBe('一百零三'))
  it('110 returns 一百一十',           () => expect(fromArabic(110)).toBe('一百一十'))
  it('999 returns 九百九十九',         () => expect(fromArabic(999)).toBe('九百九十九'))
  it('1000 returns 一千',              () => expect(fromArabic(1000)).toBe('一千'))
  it('1001 returns 一千零一',          () => expect(fromArabic(1001)).toBe('一千零一'))
  it('1030 returns 一千零三十',        () => expect(fromArabic(1030)).toBe('一千零三十'))
  it('9999 returns 九千九百九十九',    () => expect(fromArabic(9999)).toBe('九千九百九十九'))
  it('10000 returns 一萬',             () => expect(fromArabic(10000)).toBe('一萬'))
  it('10003 returns 一萬零三',         () => expect(fromArabic(10003)).toBe('一萬零三'))
  it('100000 returns 十萬',            () => expect(fromArabic(100000)).toBe('十萬'))
  it('110000 returns 十一萬',          () => expect(fromArabic(110000)).toBe('十一萬'))
  it('1000000 returns 一百萬',         () => expect(fromArabic(1000000)).toBe('一百萬'))
  it('1234567 returns 一百二十三萬四千五百六十七', () =>
    expect(fromArabic(1234567)).toBe('一百二十三萬四千五百六十七'))
  it('9999999 returns 九百九十九萬九千九百九十九', () =>
    expect(fromArabic(9999999)).toBe('九百九十九萬九千九百九十九'))

  it('throws on -1',       () => expect(() => fromArabic(-1)).toThrow())
  it('throws on 10000000', () => expect(() => fromArabic(10000000)).toThrow())
  it('throws on 3.5',      () => expect(() => fromArabic(3.5)).toThrow())
})

describe('Chinese Traditional — toArabic', () => {
  const roundTrips = [
    1, 9, 10, 11, 42, 100, 103, 110, 999,
    1000, 1001, 1030, 9999, 10000, 10003,
    100000, 110000, 1000000, 1234567, 9999999,
  ]
  roundTrips.forEach(n => {
    it(`round-trip ${n}`, () => expect(toArabic(fromArabic(n))).toBe(n))
  })

  it('throws on fractions', () => expect(() => toArabic('三.五')).toThrow())
})
