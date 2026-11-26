import type { GameState, Turn } from "../logic/board.ts";
import { isLegalTurn, legalPlacements, legalTurns } from "../logic/moves.ts";
import { classifyRegions, securedScore } from "../logic/regions.ts";
import { applyTurn } from "../logic/state.ts";
import type { Difficulty } from "./difficulty.ts";
import { evaluate } from "./evaluate.ts";
import { choosePlacement } from "./placement.ts";
import { type SearchResult, searchTurn } from "./search.ts";

export type { Difficulty } from "./difficulty.ts";

export type Decision =
  | { kind: "placement"; cell: number }
  | { kind: "turn"; turn: Turn; depthCompleted: number }
  | { kind: "pass" };

export type BotRequest = {
  requestId: number;
  state: GameState;
  difficulty: Difficulty;
  seed: number;
  deadline: number;
};

export type BotResponse = {
  requestId: number;
  decision: Decision;
};

export const BUDGET_MS: Record<Difficulty, number> = {
  easy: 40,
  medium: 700,
  hard: 1500,
  expert: 3000,
};

const PLAN = {
  easy: { depth: 0, limit: null },
  medium: { depth: 2, limit: null },
  hard: { depth: 4, limit: 24 },
  expert: { depth: 32, limit: 32 },
} as const satisfies Record<
  Difficulty,
  { depth: number; limit: number | null }
>;

const pickEasy = (state: GameState, turns: Turn[], random: () => number) => {
  const side = state.toMove;
  const before = securedScore(classifyRegions(state))[side];
  const weights = turns.map((turn) => {
    const next = applyTurn(state, turn);
    const gain = securedScore(classifyRegions(next))[side] - before;
    return 1 + Math.max(0, gain) * 10;
  });
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let cursor = random() * total;
  for (let index = 0; index < turns.length; index++) {
    cursor -= weights[index] ?? 0;
    const turn = turns[index];
    if (cursor <= 0 && turn) {
      return turn;
    }
  }
  return turns[turns.length - 1] ?? turns[0];
};

/** A short scan used when search cannot finish a depth. */
const cheapPick = (state: GameState, turns: Turn[], random: () => number) => {
  const step = Math.max(1, Math.ceil(turns.length / 24));
  let bestScore = Number.NEGATIVE_INFINITY;
  const pool: Turn[] = [];
  for (let index = 0; index < turns.length; index += step) {
    const turn = turns[index];
    if (!turn) {
      continue;
    }
    const score = evaluate(applyTurn(state, turn), state.toMove);
    if (score > bestScore) {
      bestScore = score;
      pool.length = 0;
      pool.push(turn);
    } else if (score === bestScore) {
      pool.push(turn);
    }
  }
  return pool[Math.floor(random() * pool.length)] ?? turns[0];
};

const play = (
  state: GameState,
  difficulty: Difficulty,
  random: () => number,
  deadline: number,
): Decision => {
  const turns = legalTurns(state, state.toMove);
  const first = turns[0];
  if (!first) {
    return { kind: "pass" };
  }
  if (difficulty === "easy") {
    const turn = pickEasy(state, turns, random);
    return { kind: "turn", turn: turn ?? first, depthCompleted: 0 };
  }
  if (Date.now() >= deadline) {
    const turn = cheapPick(state, turns, random);
    return { kind: "turn", turn: turn ?? first, depthCompleted: 0 };
  }
  const plan = PLAN[difficulty];
  const result: SearchResult = searchTurn(
    state,
    deadline,
    plan.depth,
    plan.limit,
    random,
  );
  if (result.depthCompleted === 0) {
    const turn = cheapPick(state, turns, random);
    return { kind: "turn", turn: turn ?? result.turn, depthCompleted: 0 };
  }
  return {
    kind: "turn",
    turn: result.turn,
    depthCompleted: result.depthCompleted,
  };
};

export const chooseDecision = (
  state: GameState,
  difficulty: Difficulty,
  random: () => number,
  deadline: number,
): Decision => {
  if (state.phase === "deploy") {
    return {
      kind: "placement",
      cell: choosePlacement(state, state.toMove, difficulty, random),
    };
  }
  if (state.phase !== "play") {
    return { kind: "pass" };
  }
  return play(state, difficulty, random, deadline);
};

/** Replaces a stale choice with a move that is legal on this board. */
export const legalDecision = (
  state: GameState,
  decision: Decision,
): Decision => {
  if (decision.kind === "placement") {
    if (legalPlacements(state).includes(decision.cell)) {
      return decision;
    }
    const cell = legalPlacements(state)[0];
    return cell === undefined ? { kind: "pass" } : { kind: "placement", cell };
  }
  if (
    decision.kind === "turn" &&
    isLegalTurn(state, state.toMove, decision.turn)
  ) {
    return decision;
  }
  const turn = legalTurns(state, state.toMove)[0];
  if (!turn || state.phase !== "play") {
    return { kind: "pass" };
  }
  return { kind: "turn", turn, depthCompleted: 0 };
};
