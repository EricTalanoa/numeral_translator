# Converter Interface

**Status: LOCKED** — This contract must not change once parallel agent work begins. Any proposed change requires discussion and a new entry in [[Design Decisions]].

---

## The Contract

Every numeral system converter is a TypeScript module that exports exactly two functions:

```ts
/**
 * Parses a string representation of a number in this system
 * and returns the equivalent Arabic integer.
 *
 * @param input - the numeral string to parse
 * @returns integer in range [0, 3999]
 * @throws Error if input is unparseable, fractional, or out of range
 */
export function toArabic(input: string): number

/**
 * Converts an Arabic integer to this system's representation.
 *
 * @param n - integer in range [0, 3999]
 * @returns the numeral string, or "∅" if the system has no zero and n === 0
 * @throws Error if n is outside [0, 3999] or not an integer
 */
export function fromArabic(n: number): string
```

---

## Sentinel Value

`"∅"` (U+2205, EMPTY SET) is the zero sentinel. It means "this system cannot represent zero."

Systems that return `"∅"` for `fromArabic(0)`:
- Egyptian Hieroglyphic
- Ionian Greek
- Attic Greek
- Babylonian (pre-placeholder era)
- Roman
- Chinese Rod (original system used empty space; we use `"∅"`)

Systems that return a real glyph for `fromArabic(0)`:
- Mayan (returns the shell glyph representation)

---

## Error Behavior

| Situation | Behavior |
|---|---|
| `toArabic` receives a fractional string (e.g., `"3.5"`, `"½"`) | throw `Error("Fractions not supported")` |
| `toArabic` receives an unrecognizable string | throw `Error("Cannot parse: <input>")` |
| `fromArabic` receives a non-integer | throw `Error("Input must be an integer")` |
| `fromArabic` receives a number outside [0, 3999] | throw `Error("Out of range: <n>")` |

The UI layer catches these errors and displays an appropriate message. Converters do not show UI.

---

## File Locations

```
src/converters/
├── egyptian.ts
├── ionian.ts
├── attic.ts
├── babylonian.ts
├── roman.ts
├── mayan.ts
└── chinese-rod.ts
```

Each file is standalone. No converter imports from another converter.

---

## What Converters Must NOT Do

- Import from each other
- Import from any UI component
- Render anything (return strings only; SVG rendering lives in `src/renderers/`)
- Make API calls
- Read from DOM or browser globals
- Handle fonts

---

## System Registry

The UI imports a registry array so it can fan out to all converters dynamically:

```ts
// src/converters/index.ts
import * as egyptian from './egyptian'
import * as ionian from './ionian'
import * as attic from './attic'
import * as babylonian from './babylonian'
import * as roman from './roman'
import * as mayan from './mayan'
import * as chineseRod from './chinese-rod'

export const CONVERTERS = [
  { id: 'egyptian',    label: 'Egyptian Hieroglyphic', ...egyptian },
  { id: 'ionian',      label: 'Ionian Greek',          ...ionian },
  { id: 'attic',       label: 'Attic Greek',           ...attic },
  { id: 'babylonian',  label: 'Babylonian',            ...babylonian },
  { id: 'roman',       label: 'Roman',                 ...roman },
  { id: 'mayan',       label: 'Mayan',                 ...mayan },
  { id: 'chineseRod',  label: 'Chinese Rod',           ...chineseRod },
] as const
```

---

## Test Requirements Per Converter

Each converter's test file must cover:
1. Minimum value: `fromArabic(1)` and `toArabic` of that result
2. Maximum value: `fromArabic(3999)` and `toArabic` of that result
3. Zero: `fromArabic(0)` returns `"∅"` (or shell glyph for Mayan)
4. Round-trip: `toArabic(fromArabic(n)) === n` for representative n values
5. At least 5 specific known test cases from each system's note in [[20 - Numeral Systems]]
6. Error case: `toArabic` throws on a fractional string

See individual system notes for the specific test cases.
