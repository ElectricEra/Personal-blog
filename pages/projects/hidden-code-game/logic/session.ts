import { shuffle } from "@/utils/shuffle";

import type { Puzzle } from "./puzzles";

export const MODES = ["guided", "classic", "challenge"] as const;

export type Mode = (typeof MODES)[number];

export const isMode = (value: string): value is Mode =>
  MODES.some((mode) => mode === value);

type ModeConfig = {
  sessionLength: number;
  maxTests: number | null;
  maxAnswers: number | null;
  hintAfterMisses: number | null;
  timed: boolean;
};

export const MODE_CONFIG = {
  guided: {
    sessionLength: 1,
    maxTests: null,
    maxAnswers: null,
    hintAfterMisses: 3,
    timed: false,
  },
  classic: {
    sessionLength: 5,
    maxTests: null,
    maxAnswers: 2,
    hintAfterMisses: null,
    timed: true,
  },
  challenge: {
    sessionLength: 5,
    maxTests: 6,
    maxAnswers: 1,
    hintAfterMisses: null,
    timed: true,
  },
} as const satisfies Record<Mode, ModeConfig>;

const take = (
  puzzles: readonly Puzzle[],
  count: number,
  random: () => number,
): Puzzle[] => shuffle(puzzles, random).slice(0, count);

export const drawSession = (
  mode: Mode,
  puzzles: readonly Puzzle[],
  random: () => number = Math.random,
): Puzzle[] => {
  if (mode === "guided") {
    return take(puzzles, 1, random);
  }

  if (mode === "challenge") {
    const hard = puzzles.filter((puzzle) => puzzle.band === "hard");
    const medium = puzzles.filter((puzzle) => puzzle.band === "medium");
    return shuffle([...hard, ...take(medium, 2, random)], random);
  }

  const picked = [
    ...take(
      puzzles.filter((puzzle) => puzzle.band === "easy"),
      1,
      random,
    ),
    ...take(
      puzzles.filter((puzzle) => puzzle.band === "medium"),
      1,
      random,
    ),
    ...take(
      puzzles.filter((puzzle) => puzzle.band === "hard"),
      1,
      random,
    ),
  ];
  const used = new Set(picked.map((puzzle) => puzzle.id));
  const rest = puzzles.filter((puzzle) => !used.has(puzzle.id));
  return shuffle([...picked, ...take(rest, 2, random)], random);
};

export const formatElapsed = (milliseconds: number): string => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};
