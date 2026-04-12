import * as egyptian from './egyptian'
import * as ionian from './ionian'
import * as attic from './attic'
import * as babylonian from './babylonian'
import * as roman from './roman'
import * as mayan from './mayan'
import * as chineseRod from './chinese-rod'

export interface Converter {
  id: string
  label: string
  toArabic: (input: string) => number
  fromArabic: (n: number) => string
}

export const CONVERTERS: Converter[] = [
  { id: 'egyptian',   label: 'Egyptian Hieroglyphic', ...egyptian },
  { id: 'ionian',     label: 'Ionian Greek',          ...ionian },
  { id: 'attic',      label: 'Attic Greek',           ...attic },
  { id: 'babylonian', label: 'Babylonian',            ...babylonian },
  { id: 'roman',      label: 'Roman',                 ...roman },
  { id: 'mayan',      label: 'Mayan',                 ...mayan },
  { id: 'chineseRod', label: 'Chinese Rod',           ...chineseRod },
]
