export const COLORS = ["red", "yellow", "green", "blue", "purple"] as const;

export type Color = (typeof COLORS)[number];

export const DIFFICULTY_IDS = ["easy", "normal", "hard"] as const;

export type Difficulty = (typeof DIFFICULTY_IDS)[number];

export type Pan = Record<Color, number>;

export type ScaleId = "main" | "secondary";

export type Side = "left" | "right";

export type Outcome = "left" | "right" | "balance";

export type ReportedOutcome = Outcome | "none";

export type ScaleState = {
  left: Pan;
  right: Pan;
};

export type Board = {
  main: ScaleState;
  secondary: ScaleState;
};

export type Placement = {
  scale: ScaleId;
  side: Side;
  color: Color;
};

export type Weights = Record<Color, number>;

export type DifficultyConfig = {
  minWeight: number;
  maxWeight: number;
  revealedCount: number;
  copies: number;
  minPlace: number;
  guesses: number;
  partialCounts: boolean;
  medianReveal: boolean;
};

export const DIFFICULTIES = {
  easy: {
    minWeight: 1,
    maxWeight: 10,
    revealedCount: 2,
    copies: 8,
    minPlace: 2,
    guesses: 2,
    partialCounts: true,
    medianReveal: false,
  },
  normal: {
    minWeight: 1,
    maxWeight: 20,
    revealedCount: 1,
    copies: 8,
    minPlace: 2,
    guesses: 2,
    partialCounts: true,
    medianReveal: true,
  },
  hard: {
    minWeight: 1,
    maxWeight: 20,
    revealedCount: 1,
    copies: 8,
    minPlace: 3,
    guesses: 1,
    partialCounts: false,
    medianReveal: false,
  },
} as const satisfies Record<Difficulty, DifficultyConfig>;

export type Challenge = {
  difficulty: Difficulty;
  weights: Weights;
  revealed: Color[];
};

export type HistoryEntry = {
  id: number;
  added: Placement[];
  main: ReportedOutcome;
  secondary: ReportedOutcome;
};

export type RoundResult = "playing" | "full" | "partial" | "failure";

export const emptyPan = (): Pan => ({
  red: 0,
  yellow: 0,
  green: 0,
  blue: 0,
  purple: 0,
});

export const emptyScale = (): ScaleState => ({
  left: emptyPan(),
  right: emptyPan(),
});

export const emptyBoard = (): Board => ({
  main: emptyScale(),
  secondary: emptyScale(),
});

export const blockCount = (pan: Pan): number =>
  COLORS.reduce((sum, color) => sum + pan[color], 0);

const weightOf = (pan: Pan, weights: Weights): number =>
  COLORS.reduce((sum, color) => sum + pan[color] * weights[color], 0);

export const samePattern = (left: Pan, right: Pan): boolean =>
  COLORS.every((color) => left[color] === right[color]);

export const compareScale = (scale: ScaleState, weights: Weights): Outcome => {
  const left = weightOf(scale.left, weights);
  const right = weightOf(scale.right, weights);
  if (left > right) {
    return "left";
  }
  if (left < right) {
    return "right";
  }
  return "balance";
};

export const reportOutcome = (
  scale: ScaleState,
  weights: Weights,
): ReportedOutcome => {
  if (blockCount(scale.left) + blockCount(scale.right) === 0) {
    return "none";
  }
  return compareScale(scale, weights);
};

export const mainIsSolved = (scale: ScaleState, weights: Weights): boolean =>
  blockCount(scale.left) > 0 &&
  blockCount(scale.right) > 0 &&
  !samePattern(scale.left, scale.right) &&
  compareScale(scale, weights) === "balance";

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

export const findValidBalance = (
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

const shuffle = <T>(items: readonly T[], random: () => number): T[] => {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = next[index];
    const swap = next[swapIndex];
    if (current === undefined || swap === undefined) {
      continue;
    }
    next[index] = swap;
    next[swapIndex] = current;
  }
  return next;
};

const fallbackWeights = (): Weights => ({
  red: 2,
  yellow: 3,
  green: 4,
  blue: 5,
  purple: 6,
});

const fallbackMedian = (): { weights: Weights; revealed: Color } => ({
  weights: fallbackWeights(),
  revealed: "green",
});

