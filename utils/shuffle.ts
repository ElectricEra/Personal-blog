/** Fisher-Yates shuffle that returns a new array. */
export const shuffle = <T>(
  items: readonly T[],
  random: () => number = Math.random,
): T[] => {
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
