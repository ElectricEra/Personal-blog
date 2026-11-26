import type { GameState, Side, Turn } from "../logic/board.ts";
import { legalTurns } from "../logic/moves.ts";
import { applyTurn, resolve } from "../logic/state.ts";
import { evaluate, terminalScore } from "./evaluate.ts";
import { orderTurns } from "./order.ts";

type Bound = "exact" | "lower" | "upper";

type Entry = {
  depth: number;
  score: number;
  flag: Bound;
  turn: Turn | null;
};

export class SearchDeadline extends Error {
  constructor() {
    super("deadline");
    this.name = "SearchDeadline";
  }
}

/** Walls, pieces, side to move, and phase. A different side is a different key. */
export const hashState = (state: GameState) => {
  let hash = BigInt("0xcbf29ce484222325");
  const mix = (part: number) => {
    hash ^= BigInt(part);
    hash = (hash * BigInt("0x100000001b3")) & BigInt("0xffffffffffffffff");
  };
  const phaseCode =
    state.phase === "deploy" ? 1 : state.phase === "play" ? 2 : 3;
  mix(phaseCode);
  mix(state.toMove === "red" ? 1 : 2);
  mix(state.deployStep);
  for (let index = 0; index < state.walls.length; index++) {
    if (state.walls[index]) {
      mix(index + 1);
    }
  }
  for (const side of [state.pieces.red, state.pieces.blue]) {
    const cells = [...side].sort((a, b) => a - b);
    mix(cells.length + 1);
    for (const cell of cells) {
      mix(cell + 1);
    }
  }
  return hash;
};

const stopAt = (deadline: number) => {
  if (Date.now() >= deadline) {
    throw new SearchDeadline();
  }
};

const minimax = (
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  bot: Side,
  deadline: number,
  table: Map<bigint, Entry>,
  ply: number,
  limit: number | null,
): number => {
  stopAt(deadline);
  if (state.phase === "over") {
    return terminalScore(state, bot, ply);
  }
  const key = hashState(state);
  const cached = table.get(key);
  let nextAlpha = alpha;
  let nextBeta = beta;
  if (cached && cached.depth >= depth) {
    if (cached.flag === "exact") {
      return cached.score;
    }
    if (cached.flag === "lower") {
      nextAlpha = Math.max(nextAlpha, cached.score);
    } else {
      nextBeta = Math.min(nextBeta, cached.score);
    }
    if (nextAlpha >= nextBeta) {
      return cached.score;
    }
  }
  if (depth === 0) {
    return evaluate(state, bot);
  }
  const moves = legalTurns(state, state.toMove);
  if (moves.length === 0) {
    const skipped = resolve(state);
    if (skipped === state) {
      return evaluate(state, bot);
    }
    return minimax(
      skipped,
      depth,
      nextAlpha,
      nextBeta,
      bot,
      deadline,
      table,
      ply,
      limit,
    );
  }
  const ordered = orderTurns(state, moves, limit, cached?.turn ?? null);
  const maximizing = state.toMove === bot;
  let best = maximizing ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
  let bestTurn: Turn | null = null;
  const alphaStart = nextAlpha;
  const betaStart = nextBeta;
  for (const turn of ordered) {
    const score = minimax(
      applyTurn(state, turn),
      depth - 1,
      nextAlpha,
      nextBeta,
      bot,
      deadline,
      table,
      ply + 1,
      limit,
    );
    if (maximizing ? score > best : score < best) {
      best = score;
      bestTurn = turn;
    }
    if (maximizing) {
      nextAlpha = Math.max(nextAlpha, score);
    } else {
      nextBeta = Math.min(nextBeta, score);
    }
    if (nextAlpha >= nextBeta) {
      break;
    }
  }
  let flag: Bound = "exact";
  if (best <= alphaStart) {
    flag = "upper";
  } else if (best >= betaStart) {
    flag = "lower";
  }
  table.set(key, { depth, score: best, flag, turn: bestTurn });
  return best;
};

export type SearchResult = {
  turn: Turn;
  depthCompleted: number;
};

/**
 * Iterative deepening. The move comes from the deepest finished depth,
 * never from a comparison of scores across depths.
 */
export const searchTurn = (
  state: GameState,
  deadline: number,
  maxDepth: number,
  limit: number | null,
  random: () => number,
): SearchResult => {
  const moves = legalTurns(state, state.toMove);
  const fallback = moves[0];
  if (!fallback) {
    throw new Error("no legal turn");
  }
  const table = new Map<bigint, Entry>();
  let best = fallback;
  let completed = 0;
  const bot = state.toMove;
  for (let depth = 1; depth <= maxDepth; depth++) {
    if (Date.now() >= deadline) {
      break;
    }
    try {
      const ordered = orderTurns(state, moves, null, best);
      let depthBest = ordered[0] ?? fallback;
      let depthScore = Number.NEGATIVE_INFINITY;
      const tied: Turn[] = [];
      for (const turn of ordered) {
        const score = minimax(
          applyTurn(state, turn),
          depth - 1,
          Number.NEGATIVE_INFINITY,
          Number.POSITIVE_INFINITY,
          bot,
          deadline,
          table,
          1,
          limit,
        );
        if (score > depthScore) {
          depthScore = score;
          depthBest = turn;
          tied.length = 0;
          tied.push(turn);
        } else if (score === depthScore) {
          tied.push(turn);
        }
      }
      const pick = tied[Math.floor(random() * tied.length)];
      best = pick ?? depthBest;
      completed = depth;
    } catch (error) {
      if (error instanceof SearchDeadline) {
        break;
      }
      throw error;
    }
  }
  return { turn: best, depthCompleted: completed };
};
