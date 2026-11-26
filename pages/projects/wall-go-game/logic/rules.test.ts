import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CELLS,
  cellFrom,
  type Direction,
  directionBetween,
  edgeBetween,
  emptyWalls,
  type GameState,
  NEIGHBORS,
  type Side,
} from "./board.ts";
import {
  destinations,
  isLegalTurn,
  legalPlacements,
  legalTurns,
} from "./moves.ts";
import { decideWinner, outcomeOf } from "./outcome.ts";
import { mulberry32 } from "./random.ts";
import {
  classifyRegions,
  finalScore,
  securedOwners,
  securedScore,
} from "./regions.ts";
import { applyPlacement, applyTurn, initialState, resolve } from "./state.ts";

const at = (row: number, column: number) => cellFrom(row, column);

const edge = (
  row: number,
  column: number,
  otherRow: number,
  otherColumn: number,
) => {
  const id = edgeBetween(at(row, column), at(otherRow, otherColumn));
  if (id === null) {
    throw new Error("not adjacent");
  }
  return id;
};

const box = (walls: Uint8Array, cell: number) => {
  for (const step of NEIGHBORS[cell]) {
    walls[step.edge] = 1;
  }
};

const seal = (walls: Uint8Array, cells: number[], gaps: number[] = []) => {
  const inside = new Set(cells);
  const open = new Set(gaps);
  for (const cell of cells) {
    for (const step of NEIGHBORS[cell]) {
      if (!inside.has(step.cell) && !open.has(step.edge)) {
        walls[step.edge] = 1;
      }
    }
  }
};

const playing = (
  red: number[],
  blue: number[],
  walls: Uint8Array,
  toMove: Side = "red",
): GameState => ({
  phase: "play",
  pieces: { red, blue },
  walls,
  toMove,
  deployStep: 4,
  lastAction: null,
  lastPass: null,
  endReason: null,
});

const takenOf = (state: GameState, except: number) => {
  const taken = new Uint8Array(CELLS);
  for (const cell of [...state.pieces.red, ...state.pieces.blue]) {
    taken[cell] = 1;
  }
  taken[except] = 0;
  return taken;
};

describe("movement", () => {
  it("allows an L-shaped two-step move", () => {
    const state = initialState();
    const from = at(4, 4);
    const reached = destinations(state.walls, takenOf(state, from), from);
    assert.ok(reached.includes(at(3, 5)));
    assert.ok(reached.includes(at(4, 4)));
    assert.equal(reached.includes(at(4, 7)), false);
  });

  it("does not jump an occupied cell", () => {
    const state = playing([at(4, 4)], [at(4, 5)], emptyWalls());
    const reached = destinations(
      state.walls,
      takenOf(state, at(4, 4)),
      at(4, 4),
    );
    assert.equal(reached.includes(at(4, 6)), false);
    assert.equal(reached.includes(at(4, 5)), false);
  });

  it("keeps a destination when one of two routes is open", () => {
    const walls = emptyWalls();
    walls[edge(4, 4, 3, 4)] = 1;
    const reached = destinations(walls, new Uint8Array(CELLS), at(4, 4));
    assert.ok(reached.includes(at(3, 5)));
    walls[edge(4, 4, 4, 5)] = 1;
    const blocked = destinations(walls, new Uint8Array(CELLS), at(4, 4));
    assert.equal(blocked.includes(at(3, 5)), false);
  });

  it("refuses a zero-step move for an immobilized piece", () => {
    const walls = emptyWalls();
    const from = at(4, 4);
    box(walls, from);
    const stuck = destinations(walls, new Uint8Array(CELLS), from);
    assert.deepEqual(stuck, []);

    walls[edge(4, 4, 4, 5)] = 0;
    const free = destinations(walls, new Uint8Array(CELLS), from);
    assert.ok(free.includes(from));
  });

  it("refuses a move inside a territory that already has an owner", () => {
    const walls = emptyWalls();
    const pocket = [at(1, 1), at(1, 2)];
    seal(walls, pocket);
    const red = at(4, 4);
    const blue = at(4, 5);
    for (const step of NEIGHBORS[red]) {
      if (step.cell !== blue) {
        walls[step.edge] = 1;
      }
    }
    for (const cell of [at(7, 1), at(7, 2)]) {
      box(walls, cell);
    }
    const state = playing(
      [at(1, 1), red, at(7, 1), at(7, 2)],
      [blue, at(6, 6), at(6, 7), at(7, 7)],
      walls,
      "red",
    );
    const physical = destinations(walls, takenOf(state, at(1, 1)), at(1, 1));
    assert.ok(physical.includes(at(1, 2)));
    const inside = { from: at(1, 1), to: at(1, 2), edge: edge(1, 1, 1, 2) };
    assert.equal(isLegalTurn(state, "red", inside), false);
    assert.equal(
      legalTurns(state, "red").some((turn) => turn.from === at(1, 1)),
      false,
    );
    assert.equal(legalTurns(state, "red").length, 0);
    const owners = securedOwners(classifyRegions(state));
    assert.equal(owners[at(1, 1)], "red");
    assert.equal(owners[at(1, 2)], "red");
    assert.equal(owners[red], null);
    const next = resolve(state);
    assert.equal(next.phase, "play");
    assert.equal(next.lastPass, "red");
    assert.equal(next.toMove, "blue");
    assert.ok(legalTurns(next, "blue").length > 0);
  });

  it("rejects a wall that does not touch the destination", () => {
    const state = playing(
      [at(4, 4), at(7, 1), at(7, 2), at(7, 3)],
      [at(1, 1), at(1, 2), at(1, 3), at(1, 4)],
      emptyWalls(),
    );
    const turn = { from: at(4, 4), to: at(4, 3), edge: edge(1, 1, 1, 2) };
    assert.equal(isLegalTurn(state, "red", turn), false);
    assert.throws(() => applyTurn(state, turn));
    assert.equal(state.walls[turn.edge], 0);
  });
});

