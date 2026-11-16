import { type Board, isSolved } from "./sudoku";

const SIZE = 9;
const BOX = 3;
const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export type HintTechnique = "last-empty" | "naked-single" | "hidden-single";
export type HintUnit = "row" | "col" | "box";

export type CellRef = {
  row: number;
  col: number;
};

export type Hint = {
  technique: HintTechnique;
  row: number;
  col: number;
  value: number;
  unit?: HintUnit;
  /** Filled cells that force this placement — highlight these for the player. */
  causes: CellRef[];
  explanation: string;
};

const cellKey = (row: number, col: number) => `${row}-${col}`;

const uniqueCells = (cells: CellRef[]): CellRef[] => {
  const seen = new Set<string>();
  const result: CellRef[] = [];
  for (const cell of cells) {
    const key = cellKey(cell.row, cell.col);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(cell);
  }
  return result;
};

const isPlacementValid = (
  board: Board,
  row: number,
  col: number,
  value: number,
) => {
  for (let i = 0; i < SIZE; i += 1) {
    if (board[row]?.[i] === value || board[i]?.[col] === value) {
      return false;
    }
  }

  const boxRow = Math.floor(row / BOX) * BOX;
  const boxCol = Math.floor(col / BOX) * BOX;
  for (let r = boxRow; r < boxRow + BOX; r += 1) {
    for (let c = boxCol; c < boxCol + BOX; c += 1) {
      if (board[r]?.[c] === value) {
        return false;
      }
    }
  }

  return true;
};

export const getCandidates = (
  board: Board,
  row: number,
  col: number,
): number[] => {
  if ((board[row]?.[col] ?? 0) > 0) {
    return [];
  }

  return NUMBERS.filter((value) => isPlacementValid(board, row, col, value));
};

const buildCandidateGrid = (board: Board): number[][][] =>
  Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) => getCandidates(board, row, col)),
  );

const countFilledInRow = (board: Board, row: number) => {
  let filled = 0;
  for (let col = 0; col < SIZE; col += 1) {
    if ((board[row]?.[col] ?? 0) > 0) {
      filled += 1;
    }
  }
  return filled;
};

const countFilledInCol = (board: Board, col: number) => {
  let filled = 0;
  for (let row = 0; row < SIZE; row += 1) {
    if ((board[row]?.[col] ?? 0) > 0) {
      filled += 1;
    }
  }
  return filled;
};

const countFilledInBox = (board: Board, row: number, col: number) => {
  const boxRow = Math.floor(row / BOX) * BOX;
  const boxCol = Math.floor(col / BOX) * BOX;
  let filled = 0;
  for (let r = boxRow; r < boxRow + BOX; r += 1) {
    for (let c = boxCol; c < boxCol + BOX; c += 1) {
      if ((board[r]?.[c] ?? 0) > 0) {
        filled += 1;
      }
    }
  }
  return filled;
};

const missingDigitInCells = (board: Board, cells: CellRef[]) => {
  const present = new Set<number>();
  for (const cell of cells) {
    const value = board[cell.row]?.[cell.col] ?? 0;
    if (value > 0) {
      present.add(value);
    }
  }
  return NUMBERS.find((digit) => !present.has(digit));
};

const filledCellsOnly = (board: Board, cells: CellRef[]): CellRef[] =>
  cells.filter((cell) => (board[cell.row]?.[cell.col] ?? 0) > 0);

const emptyCellsIn = (board: Board, cells: CellRef[]): CellRef[] =>
  cells.filter((cell) => (board[cell.row]?.[cell.col] ?? 0) === 0);

const rowCells = (row: number): CellRef[] =>
  Array.from({ length: SIZE }, (_, col) => ({ row, col }));

const colCells = (col: number): CellRef[] =>
  Array.from({ length: SIZE }, (_, row) => ({ row, col }));

const boxCells = (box: number): CellRef[] => {
  const boxRow = Math.floor(box / BOX) * BOX;
  const boxCol = (box % BOX) * BOX;
  const cells: CellRef[] = [];
  for (let r = boxRow; r < boxRow + BOX; r += 1) {
    for (let c = boxCol; c < boxCol + BOX; c += 1) {
      cells.push({ row: r, col: c });
    }
  }
  return cells;
};

const unitLabelUk = (unit: HintUnit, index1Based: number) => {
  if (unit === "row") {
    return `${index1Based}-му рядку`;
  }
  if (unit === "col") {
    return `${index1Based}-му стовпці`;
  }
  return `${index1Based}-му квадраті 3×3`;
};

/**
 * Last empty cell in a house: 8 filled → the empty cell gets the missing digit.
 * Prefer box, then row, then column (easiest visual scan first).
 */
