export type Difficulty = "easy" | "medium" | "hard";
export type Board = number[][];

const SIZE = 9;
const BOX = 3;
const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

const CLUES: Record<Difficulty, number> = {
  easy: 40,
  medium: 32,
  hard: 26,
};

export const emptyBoard = (): Board =>
  Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => 0));

export const cloneBoard = (board: Board): Board => board.map((row) => [...row]);

const shuffle = <T>(items: readonly T[]): T[] => {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = next[i];
    const swap = next[j];
    if (current === undefined || swap === undefined) {
      continue;
    }
    next[i] = swap;
    next[j] = current;
  }
  return next;
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

const findEmptyCell = (board: Board) => {
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (board[row]?.[col] === 0) {
        return { row, col };
      }
    }
  }
  return null;
};

const fillBoard = (board: Board): boolean => {
  const empty = findEmptyCell(board);
  if (!empty) {
    return true;
  }

  for (const value of shuffle(NUMBERS)) {
    if (isPlacementValid(board, empty.row, empty.col, value)) {
      const row = board[empty.row];
      if (!row) {
        return false;
      }
      row[empty.col] = value;
      if (fillBoard(board)) {
        return true;
      }
      row[empty.col] = 0;
    }
  }

  return false;
};

const countSolutions = (board: Board, limit = 2): number => {
  const empty = findEmptyCell(board);
  if (!empty) {
    return 1;
  }

  let count = 0;
  for (const value of NUMBERS) {
    if (isPlacementValid(board, empty.row, empty.col, value)) {
      const row = board[empty.row];
      if (!row) {
        return count;
      }
      row[empty.col] = value;
      count += countSolutions(board, limit);
      row[empty.col] = 0;
      if (count >= limit) {
        return count;
      }
    }
  }

  return count;
};

const cellKey = (row: number, col: number) => `${row}-${col}`;

export const getConflictKeys = (board: Board) => {
  const conflicts = new Set<string>();

  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      const value = board[row]?.[col];
      if (!value) {
        continue;
      }

      for (let i = 0; i < SIZE; i += 1) {
        if (i !== col && board[row]?.[i] === value) {
          conflicts.add(cellKey(row, col));
          conflicts.add(cellKey(row, i));
        }
        if (i !== row && board[i]?.[col] === value) {
          conflicts.add(cellKey(row, col));
          conflicts.add(cellKey(i, col));
        }
      }

      const boxRow = Math.floor(row / BOX) * BOX;
      const boxCol = Math.floor(col / BOX) * BOX;
      for (let r = boxRow; r < boxRow + BOX; r += 1) {
        for (let c = boxCol; c < boxCol + BOX; c += 1) {
          if ((r !== row || c !== col) && board[r]?.[c] === value) {
            conflicts.add(cellKey(row, col));
            conflicts.add(cellKey(r, c));
          }
        }
      }
    }
  }

  return conflicts;
};

export const isSolved = (board: Board) => {
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (!board[row]?.[col]) {
        return false;
      }
    }
  }
  return getConflictKeys(board).size === 0;
};

export const generatePuzzle = (difficulty: Difficulty): Board => {
  const board = emptyBoard();
  fillBoard(board);

  const positions = shuffle(
    Array.from({ length: SIZE * SIZE }, (_, index) => ({
      row: Math.floor(index / SIZE),
      col: index % SIZE,
    })),
  );

  let remaining = SIZE * SIZE;
  const minClues = CLUES[difficulty];

  for (const position of positions) {
    if (remaining <= minClues) {
      break;
    }

    const row = board[position.row];
    const value = row?.[position.col];
    if (!row || !value) {
      continue;
    }

    row[position.col] = 0;
    const solutions = countSolutions(cloneBoard(board));
    if (solutions !== 1) {
      row[position.col] = value;
    } else {
      remaining -= 1;
    }
  }

  return board;
};