describe("territory", () => {
  it("scores a region once, however many friendly pieces sit in it", () => {
    const walls = emptyWalls();
    const pocket = [at(1, 1), at(1, 2), at(1, 3), at(2, 1), at(2, 2), at(2, 3)];
    seal(walls, pocket);
    const state = playing(
      [at(1, 1), at(1, 2), at(6, 1), at(6, 2)],
      [at(4, 4), at(4, 5), at(5, 4), at(5, 5)],
      walls,
    );
    const regions = classifyRegions(state);
    const owned = regions.find((region) => region.cells.includes(at(1, 1)));
    assert.equal(owned?.kind, "red");
    assert.equal(owned?.cells.length, 6);
    assert.equal(owned?.redPieces, 2);
    assert.equal(finalScore(regions).red, 6);
  });

  it("leaves an empty sealed region neutral", () => {
    const walls = emptyWalls();
    const pocket = [at(1, 1), at(1, 2), at(2, 1), at(2, 2)];
    seal(walls, pocket);
    const state = playing(
      [at(6, 1), at(6, 2), at(6, 3), at(6, 4)],
      [at(7, 1), at(7, 2), at(7, 3), at(7, 4)],
      walls,
    );
    const regions = classifyRegions(state);
    const empty = regions.find((region) => region.cells.includes(at(1, 1)));
    assert.equal(empty?.kind, "neutral");
    assert.equal(empty?.cells.length, 4);
    assert.equal(securedScore(regions).red, 0);
    assert.equal(securedScore(regions).blue, 0);
  });

  it("awards a region to the pieces inside it, not to the builder", () => {
    const walls = emptyWalls();
    const pocket = [at(1, 1), at(1, 2), at(1, 3), at(2, 1), at(2, 2)];
    const gap = edge(2, 2, 2, 3);
    seal(walls, pocket, [gap]);
    const state = playing(
      [at(2, 3), at(6, 1), at(6, 2), at(6, 3)],
      [at(1, 1), at(5, 5), at(5, 6), at(5, 7)],
      walls,
    );
    const next = applyTurn(state, { from: at(2, 3), to: at(2, 3), edge: gap });
    const regions = classifyRegions(next);
    const owned = regions.find((region) => region.cells.includes(at(1, 1)));
    assert.equal(owned?.kind, "blue");
    assert.equal(owned?.cells.length, 5);
    assert.equal(finalScore(regions).blue, 5);
  });

  it("scores only the trapped pieces in a mixed region that nobody can leave", () => {
    const walls = emptyWalls();
    const red = at(4, 4);
    const blue = at(4, 5);
    box(walls, red);
    box(walls, blue);
    walls[edge(4, 4, 4, 5)] = 0;
    const state = playing(
      [red, at(1, 1), at(1, 2), at(1, 3)],
      [blue, at(7, 1), at(7, 2), at(7, 3)],
      walls,
    );
    for (const cell of [
      at(1, 1),
      at(1, 2),
      at(1, 3),
      at(7, 1),
      at(7, 2),
      at(7, 3),
    ]) {
      box(walls, cell);
    }
    const regions = classifyRegions(state);
    const mixed = regions.find((region) => region.cells.includes(red));
    assert.equal(mixed?.kind, "trapped");
    const score = finalScore(regions);
    assert.equal(score.red, 4);
    assert.equal(score.blue, 4);
  });
});