const findLastEmpty = (board: Board): Hint | null => {
  const tryUnit = (
    cells: CellRef[],
    unit: HintUnit,
    index1Based: number,
  ): Hint | null => {
    const empty = emptyCellsIn(board, cells);
    if (empty.length !== 1) {
      return null;
    }
    const target = empty[0];
    if (!target) {
      return null;
    }
    const value = missingDigitInCells(board, cells);
    if (value === undefined) {
      return null;
    }
    return {
      technique: "last-empty",
      row: target.row,
      col: target.col,
      value,
      unit,
      causes: filledCellsOnly(board, cells),
      explanation: `Last empty: у ${unitLabelUk(unit, index1Based)} лишилась одна порожня клітинка (рядок ${target.row + 1}, стовпець ${target.col + 1}) — туди йде цифра ${value}, якої ще немає в цьому ${unit === "row" ? "рядку" : unit === "col" ? "стовпці" : "квадраті"}. Це найпростіший тип підказки: достатньо подивитись лише на один юніт.`,
    };
  };

  for (let box = 0; box < SIZE; box += 1) {
    const hint = tryUnit(boxCells(box), "box", box + 1);
    if (hint) {
      return hint;
    }
  }

  for (let row = 0; row < SIZE; row += 1) {
    const hint = tryUnit(rowCells(row), "row", row + 1);
    if (hint) {
      return hint;
    }
  }

  for (let col = 0; col < SIZE; col += 1) {
    const hint = tryUnit(colCells(col), "col", col + 1);
    if (hint) {
      return hint;
    }
  }

  return null;
};

/**
 * Minimal set of filled cells that explain a general naked single: for each
 * eliminated digit, one peer that already holds that digit.
 */
const collectNakedSingleCauses = (
  board: Board,
  row: number,
  col: number,
  answer: number,
): CellRef[] => {
  const causes: CellRef[] = [];

  for (const digit of NUMBERS) {
    if (digit === answer) {
      continue;
    }
    const blockers = collectDigitBlockers(board, row, col, digit);
    const blocker = blockers[0];
    if (blocker) {
      causes.push(blocker);
    }
  }

  return uniqueCells(causes);
};

/** Filled cells that contain `value` and see (row, col) — they block that digit there. */
const collectDigitBlockers = (
  board: Board,
  row: number,
  col: number,
  value: number,
): CellRef[] => {
  const causes: CellRef[] = [];

  for (let c = 0; c < SIZE; c += 1) {
    if (board[row]?.[c] === value) {
      causes.push({ row, col: c });
    }
  }

  for (let r = 0; r < SIZE; r += 1) {
    if (board[r]?.[col] === value) {
      causes.push({ row: r, col });
    }
  }

  const boxRow = Math.floor(row / BOX) * BOX;
  const boxCol = Math.floor(col / BOX) * BOX;
  for (let r = boxRow; r < boxRow + BOX; r += 1) {
    for (let c = boxCol; c < boxCol + BOX; c += 1) {
      if (board[r]?.[c] === value) {
        causes.push({ row: r, col: c });
      }
    }
  }

  return uniqueCells(causes);
};

const collectHiddenSingleCauses = (
  board: Board,
  unitCells: CellRef[],
  target: CellRef,
  value: number,
): CellRef[] => {
  const causes: CellRef[] = [];

  for (const cell of unitCells) {
    if (cell.row === target.row && cell.col === target.col) {
      continue;
    }
    if ((board[cell.row]?.[cell.col] ?? 0) > 0) {
      continue;
    }
    causes.push(...collectDigitBlockers(board, cell.row, cell.col, value));
  }

  return uniqueCells(causes);
};

const isLastEmptySomewhere = (board: Board, row: number, col: number) =>
  countFilledInRow(board, row) === 8 ||
  countFilledInCol(board, col) === 8 ||
  countFilledInBox(board, row, col) === 8;

/** Higher = easier among general naked singles (not last-empty cases). */
const nakedSingleEase = (board: Board, row: number, col: number) =>
  countFilledInRow(board, row) +
  countFilledInCol(board, col) +
  countFilledInBox(board, row, col);

const sameBox = (aRow: number, aCol: number, bRow: number, bCol: number) =>
  Math.floor(aRow / BOX) === Math.floor(bRow / BOX) &&
  Math.floor(aCol / BOX) === Math.floor(bCol / BOX);

const describeBlockerUnit = (
  targetRow: number,
  targetCol: number,
  blocker: CellRef,
) => {
  const units: string[] = [];
  if (blocker.row === targetRow) {
    units.push("рядку");
  }
  if (blocker.col === targetCol) {
    units.push("стовпці");
  }
  if (sameBox(targetRow, targetCol, blocker.row, blocker.col)) {
    units.push("квадраті");
  }
  return units.join("/");
};

