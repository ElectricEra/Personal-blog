# Scale Game: reusable UI/UX patterns

This document looks at `pages/projects/scale-game` from a design and interaction point of view. Game rules and business logic are left out. The aim is to pull out choices that can be reused in other interactive projects (puzzles, tools, configurators).

Files covered:

- `pages/projects/scale-game/index.page.tsx` — page layout and interaction wiring
- `pages/projects/scale-game/index.module.css` — page styles
- `pages/projects/scale-game/translations/*` — copy
- Shared components: `RightBar`, `PhysicalButton`, `Popover`, `Modal`, `Collapsible`, `Select`, `PageWrapper`, `SectionHeader`, `Stack`, `Text`
- Site shell (shared by every page): `SideMenu` and the layout in `pages/_app.page.tsx` / `pages/app.module.css`

---

## 1. Page structure

### The site shell

Every page sits in the same three-column shell:

| Column | Component | Shown |
| --- | --- | --- |
| Left | `SideMenu` (rendered once from `_app`) | Always. Becomes a slide-out drawer at `768px` and below |
| Center | The page itself, max `980px`, centered in the space left over | Always |
| Right | `RightBar` (placed by the page) | Only at `1100px` and wider |

The left menu holds site navigation (the site name links home, then **Games** and **Projects** sections) and the language switcher. Because navigation and language live in the shell, game pages have no top bar or back button of their own.

### The game page

The center column is one vertical column. The order follows what the player needs from top to bottom:

1. **Title and one-sentence intro**, centered, intro capped at `640px` so the line length stays readable.
2. **Game controls**: difficulty select, "New puzzle", "Resign", settings. On desktop they live in the right bar under a small "Game" heading. Below `1100px` the same markup renders inline as a row under the intro.
3. **Rules** in a `Collapsible` that is open by default. Below the rules there is a "Starting information" block that changes with the selected difficulty.
4. **Game area**, rendered only after a game starts:
   - known facts ("Your information")
   - action buttons (Commit / Undo / Clear)
   - inventory and staged counter
   - one feedback line
   - context-dependent call to action (Submit guess / Finish with partial)
   - reveal panel (after the game ends)
   - the two scales
   - deduction tools (assumed-order board, free-text notes)
   - move history

Patterns to reuse:

- **Configure first, then play.** Before the first game, the page shows only the controls and the rules. The game area appears after "New puzzle", so a first-time visitor is not faced with an empty board.
- **Rules open by default, but collapsible.** New players see them right away. Returning players close them with one click. The panel below the rules repeats the parameters of the *selected* difficulty, so changing the select gives an immediate preview of what changes.
- **Scroll to Information when a round starts.** "New puzzle" brings the Information heading to the top of the window. The scroll runs only for that press: the click handler sets a ref, and an effect that depends on the new round reads it and clears it. Later updates, such as a timer tick or a move, do not move the page. The call is `scrollIntoView({ behavior: "smooth", block: "start" })`. The heading has `scroll-margin-top: 16px`, and `72px` at `768px` and below, so the sticky mobile menu does not cover it. When `prefers-reduced-motion: reduce` matches, the behavior is `"auto"`, an instant jump.
- **Separators group the zones.** Light `<hr>`s mark where the game area starts (above "Your information") and split it into "facts", "actions and board", and "your reasoning". There are no nested cards for this, which keeps the visual weight low.

---

## 2. Side bars

### Left menu (`SideMenu`)

- **Fixed, not scrolling with the page.** The menu is `position: fixed` to the left edge of the window, full height. The site name stays at the top and the language switcher at the bottom. Only the middle part (the sections and their links) scrolls, via `flex: 1; min-height: 0; overflow-y: auto`.
- **Grouped links with small headings.** Each section is a `<section aria-labelledby>` with a small uppercase grey heading. Sections are data (`SECTIONS` in `SideMenu.tsx`), so adding a page is one entry plus its translated name.
- **Current page is marked twice**: a yellow pill (`.active`) for sighted users and `aria-current="page"` for assistive tech.
- **Mobile drawer at `768px` and below.** A sticky top bar shows a menu button and the site name. The button slides the menu in from the left over a dimmed backdrop. It closes from the ✕ button, the backdrop, Escape, or picking a link, and also on any route change. While it is open, body scroll is locked. Focus moves to the close button on open and back to the menu button on close.
- **Hidden means hidden.** The closed drawer and its backdrop use `visibility: hidden` (with the visibility change delayed until the slide finishes), so their links are out of the tab order and the accessibility tree, not just off-screen.

