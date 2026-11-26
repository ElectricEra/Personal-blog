import { type Direction, H_EDGES, SIZE } from "../logic/board.ts";

export const wallSlot = (edge: number) => {
  if (edge < H_EDGES) {
    const row = Math.floor(edge / SIZE);
    const column = edge % SIZE;
    return {
      gridRow: row * 2 + 2,
      gridColumn: column * 2 + 1,
      cell: row * SIZE + column,
      direction: "down" as Direction,
    };
  }
  const index = edge - H_EDGES;
  const row = Math.floor(index / 6);
  const column = index % 6;
  return {
    gridRow: row * 2 + 1,
    gridColumn: column * 2 + 2,
    cell: row * SIZE + column,
    direction: "right" as Direction,
  };
};
