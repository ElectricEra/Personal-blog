import { nextPosition, POSITIONS, type Star } from "./positions";

export const RULE_IDS = [
  "sumEvens",
  "sumOdds",
  "sumDivisibleBy3",
  "sumPrimes",
  "sumSquares",
  "sumMultiDigit",
  "maxMinusMin",
  "sumGreaterThanNext",
  "sumContains1",
] as const;

export type RuleId = (typeof RULE_IDS)[number];

export const BANDS = ["easy", "medium", "hard"] as const;

export type Band = (typeof BANDS)[number];

export const RULE_BANDS = {
  sumEvens: "easy",
  sumOdds: "easy",
  sumDivisibleBy3: "easy",
  sumPrimes: "medium",
  sumSquares: "medium",
  sumMultiDigit: "medium",
  maxMinusMin: "hard",
  sumGreaterThanNext: "hard",
  sumContains1: "hard",
} as const satisfies Record<RuleId, Band>;

const placedNumbers = (star: Star): number[] =>
  POSITIONS.flatMap((position) => {
    const value = star[position];
    return value === null ? [] : [value];
  });

const sum = (values: readonly number[]): number =>
  values.reduce((total, value) => total + value, 0);

const isPrime = (value: number): boolean => {
  if (value < 2) {
    return false;
  }
  for (let divisor = 2; divisor * divisor <= value; divisor += 1) {
    if (value % divisor === 0) {
      return false;
    }
  }
  return true;
};

const isSquare = (value: number): boolean => {
  if (value < 0) {
    return false;
  }
  const root = Math.round(Math.sqrt(value));
  return root * root === value;
};

const evaluators: Record<RuleId, (star: Star) => number> = {
  sumEvens: (star) =>
    sum(placedNumbers(star).filter((value) => value % 2 === 0)),
  sumOdds: (star) =>
    sum(placedNumbers(star).filter((value) => value % 2 !== 0)),
  sumDivisibleBy3: (star) =>
    sum(placedNumbers(star).filter((value) => value % 3 === 0)),
  sumPrimes: (star) => sum(placedNumbers(star).filter(isPrime)),
  sumSquares: (star) => sum(placedNumbers(star).filter(isSquare)),
  sumMultiDigit: (star) =>
    sum(placedNumbers(star).filter((value) => value >= 10)),
  maxMinusMin: (star) => {
    const values = placedNumbers(star);
    if (values.length === 0) {
      return 0;
    }
    return Math.max(...values) - Math.min(...values);
  },
  sumGreaterThanNext: (star) =>
    sum(
      POSITIONS.flatMap((position) => {
        const value = star[position];
        const next = star[nextPosition(position)];
        return value !== null && next !== null && value > next ? [value] : [];
      }),
    ),
  sumContains1: (star) =>
    sum(placedNumbers(star).filter((value) => String(value).includes("1"))),
};

export const evaluate = (ruleId: RuleId, star: Star): number =>
  evaluators[ruleId](star);
