export const LETTERS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
] as const;

export const BOARD_SIZE = LETTERS.length;
const GRID = 4;

export type Round = {
  numbers: number[];
  solution: number[];
};

export const neighbors = (index: number): number[] => {
  const next = [index - GRID, index + GRID];
  if (index % GRID !== 0) {
    next.push(index - 1);
  }
  if (index % GRID !== GRID - 1) {
    next.push(index + 1);
  }
  return next.filter((cell) => cell >= 0 && cell < BOARD_SIZE);
};

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

const distance = (from: number, to: number) =>
  Math.abs(Math.floor(from / GRID) - Math.floor(to / GRID)) +
  Math.abs((from % GRID) - (to % GRID));

// Shortest orthogonal route whose ends are Manhattan distance 4 or 5 apart,
// so the path contains exactly 5 or 6 cells.
const generatePath = (): number[] => {
  const desiredDistance = 4 + Math.floor(Math.random() * 2);
  const pairs: Array<[number, number]> = [];
  for (let start = 0; start < BOARD_SIZE; start += 1) {
    for (let end = 0; end < BOARD_SIZE; end += 1) {
      if (distance(start, end) === desiredDistance) {
        pairs.push([start, end]);
      }
    }
  }
  const pair = pairs[Math.floor(Math.random() * pairs.length)];
  if (!pair) {
    return [0, 1, 2, 3, 7];
  }
  const [start, end] = pair;
  const route = [start];
  while (route[route.length - 1] !== end) {
    const current = route[route.length - 1];
    if (current === undefined) {
      break;
    }
    const options = neighbors(current).filter(
      (cell) => distance(cell, end) === distance(current, end) - 1,
    );
    const nextCell = options[Math.floor(Math.random() * options.length)];
    if (nextCell === undefined) {
      break;
    }
    route.push(nextCell);
  }
  return route;
};

export const sumPath = (numbers: readonly number[], path: readonly number[]) =>
  path.reduce((sum, index) => sum + (numbers[index] ?? 0), 0);

export const generateRound = (): Round => ({
  numbers: shuffle(Array.from({ length: 20 }, (_, index) => index + 1)).slice(
    0,
    BOARD_SIZE,
  ),
  solution: generatePath(),
});
