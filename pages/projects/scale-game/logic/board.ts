import {
  type Board,
  COLORS,
  type Outcome,
  type Pan,
  type Placement,
  type ReportedOutcome,
  type ScaleId,
  type ScaleState,
  type Side,
  type Weights,
} from "./config";

export const emptyPan = (): Pan => ({
  red: 0,
  yellow: 0,
  green: 0,
  blue: 0,
  purple: 0,
});

const emptyScale = (): ScaleState => ({
  left: emptyPan(),
  right: emptyPan(),
});

export const emptyBoard = (): Board => ({
  main: emptyScale(),
  secondary: emptyScale(),
});

const blockCount = (pan: Pan): number =>
  COLORS.reduce((sum, color) => sum + pan[color], 0);

const weightOf = (pan: Pan, weights: Weights): number =>
  COLORS.reduce((sum, color) => sum + pan[color] * weights[color], 0);

const samePattern = (left: Pan, right: Pan): boolean =>
  COLORS.every((color) => left[color] === right[color]);

const bothPansUsed = (scale: ScaleState): boolean =>
  blockCount(scale.left) > 0 && blockCount(scale.right) > 0;

const compareScale = (scale: ScaleState, weights: Weights): Outcome => {
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

/** Both pans hold blocks, and the same combination of them. */
export const pansMatch = (scale: ScaleState): boolean =>
  bothPansUsed(scale) && samePattern(scale.left, scale.right);

export const mainIsSolved = (scale: ScaleState, weights: Weights): boolean =>
  bothPansUsed(scale) &&
  !samePattern(scale.left, scale.right) &&
  compareScale(scale, weights) === "balance";

export const addPans = (base: Pan, extra: Pan): Pan => {
  const next = emptyPan();
  for (const color of COLORS) {
    next[color] = base[color] + extra[color];
  }
  return next;
};

/** Per color, how many blocks have a partner on the other pan. */
export const pairOverlap = (left: Pan, right: Pan): Pan => {
  const overlap = emptyPan();
  for (const color of COLORS) {
    overlap[color] = Math.min(left[color], right[color]);
  }
  return overlap;
};

const withPlacement = (board: Board, placement: Placement): Board => {
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

const usedInventory = (
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

export const unusedBlocks = (copies: number, board: Board): number => {
  const used = usedInventory(board);
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