const distinctWeights = (
  config: DifficultyConfig,
  random: () => number,
): Weights | null => {
  const span = config.maxWeight - config.minWeight + 1;
  if (span < COLORS.length) {
    return null;
  }
  const pool: number[] = [];
  for (let value = config.minWeight; value <= config.maxWeight; value += 1) {
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

const randomMedianChallenge = (
  config: DifficultyConfig,
  random: () => number,
): { weights: Weights; revealed: Color } | null => {
  const weights = distinctWeights(config, random);
  if (!weights) {
    return null;
  }
  const ordered = [...COLORS].sort(
    (left, right) => weights[left] - weights[right],
  );
  const revealed = ordered[Math.floor(COLORS.length / 2)];
  if (!revealed) {
    return null;
  }
  return { weights, revealed };
};

export const createChallenge = (
  difficulty: Difficulty,
  random: () => number = Math.random,
): Challenge => {
  const config = DIFFICULTIES[difficulty];
  if (config.medianReveal) {
    let picked: { weights: Weights; revealed: Color } | null = null;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const candidate = randomMedianChallenge(config, random);
      if (candidate && findValidBalance(candidate.weights, config.copies)) {
        picked = candidate;
        break;
      }
    }
    const median = picked ?? fallbackMedian();
    return {
      difficulty,
      weights: median.weights,
      revealed: [median.revealed],
    };
  }

  let weights: Weights | null = null;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const candidate = distinctWeights(config, random);
    if (candidate && findValidBalance(candidate, config.copies)) {
      weights = candidate;
      break;
    }
  }
  if (!weights) {
    weights = fallbackWeights();
  }

  const revealed = shuffle(COLORS, random).slice(0, config.revealedCount);
  return { difficulty, weights, revealed };
};

export const withPlacement = (board: Board, placement: Placement): Board => {
  const scale = board[placement.scale];
  const pan = scale[placement.side];
  return {
    ...board,
    [placement.scale]: {
      ...scale,
      [placement.side]: {
        ...pan,
        [placement.color]: pan[placement.color] + 1,
      },
    },
  };
};

export const boardFromPlacements = (placements: readonly Placement[]): Board =>
  placements.reduce<Board>(withPlacement, emptyBoard());

const addPans = (base: Pan, extra: Pan): Pan => {
  const next = emptyPan();
  for (const color of COLORS) {
    next[color] = base[color] + extra[color];
  }
  return next;
};

const addScales = (base: ScaleState, extra: ScaleState): ScaleState => ({
  left: addPans(base.left, extra.left),
  right: addPans(base.right, extra.right),
});

export const addBoards = (base: Board, extra: Board): Board => ({
  main: addScales(base.main, extra.main),
  secondary: addScales(base.secondary, extra.secondary),
});

export const countPlacements = (
  placements: readonly Placement[],
  scale: ScaleId,
  side: Side,
): Pan => {
  const pan = emptyPan();
  for (const placement of placements) {
    if (placement.scale === scale && placement.side === side) {
      pan[placement.color] += 1;
    }
  }
  return pan;
};

export const usedInventory = (
  board: Board,
  pending: readonly Placement[] = [],
): Pan => {
  const used = emptyPan();
  for (const scale of [board.main, board.secondary]) {
    for (const color of COLORS) {
      used[color] += scale.left[color] + scale.right[color];
    }
  }
  for (const placement of pending) {
    used[placement.color] += 1;
  }
  return used;
};

export const copiesLeft = (
  copies: number,
  board: Board,
  pending: readonly Placement[] = [],
): Pan => {
  const used = usedInventory(board, pending);
  const left = emptyPan();
  for (const color of COLORS) {
    left[color] = copies - used[color];
  }
  return left;
};

export const unusedBlocks = (
  copies: number,
  board: Board,
  pending: readonly Placement[] = [],
): number => {
  const used = usedInventory(board, pending);
  return COLORS.reduce((sum, color) => sum + (copies - used[color]), 0);
};

export const canCommit = (pendingCount: number, minPlace: number): boolean =>
  pendingCount >= minPlace;

export const withoutLastPlacement = (
  pending: readonly Placement[],
  target?: Placement,
): Placement[] => {
  if (!target) {
    return pending.slice(0, -1);
  }
  for (let index = pending.length - 1; index >= 0; index -= 1) {
    const placement = pending[index];
    if (
      placement &&
      placement.scale === target.scale &&
      placement.side === target.side &&
      placement.color === target.color
    ) {
      return pending.filter((_, item) => item !== index);
    }
  }
  return [...pending];
};

export const parseGuess = (
  raw: Record<Color, string>,
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
