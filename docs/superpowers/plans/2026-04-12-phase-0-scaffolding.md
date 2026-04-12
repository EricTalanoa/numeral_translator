# Phase 0 — Project Scaffolding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a working Vite + React + TypeScript project with locked converter interfaces, stub implementations for all 7 systems, and an initial commit pushed to the GitHub remote — ready for parallel agent work.

**Architecture:** All source lives at the project root alongside the existing `obsidian/` vault. Converter stubs export the locked `toArabic`/`fromArabic` interface but throw `"Not implemented"` — this lets the registry and TypeScript compile cleanly before converter agents fill in the logic. The scaffold test verifies the registry shape, not converter behavior.

**Tech Stack:** React 18, Vite 5, TypeScript 5, Vitest 2, Node 18+

---

## File Map

**Created in this plan:**
- `package.json` — deps and scripts
- `vite.config.ts` — Vite + Vitest config
- `tsconfig.json` — TypeScript config
- `index.html` — app entry point
- `src/vite-env.d.ts` — Vite env types
- `src/main.tsx` — React root mount
- `src/components/App.tsx` — placeholder component
- `src/styles/main.css` — base styles
- `src/converters/index.ts` — CONVERTERS registry (locked interface)
- `src/converters/egyptian.ts` — stub
- `src/converters/ionian.ts` — stub
- `src/converters/attic.ts` — stub
- `src/converters/babylonian.ts` — stub
- `src/converters/roman.ts` — stub
- `src/converters/mayan.ts` — stub
- `src/converters/chinese-rod.ts` — stub
- `src/renderers/MayanSvg.tsx` — stub
- `src/renderers/BabylonianSvg.tsx` — stub
- `src/vision/vision-client.ts` — stub
- `tests/converters/registry.test.ts` — scaffold smoke test
- `.gitignore`
- `.env.local.example`

---

## Task 1: Create config files

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/vite-env.d.ts`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "numeral-translator",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.6.2",
    "vite": "^5.4.10",
    "vitest": "^2.1.0",
    "jsdom": "^25.0.0"
  }
}
```

- [ ] **Step 2: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
})
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 4: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Numeral Translator</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create `src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />
```

---

## Task 2: Create source entry files

**Files:**
- Create: `src/main.tsx`
- Create: `src/components/App.tsx`
- Create: `src/styles/main.css`

- [ ] **Step 1: Create `src/main.tsx`**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App'
import './styles/main.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 2: Create `src/components/App.tsx`**

```tsx
export default function App() {
  return <h1>Numeral Translator</h1>
}
```

- [ ] **Step 3: Create `src/styles/main.css`**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  background: #fafafa;
  color: #1a1a1a;
}
```

---

## Task 3: Install dependencies

**Files:** none created — installs into `node_modules/` and writes `package-lock.json`

- [ ] **Step 1: Install**

Run: `npm install`

Expected: installs ~150 packages, no errors. `node_modules/` is created.

- [ ] **Step 2: Verify dev server starts**

Run: `npm run dev`

Expected: output includes `Local: http://localhost:5173/` and the page shows "Numeral Translator". Stop with Ctrl+C.

---

## Task 4: Write registry smoke test (failing)

**Files:**
- Create: `tests/converters/registry.test.ts`

This test verifies the CONVERTERS registry shape before any converter logic exists. It will **fail** until Task 5 creates the registry.

- [ ] **Step 1: Create `tests/converters/registry.test.ts`**

```ts
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
]

describe('CONVERTERS registry', () => {
  it('contains exactly 7 converters', () => {
    expect(CONVERTERS).toHaveLength(7)
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`

Expected: FAIL — "Cannot find module '../../src/converters/index'"

---

## Task 5: Create converter stubs and registry

**Files:**
- Create: `src/converters/index.ts`
- Create: `src/converters/egyptian.ts`
- Create: `src/converters/ionian.ts`
- Create: `src/converters/attic.ts`
- Create: `src/converters/babylonian.ts`
- Create: `src/converters/roman.ts`
- Create: `src/converters/mayan.ts`
- Create: `src/converters/chinese-rod.ts`

