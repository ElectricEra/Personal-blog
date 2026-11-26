import {
  CELLS,
  type GameState,
  NEIGHBORS,
  other,
  type Side,
} from "../logic/board.ts";
import { legalTurns } from "../logic/moves.ts";
import { outcomeOf } from "../logic/outcome.ts";
import {
  classifyRegions,
  finalScore,
  type Region,
  securedScore,
} from "../logic/regions.ts";

/** Positive means `side` is ahead. A finished game outranks every heuristic. */
export const terminalScore = (state: GameState, side: Side, ply: number) => {
  const outcome = outcomeOf(state);
  if (!outcome || outcome.winner === "draw") {
    return 0;
  }
  const margin = outcome.score[side] - outcome.score[other(side)];
  const sign = outcome.winner === side ? 1 : -1;
  return sign * (1_000_000 - ply) + margin;
};

const distances = (state: GameState, side: Side) => {
  const dist = new Int16Array(CELLS).fill(-1);
  const blocked = new Uint8Array(CELLS);
  for (const cell of state.pieces[other(side)]) {
    blocked[cell] = 1;
  }
  const queue: number[] = [];
  for (const cell of state.pieces[side]) {
    dist[cell] = 0;
    queue.push(cell);
  }
  for (let index = 0; index < queue.length; index++) {
    const cell = queue[index];
    if (cell === undefined) {
      break;
    }
    for (const step of NEIGHBORS[cell]) {
      if (
        state.walls[step.edge] ||
        blocked[step.cell] ||
        dist[step.cell] !== -1
      ) {
        continue;
      }
      dist[step.cell] = dist[cell] + 1;
      queue.push(step.cell);
    }
  }
  return dist;
};

/** Contested cells the side can reach sooner than the opponent. */
const reachability = (state: GameState, regions: Region[], side: Side) => {
  const contested = new Uint8Array(CELLS);
  for (const region of regions) {
    if (region.kind !== "contested") {
      continue;
    }
    for (const cell of region.cells) {
      contested[cell] = 1;
    }
  }
  const own = distances(state, side);
  const enemy = distances(state, other(side));
  let score = 0;
  for (let cell = 0; cell < CELLS; cell++) {
    if (!contested[cell]) {
      continue;
    }
    const mine = own[cell];
    const theirs = enemy[cell];
    if (mine < 0 && theirs < 0) {
      continue;
    }
    if (theirs < 0 || (mine >= 0 && mine < theirs)) {
      score += 1;
    } else if (mine < 0 || theirs < mine) {
      score -= 1;
    }
  }
  return score;
};

export const evaluate = (state: GameState, side: Side) => {
  if (state.phase === "over") {
    return terminalScore(state, side, 0);
  }
  const regions = classifyRegions(state);
  const secured = securedScore(regions);
  const largest = finalScore(regions).largest;
  const opponent = other(side);
  const mobility =
    legalTurns(state, side).length - legalTurns(state, opponent).length;
  return (
    (secured[side] - secured[opponent]) * 100 +
    reachability(state, regions, side) * 4 +
    mobility * 2 +
    (largest[side] - largest[opponent])
  );
};
