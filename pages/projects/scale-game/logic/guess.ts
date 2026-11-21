import { emptyPan } from "./board";
import {
  type Challenge,
  COLORS,
  type Color,
  type RoundResult,
  type Weights,
} from "./config";

/** Weights as the player typed them, one text value per color. */
export type Guess = Record<Color, string>;

export const emptyGuess = (): Guess => ({
  red: "",
  yellow: "",
  green: "",
  blue: "",
  purple: "",
});

/** The guess with every revealed color set to its known weight. */
export const withRevealedWeights = (
  guess: Guess,
  challenge: Challenge,
): Guess => {
  const next = { ...guess };
  for (const color of challenge.revealed) {
    next[color] = String(challenge.weights[color]);
  }
  return next;
};

export const parseGuess = (
  raw: Guess,
  minWeight: number,
  maxWeight: number,
): Weights | null => {
  const guess = emptyPan();
  for (const color of COLORS) {
    const text = raw[color].trim();
    if (!/^\d+$/.test(text)) {
      return null;
    }
    const value = Number(text);
    if (!Number.isInteger(value) || value < minWeight || value > maxWeight) {
      return null;
    }
    guess[color] = value;
  }
  return guess;
};

export const guessIsCorrect = (weights: Weights, guess: Weights): boolean =>
  COLORS.every((color) => weights[color] === guess[color]);

export const resultAfterGuess = (
  correct: boolean,
  guessesLeft: number,
  partialCounts: boolean,
): RoundResult => {
  if (correct) {
    return "full";
  }
  if (guessesLeft > 0) {
    return "playing";
  }
  return partialCounts ? "partial" : "failure";
};

export const resultIfStuck = (
  solved: boolean,
  canMove: boolean,
  guessesLeft: number,
  partialCounts: boolean,
): RoundResult => {
  if (canMove || (solved && guessesLeft > 0)) {
    return "playing";
  }
  if (solved && partialCounts) {
    return "partial";
  }
  return "failure";
};