const formatNakedSingleExplanation = (
  board: Board,
  row: number,
  col: number,
  value: number,
) => {
  const eliminations: string[] = [];

  for (const digit of NUMBERS) {
    if (digit === value) {
      continue;
    }
    const blocker = collectDigitBlockers(board, row, col, digit)[0];
    if (!blocker) {
      continue;
    }
    const unit = describeBlockerUnit(row, col, blocker);
    eliminations.push(
      `${digit} уже є в ${unit} (клітинка ${blocker.row + 1},${blocker.col + 1})`,
    );
  }

  const filledNearby = nakedSingleEase(board, row, col);

  return [
    `Naked single: у клітинці (рядок ${row + 1}, стовпець ${col + 1}) лишається лише цифра ${value}.`,
    `Чому саме ${value}: ${eliminations.join("; ")}. Інших кандидатів немає.`,
    `Чому ця підказка зараз найпростіша: на дошці немає «останньої порожньої» в рядку/стовпці/квадраті (це було б ще простіше), а серед naked single у цієї клітинки найбільше заповнених сусідів (${filledNearby}).`,
  ].join(" ");
};

const findNakedSingle = (
  board: Board,
  candidates: number[][][],
): Hint | null => {
  let best: Hint | null = null;
  let bestEase = -1;

  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if ((board[row]?.[col] ?? 0) > 0) {
        continue;
      }
      // Handled by findLastEmpty — simpler spotting path.
      if (isLastEmptySomewhere(board, row, col)) {
        continue;
      }

      const cellCandidates = candidates[row]?.[col] ?? [];
      if (cellCandidates.length !== 1) {
        continue;
      }
      const value = cellCandidates[0];
      if (value === undefined) {
        continue;
      }

      const ease = nakedSingleEase(board, row, col);
      if (ease <= bestEase) {
        continue;
      }

      bestEase = ease;
      best = {
        technique: "naked-single",
        row,
        col,
        value,
        causes: collectNakedSingleCauses(board, row, col, value),
        explanation: formatNakedSingleExplanation(board, row, col, value),
      };
    }
  }

  return best;
};

const findHiddenSingleInUnit = (
  board: Board,
  candidates: number[][][],
  cells: CellRef[],
  unit: HintUnit,
  unitLabel: string,
): Hint | null => {
  for (const value of NUMBERS) {
    const places: CellRef[] = [];
    for (const cell of cells) {
      if ((board[cell.row]?.[cell.col] ?? 0) > 0) {
        continue;
      }
      if (candidates[cell.row]?.[cell.col]?.includes(value)) {
        places.push(cell);
      }
    }
    if (places.length === 1) {
      const cell = places[0];
      if (!cell) {
        continue;
      }
      const placeDetail =
        unit === "row"
          ? `стовпці ${cell.col + 1}`
          : unit === "col"
            ? `рядку ${cell.row + 1}`
            : `клітинці (рядок ${cell.row + 1}, стовпець ${cell.col + 1})`;

      return {
        technique: "hidden-single",
        row: cell.row,
        col: cell.col,
        value,
        unit,
        causes: collectHiddenSingleCauses(board, cells, cell, value),
        explanation: `Hidden single: цифра ${value} у ${unitLabel} може стояти лише в ${placeDetail}.`,
      };
    }
  }
  return null;
};

const findHiddenSingle = (
  board: Board,
  candidates: number[][][],
): Hint | null => {
  for (let row = 0; row < SIZE; row += 1) {
    const hint = findHiddenSingleInUnit(
      board,
      candidates,
      rowCells(row),
      "row",
      `${row + 1}-му рядку`,
    );
    if (hint) {
      return hint;
    }
  }

  for (let col = 0; col < SIZE; col += 1) {
    const hint = findHiddenSingleInUnit(
      board,
      candidates,
      colCells(col),
      "col",
      `${col + 1}-му стовпці`,
    );
    if (hint) {
      return hint;
    }
  }

  for (let box = 0; box < SIZE; box += 1) {
    const hint = findHiddenSingleInUnit(
      board,
      candidates,
      boxCells(box),
      "box",
      `${box + 1}-му квадраті 3×3`,
    );
    if (hint) {
      return hint;
    }
  }

  return null;
};

/** Returns the simplest forced placement, or null if none of the v1 techniques apply. */
export const findNextHint = (board: Board): Hint | null => {
  if (isSolved(board)) {
    return null;
  }

  const candidates = buildCandidateGrid(board);
  return (
    findLastEmpty(board) ??
    findNakedSingle(board, candidates) ??
    findHiddenSingle(board, candidates)
  );
};
