import { type Challenge, type Color, DIFFICULTIES } from "./config";

/** The player's assumed ranking, heaviest first. `null` is an empty slot. */
export type Order = Array<Color | null>;

export const SLOT_KEYS = [
  "heaviest",
  "heavy",
  "middle",
  "light",
  "lightest",
] as const;

const MIDDLE_SLOT = 2;

/** The revealed median color, which is pinned to the middle slot. */
export const fixedColorOf = (challenge: Challenge): Color | null =>
  DIFFICULTIES[challenge.difficulty].medianReveal
    ? (challenge.revealed[0] ?? null)
    : null;

export const slotIsFixed = (challenge: Challenge, index: number): boolean =>
  fixedColorOf(challenge) !== null && index === MIDDLE_SLOT;

export const orderFromChallenge = (challenge: Challenge): Order => {
  const slots: Order = SLOT_KEYS.map(() => null);
  slots[MIDDLE_SLOT] = fixedColorOf(challenge);
  return slots;
};

/**
 * Moves `color` to slot `toIndex`, swapping with whatever was there, or back
 * to the tray when `toIndex` is null. The fixed color never moves.
 */
export const moveInOrder = (
  order: Order,
  challenge: Challenge,
  color: Color,
  toIndex: number | null,
): Order => {
  const fixed = fixedColorOf(challenge);
  if (color === fixed) {
    return order;
  }
  const fromIndex = order.indexOf(color);
  if (toIndex === null) {
    if (fromIndex < 0) {
      return order;
    }
    const next = [...order];
    next[fromIndex] = null;
    return next;
  }
  if (slotIsFixed(challenge, toIndex) || fromIndex === toIndex) {
    return order;
  }
  const occupant = order[toIndex] ?? null;
  const next = [...order];
  next[toIndex] = color;
  if (fromIndex >= 0) {
    next[fromIndex] = occupant;
  }
  return next;
};