describe("endings", () => {
  it("skips a side that has no legal turn", () => {
    const walls = emptyWalls();
    const red = at(4, 4);
    const blue = at(4, 5);
    for (const step of NEIGHBORS[red]) {
      if (step.cell !== blue) {
        walls[step.edge] = 1;
      }
    }
    const state = playing(
      [red, at(1, 1), at(1, 2), at(1, 3)],
      [blue, at(7, 5), at(7, 6), at(7, 7)],
      walls,
      "blue",
    );
    for (const cell of [at(1, 1), at(1, 2), at(1, 3)]) {
      box(walls, cell);
    }
    const wall = edge(4, 5, 4, 6);
    const next = applyTurn(state, { from: blue, to: blue, edge: wall });
    assert.equal(next.phase, "play");
    assert.equal(next.toMove, "blue");
    assert.equal(next.lastPass, "red");
    assert.ok(legalTurns(next, "blue").length > 0);
    assert.equal(legalTurns(next, "red").length, 0);
  });

  it("ends in a stalemate when neither side can move", () => {
    const walls = emptyWalls();
    const red = at(4, 4);
    const blue = at(4, 5);
    box(walls, red);
    box(walls, blue);
    walls[edge(4, 4, 4, 5)] = 0;
    const state = playing(
      [red, at(1, 1), at(1, 2), at(1, 3)],
      [blue, at(7, 1), at(7, 2), at(7, 3)],
      walls,
    );
    for (const cell of [
      at(1, 1),
      at(1, 2),
      at(1, 3),
      at(7, 1),
      at(7, 2),
      at(7, 3),
    ]) {
      box(walls, cell);
    }
    const next = resolve(state);
    assert.equal(next.phase, "over");
    assert.equal(next.endReason, "stalemate");
    assert.equal(outcomeOf(next)?.winner, "draw");
  });

  it("uses the safety ending when no interior edge remains in a mixed board", () => {
    const walls = emptyWalls();
    walls.fill(1);
    const shared = at(4, 4);
    const state = playing(
      [shared, at(1, 1), at(1, 2), at(1, 3)],
      [shared, at(7, 1), at(7, 2), at(7, 3)],
      walls,
    );
    const next = resolve(state);
    assert.equal(next.phase, "over");
    assert.equal(next.endReason, "safety");
  });

  it("ends by separation once every region has one owner", () => {
    const walls = emptyWalls();
    const cells = [at(1, 1), at(1, 2), at(1, 3)];
    seal(walls, cells, [edge(1, 3, 1, 4)]);
    const state = playing(
      [at(1, 1), at(6, 1), at(6, 2), at(6, 3)],
      [at(7, 4), at(7, 5), at(7, 6), at(7, 7)],
      walls,
    );
    for (const cell of [
      at(6, 1),
      at(6, 2),
      at(6, 3),
      at(7, 4),
      at(7, 5),
      at(7, 6),
      at(7, 7),
    ]) {
      box(walls, cell);
    }
    const next = resolve(state);
    assert.equal(next.phase, "over");
    assert.equal(next.endReason, "separation");
    assert.equal(outcomeOf(next)?.winner, "red");
  });
});

