import { CELLS, type GameState, NEIGHBORS, type Side } from "./board.ts";
import { allTaken, canStep } from "./moves.ts";

export const REGION_KINDS = [
  "red",
  "blue",
  "neutral",
  "contested",
  "trapped",
] as const;
export type RegionKind = (typeof REGION_KINDS)[number];

export type Region = {
  cells: number[];
  kind: RegionKind;
  redPieces: number;
  bluePieces: number;
};

export type Score = {
  red: number;
  blue: number;
  largest: Record<Side, number>;
};

export const computeRegions = (walls: Uint8Array) => {
  const seen = new Uint8Array(CELLS);
  const regions: number[][] = [];
  for (let start = 0; start < CELLS; start++) {
    if (seen[start]) {
      continue;
    }
    const cells: number[] = [];
    const stack = [start];
    seen[start] = 1;
    while (stack.length > 0) {
      const cell = stack.pop();
      if (cell === undefined) {
        break;
      }
      cells.push(cell);
      for (const step of NEIGHBORS[cell]) {
        if (!walls[step.edge] && !seen[step.cell]) {
          seen[step.cell] = 1;
          stack.push(step.cell);
        }
      }
    }
    regions.push(cells);
  }
  return regions;
};

export const classifyRegions = (state: GameState): Region[] => {
  const reds = new Set(state.pieces.red);
  const blues = new Set(state.pieces.blue);
  const taken = allTaken(state);
  return computeRegions(state.walls).map((cells) => {
    let redPieces = 0;
    let bluePieces = 0;
    const pieceCells: number[] = [];
    for (const cell of cells) {
      if (reds.has(cell)) {
        redPieces += 1;
        pieceCells.push(cell);
      }
      if (blues.has(cell)) {
        bluePieces += 1;
        pieceCells.push(cell);
      }
    }
    let kind: RegionKind = "neutral";
    if (redPieces > 0 && bluePieces > 0) {
      const trapped = pieceCells.every(
        (cell) => !canStep(state.walls, taken, cell),
      );
      kind = trapped ? "trapped" : "contested";
    } else if (redPieces > 0) {
      kind = "red";
    } else if (bluePieces > 0) {
      kind = "blue";
    }
    return { cells, kind, redPieces, bluePieces };
  });
};

export const securedScore = (regions: Region[]) => {
  const score = { red: 0, blue: 0 };
  for (const region of regions) {
    if (region.kind === "red" || region.kind === "blue") {
      score[region.kind] += region.cells.length;
    }
  }
  return score;
};

/** Exclusive regions score their area. A trapped mix scores one point per own piece. */
export const finalScore = (regions: Region[]): Score => {
  const score: Score = { red: 0, blue: 0, largest: { red: 0, blue: 0 } };
  for (const region of regions) {
    if (region.kind === "red" || region.kind === "blue") {
      score[region.kind] += region.cells.length;
      score.largest[region.kind] = Math.max(
        score.largest[region.kind],
        region.cells.length,
      );
    } else if (region.kind === "trapped") {
      score.red += region.redPieces;
      score.blue += region.bluePieces;
    }
  }
  return score;
};

export const hasFreeEdge = (walls: Uint8Array) => {
  for (const wall of walls) {
    if (!wall) {
      return true;
    }
  }
  return false;
};

export const ownerByCell = (regions: Region[]) => {
  const owners = new Array<RegionKind>(CELLS).fill("neutral");
  for (const region of regions) {
    for (const cell of region.cells) {
      owners[cell] = region.kind;
    }
  }
  return owners;
};

/** Cells of a territory that already belongs to one side. Null elsewhere. */
export const securedOwners = (regions: Region[]) => {
  const owners = new Array<RegionKind | null>(CELLS).fill(null);
  for (const region of regions) {
    if (region.kind !== "red" && region.kind !== "blue") {
      continue;
    }
    for (const cell of region.cells) {
      owners[cell] = region.kind;
    }
  }
  return owners;
};

/** Every cell inside a territory that already belongs to one side. */
export const enclosedCells = (state: GameState) => {
  const cells = new Uint8Array(CELLS);
  for (const region of classifyRegions(state)) {
    if (region.kind !== "red" && region.kind !== "blue") {
      continue;
    }
    for (const cell of region.cells) {
      cells[cell] = 1;
    }
  }
  return cells;
};

export const isMixed = (regions: Region[]) =>
  regions.some(
    (region) => region.kind === "contested" || region.kind === "trapped",
  );
