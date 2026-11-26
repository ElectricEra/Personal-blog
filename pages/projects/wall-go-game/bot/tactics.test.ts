import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  cellFrom,
  cloneState,
  edgeBetween,
  emptyWalls,
  type GameState,
  type Side,
} from "../logic/board.ts";
import { isLegalTurn, legalPlacements, legalTurns } from "../logic/moves.ts";
import { outcomeOf } from "../logic/outcome.ts";
import { mulberry32 } from "../logic/random.ts";
import { classifyRegions, securedScore } from "../logic/regions.ts";
import { applyPlacement, applyTurn, initialState } from "../logic/state.ts";
import { chooseDecision, legalDecision } from "./chooseAction.ts";
import { DIFFICULTIES, type Difficulty } from "./difficulty.ts";
import { terminalScore } from "./evaluate.ts";
import { choosePlacement } from "./placement.ts";
import { hashState, searchTurn } from "./search.ts";

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

const walled = () => {
  const walls = emptyWalls();
  walls.fill(1);
  return walls;
};

const open = (
  walls: Uint8Array,
  row: number,
  column: number,
  otherRow: number,
  otherColumn: number,
) => {
  walls[edge(row, column, otherRow, otherColumn)] = 0;
};

const playing = (
  red: number[],
  blue: number[],
  walls: Uint8Array,
  toMove: Side,
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

/** A 6-cell pocket with one gap. The mover who stays inside and closes it wins. */
const captureBoard = (side: Side): GameState => {
  const walls = walled();
  open(walls, 1, 1, 1, 2);
  open(walls, 1, 2, 1, 3);
  open(walls, 1, 1, 2, 1);
  open(walls, 2, 1, 2, 2);
  open(walls, 1, 2, 2, 2);
  open(walls, 1, 3, 2, 3);
  open(walls, 2, 2, 2, 3);
  open(walls, 2, 3, 2, 4);
  open(walls, 2, 4, 3, 4);
  open(walls, 3, 4, 3, 5);
  const inside = side === "red" ? at(2, 2) : at(3, 4);
  const outside = side === "red" ? at(3, 4) : at(2, 2);
  const red =
    side === "red"
      ? [inside, at(7, 1), at(7, 2), at(7, 3)]
      : [outside, at(7, 1), at(7, 2), at(7, 3)];
  const blue =
    side === "blue"
      ? [inside, at(7, 5), at(7, 6), at(7, 7)]
      : [outside, at(7, 5), at(7, 6), at(7, 7)];
  return playing(red, blue, walls, side);
};

/** Blue can close a 6-cell pocket unless Red steps into it first. */
const defenseBoard = (): GameState => {
  const walls = walled();
  open(walls, 1, 1, 1, 2);
  open(walls, 1, 2, 1, 3);
  open(walls, 1, 1, 2, 1);
  open(walls, 2, 1, 2, 2);
  open(walls, 1, 2, 2, 2);
  open(walls, 1, 3, 2, 3);
  open(walls, 2, 2, 2, 3);
  open(walls, 2, 3, 2, 4);
  open(walls, 2, 4, 2, 5);
  open(walls, 2, 5, 2, 6);
  return playing(
    [at(2, 5), at(7, 1), at(7, 2), at(7, 3)],
    [at(2, 2), at(7, 5), at(7, 6), at(7, 7)],
    walls,
    "red",
  );
};

const secured = (state: GameState) => securedScore(classifyRegions(state));

const choose = (state: GameState, difficulty: Difficulty, seed = 1) => {
  const decision = chooseDecision(
    state,
    difficulty,
    mulberry32(seed),
    Date.now() + 2000,
  );
  assert.equal(decision.kind, "turn");
  if (decision.kind !== "turn") {
    throw new Error("expected a turn");
  }
  assert.equal(isLegalTurn(state, state.toMove, decision.turn), true);
  return decision;
};

describe("bot legality", () => {
  it("takes its own deployment slots for either color", () => {
    for (const bot of ["red", "blue"] as const) {
      let state = initialState();
      const seen: Side[] = [];
      while (state.phase === "deploy") {
        seen.push(state.toMove);
        if (state.toMove === bot) {
          const cell = choosePlacement(state, bot, "medium", mulberry32(3));
          assert.ok(legalPlacements(state).includes(cell));
          state = applyPlacement(state, cell);
        } else {
          const cell = legalPlacements(state)[0];
          assert.ok(cell !== undefined);
          state = applyPlacement(state, cell);
        }
      }
      assert.deepEqual(seen, ["red", "blue", "blue", "red"]);
    }
  });

  it("returns a legal action at every difficulty", () => {
    let state = initialState();
    const random = mulberry32(4);
    while (state.phase === "deploy") {
      const cell = legalPlacements(state)[0];
      assert.ok(cell !== undefined);
      state = applyPlacement(state, cell);
    }
    for (const difficulty of DIFFICULTIES) {
      const decision = chooseDecision(
        state,
        difficulty,
        random,
        Date.now() + (difficulty === "easy" ? 50 : 120),
      );
      assert.equal(decision.kind, "turn");
      if (decision.kind === "turn") {
        assert.equal(isLegalTurn(state, "red", decision.turn), true);
      }
    }
  });

  it("passes only when nothing is legal", () => {
    const walls = walled();
    walls[edge(4, 4, 4, 5)] = 0;
    const state = playing(
      [at(4, 4), at(1, 1), at(1, 2), at(1, 3)],
      [at(4, 5), at(7, 1), at(7, 2), at(7, 3)],
      walls,
      "red",
    );
    assert.equal(legalTurns(state, "red").length, 0);
    const decision = chooseDecision(
      state,
      "hard",
      mulberry32(1),
      Date.now() + 200,
    );
    assert.equal(decision.kind, "pass");
  });

  it("replaces an illegal recommendation", () => {
    const state = captureBoard("red");
    const fixed = legalDecision(state, {
      kind: "turn",
      turn: { from: at(7, 7), to: at(7, 7), edge: 0 },
      depthCompleted: 3,
    });
    assert.equal(fixed.kind, "turn");
    if (fixed.kind === "turn") {
      assert.equal(isLegalTurn(state, "red", fixed.turn), true);
    }
  });

  it("still moves when the budget is already spent", () => {
    const state = captureBoard("red");
    const decision = chooseDecision(
      state,
      "expert",
      mulberry32(9),
      Date.now() - 5,
    );
    assert.equal(decision.kind, "turn");
    if (decision.kind === "turn") {
      assert.equal(decision.depthCompleted, 0);
      assert.equal(isLegalTurn(state, "red", decision.turn), true);
    }
  });
});

describe("bot tactics", () => {
  for (const difficulty of ["medium", "hard", "expert"] as const) {
    it(`seals a winning region on ${difficulty}`, () => {
      const state = captureBoard("red");
      const decision = choose(state, difficulty, 2);
      const next = applyTurn(state, decision.turn);
      const outcome = outcomeOf(next);
      assert.equal(next.phase, "over");
      assert.equal(outcome?.winner, "red");
      assert.ok(outcome && outcome.score.red - outcome.score.blue >= 3);
    });
  }

  it("blocks an opponent who would otherwise take the pocket", () => {
    for (const difficulty of ["hard", "expert"] as const) {
      const state = defenseBoard();
      const decision = choose(state, difficulty, 5);
      const next = applyTurn(state, decision.turn);
      const gifted = legalTurns(next, "blue").some((turn) => {
        const after = applyTurn(next, turn);
        return secured(after).blue - secured(next).blue >= 6;
      });
      assert.equal(gifted, false, difficulty);
    }
  });

  it("does not hand the opponent a finished region", () => {
    const state = defenseBoard();
    state.pieces.red[0] = at(2, 4);
    for (const difficulty of ["medium", "hard", "expert"] as const) {
      const decision = choose(state, difficulty, 6);
      const next = applyTurn(state, decision.turn);
      assert.ok(secured(next).blue - secured(state).blue < 6, difficulty);
    }
  });

  it("values a tiebreak win over a tiebreak loss", () => {
    const walls = walled();
    open(walls, 1, 1, 1, 2);
    open(walls, 1, 2, 1, 3);
    open(walls, 2, 1, 2, 2);
    open(walls, 3, 1, 3, 2);
    const win = playing(
      [at(1, 1), at(7, 1), at(7, 2)],
      [at(2, 1), at(3, 1), at(7, 7)],
      walls,
      "red",
    );
    win.phase = "over";
    win.endReason = "separation";
    const loss = cloneState(win);
    loss.pieces = {
      red: [...win.pieces.blue],
      blue: [...win.pieces.red],
    };
    assert.equal(outcomeOf(win)?.winner, "red");
    assert.equal(outcomeOf(loss)?.winner, "blue");
    assert.ok(terminalScore(win, "red", 1) > terminalScore(loss, "red", 1));
  });

  it("lets Easy miss a capture that stronger levels take", () => {
    const state = captureBoard("red");
    const seen = new Set<string>();
    for (let seed = 1; seed <= 30; seed++) {
      const decision = chooseDecision(
        state,
        "easy",
        mulberry32(seed),
        Date.now() + 200,
      );
      if (decision.kind === "turn") {
        seen.add(`${decision.turn.to}:${decision.turn.edge}`);
      }
    }
    assert.ok(seen.size > 1);
    const serious = choose(state, "hard", 1);
    const next = applyTurn(state, serious.turn);
    assert.equal(outcomeOf(next)?.winner, "red");
  });
});

describe("search bookkeeping", () => {
  it("keeps different sides out of the same cache entry", () => {
    const red = captureBoard("red");
    const blue = cloneState(red);
    blue.toMove = "blue";
    assert.notEqual(hashState(red), hashState(blue));
    const redMove = searchTurn(red, Date.now() + 500, 2, null, () => 0);
    const blueMove = searchTurn(blue, Date.now() + 500, 2, null, () => 0);
    assert.ok(red.pieces.red.includes(redMove.turn.from));
    assert.ok(blue.pieces.blue.includes(blueMove.turn.from));
  });

  it("ignores piece order in the hash", () => {
    const state = captureBoard("red");
    const swapped = cloneState(state);
    swapped.pieces.red.reverse();
    assert.equal(hashState(state), hashState(swapped));
  });
});
