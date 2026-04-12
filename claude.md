# Numeral Translator — Project Brief for Claude Code

You are being asked to **plan, architect, and then build** a numeral translation tool
for a History of Mathematics course. This document is your starting brief.

**Your first job is not to write application code.** Your first job is to read this
brief carefully, ask any clarifying questions you need, and then produce a complete
project plan — stored in the Obsidian vault described below — before a single line
of application code is written.

---

## What the project does

A web application that translates numbers across ancient numeral systems. Two input
modes:

1. **Photo input** — user uploads or photographs a number written in an ancient system;
   Claude Vision identifies the symbols and returns the value.
2. **Typed input** — user types a standard Arabic integer and sees it rendered in every
   supported system simultaneously.

### Numeral systems to support (minimum)

- Egyptian Hieroglyphic
- Ionian (Milesian) Greek — alphabetic, with keraia
- Attic Greek — acrophonic
- Babylonian — base-60 cuneiform
- Roman
- Mayan — base-20, dot-and-bar
- Chinese rod numerals

Each system has unique quirks: some have no zero, some have strict maximum values,
some require custom SVG rendering because Unicode coverage is incomplete. The plan
must address each system individually.

---

## Core architectural constraint

**All conversion flows through a plain Arabic integer.** No converter ever talks to
another converter directly. Every system exports exactly two functions:

```
toArabic(input: string): number
fromArabic(n: number): string
```

Photo input feeds into the same pipeline as typed input — Vision returns an Arabic
integer, which then fans out to all converters. This constraint is non-negotiable;
plan around it.

---

## Multi-agent design requirement

This project must be designed for **multi-agent execution** in Claude Code. Before
writing any plan, think carefully about which workstreams are genuinely independent
and can run in parallel, and which have hard dependencies that require sequencing.

At minimum, consider separate agents (or clearly separated workstreams) for:

- **Converter agents** — one per numeral system, each responsible for conversion
  logic, edge case handling, and test cases for that system only
- **Renderer agent** — responsible for the SVG/Unicode rendering layer that turns
  converter output into visible symbols (especially Mayan and Babylonian)
- **Vision agent** — responsible for the Claude API integration, prompt engineering
  for symbol recognition, and graceful failure handling
- **UI agent** — responsible for the React/HTML interface, input handling, and
  the output display grid
- **QA agent** — responsible for cross-system test cases, edge case validation
  (zero, max values, fractions), and integration tests

The plan must define: what each agent owns, what its inputs and outputs are, what
it must NOT touch, and in what order agents should be spawned relative to each other.
Think about where shared interfaces need to be locked before parallel work begins.

---

## Obsidian vault setup

The project repository will contain an `obsidian/` directory that is a live Obsidian
vault. **You must create and populate this vault as part of the planning phase**, not
as an afterthought.

### Required vault structure

```
obsidian/
├── 00 - Project Home.md          ← session dashboard, opened every work session
├── 10 - Planning/
│   ├── Architecture.md           ← definitive system design, updated as it evolves
│   ├── Agent Map.md              ← which agent owns what, spawn order, interfaces
│   ├── Phase Checklist.md        ← build phases with checkbox tasks
│   └── Design Decisions.md       ← log of WHY choices were made
├── 20 - Numeral Systems/         ← one note per system
│   ├── Egyptian Hieroglyphic.md
│   ├── Ionian Greek.md
│   ├── Attic Greek.md
│   ├── Babylonian.md
│   ├── Roman.md
│   ├── Mayan.md
│   └── Chinese Rod.md
├── 30 - Dev Notes/
│   ├── Converter Interface.md    ← the toArabic/fromArabic contract, locked early
│   ├── Vision API Notes.md       ← prompt engineering, failure modes, overrides
│   ├── Rendering Strategy.md     ← Unicode vs SVG decisions per system
│   └── Bugs and Fixes.md
└── 40 - Class Notes/             ← placeholder for user's own class material
    └── README.md
```

Each numeral system note in `20 - Numeral Systems/` must contain, at minimum:

- How the system works (brief, accurate summary)
- The conversion algorithm or lookup table
- Known edge cases (no zero? max value? special notation?)
- At least 5 test cases with expected input → output
- Unicode range or rendering approach
- Links to other relevant notes using `[[wikilinks]]`

