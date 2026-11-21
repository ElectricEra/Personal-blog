# Coding principles

This is the reference for writing code in this repo. Read it before adding or changing a project page. UI, interaction, and accessibility patterns are covered separately in [scale-game-ui-ux-patterns.md](scale-game-ui-ux-patterns.md).

The stack: Next.js (pages router), React 19, TypeScript, CSS modules, Biome for lint and format.

---

## 1. Keep files small

- Aim for **under 300 lines** per file. **500 lines is the hard ceiling.** A file past it must be split before more code goes in.
- Split by responsibility, not by line count: pure logic, state, and markup are different concerns and belong in different files.
- A page file only **composes** the page. It calls hooks and renders components. It does not define sub-components inline, and it does not hold game rules.
- One component per file. Small private helpers used only by that component may live in the same file.

## 2. Project folder layout

`next.config.js` sets `pageExtensions: ["page.tsx", "page.ts"]`, so only `*.page.tsx` files become routes. Everything else can sit next to the page.

A project folder looks like this:

```
pages/projects/my-game/
  index.page.tsx        page composition only
  index.module.css      page-level layout only
  useMyGame.ts          state and actions (one or more hooks)
  game.ts | logic/      pure TypeScript, no React
  components/
    Board.tsx
    Board.module.css
  translations/
    en.ts
    uk.ts
    index.ts
```

- **Logic** (`game.ts`, or a `logic/` folder once it grows past one file) is plain TypeScript: types, config, and pure functions. No React, no DOM, no translations. Functions that use randomness take `random: () => number = Math.random` as a parameter so they stay deterministic in tests.
- **Hooks** (`use*.ts`) own `useState`, effects, and the action handlers. They return the state and the actions the page needs. Split a hook when it holds two unrelated pieces of state, for example the game loop and the scratch board.
- **Components** (`components/*.tsx`) are presentational. They get data and callbacks through props, and their labels from the `copy` prop. Each one has its own `.module.css` when it needs styles.
- **Translations** live in `translations/` (see section 5).

## 3. Shared code

If a second project would copy it, it belongs in a shared place:

- **Components** go in `components/Name/Name.tsx` with `Name.module.css` next to it. Use a named export (`export const Name`).
- **Utilities and hooks** that are not React components go in `utils/` (for example `utils/shuffle.ts`, `utils/useScrollIntoView.ts`).
- Shared components take every visible string and `aria-label` as a prop. They have no translations of their own, so each page stays in charge of its copy.
- Before writing a new UI block, check `components/`. The game pages share these:

| Component | Use it for |
| --- | --- |
| `GameHeader` | The page title with its one-sentence intro |
| `GameControls` | The controls row, placed in the right bar on desktop |
| `GameControls/ConfirmPopover` | A one-question confirmation in the controls row (Resign, Reveal) |
| `GameControls/SettingsButton` | The gear button in the controls row that opens the settings modal |
| `SettingsModal`, `SettingsCheckbox` | The settings dialog and its toggles |
| `GameRules` | The collapsible rules list with the starting-information block |
| `ZoneHeading` | A separator plus a section heading inside the game area |
| `ButtonRow` | A row of action buttons, stretched on desktop or centered |
| `FeedbackLine` | The single `aria-live` feedback message (`Feedback` type) |
| `Hint` | Muted secondary text: a tip or a note about what the screen shows |
| `HistoryList` | A capped, scrollable list of past moves or checks |
| `Pill` | A small rounded counter |
| `VisuallyHidden` | Text for screen readers only |

- Do not duplicate CSS between two projects. If two modules share rules, move them into the shared component that renders that markup.

## 4. TypeScript

- No `any`. Narrow with type guards (`isDifficulty(value): value is Difficulty`) instead of casting.
- Derive types from data: `const COLORS = [...] as const; type Color = (typeof COLORS)[number]`.
- Validate config objects with `satisfies` so the literal types are kept: `DIFFICULTIES = {...} as const satisfies Record<Difficulty, DifficultyConfig>`.
- Use `Record<Key, Value>` to map an entity to anything (class names, labels). A new key then fails type checking until every map handles it.
- **Export only what another file imports.** Helpers used inside one module stay unexported. Remove an export as soon as its last importer is gone.

## 5. Translations

- `en.ts` defines the shape: `export type GameTranslation = typeof en`. `uk.ts` is typed `GameTranslation`. `index.ts` exports `translations = { en, uk } satisfies Record<Language, GameTranslation>`, so a missing key fails type checking.
- Read copy with `const copy = useTranslation(translations)` in the page, and pass `copy` (or single strings) down as props.
- Strings that contain values are functions, not templates with placeholders: `staged: (count: number, min: number) => ...`. Each language can then order words and handle plurals its own way.
- `aria-label` text is translated too.
- **Every key must be used.** When you remove the last use of a key, delete it from every language in the same change.

## 6. React

- Join class names with `cx` from `utils/cx.ts`, never with template strings: `cx(styles.slot, filled && styles.slotFilled)`.
- Map entities to class names with a typed record (`colorClassNames: Record<Color, string>`), not an `if` chain.
- Compute derived values during render. Keep state minimal: do not store anything that can be computed from other state.
- Use the index that `map` already gives you; do not search the array again with `indexOf`.
- When a value is built the same way in two places, extract a helper and call it from both.
- Pass `ref` as a regular prop (React 19); `forwardRef` is not needed.
- Any motion started from JS (`scrollIntoView`, `element.animate`) checks `prefers-reduced-motion`. CSS transitions get a `prefers-reduced-motion: reduce` media query.

## 7. CSS

- One CSS module per component. Class names are camelCase.
- Page modules hold only page layout. Styles for a component live with that component.
- Use the color tokens from `pages/global.css` (`--color-black`, `--color-dark-blue`, `--color-success`, `--color-error`, …) instead of new hex values where a token exists.
- `global.css` resets `margin` and `padding` to 0 on every element, so do not repeat `margin: 0` in modules.
- Use `minmax(0, 1fr)` in grids so long text shrinks instead of overflowing.
- The right-bar breakpoint (`1100px`) is repeated in `RightBar.module.css`, `app.module.css`, and `GameControls.module.css`. Change them together.

## 8. Comments

- Comment only a constraint the code cannot show (a browser quirk, a non-obvious invariant, why a selector needs extra specificity).
- Do not narrate what the next line does, and do not leave history ("moved from…", "used to…").
- No commented-out code.

## 9. No leftovers

- No prototypes, scratch HTML, screenshots, or unused assets inside `pages/`.
- No unused exports, translation keys, CSS classes, components, or files.
- Delete code when it stops being used, in the same change that removed its last use.

### How to audit a project for dead code

1. **Translation keys:** for each key in `en.ts`, search the project for `copy.<key>` (and for places where `copy` is passed to a component, search that component). A key with no hit is dead.
2. **CSS classes:** for each `.className` in a module, search the importing files for `styles.<className>`. Remember classes used only inside other selectors in the same file.
3. **Exports:** for each `export`, search the repo for the name. If only its own file uses it, drop the `export`. If nothing uses it, delete it.
4. **Files:** any file in the project folder that no `import` reaches and that is not a `*.page.tsx` is dead.

## 10. Done means

Before finishing a change:

1. `npx tsc --noEmit` passes.
2. `npm run lint` passes (it also formats with Biome).
3. `npm run build` passes.
4. The page was checked in the browser in both English and Ukrainian, at desktop width (1100px and wider), tablet width, and phone width (720px and below).
5. No file is over 500 lines, and the dead-code audit above finds nothing.
