import { emptyStar, POSITIONS, type Position, type Star } from "./positions";

export const DIE_FACES = [1, 2, 3, 4, 5, 6] as const;

export type DieFace = (typeof DIE_FACES)[number];

export type Die = {
  id: string;
  face: DieFace;
};

export type OpeningFaces = readonly [
  DieFace,
  DieFace,
  DieFace,
  DieFace,
  DieFace,
];

export type Placement = Record<Position, string[]>;

export const emptyPlacement = (): Placement => ({
  A: [],
  B: [],
  C: [],
  D: [],
  E: [],
});

export const diceFromFaces = (
  faces: readonly DieFace[],
  setId: number,
): Die[] => faces.map((face, index) => ({ id: `${setId}-${index}`, face }));

export const rollFaces = (random: () => number = Math.random): OpeningFaces => {
  const face = (): DieFace =>
    DIE_FACES[Math.floor(random() * DIE_FACES.length)] ?? 1;
  return [face(), face(), face(), face(), face()];
};

const dieIds = (placement: Placement): string[] =>
  POSITIONS.flatMap((position) => placement[position]);

export const placedCount = (placement: Placement): number =>
  dieIds(placement).length;

export const isComplete = (
  placement: Placement,
  dice: readonly Die[],
): boolean => {
  if (dice.length === 0 || placedCount(placement) !== dice.length) {
    return false;
  }
  const used = new Set(dieIds(placement));
  return dice.every((die) => used.has(die.id));
};

export const removeDie = (placement: Placement, dieId: string): Placement => {
  const next = emptyPlacement();
  for (const position of POSITIONS) {
    next[position] = placement[position].filter((id) => id !== dieId);
  }
  return next;
};

export const appendDie = (
  placement: Placement,
  position: Position,
  dieId: string,
): Placement => ({
  ...placement,
  [position]: [...placement[position], dieId],
});

export const placementToStar = (
  placement: Placement,
  dice: readonly Die[],
): Star => {
  const faces = new Map(dice.map((die) => [die.id, die.face]));
  const star = emptyStar();
  for (const position of POSITIONS) {
    const ids = placement[position];
    if (ids.length === 0) {
      continue;
    }
    let digits = "";
    for (const id of ids) {
      const face = faces.get(id);
      if (face === undefined) {
        return emptyStar();
      }
      digits += String(face);
    }
    star[position] = Number(digits);
  }
  return star;
};
