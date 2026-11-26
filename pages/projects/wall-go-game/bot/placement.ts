import { type GameState, other, type Side } from "../logic/board.ts";
import { legalPlacements } from "../logic/moves.ts";
import type { Difficulty } from "./difficulty.ts";

const CENTER = 3;

const manhattan = (from: number, to: number) => {
  const fromRow = Math.floor(from / 7);
  const toRow = Math.floor(to / 7);
  return Math.abs(fromRow - toRow) + Math.abs((from % 7) - (to % 7));
};

const nearest = (cells: number[], target: number) => {
  let best = 99;
  for (const cell of cells) {
    best = Math.min(best, manhattan(cell, target));
  }
  return best;
};

/** Higher is a better deployment cell for `side`. */
export const placementScore = (state: GameState, side: Side, cell: number) => {
  const row = Math.floor(cell / 7);
  const column = cell % 7;
  let score =
    CENTER - Math.abs(row - CENTER) + (CENTER - Math.abs(column - CENTER));
  const corner = (row === 0 || row === 6) && (column === 0 || column === 6);
  const edge = row === 0 || row === 6 || column === 0 || column === 6;
  if (corner) {
    score -= 4;
  } else if (edge) {
    score -= 1;
  }

  let open = 0;
  if (row > 0 && !occupied(state, cell - 7)) open += 1;
  if (row < 6 && !occupied(state, cell + 7)) open += 1;
  if (column > 0 && !occupied(state, cell - 1)) open += 1;
  if (column < 6 && !occupied(state, cell + 1)) open += 1;
  score += open * 2;

  const friends = state.pieces[side];
  if (friends.length > 0) {
    const gap = nearest(friends, cell);
    if (gap <= 1) {
      score -= 3;
    } else if (gap <= 3) {
      score += 3;
    } else {
      score += 1;
    }
  }
  const enemies = nearest(state.pieces[other(side)], cell);
  if (enemies === 1) {
    score -= 1;
  } else if (enemies === 2) {
    score += 1;
  }
  return score;
};

const occupied = (state: GameState, cell: number) =>
  state.pieces.red.includes(cell) || state.pieces.blue.includes(cell);

export const choosePlacement = (
  state: GameState,
  side: Side,
  difficulty: Difficulty,
  random: () => number,
) => {
  const cells = legalPlacements(state);
  const ranked = cells
    .map((cell) => ({ cell, score: placementScore(state, side, cell) }))
    .sort((a, b) => b.score - a.score);
  const best = ranked[0];
  if (!best) {
    throw new Error("no placement");
  }
  const pool =
    difficulty === "easy"
      ? ranked.slice(0, Math.min(5, ranked.length))
      : ranked.filter((entry) => best.score - entry.score <= 2);
  const pick = pool[Math.floor(random() * pool.length)] ?? best;
  return pick.cell;
};
