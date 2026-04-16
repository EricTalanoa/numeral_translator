# Quiz Mode Design

**Date:** 2026-04-15
**Status:** Approved — ready for implementation

---

## Goal

Add a Quiz mode to the Numeral Translator where the app displays a numeral in a randomly selected ancient system and asks the user to type the Arabic value. Immediate correct/wrong feedback with a session score.

## Architecture

`App.tsx` gains a `mode: 'translate' | 'quiz'` toggle and `checkedSystemIds: string[]` (which systems to include in the quiz). A two-tab strip in the sidebar switches modes. The main tile area renders `OutputGrid` (translate) or `QuizPanel` (quiz) based on mode. No routing. No new dependencies.

## Layout

- **Sidebar (quiz mode):** mode tab strip → `QuizControls` (system checkboxes + Reset button)
- **Main area (quiz mode):** `QuizPanel` — a centered question card with the numeral, input field, and score

The existing translate mode layout is unchanged.

## Components

### New: `src/components/NumeralDisplay.tsx`

Extracted from `NumeralTile`'s `renderContent()`. Handles all rendering dispatch:

- Mayan → `<MayanSvg>`
- Babylonian → `<BabylonianSvg>`
- Chinese Rod → `<ChineseRodSvg>`
- Egyptian/OCS (font-gated) → `<span className={system.id}>` once font ready, else loading text
- All others → `<span className={`tile-numeral ${system.id}`}>`
- `"∅"` output → `<span className="tile-no-rep">No representation</span>`

Props: `{ system: Converter; value: number; scale?: number; fontReady?: boolean }`

`NumeralDisplay` assumes `value` is valid and in range — it does not handle null or out-of-range values. Callers (NumeralTile, QuizPanel) are responsible for those guards before rendering `NumeralDisplay`.

`NumeralTile` is updated to use `<NumeralDisplay>` in place of its inline `renderContent()`.

### New: `src/components/QuizControls.tsx`

Sidebar content in quiz mode.

Props:
```ts
interface QuizControlsProps {
  checkedIds: string[]
  onToggle: (id: string) => void
  onReset: () => void
}
```

Behavior:
- Renders all 10 system labels as checkboxes (all checked by default)
- If a checkbox is the last checked one, `onToggle` is not called (enforces minimum 1)
- "Reset Score" button calls `onReset`

### New: `src/components/QuizPanel.tsx`

Main area in quiz mode. Owns all quiz state.

Props:
```ts
interface QuizPanelProps {
  checkedIds: string[]
}
```

Internal state — two phases:
```ts
type Phase =
  | { tag: 'question'; system: Converter; value: number }
  | { tag: 'feedback'; system: Converter; value: number; correct: boolean }

// plus: userInput: string, score: { correct: number; total: number }
```

Score resets when the component remounts (App passes a `key` prop derived from a reset counter incremented by `onReset`).

**Font loading:** QuizPanel owns the same `fontReady` state logic as NumeralTile — a `useEffect` that calls `document.fonts.load()` for Egyptian and OCS systems. This is passed to `NumeralDisplay` via the `fontReady` prop.

