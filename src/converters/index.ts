import * as egyptian from './egyptian'
import * as ionian from './ionian'
import * as attic from './attic'
import * as babylonian from './babylonian'
import * as roman from './roman'
import * as mayan from './mayan'
import * as chineseRod from './chinese-rod'
import * as chineseTraditional from './chinese-traditional'
import * as glagolitic from './glagolitic'
import * as oldChurchSlavonic from './old-church-slavonic'
import type { BreakdownToken } from './types'

export type { BreakdownToken } from './types'

export interface Converter {
  id: string
  label: string
  maxValue: number
  toArabic: (input: string) => number
  fromArabic: (n: number) => string
  explain: (n: number) => BreakdownToken[]
}

export const CONVERTERS: Converter[] = [
  { id: 'egyptian',           label: 'Egyptian Hieroglyphic', maxValue: 9_999_999, ...egyptian },
  { id: 'ionian',             label: 'Ionian Greek',          maxValue: 9_999,     ...ionian },
  { id: 'attic',              label: 'Attic Greek',           maxValue: 9_999,     ...attic },
  { id: 'babylonian',         label: 'Babylonian',            maxValue: 999_999,   ...babylonian },
  { id: 'roman',              label: 'Roman',                 maxValue: 3_999,     ...roman },
  { id: 'mayan',              label: 'Mayan',                 maxValue: 999_999,   ...mayan },
  { id: 'chineseRod',         label: 'Chinese Rod',           maxValue: 999_999,   ...chineseRod },
  { id: 'chineseTraditional', label: 'Chinese Traditional',   maxValue: 9_999_999, ...chineseTraditional },
  { id: 'glagolitic',         label: 'Glagolitic',            maxValue: 9_999,     ...glagolitic },
  { id: 'oldChurchSlavonic',  label: 'Old Church Slavonic',   maxValue: 9_999,     ...oldChurchSlavonic },
]