- [ ] **Step 1: Create `src/converters/egyptian.ts`**

```ts
export function toArabic(_input: string): number {
  throw new Error('Not implemented')
}

export function fromArabic(_n: number): string {
  throw new Error('Not implemented')
}
```

- [ ] **Step 2: Create `src/converters/ionian.ts`**

```ts
export function toArabic(_input: string): number {
  throw new Error('Not implemented')
}

export function fromArabic(_n: number): string {
  throw new Error('Not implemented')
}
```

- [ ] **Step 3: Create `src/converters/attic.ts`**

```ts
export function toArabic(_input: string): number {
  throw new Error('Not implemented')
}

export function fromArabic(_n: number): string {
  throw new Error('Not implemented')
}
```

- [ ] **Step 4: Create `src/converters/babylonian.ts`**

```ts
export function toArabic(_input: string): number {
  throw new Error('Not implemented')
}

export function fromArabic(_n: number): string {
  throw new Error('Not implemented')
}
```

- [ ] **Step 5: Create `src/converters/roman.ts`**

```ts
export function toArabic(_input: string): number {
  throw new Error('Not implemented')
}

export function fromArabic(_n: number): string {
  throw new Error('Not implemented')
}
```

- [ ] **Step 6: Create `src/converters/mayan.ts`**

```ts
export function toArabic(_input: string): number {
  throw new Error('Not implemented')
}

export function fromArabic(_n: number): string {
  throw new Error('Not implemented')
}
```

- [ ] **Step 7: Create `src/converters/chinese-rod.ts`**

```ts
export function toArabic(_input: string): number {
  throw new Error('Not implemented')
}

export function fromArabic(_n: number): string {
  throw new Error('Not implemented')
}
```

- [ ] **Step 8: Create `src/converters/index.ts`**

```ts
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
```

- [ ] **Step 9: Run tests — must pass**

Run: `npm test`

Expected output:
```
✓ tests/converters/registry.test.ts (3)
  ✓ CONVERTERS registry > contains exactly 7 converters
  ✓ CONVERTERS registry > has the correct system IDs in order
  ✓ CONVERTERS registry > each entry has id, label, toArabic, and fromArabic

Test Files  1 passed (1)
Tests       3 passed (3)
```

---

## Task 6: Create renderer and vision stubs

**Files:**
- Create: `src/renderers/MayanSvg.tsx`
- Create: `src/renderers/BabylonianSvg.tsx`
- Create: `src/vision/vision-client.ts`

- [ ] **Step 1: Create `src/renderers/MayanSvg.tsx`**

```tsx
interface MayanSvgProps {
  encoded: string
}

export function MayanSvg({ encoded: _encoded }: MayanSvgProps) {
  return <svg data-testid="mayan-svg" width="60" height="50" />
}
```

- [ ] **Step 2: Create `src/renderers/BabylonianSvg.tsx`**

```tsx
interface BabylonianSvgProps {
  encoded: string
}

export function BabylonianSvg({ encoded: _encoded }: BabylonianSvgProps) {
  return <svg data-testid="babylonian-svg" width="80" height="40" />
}
```

- [ ] **Step 3: Create `src/vision/vision-client.ts`**

```ts
export interface RecognitionResult {
  value: number | null
  confidence: 'high' | 'low'
  rawText: string
}

export async function recognizeNumeral(
  _imageBase64: string,
  _mimeType: string,
  _systemName: string,
): Promise<RecognitionResult> {
  throw new Error('Not implemented')
}
```

- [ ] **Step 4: Run tests to confirm still passing**

Run: `npm test`

Expected: same 3 passing tests, no new failures.

---

## Task 7: Security and environment setup

**Files:**
- Create: `.gitignore`
- Create: `.env.local.example`

- [ ] **Step 1: Create `.gitignore`**

```
# dependencies
node_modules/

# build output
dist/
dist-ssr/

# local env — NEVER COMMIT THE REAL KEY
.env.local
.env.*.local

# editor
.vscode/
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS
.DS_Store
Thumbs.db

# logs
*.log
npm-debug.log*
```

- [ ] **Step 2: Create `.env.local.example`**

