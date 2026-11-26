import { type GameState, other, type Turn } from "../logic/board.ts";
import { freeEdges } from "../logic/moves.ts";
import { classifyRegions, securedScore } from "../logic/regions.ts";
import { applyTurn } from "../logic/state.ts";

const sameTurn = (left: Turn, right: Turn) =>
  left.from === right.from && left.to === right.to && left.edge === right.edge;

/**
 * Puts likely seals and blocks first. When `limit` is set, tactical moves
 * stay in the list even if they rank past the cut.
 */
export const orderTurns = (
  state: GameState,
  turns: Turn[],
  limit: number | null,
  preferred: Turn | null,
) => {
  const before = securedScore(classifyRegions(state));
  const ranked = turns.map((turn) => {
    const open = freeEdges(state.walls, turn.to).length;
    let score = 6 - open;
    let tactical = open <= 2;
    if (limit !== null || open <= 3) {
      const next = applyTurn(state, turn);
      const after = securedScore(classifyRegions(next));
      const opponent = other(state.toMove);
      const gain = after[state.toMove] - before[state.toMove];
      const gifted = after[opponent] - before[opponent];
      score =
        gain * 100 - gifted * 120 + (next.phase === "over" ? 40 : 0) - open;
      tactical = gain > 0 || gifted > 0 || next.phase === "over";
    }
    return { turn, score, tactical };
  });
  ranked.sort((a, b) => b.score - a.score);
  if (preferred) {
    const index = ranked.findIndex((entry) => sameTurn(entry.turn, preferred));
    if (index > 0) {
      const [picked] = ranked.splice(index, 1);
      if (picked) {
        ranked.unshift(picked);
      }
    }
  }
  if (limit === null || ranked.length <= limit) {
    return ranked.map((entry) => entry.turn);
  }
  const kept = ranked.filter((entry, index) => index < limit || entry.tactical);
  return (kept.length > 0 ? kept : ranked.slice(0, 1)).map(
    (entry) => entry.turn,
  );
};
