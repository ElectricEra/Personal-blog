import type { GameState, Side } from "./board.ts";
import { classifyRegions, finalScore, type Score } from "./regions.ts";

export type Outcome = {
  winner: Side | "draw";
  score: Score;
};

export const decideWinner = (score: Score): Side | "draw" => {
  if (score.red !== score.blue) {
    return score.red > score.blue ? "red" : "blue";
  }
  if (score.largest.red !== score.largest.blue) {
    return score.largest.red > score.largest.blue ? "red" : "blue";
  }
  return "draw";
};

export const outcomeOf = (state: GameState): Outcome | null => {
  if (state.phase !== "over") {
    return null;
  }
  const score = finalScore(classifyRegions(state));
  return { winner: decideWinner(score), score };
};
