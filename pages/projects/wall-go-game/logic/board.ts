export const SIZE = 7;
export const CELLS = SIZE * SIZE;
export const H_EDGES = 6 * SIZE;
export const V_EDGES = SIZE * 6;
export const EDGES = H_EDGES + V_EDGES;

export const SIDES = ["red", "blue"] as const;
export type Side = (typeof SIDES)[number];

export const other = (side: Side): Side => (side === "red" ? "blue" : "red");

export const DIRECTIONS = ["up", "right", "down", "left"] as const;
export type Direction = (typeof DIRECTIONS)[number];

const D_ROW = [-1, 0, 1, 0];
const D_COL = [0, 1, 0, -1];

export type Phase = "deploy" | "play" | "over";
export type EndReason = "separation" | "stalemate" | "safety";

export type Turn = {
  from: number;
  to: number;
  edge: number;
};

export type GameState = {
  phase: Phase;
  pieces: Record<Side, number[]>;
  walls: Uint8Array;
  toMove: Side;
  deployStep: number;
  lastAction: Turn | null;
  /** Side skipped because it had no legal turn. */
  lastPass: Side | null;
  endReason: EndReason | null;
};

export type Step = {
  cell: number;
  edge: number;
  direction: Direction;
};

export const rowOf = (cell: number) => Math.floor(cell / SIZE);
export const colOf = (cell: number) => cell % SIZE;

/** 1-based row and column, matching the rule statement. */
export const cellFrom = (row: number, column: number) =>
  (row - 1) * SIZE + (column - 1);

export const cellLabel = (cell: number) =>
  `${"ABCDEFG"[colOf(cell)]}${rowOf(cell) + 1}`;

const edgeId = (row: number, column: number, direction: number) => {
  if (direction === 0) {
    return (row - 1) * SIZE + column;
  }
  if (direction === 2) {
    return row * SIZE + column;
  }
  if (direction === 1) {
    return H_EDGES + row * 6 + column;
  }
  return H_EDGES + row * 6 + (column - 1);
};

export const NEIGHBORS: readonly Step[][] = Array.from(
  { length: CELLS },
  (_, cell) => {
    const row = rowOf(cell);
    const column = colOf(cell);
    const steps: Step[] = [];
    for (let direction = 0; direction < 4; direction++) {
      const nextRow = row + D_ROW[direction];
      const nextColumn = column + D_COL[direction];
      if (
        nextRow < 0 ||
        nextRow >= SIZE ||
        nextColumn < 0 ||
        nextColumn >= SIZE
      ) {
        continue;
      }
      steps.push({
        cell: nextRow * SIZE + nextColumn,
        edge: edgeId(row, column, direction),
        direction: DIRECTIONS[direction],
      });
    }
    return steps;
  },
);

export const edgeBetween = (from: number, to: number) =>
  NEIGHBORS[from].find((step) => step.cell === to)?.edge ?? null;

export const directionBetween = (from: number, edge: number) =>
  NEIGHBORS[from].find((step) => step.edge === edge)?.direction ?? null;

/** Red (2,2) and (6,6); Blue (2,6) and (6,2). Then Red, Blue, Blue, Red. */
export const START_PIECES: Record<Side, number[]> = {
  red: [cellFrom(2, 2), cellFrom(6, 6)],
  blue: [cellFrom(2, 6), cellFrom(6, 2)],
};

export const DEPLOY_ORDER: readonly Side[] = ["red", "blue", "blue", "red"];

export const emptyWalls = () => new Uint8Array(EDGES);

export const cloneState = (state: GameState): GameState => ({
  phase: state.phase,
  pieces: { red: [...state.pieces.red], blue: [...state.pieces.blue] },
  walls: new Uint8Array(state.walls),
  toMove: state.toMove,
  deployStep: state.deployStep,
  lastAction: state.lastAction ? { ...state.lastAction } : null,
  lastPass: state.lastPass,
  endReason: state.endReason,
});
