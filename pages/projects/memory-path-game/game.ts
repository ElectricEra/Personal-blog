import { shuffle } from "@/utils/shuffle";

const LETTERS = [..."ABCDEFGHIJKLMNOP"];

export const BOARD_SIZE = LETTERS.length;
const GRID = 4;

export type Round = {
  numbers: number[];
  solution: number[];
};

export const letterAt = (index: number) => LETTERS[index] ?? "";

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

const distance = (from: number, to: number) =>
  Math.abs(Math.floor(from / GRID) - Math.floor(to / GRID)) +
  Math.abs((from % GRID) - (to % GRID));

// Shortest orthogonal route whose ends are Manhattan distance 4 or 5 apart,
// so the path contains exactly 5 or 6 cells.
const generatePath = (random: () => number): number[] => {
  const desiredDistance = 4 + Math.floor(random() * 2);
  const pairs: Array<[number, number]> = [];
  for (let start = 0; start < BOARD_SIZE; start += 1) {
    for (let end = 0; end < BOARD_SIZE; end += 1) {
      if (distance(start, end) === desiredDistance) {
        pairs.push([start, end]);
      }
    }
  }
  const pair = pairs[Math.floor(random() * pairs.length)];
  if (!pair) {
    return [0, 1, 2, 3, 7];
  }
  const [start, end] = pair;
  const route = [start];
  let current = start;
  while (current !== end) {
    const options = neighbors(current).filter(
      (cell) => distance(cell, end) === distance(current, end) - 1,
    );
    const nextCell = options[Math.floor(random() * options.length)];
    if (nextCell === undefined) {
      break;
    }
    route.push(nextCell);
    current = nextCell;
  }
  return route;
};

/** Cells the player may step to next: the start, or a free neighbor of the last cell. */
export const legalSteps = (
  path: readonly number[],
  start: number,
  end: number,
): Set<number> => {
  const last = path[path.length - 1];
  if (last === undefined) {
    return new Set([start]);
  }
  if (last === end) {
    return new Set();
  }
  return new Set(neighbors(last).filter((cell) => !path.includes(cell)));
};

export const sumPath = (numbers: readonly number[], path: readonly number[]) =>
  path.reduce((sum, index) => sum + (numbers[index] ?? 0), 0);

export const generateRound = (random: () => number = Math.random): Round => ({
  numbers: shuffle(
    Array.from({ length: 20 }, (_, index) => index + 1),
    random,
  ).slice(0, BOARD_SIZE),
  solution: generatePath(random),
});
