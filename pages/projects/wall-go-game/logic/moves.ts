import { type GameState, NEIGHBORS, type Side, type Turn } from "./board.ts";
import { enclosedCells } from "./regions.ts";

const occupiedExcept = (state: GameState, except: number) => {
  const taken = new Uint8Array(49);
  for (const cell of state.pieces.red) {
    taken[cell] = 1;
  }
  for (const cell of state.pieces.blue) {
    taken[cell] = 1;
  }
  taken[except] = 0;
  return taken;
};

export const freeEdges = (walls: Uint8Array, cell: number) => {
  const edges: number[] = [];
  for (const step of NEIGHBORS[cell]) {
    if (!walls[step.edge]) {
      edges.push(step.edge);
    }
  }
  return edges;
};

/** A piece can take one step when an open edge leads to an empty cell. */
export const canStep = (walls: Uint8Array, taken: Uint8Array, cell: number) => {
  for (const step of NEIGHBORS[cell]) {
    if (!walls[step.edge] && !taken[step.cell]) {
      return true;
    }
  }
  return false;
};

/**
 * Cells reachable in 0, 1, or 2 orthogonal steps.
 * Staying is allowed only when the piece can step out and return.
 * A destination is kept only when it still has a free edge for the wall.
 */
export const destinations = (
  walls: Uint8Array,
  taken: Uint8Array,
  from: number,
) => {
  const oneStep: number[] = [];
  for (const step of NEIGHBORS[from]) {
    if (!walls[step.edge] && !taken[step.cell]) {
      oneStep.push(step.cell);
    }
  }
  const found = new Set<number>(oneStep);
  if (oneStep.length > 0) {
    found.add(from);
  }
  for (const mid of oneStep) {
    for (const step of NEIGHBORS[mid]) {
      if (walls[step.edge]) {
        continue;
      }
      if (step.cell !== from && taken[step.cell]) {
        continue;
      }
      found.add(step.cell);
    }
  }
  const result: number[] = [];
  for (const dest of found) {
    if (freeEdges(walls, dest).length > 0) {
      result.push(dest);
    }
  }
  result.sort((a, b) => a - b);
  return result;
};

/** Destinations a piece may still use. Closed territories are frozen. */
export const playableDestinations = (state: GameState, from: number) => {
  if (state.phase !== "play" || enclosedCells(state)[from]) {
    return [];
  }
  return destinations(state.walls, occupiedExcept(state, from), from);
};

export const legalTurns = (state: GameState, side: Side): Turn[] => {
  if (state.phase !== "play") {
    return [];
  }
  const frozen = enclosedCells(state);
  const turns: Turn[] = [];
  for (const from of state.pieces[side]) {
    if (frozen[from]) {
      continue;
    }
    const taken = occupiedExcept(state, from);
    for (const to of destinations(state.walls, taken, from)) {
      for (const edge of freeEdges(state.walls, to)) {
        turns.push({ from, to, edge });
      }
    }
  }
  return turns;
};

export const isLegalTurn = (state: GameState, side: Side, turn: Turn) => {
  if (state.phase !== "play" || !state.pieces[side].includes(turn.from)) {
    return false;
  }
  if (enclosedCells(state)[turn.from]) {
    return false;
  }
  const taken = occupiedExcept(state, turn.from);
  if (!destinations(state.walls, taken, turn.from).includes(turn.to)) {
    return false;
  }
  return freeEdges(state.walls, turn.to).includes(turn.edge);
};

export const legalPlacements = (state: GameState) => {
  if (state.phase !== "deploy") {
    return [];
  }
  const taken = new Set<number>([...state.pieces.red, ...state.pieces.blue]);
  const cells: number[] = [];
  for (let cell = 0; cell < 49; cell++) {
    if (!taken.has(cell)) {
      cells.push(cell);
    }
  }
  return cells;
};

export const allTaken = (state: GameState) => {
  const taken = new Uint8Array(49);
  for (const cell of state.pieces.red) {
    taken[cell] = 1;
  }
  for (const cell of state.pieces.blue) {
    taken[cell] = 1;
  }
  return taken;
};
