/** Clockwise from the top. The point after E is A. */
export const POSITIONS = ["A", "B", "C", "D", "E"] as const;

export type Position = (typeof POSITIONS)[number];

export type Star = Record<Position, number | null>;

export const emptyStar = (): Star => ({
  A: null,
  B: null,
  C: null,
  D: null,
  E: null,
});

export const starFrom = (values: Partial<Star>): Star => ({
  ...emptyStar(),
  ...values,
});

export const nextPosition = (position: Position): Position => {
  const index = POSITIONS.indexOf(position);
  return POSITIONS[(index + 1) % POSITIONS.length] ?? position;
};
