import {
  cloneState,
  DEPLOY_ORDER,
  type EndReason,
  emptyWalls,
  type GameState,
  other,
  type Side,
  START_PIECES,
  type Turn,
} from "./board.ts";
import { isLegalTurn, legalPlacements, legalTurns } from "./moves.ts";
import { classifyRegions, hasFreeEdge, isMixed } from "./regions.ts";

export const initialState = (): GameState => ({
  phase: "deploy",
  pieces: { red: [...START_PIECES.red], blue: [...START_PIECES.blue] },
  walls: emptyWalls(),
  toMove: DEPLOY_ORDER[0],
  deployStep: 0,
  lastAction: null,
  lastPass: null,
  endReason: null,
});

const endGame = (state: GameState, reason: EndReason): GameState => ({
  ...state,
  phase: "over",
  endReason: reason,
  lastPass: null,
});

/**
 * After the side to move has been set, end the match or skip a side with
 * no legal turn. Separation wins over the safety net, which wins over a pass.
 */
export const resolve = (state: GameState): GameState => {
  if (state.phase !== "play") {
    return state;
  }
  if (!isMixed(classifyRegions(state))) {
    return endGame(state, "separation");
  }
  if (!hasFreeEdge(state.walls)) {
    return endGame(state, "safety");
  }
  if (legalTurns(state, state.toMove).length > 0) {
    return state;
  }
  const opponent = other(state.toMove);
  if (legalTurns(state, opponent).length > 0) {
    return { ...state, toMove: opponent, lastPass: state.toMove };
  }
  return endGame(state, "stalemate");
};

export const applyPlacement = (state: GameState, cell: number): GameState => {
  if (state.phase !== "deploy" || !legalPlacements(state).includes(cell)) {
    throw new Error("illegal placement");
  }
  const next = cloneState(state);
  next.pieces[state.toMove] = [...next.pieces[state.toMove], cell];
  next.deployStep += 1;
  next.lastPass = null;
  next.lastAction = null;
  if (next.deployStep >= DEPLOY_ORDER.length) {
    next.phase = "play";
    next.toMove = "red";
    return resolve(next);
  }
  next.toMove = DEPLOY_ORDER[next.deployStep];
  return next;
};

const movePiece = (pieces: number[], from: number, to: number) =>
  pieces.map((cell) => (cell === from ? to : cell));

export const applyTurn = (state: GameState, turn: Turn): GameState => {
  if (!isLegalTurn(state, state.toMove, turn)) {
    throw new Error("illegal turn");
  }
  const next = cloneState(state);
  const side: Side = state.toMove;
  next.pieces[side] = movePiece(next.pieces[side], turn.from, turn.to);
  next.walls[turn.edge] = 1;
  next.lastAction = turn;
  next.lastPass = null;
  next.toMove = other(side);
  return resolve(next);
};
