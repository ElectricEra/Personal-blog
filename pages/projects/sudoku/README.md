# How this Sudoku is generated

The whole pipeline lives in `sudoku.ts` (`generatePuzzle`). It has two acts: **build a full valid board**, then **carve cells out** until the chosen difficulty is reached — without ever creating a puzzle that has more than one solution.

## 1. Create a complete board

1. Start from an empty 9×9 grid (zeros).
2. Walk empty cells in order (`findEmptyCell`).
3. For each empty cell, try digits `1–9` in a **random order** (`shuffle` + `fillBoard`).
4. A digit is allowed only if it does not already appear in that row, column, or 3×3 box (`isPlacementValid`).
5. If a branch fails, backtrack: clear the cell and try the next digit.

Because candidates are shuffled, each full board is a different valid solution, not a fixed template.

## 2. Decide which cells to remove

1. List all 81 positions and **shuffle** that list — removal order is random, not “center first” or “edges first”.
2. For each position, while the board still has more filled cells than the difficulty target:
   - Temporarily clear the cell.
   - Run `countSolutions` on a clone of the board (stops early once it finds 2 solutions).
   - **Keep the cell empty** only if there is still exactly **one** solution.
   - Otherwise **restore** the digit — that cell was a necessary clue.

So removal is: *random candidate + uniqueness gate*. We never leave a puzzle with 0 or 2+ solutions on purpose.

## 3. How “complexity” is accessed today

Difficulty is **not** based on solving techniques (naked singles, pointing pairs, X-Wing, etc.). It is a **clue-count budget**:

| Difficulty | Target clues left (`CLUES`) |
| ---------- | --------------------------- |
| easy       | 40                          |
| medium     | 32                          |
| hard       | 26                          |

Fewer clues usually means a harder feel, but it is a blunt proxy: two puzzles with 26 clues can still differ a lot in how hard they are to solve by hand.

Generation stops when `remaining <= minClues`. Some removals may be rejected by the uniqueness check, so a “hard” puzzle might end slightly above 26 clues if further removals would create multiple solutions.

## Mental model

```
empty grid
    → fillBoard (random backtracking)     → full valid solution
    → shuffle cell order
    → dig holes if still unique           → playable puzzle
    → stop near CLUES[difficulty]
```

## Honest limits (good future stories)

- Complexity ≈ clue count, not human solving depth.
- Uniqueness is enforced; “minimal” (no clue can be removed) is not guaranteed beyond hitting the target.
- Harder levels dig more cells, so generation can take longer because `countSolutions` runs more often.

## Solver / hints

Hints live in `solver.ts` (`findNextHint`). They never auto-fill the board — they only explain the simplest forced placement.

### Candidate model

For each empty cell, candidates are digits `1–9` that do not already appear in that row, column, or 3×3 box (`getCandidates`).

### Technique ladder (simplest first)

1. **Last empty** — a row, column, or box has exactly one empty cell → that cell gets the missing digit. Prefer **box → row → col** (easiest to spot). Highlight only the filled cells in that unit.
2. **Naked single** — the cell has exactly one candidate, but no house is “last empty”. Among several, pick the easiest by filled neighbors in row+col+box. Highlight one blocker cell per eliminated digit.
3. **Hidden single** — within a row, column, or box, a digit can appear in only one empty cell.

The first technique with a hit wins. Explanations are Ukrainian and use 1-based row/column numbers.

The UI highlights the **target cell** (blue) and the **cause cells** (purple).

### v1 limits

- No pairs, pointing pairs, X-Wing, chains, or guessing in the hint path.
- If neither technique fires on an unfinished board, the UI says simple techniques cannot see the next move — harder patterns are not implemented yet.