```
# Copy this file to .env.local and fill in your key.
# .env.local is gitignored and must never be committed.
# Get your key at https://console.anthropic.com/

VITE_CLAUDE_API_KEY=your_api_key_here
```

- [ ] **Step 3: Create `public/fonts/.gitkeep`**

Git doesn't track empty directories. This placeholder reserves the slot where `NotoSansEgyptianHieroglyphs-Regular.ttf` will be placed before Phase 2 (UI work).

Create an empty file at `public/fonts/.gitkeep`. Contents: empty.

The font itself is free/OFL-licensed. Download link for later:
`https://fonts.google.com/noto/specimen/Noto+Sans+Egyptian+Hieroglyphs`
Download the TTF and place it at `public/fonts/NotoSansEgyptianHieroglyphs-Regular.ttf` before the UI agent starts.

- [ ] **Step 5: Verify `.env.local` is not tracked**

Run: `git status` (after git init in Task 8 — skip this step until then)

---

## Task 8: Initialize git and push to GitHub

**Files:** none created — git history only

- [ ] **Step 1: Initialize git**

Run: `git init`

Expected: "Initialized empty Git repository in ..."

- [ ] **Step 2: Add remote**

Run: `git remote add origin https://github.com/EricTalanoa/numeral_translator.git`

- [ ] **Step 3: Stage files**

Run:
```bash
git add package.json vite.config.ts tsconfig.json index.html
git add src/ tests/ obsidian/ docs/ claude.md
git add .gitignore .env.local.example
```

Do **not** add `.env.local` (it shouldn't exist yet — and if it does, do not add it).

- [ ] **Step 4: Verify nothing sensitive is staged**

Run: `git status`

Confirm: `.env.local` does NOT appear in staged files. `node_modules/` does NOT appear.

- [ ] **Step 5: Create initial commit**

Run:
```bash
git commit -m "$(cat <<'EOF'
chore: scaffold Phase 0 — Vite + React + TypeScript + converter stubs

Sets up project structure, locked CONVERTERS registry, 7 converter stubs,
renderer stubs, vision stub, and Obsidian vault. Registry smoke test passes.
Ready for parallel Phase 1 agent work.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 6: Push to GitHub**

Run: `git push -u origin main`

If the branch is `master` instead of `main`: `git push -u origin master`

If the remote already has commits (the repo isn't empty): `git pull origin main --allow-unrelated-histories` first, then push.

Expected: push succeeds, files visible at https://github.com/EricTalanoa/numeral_translator

---

## Task 9: Final verification

- [ ] **Step 1: Run tests one final time**

Run: `npm test`

Expected:
```
Test Files  1 passed (1)
Tests       3 passed (3)
```

- [ ] **Step 2: Verify dev server**

Run: `npm run dev`

Expected: `http://localhost:5173/` loads and shows "Numeral Translator" heading. No console errors.

- [ ] **Step 3: Check TypeScript compiles cleanly**

Run: `npx tsc --noEmit`

Expected: no output (no errors).

- [ ] **Phase 0 complete ✓**

All three checks pass. The scaffold is ready. Proceed to Phase 1: spawn converter agents in parallel.

---

## What comes next (Phase 1)

After Phase 0, spawn these agents **simultaneously** — they are fully independent:

1. **Converter:Roman** — easiest, good for validating the agent prompt template
2. **Converter:Egyptian** — codepoints locked, straightforward additive logic
3. **Converter:Attic** — greedy subtraction with two-char composites
4. **Converter:Ionian** — most parsing complexity (archaic letters, keraia)
5. **Converter:Babylonian** — pipe-separated output format, base-60
6. **Converter:Mayan** — comma-separated output, shell sentinel for zero
7. **Converter:ChineseRod** — alternating orientation rule
8. **Renderer** — MayanSvg + BabylonianSvg (parallel with converters)
9. **Vision** — recognizeNumeral implementation (parallel with converters)

Each agent receives the contents of `obsidian/30 - Dev Notes/Converter Interface.md` and its system's note from `obsidian/20 - Numeral Systems/`. See `obsidian/10 - Planning/Agent Map.md` for full agent prompt instructions.