```css
.menu { visibility: hidden; transform: translateX(-100%);
  transition: transform 0.25s ease, visibility 0s linear 0.25s; }
.open { visibility: visible; transform: none;
  transition: transform 0.25s ease; }
```

### Right bar (`RightBar`)

- **Desktop only, without duplicate markup.** The page renders its controls once, wrapped in `<RightBar title="…">`. At `1100px` and wider the bar is a fixed panel on the right edge. Below that it is `display: contents`, so it adds no box and the controls render inline where the bar was placed. Its heading is hidden there too.
- **The layout makes room only when needed.** The center column gets a right margin through `:has()`, so pages without a right bar keep the full width:

```css
.content:has([data-right-bar]) { margin-right: var(--right-bar-width); }
```

- **The page decides how its controls stack.** The bar only positions itself. The Scale game adds a `min-width: 1100px` rule that turns the control row into one column, shows a "Settings" label next to the gear, and fits the Resign popover to the bar's width so it cannot run off the screen edge.
- **The breakpoint is repeated** in `RightBar.module.css`, `app.module.css`, and the page's own CSS. Change all three together.

---

## 3. Staged actions: draft, then commit

The main interaction is a two-step transaction. The player builds a move from several placements, then commits it. Only committed state produces results.

How the UI supports this:

- **Pending items look different.** Uncommitted tokens have a dashed border (`.pendingToken`). Committed tokens are solid. This is the same dashed-means-draft convention used by the empty slots on the order board, so it is consistent across the page.
- **Pending items are buttons, committed items are not.** Clicking a dashed token removes it. Committed tokens are plain `<span>`s, so they cannot be clicked by accident.
- **The output reflects only committed state**, and the page says so: "The beam shows only the blocks you have already committed." When output intentionally lags behind input, say it on screen.
- **Progress toward the minimum** is a pill next to the inventory: `Staged: 2 / 3`. It uses `font-variant-numeric: tabular-nums` so the width does not shift as the number changes.
- **The transaction buttons sit together**: Commit (primary), Undo (removes the last item), Clear (removes everything). Each one is disabled when it would do nothing.

This pattern works anywhere a user builds a batch before applying it: bulk edits, form wizards, drawing tools, shopping carts.

---

## 4. Select a target, then act

Placing a block takes two steps: choose a pan (target), then press a color (item). The selected target stays selected, so several blocks can go to the same pan quickly.

- The target is a toggle button with `aria-pressed`. When selected, both the button and the pan it controls are highlighted (`.sideSelected`, `.panSelected` with an inset ring). That ties the control to the area it affects.
- A default target is set at game start (`main` / `left`), so the first click on a color always does something.
- A status line next to the inventory names the current target in words ("Placing on Main scale, Left pan."). The highlight shows the target, and the text confirms it without the user having to look back at the board.
- The inventory buttons show the **remaining count** as their label. They are disabled at zero, and their accessible name includes everything a sighted user can infer from color and number: "Place Red, 7 g, 3 left".

The order board uses a **tap-to-pick, tap-to-place** model instead of drag-and-drop:

- Tap a chip to pick it (`aria-pressed`, outline ring). Empty slots then get an accent border (`.slotReady`) to show where it can go.
- Tap a slot to place it there. Tap a placed chip while holding another to swap them.
- Tap the picked chip again to put it back in the tray.
- Fixed items (known information) are rendered as non-interactive spans with a tinted slot background (`.slotFixed`).

Tap-to-pick works the same with mouse, touch, and keyboard, and needs no drag library. For small sets of items, it is a good default before reaching for drag-and-drop.

---

## 5. Feedback

Feedback is spread across a few places, each with its own job:

| Where | What it shows |
| --- | --- |
| Per-scale outcome line | Current state of that scale ("Left heavier") |
| Beam tilt | Same state, shown visually |
| Global feedback line | Result of the last action (warning or success) |
| Pill | Progress toward a requirement |
| History list | Every past action and its result |
| Dialog error | Validation inside the dialog |

Details worth copying:

- **One feedback line, cleared on the next action.** `Feedback = { text, good }` is set by actions and reset to `null` by the next one. The line uses `aria-live="polite"` and the `hidden` attribute, with an explicit `.feedback[hidden] { display: none; }` so a `display` set elsewhere cannot override it.
- **Color carries meaning, but text carries it too.** Good is green, bad is red, and the message text is enough on its own.
- **Reserve space for status text.** `.outcome { min-height: 1.4em; }` keeps the layout from jumping when the text appears or changes length.
- **Animate state changes lightly.** The beam is a `div` rotated by ±8deg with `transition: transform 0.3s ease`. It is cheap, readable, and gives a physical feel without any animation library.
- **Explain why an action did not count.** When the scale balances with identical pans, the message says why that balance does not count, instead of showing a plain "no".
- **The end state shows everything.** After the game ends, all hidden values appear in a grid of colored cards sorted by value, with the number large and the name small.

---

## 6. Scaffolding for the user's own thinking

The page includes tools that don't affect the game state. They help the player think:

- **Assumed order board**: a ranking of five slots joined by `>` signs, plus a tray of unplaced items. Every item can carry a draft numeric value.
- **Notes textarea** with a placeholder that suggests what to write ("inequalities, equations, and ideas").
- **History** as an ordered list with a capped height (`max-height: 260px; overflow: auto`) so it does not take over the page.
- **Optional visual aid behind a setting**: "Ghost blocks that have a match on the other pan" dims tokens that cancel out (`opacity: 0.28`). It is off by default, so the core experience stays unassisted, and screen readers get a matching text suffix ("cancels").

**Draft values carry into the final submission.** When the player opens the guess dialog, it is prefilled with the drafts from the order board, and the rows are sorted in the player's assumed order. The work they did on the scratch board is not lost.

Generalized: if a task needs reasoning, give the user a place to keep their reasoning next to the task, and reuse what they enter there when they submit.

---

## 7. Escalating weight of confirmation

Different actions use different confirmation surfaces, matched to how much is at stake:

| Action | Surface | Why |
| --- | --- | --- |
| Place, undo, clear | None | Cheap and reversible |
| Resign | `Popover` next to the button | Destructive but simple: one question, two answers |
| Submit final guess | `Modal` with a form | Needs input and validation, and uses up a limited attempt |
| Settings | `Modal` | Separate from the game flow |

Details:

- **The popover asks a full question and names its answers by result**: "Resign and reveal the weights? This ends the puzzle." with "Reveal weights" / "Keep playing", not "Yes" / "No".
- **The modal uses a real `<form>`**, so Enter submits. Errors show inline and clear as soon as the user edits a field.
- **Inputs are cleaned as the user types**: `inputMode="numeric"` brings up the numeric keyboard on mobile, and `value.replace(/\D/g, "")` drops non-digits. That avoids `type="number"` and its spinner and scroll-wheel quirks.
- **Known values are shown as text, not as locked inputs.** If a value is given, it appears as "7 g", not as a disabled field.
- **The context-dependent CTA appears only when it is valid.** "Submit guess" exists only once the puzzle state allows it. It is not shown as a disabled button the rest of the time.

- **The Resign popover can only be open during a game.** It is controlled with `open={interactive && resigning}`, so if the game ends while it is open, it closes on its own.

Disabled versus hidden, in short:

- **Disabled:** standing controls and actions in the normal loop (Resign, Commit, Undo, Clear, inventory). They stay visible and are disabled when they don't apply, so the layout stays stable and the player learns where things are. Resign is always in the controls and is disabled until a game is running.
- **Hidden:** milestone actions (Submit guess, Finish with partial). They appear only when they apply, so their appearance is itself a signal.

---

## 8. Shared components and what they encode

### `PhysicalButton`

A button that looks pressable: a solid offset "lip" under the button (`box-shadow: 0 var(--depth) 0 var(--lip)`) that shrinks while the button moves down on `:active`.