describe("winner", () => {
  it("breaks a tied total with the largest region, otherwise draws", () => {
    assert.equal(
      decideWinner({ red: 20, blue: 20, largest: { red: 11, blue: 8 } }),
      "red",
    );
    assert.equal(
      decideWinner({ red: 20, blue: 20, largest: { red: 8, blue: 8 } }),
      "draw",
    );
    assert.equal(
      decideWinner({ red: 19, blue: 20, largest: { red: 19, blue: 4 } }),
      "blue",
    );
  });

  it("applies the tiebreak on a finished board", () => {
    const walls = emptyWalls();
    const redLarge = [
      at(1, 1),
      at(1, 2),
      at(1, 3),
      at(2, 1),
      at(2, 2),
      at(2, 3),
    ];
    const blueLarge = [at(1, 5), at(1, 6), at(1, 7), at(2, 5)];
    const blueNext = [at(3, 5), at(3, 6), at(3, 7)];
    seal(walls, redLarge);
    seal(walls, blueLarge);
    seal(walls, blueNext);
    for (const cell of [at(6, 1), at(6, 2), at(6, 3), at(7, 7), at(7, 6)]) {
      box(walls, cell);
    }
    const state = playing(
      [at(1, 1), at(6, 1), at(6, 2), at(6, 3)],
      [at(1, 5), at(3, 5), at(7, 7), at(7, 6)],
      walls,
    );
    const next = resolve(state);
    assert.equal(next.endReason, "separation");
    const outcome = outcomeOf(next);
    assert.equal(outcome?.score.red, outcome?.score.blue);
    assert.equal(outcome?.winner, "red");
    assert.equal(outcome?.score.largest.red, 6);
  });
});

describe("deployment and full games", () => {
  it("deploys Red, Blue, Blue, Red and then lets Red move", () => {
    let state = initialState();
    assert.deepEqual(state.pieces.red, [at(2, 2), at(6, 6)]);
    assert.deepEqual(state.pieces.blue, [at(2, 6), at(6, 2)]);
    const seen: Side[] = [];
    while (state.phase === "deploy") {
      seen.push(state.toMove);
      const cell = legalPlacements(state)[0];
      assert.ok(cell !== undefined);
      state = applyPlacement(state, cell);
    }
    assert.deepEqual(seen, ["red", "blue", "blue", "red"]);
    assert.equal(state.phase, "play");
    assert.equal(state.toMove, "red");
    assert.equal(state.pieces.red.length, 4);
    assert.equal(state.pieces.blue.length, 4);
  });

  it("finishes seeded games without getting stuck", () => {
    for (let seed = 1; seed <= 20; seed++) {
      const random = mulberry32(seed);
      let state = initialState();
      for (let guard = 0; guard < 100 && state.phase !== "over"; guard++) {
        if (state.phase === "deploy") {
          const cells = legalPlacements(state);
          const cell = cells[Math.floor(random() * cells.length)];
          state = applyPlacement(state, cell);
          continue;
        }
        const turns = legalTurns(state, state.toMove);
        assert.ok(turns.length > 0, `seed ${seed} offered an empty turn`);
        const turn = turns[Math.floor(random() * turns.length)];
        const before = state.walls.reduce((sum, wall) => sum + wall, 0);
        state = applyTurn(state, turn);
        const after = state.walls.reduce((sum, wall) => sum + wall, 0);
        assert.equal(after, before + 1);
        assert.equal(
          new Set([...state.pieces.red, ...state.pieces.blue]).size,
          8,
        );
      }
      assert.equal(state.phase, "over", `seed ${seed} did not finish`);
      const outcome = outcomeOf(state);
      assert.ok(outcome);
      assert.ok(outcome.score.red + outcome.score.blue <= CELLS);
    }
  });
});

describe("directions", () => {
  it("names the side of a cell an edge sits on", () => {
    const from = at(4, 4);
    const names = NEIGHBORS[from].map((step) => step.direction);
    assert.deepEqual(names, [
      "up",
      "right",
      "down",
      "left",
    ] satisfies Direction[]);
    assert.equal(directionBetween(from, edge(4, 4, 4, 5)), "right");
  });
});
