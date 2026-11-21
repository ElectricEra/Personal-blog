export const COLORS = ["red", "yellow", "green", "blue", "purple"] as const;

export type Color = (typeof COLORS)[number];

export const DIFFICULTY_IDS = ["easy", "normal", "hard"] as const;

export type Difficulty = (typeof DIFFICULTY_IDS)[number];

export const isDifficulty = (value: string): value is Difficulty =>
  DIFFICULTY_IDS.some((difficulty) => difficulty === value);

export type Pan = Record<Color, number>;

export type Weights = Record<Color, number>;

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

type DifficultyConfig = {
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
