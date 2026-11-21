import { shuffle } from "@/utils/shuffle";

import { emptyPan } from "./board";
import {
  type Challenge,
  COLORS,
  type Color,
  DIFFICULTIES,
  type Difficulty,
  type ScaleState,
  type Weights,
} from "./config";

type WeightRange = { minWeight: number; maxWeight: number };

const MAX_ATTEMPTS = 40;

const distributions = (copies: number): Array<[number, number]> => {
  const pairs: Array<[number, number]> = [];
  for (let left = 0; left <= copies; left += 1) {
    for (let right = 0; right <= copies - left; right += 1) {
      pairs.push([left, right]);
    }
  }
  return pairs.sort((a, b) => {
    const rank = (pair: [number, number]) => {
      const used = pair[0] + pair[1];
      const different = pair[0] === pair[1] ? 0 : 2;
      return different + used;
    };
    return rank(b) - rank(a);
  });
};

/** A balanced main scale with different pans, or null if none exists. */
const findValidBalance = (
  weights: Weights,
  copies: number,
): ScaleState | null => {
  const options = distributions(copies);
  const choice = COLORS.map(() => 0);
  const maxSwing = COLORS.map((color) => copies * weights[color]);

  const search = (
    index: number,
    leftWeight: number,
    rightWeight: number,
    leftBlocks: number,
    rightBlocks: number,
    identical: boolean,
  ): boolean => {
    if (index === COLORS.length) {
      return (
        leftBlocks > 0 &&
        rightBlocks > 0 &&
        !identical &&
        leftWeight === rightWeight
      );
    }

    let swing = 0;
    for (let later = index; later < COLORS.length; later += 1) {
      swing += maxSwing[later] ?? 0;
    }
    if (Math.abs(leftWeight - rightWeight) > swing) {
      return false;
    }

    const color = COLORS[index];
    if (color === undefined) {
      return false;
    }
    const weight = weights[color];

    for (let option = 0; option < options.length; option += 1) {
      const pair = options[option];
      if (pair === undefined) {
        continue;
      }
      const [left, right] = pair;
      choice[index] = option;
      if (
        search(
          index + 1,
          leftWeight + left * weight,
          rightWeight + right * weight,
          leftBlocks + left,
          rightBlocks + right,
          identical && left === right,
        )
      ) {
        return true;
      }
    }
    return false;
  };

  if (!search(0, 0, 0, 0, 0, true)) {
    return null;
  }

  const left = emptyPan();
  const right = emptyPan();
  COLORS.forEach((color, index) => {
    const pair = options[choice[index] ?? 0];
    if (pair === undefined) {
      return;
    }
    left[color] = pair[0];
    right[color] = pair[1];
  });
  return { left, right };
};

const fallbackWeights = (): Weights => ({
  red: 2,
  yellow: 3,
  green: 4,
  blue: 5,
  purple: 6,
});

const distinctWeights = (
  range: WeightRange,
  random: () => number,
): Weights | null => {
  const span = range.maxWeight - range.minWeight + 1;
  if (span < COLORS.length) {
    return null;
  }
  const pool: number[] = [];
  for (let value = range.minWeight; value <= range.maxWeight; value += 1) {
    pool.push(value);
  }
  const picked = shuffle(pool, random).slice(0, COLORS.length);
  const weights = emptyPan();
  for (const [index, color] of COLORS.entries()) {
    const value = picked[index];
    if (value === undefined) {
      return null;
    }
    weights[color] = value;
  }
  return weights;
};

const solvableWeights = (
  range: WeightRange,
  copies: number,
  random: () => number,
): Weights => {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const candidate = distinctWeights(range, random);
    if (candidate && findValidBalance(candidate, copies)) {
      return candidate;
    }
  }
  return fallbackWeights();
};

const medianColor = (weights: Weights): Color => {
  const ordered = [...COLORS].sort(
    (left, right) => weights[left] - weights[right],
  );
  return ordered[Math.floor(COLORS.length / 2)] ?? "green";
};

export const createChallenge = (
  difficulty: Difficulty,
  random: () => number = Math.random,
): Challenge => {
  const config = DIFFICULTIES[difficulty];
  const weights = solvableWeights(config, config.copies, random);
  const revealed = config.medianReveal
    ? [medianColor(weights)]
    : shuffle(COLORS, random).slice(0, config.revealedCount);
  return { difficulty, weights, revealed };
};