- `--depth` / `--pressed-depth` custom properties control the effect.
- The border and lip use the gold tokens from `global.css` (`--color-edge`, `--color-lip`, `--color-lip-secondary`) rather than black. `Select` uses the same tokens and the same press effect, so the select and the buttons in the control row read as one set.
- It has `min-width: 200px`. Inside narrow containers (the right bar, the Resign popover), set `min-width: 0` so it can shrink to fit.
- `[aria-expanded="true"]` also shows the pressed state, so a button that opened a popover stays visibly "down" while the popover is open.
- Two variants: `primary` (brand yellow) and `secondary` (white). Each screen has one primary action, and the rest are secondary.
- `prefers-reduced-motion` turns off the movement transition.
- `type="button"` is the default, so it never submits a form by accident.

### `Popover`

A controlled `open` / `onOpenChange` component that wraps any trigger with `cloneElement` and adds `aria-expanded`, `aria-controls`, and `aria-haspopup`. It closes on an outside `pointerdown` or on Escape, moves focus into the panel when it opens, and returns focus to the trigger when it closes. `className` styles the anchor, and `panelClassName` overrides the panel (the default panel is centered under the trigger).

### `Modal`

Focus trap, Escape to close, body scroll lock, focus returned to the opener, the first input focused on open, and a backdrop that is a real `<button>` with a label so it can be reached by keyboard and screen reader. `aria-labelledby` points to the title when there is one.

### `Collapsible`

A heading that wraps a full-width button with `aria-expanded` / `aria-controls`, a chevron that rotates 180°, and a `hidden` panel. The heading level is configurable so the document outline stays correct.

### Hint bubble

The "?" next to each scale title opens a small `Popover` with instructions on click or tap. The panel is left-aligned to the icon instead of centered, with its width capped at `min(280px, 70vw)` so it stays on screen on phones. Use this for short, optional instructions that would clutter the layout if always visible.

Don't use a CSS-only `:hover` / `:focus-within` tooltip for content that matters on touch devices. iOS Safari does not focus buttons on tap, so the tooltip never opens there.

---

## 9. Responsive layout

- **Grid with `minmax(0, 1fr)`** everywhere (`.controlRow`, `.scales`, `.pans`, `.answers`) so long labels shrink and wrap instead of overflowing.
- **Breakpoints:**

| Width | What changes |
| --- | --- |
| `1100px` and wider | Controls move into the right bar and stack in one column. The settings button shows its label. |
| `721px` to `1099px` | Controls are an inline row: select, New puzzle, Resign, and an icon-only settings button. |
| `768px` and below | The left menu becomes a drawer behind a menu button (site shell). |
| `720px` and below | The two scales stack, the reveal grid goes from 5 to 3 columns, the control row tightens (smaller font, the select sized to its content), and button groups center. |

- **A stable control row.** Because Resign is always rendered (disabled outside a game), the row always has the same columns: three equal text columns and one for the icon button (`repeat(3, minmax(0, 1fr)) auto`). The row does not reflow when a game starts.
- **The icon-only button gets a fixed square column** (`auto`, `42px` wide). The text buttons share the remaining space equally.
- **Wrapper elements must pass size through.** The popover root (`.stretchAnchor`) is made `display: flex; min-width: 0` so the button inside can fill its grid cell like its siblings.
- **Equal-width action buttons only on desktop** (`.moveControls > button { flex: 1 }` above 720px). On mobile they wrap naturally.
- **Horizontal scroll for an ordered chain.** The five ranking slots stay in one row and scroll sideways (`overflow-x: auto`) on narrow screens instead of wrapping, because wrapping would break the left-to-right "heavier → lighter" reading.

---

## 10. Visual language