The `Agent Map.md` note must be a detailed breakdown of every agent: name, scope,
inputs, outputs, dependencies, and spawn order.

`00 - Project Home.md` must be a living dashboard. It should include:
- Project status at a glance
- Links to every major note
- A session log section (append-only, newest at top)
- Current blockers

---

## Tech stack

- **Frontend**: React + Vite (single-page app)
- **Styling**: plain CSS, no UI framework
- **Vision**: Claude API (`claude-sonnet-4-20250514`), image sent as base64
- **Conversion logic**: pure TypeScript modules, one file per system
- **Rendering**: Unicode where viable; custom SVG for Mayan and Babylonian
- **Testing**: Vitest
- **No backend** — runs entirely client-side; the Claude API call is made directly
  from the browser using a key stored in `.env.local`

---

## Known design decisions that need to be resolved in the plan

The plan must address each of these explicitly — not defer them:

1. **Input range** — what is the minimum and maximum Arabic integer the app will
   accept? Justify the choice against the constraints of each numeral system.

2. **Zero handling** — most ancient systems have no zero. What does the UI show?

3. **Fractions** — out of scope for v1, but the plan must state this explicitly so
   no converter accidentally handles them incorrectly.

4. **Font loading** — Egyptian Hieroglyphic Unicode (U+13000–U+1342F) requires Noto
   Sans Egyptian Hieroglyphs. The plan must specify how this font is loaded and what
   the fallback is when it hasn't loaded yet.

5. **Vision failure handling** — when the API cannot confidently identify a numeral,
   the plan must specify exactly what the user sees and what manual override looks like.

6. **Mayan rendering** — Mayan numerals (dots and horizontal bars, base-20) have no
   clean Unicode representation that renders reliably across systems. The plan must
   specify the SVG rendering approach in enough detail that a converter agent can
   implement it without further design work.

7. **Quiz mode** — a stretch goal where the app shows a numeral and asks the user to
   identify it. The plan should include this as a clearly scoped Phase 4 with enough
   detail to implement later.

---

## What to produce before writing any application code

1. **Read this entire brief** and flag any ambiguity before proceeding.

2. **Create the Obsidian vault** — all folders and all notes listed above, populated
   with real content (not placeholders). The numeral system notes especially should
   contain accurate conversion algorithms. Research each system; do not invent rules.

3. **Produce `10 - Planning/Architecture.md`** — the definitive technical design.
   This is the document that all agents will reference. It must be complete enough
   that an agent working on converters and an agent working on UI can operate
   independently without stepping on each other.

4. **Produce `10 - Planning/Agent Map.md`** — the multi-agent execution plan.
   Include a spawn order diagram (even ASCII is fine), the interface contract that
   must be locked before parallel work begins, and how agents should hand off work.

5. **Produce `10 - Planning/Phase Checklist.md`** — a phased build plan with
   checkbox tasks, estimated complexity per task, and clear definition of done for
   each phase.

6. **Confirm with the user** that the plan looks correct before proceeding to
   implementation.

---

## What not to do

- Do not start writing `src/` application code until the Obsidian vault is complete
  and the user has confirmed the plan.
- Do not create stub or placeholder notes — every note should contain real, accurate
  content from the start.
- Do not invent conversion rules for any numeral system — research them accurately.
  These will be tested against real class material.
- Do not collapse the multi-agent design into a single sequential build — the whole
  point is parallelism where it genuinely exists.
- Do not skip the Design Decisions log. Every non-obvious choice made during planning
  must be recorded with a rationale.

---

## Context about the user

- CS student (senior, graduating this spring), Oregon Institute of Technology
- Comfortable with TypeScript, React, Git, and working in VS Code + Claude Code
- This tool will be used in an actual History of Mathematics course — accuracy of
  conversion rules matters more than visual polish
- Prefers direct communication, no unnecessary ceremony

---

When you are ready to begin: confirm you have read and understood this brief, state
any questions you have, then proceed to build the Obsidian vault and planning documents.
Do not write application code until the planning phase is explicitly complete.