**Submit on Enter:** The answer input field submits on `Enter` keydown (same as `InputPanel`'s behavior).

### Modified: `src/components/App.tsx`

New state:
```ts
const [mode, setMode] = useState<'translate' | 'quiz'>('translate')
const [checkedSystemIds, setCheckedSystemIds] = useState<string[]>(
  CONVERTERS.map(c => c.id)  // all 10 checked by default
)
const [quizResetKey, setQuizResetKey] = useState(0)
```

Sidebar renders:
```tsx
<ModeTabs mode={mode} onChange={setMode} />   {/* inline, not a separate component */}
{mode === 'translate'
  ? <InputPanel onResult={setValue} />
  : <QuizControls checkedIds={checkedSystemIds} onToggle={toggleSystem} onReset={resetQuiz} />
}
```

Main area renders:
```tsx
{mode === 'translate'
  ? <OutputGrid value={value} />
  : <QuizPanel key={quizResetKey} checkedIds={checkedSystemIds} />
}
```

`toggleSystem` flips an id in `checkedSystemIds`. `resetQuiz` increments `quizResetKey`.

## Question Generation

Pure helper function in `QuizPanel.tsx`:

```ts
function generateQuestion(checkedIds: string[]): { system: Converter; value: number } {
  const pool = CONVERTERS.filter(c => checkedIds.includes(c.id))
  const system = pool[Math.floor(Math.random() * pool.length)]
  const value = Math.floor(Math.random() * system.maxValue) + 1  // 1–maxValue, never 0
  return { system, value }
}
```

Zero is excluded — all systems except Mayan return `"∅"` for zero, which is unrecognizable and not a fair question.

## Answer Evaluation

```ts
const parsed = parseInt(userInput.trim(), 10)
const correct = !isNaN(parsed) && parsed === question.value
```

On Submit → transition to `feedback` phase. On Next Question → `generateQuestion` → transition to `question` phase.

## Feedback

In the `feedback` phase the card shows:
- The same numeral (unchanged)
- Green "✓ Correct — 42" or red "✗ Wrong — answer: 42"
- "Next Question" button

## Score

`{ correct: number; total: number }` in QuizPanel. Displayed as "3 / 5" on the question card.
- Correct submit: increments both `correct` and `total`
- Wrong submit: increments `total` only
- Reset: remounting QuizPanel via `key` prop resets to `{ correct: 0, total: 0 }`

## CSS

New classes added to `main.css`:

| Class | Purpose |
|---|---|
| `.mode-tabs` | Tab strip container below the title row |
| `.mode-tab` | Individual tab button (style similar to `.tile-modal-tab`) |
| `.mode-tab.active` | Active tab — gold color + bottom border |
| `.quiz-panel` | Full-height centered flex container in main area |
| `.quiz-card` | Question card — `bg-card` background, gold border, centered column |
| `.quiz-system-name` | System label above numeral (same as `.tile-modal-system-name`) |
| `.quiz-numeral-area` | Numeral display area — `min-height: 120px`, centered |
| `.quiz-score` | Score display — muted, top-right of card |
| `.quiz-input` | Answer text input — same style as `.numeral-input` |
| `.quiz-submit` | Submit button — gold background, dark text |
| `.quiz-next` | "Next Question" button — outlined gold |
| `.quiz-feedback` | Feedback line below input |
| `.quiz-feedback.correct` | Green text |
| `.quiz-feedback.wrong` | Red text |
| `.quiz-systems` | Sidebar checkbox list container |
| `.quiz-system-label` | Individual checkbox + label row |

## Testing

### `tests/components/NumeralDisplay.test.tsx`
- Renders SVG for mayan, babylonian, chineseRod
- Renders `<span className="tile-numeral mayan">` for alphabetic systems
- Renders `.tile-no-rep` for `∅` output
- Renders loading text when fontReady is false for egyptian/oldChurchSlavonic

### `tests/components/QuizControls.test.tsx`
- Renders all 10 system labels as checkboxes
- Clicking a checked checkbox calls `onToggle` with the system id
- Does not call `onToggle` when it would uncheck the last remaining checked system
- "Reset Score" button calls `onReset`

### `tests/components/QuizPanel.test.tsx`
- Renders a question card showing the system name
- Submitting the correct answer shows green feedback and score "1 / 1"
- Submitting a wrong answer shows red feedback + correct value, score shows "0 / 1"
- "Next Question" button is shown during feedback phase
- Clicking "Next Question" shows a new question (feedback panel hidden)
- Score resets when component is remounted

### `tests/components/QuizPanel.generate.test.ts`
- `generateQuestion` returns a system from the checked pool
- Returns a value in `[1, system.maxValue]`
- Never returns 0
- Only picks from systems in the checked pool

## File Summary

| File | Action |
|---|---|
| `src/components/NumeralDisplay.tsx` | Create |
| `src/components/QuizControls.tsx` | Create |
| `src/components/QuizPanel.tsx` | Create |
| `src/components/App.tsx` | Modify |
| `src/components/NumeralTile.tsx` | Modify (use NumeralDisplay) |
| `src/styles/main.css` | Modify (add quiz styles) |
| `tests/components/NumeralDisplay.test.tsx` | Create |
| `tests/components/QuizControls.test.tsx` | Create |
| `tests/components/QuizPanel.test.tsx` | Create |
| `tests/components/QuizPanel.generate.test.ts` | Create |