- **Flat, outlined, high contrast.** A white page with 1–2px near-black borders (`--color-black`) on cards and inputs, and gold edges on buttons and selects. Rounded corners range from 4px (inputs) to 12px (cards, dialogs).
- **Yellow means "here" or "go".** The primary button, the current page in the left menu, and the selected language all use `--color-yellow`.
- **Side bars are quiet.** White, with a single light-purple divider (`--color-light-purple`) toward the content, and small uppercase grey section headings. They frame the game without competing with it.
- **Only overlays get shadows.** Popovers, dialogs, hint bubbles, and the open mobile drawer have soft shadows. Cards in the page flow use borders only.
- **Fixed color tokens per entity.** Each of the five game colors has one class (`.red`, `.yellow`, …) that sets both background and a contrasting text color (yellow gets dark text, the others white). The same class styles inventory blocks, tokens, chips, and reveal cards, so an entity looks the same everywhere.
- **Color is never the only identifier.** Every colored element also has a one-letter label (R, Y, G, B, P) or the full name. This helps color-blind users and the visual stays readable in grayscale.
- **Shapes hint at the physical object.** The pan has a rounded bottom only (`border-radius: 0 0 16px 16px`), the base is a CSS border triangle, and the beam is a rounded bar. A few CSS shapes are enough to suggest the object without images.
- **Focus ring**: `2px solid var(--color-dark-blue)`, used across inputs, buttons, the hint trigger, the popover panel, and the menu links. It has a positive offset in the page, and a negative (inset) one in the left menu so it is not clipped by the menu's scroll area.
- **Disabled is consistent**: lower opacity (0.45–0.6) and `cursor: not-allowed`.

---

## 11. Accessibility

Most of this is already covered above. The practices that apply to any project:

- Every icon-only button has an `aria-label`, and the icon has `aria-hidden`.
- Toggle-like buttons use `aria-pressed` (pan select, order chips). Buttons that open a dialog use `aria-haspopup="dialog"` plus `aria-expanded`.
- Landmarks: the left menu is a `<nav>` ("Site menu"), the right bar is an `<aside>` named by its visible heading (`aria-labelledby`), and the page content is `<main>`.
- `<section aria-label>` groups regions (each scale, inventory, order board, history, reveal).
- Drawers and popovers manage focus: focus moves in when they open and returns to the button that opened them when they close. Escape closes them.
- Text that only makes sense visually gets a screen-reader version. A token shows "R" but reads "Red"; a fixed slot gets a hidden "Known middle weight" note. A local `.srOnly` utility handles this.
- Accessible names include the state a sighted user would see: remaining count, known weight, "cancels".
- Status regions use `aria-live="polite"`, not `assertive`.
- Text inputs have `autoComplete="off"` because browser autofill suggestions would be noise here.

---

## 12. Copy and i18n

- **All copy lives in one typed object per language.** `en.ts` defines the shape (`GameTranslation = typeof en`), and `uk.ts` must satisfy it. `translations` uses `satisfies Record<Language, GameTranslation>`, so a missing key in either language fails type checking.
- **Strings with values are functions**, not templates with placeholders: `staged: (count, min) => ...`, `placeBlock: (color, weight, count) => ...`. Each language can then reorder words and handle plurals its own way. `uk.ts` includes a Ukrainian plural helper (`блок` / `блоки` / `блоків`).
- **Accessible labels are translated too.** `aria-label` strings come from the same object, so screen-reader text is localized along with the visible text.
- **Writing style**: short, declarative sentences. Rules are a bulleted list with one idea per bullet. Error messages say what to do ("Place at least 3 blocks before committing."), not only what went wrong.

---

## 13. Code conventions that support the UI

- **Map entities to classes with a typed record**, not an `if` chain. A missing key fails type checking when a new color or outcome is added:

```ts
const colorClassNames: Record<Color, string> = {
  red: styles.red,
  yellow: styles.yellow,
  // ...
};
```

- **Join conditional classes with `cx`** from `utils/cx.ts`. It drops falsy values, so there are no stray spaces or `""` branches:

```tsx
className={cx(styles.slot, color && styles.slotFilled, picked && !fixed && styles.slotReady)}
```

- **Respect `prefers-reduced-motion`.** The button press, the drawer slide, and the backdrop fade are turned off by a `prefers-reduced-motion: reduce` media query. The beam tilt does not have one yet. CSS cannot see motion started from JS. The scroll to Information checks `window.matchMedia("(prefers-reduced-motion: reduce)")` and uses `behavior: "auto"` when it matches. Do the same for any new `scrollIntoView` or `element.animate`.
