export const DIFFICULTIES = ["easy", "medium", "hard", "expert"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const isDifficulty = (value: string): value is Difficulty =>
  DIFFICULTIES.some((difficulty) => difficulty === value);
