import type { DieFace, OpeningFaces } from "./placement";
import { POSITIONS, type Star, starFrom } from "./positions";
import { evaluate, RULE_BANDS, RULE_IDS, type RuleId } from "./rules";

export type Puzzle = {
  id: RuleId;
  ruleId: RuleId;
  band: (typeof RULE_BANDS)[RuleId];
  challenge: Star;
  opening: OpeningFaces;
  revealExample: Star;
  hintExample: Star;
  decoyId: RuleId;
};

const opening = (
  first: DieFace,
  second: DieFace,
  third: DieFace,
  fourth: DieFace,
  fifth: DieFace,
): OpeningFaces => [first, second, third, fourth, fifth];

const filled = (a: number, b: number, c: number, d: number, e: number): Star =>
  starFrom({ A: a, B: b, C: c, D: d, E: e });

const puzzle = (
  ruleId: RuleId,
  challenge: Star,
  faces: OpeningFaces,
  revealExample: Star,
  hintExample: Star,
  decoyId: RuleId,
): Puzzle => ({
  id: ruleId,
  ruleId,
  band: RULE_BANDS[ruleId],
  challenge,
  opening: faces,
  revealExample,
  hintExample,
  decoyId,
});

export const PUZZLES: readonly Puzzle[] = [
  puzzle(
    "sumEvens",
    filled(4, 7, 12, 3, 8),
    opening(1, 2, 3, 4, 6),
    starFrom({ A: 2, B: 5, C: 4 }),
    starFrom({ A: 2, B: 3, C: 4 }),
    "sumOdds",
  ),
  puzzle(
    "sumOdds",
    filled(5, 8, 9, 2, 11),
    opening(1, 2, 3, 5, 6),
    starFrom({ A: 3, B: 4, C: 5 }),
    starFrom({ A: 7, B: 2, C: 9 }),
    "sumEvens",
  ),
  puzzle(
    "sumDivisibleBy3",
    filled(6, 5, 9, 14, 4),
    opening(1, 2, 3, 4, 6),
    starFrom({ A: 6, B: 4, C: 9 }),
    starFrom({ A: 3, B: 2, C: 6 }),
    "sumEvens",
  ),
  puzzle(
    "sumPrimes",
    filled(4, 7, 11, 8, 2),
    opening(1, 2, 3, 4, 5),
    starFrom({ A: 4, B: 7, C: 2 }),
    starFrom({ A: 9, B: 5, C: 4 }),
    "sumOdds",
  ),
  puzzle(
    "sumSquares",
    filled(4, 7, 9, 16, 8),
    opening(1, 2, 3, 4, 5),
    starFrom({ A: 4, B: 3, C: 9 }),
    starFrom({ A: 16, B: 2, C: 1 }),
    "sumEvens",
  ),
  puzzle(
    "sumMultiDigit",
    filled(15, 20, 3, 9, 1),
    opening(1, 2, 3, 4, 6),
    starFrom({ A: 12, B: 4 }),
    starFrom({ A: 10, B: 3, C: 8 }),
    "sumEvens",
  ),
  puzzle(
    "maxMinusMin",
    filled(8, 3, 15, 6, 5),
    opening(1, 2, 4, 5, 6),
    starFrom({ A: 9, B: 2, C: 6 }),
    starFrom({ A: 7, B: 1, C: 4 }),
    "sumEvens",
  ),
  puzzle(
    "sumGreaterThanNext",
    filled(15, 5, 9, 3, 20),
    opening(1, 2, 4, 5, 6),
    starFrom({ A: 5, B: 2, C: 4 }),
    starFrom({ A: 8, B: 3, C: 7, D: 1 }),
    "sumEvens",
  ),
  puzzle(
    "sumContains1",
    filled(13, 7, 1, 21, 5),
    opening(1, 2, 3, 4, 6),
    starFrom({ A: 12, B: 3, C: 1 }),
    starFrom({ A: 10, B: 7, C: 1 }),
    "sumMultiDigit",
  ),
];

const validatePuzzle = (item: Puzzle) => {
  if (item.decoyId === item.ruleId) {
    throw new Error(`${item.id} uses itself as the decoy`);
  }
  for (const position of POSITIONS) {
    if (item.challenge[position] === null) {
      throw new Error(`${item.id} leaves ${position} empty`);
    }
  }
  const answer = evaluate(item.ruleId, item.challenge);
  for (const ruleId of RULE_IDS) {
    if (ruleId !== item.ruleId && evaluate(ruleId, item.challenge) === answer) {
      throw new Error(`${item.id} matches ${ruleId}`);
    }
  }
  const hintResult = evaluate(item.ruleId, item.hintExample);
  if (hintResult === evaluate(item.decoyId, item.hintExample)) {
    throw new Error(`${item.id} hint matches its decoy`);
  }
};

for (const item of PUZZLES) {
  validatePuzzle(item);
}
