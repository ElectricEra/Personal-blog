import { HistoryList } from "@/components/HistoryList/HistoryList";

import {
  COLORS,
  type HistoryEntry,
  type Placement,
  type ScaleId,
} from "../logic/config";
import type { GameTranslation } from "../translations";

const describeAdded = (
  placements: readonly Placement[],
  scale: ScaleId,
  copy: GameTranslation,
) => {
  const parts: string[] = [];
  for (const side of ["left", "right"] as const) {
    const sideName = side === "left" ? copy.leftPan : copy.rightPan;
    for (const color of COLORS) {
      const count = placements.filter(
        (placement) =>
          placement.scale === scale &&
          placement.side === side &&
          placement.color === color,
      ).length;
      if (count > 0) {
        parts.push(copy.piece(copy.colors[color], count, sideName));
      }
    }
  }
  return parts.length > 0 ? parts.join(", ") : copy.unchanged;
};

type MoveHistoryProps = {
  history: readonly HistoryEntry[];
  copy: GameTranslation;
};

export const MoveHistory = ({ history, copy }: MoveHistoryProps) => (
  <HistoryList
    title={copy.historyTitle}
    emptyText={copy.historyEmpty}
    items={history}
    renderItem={(entry) => (
      <>
        <strong>{copy.moveLabel(entry.id)}</strong>
        <span>
          {copy.mainScale}: {describeAdded(entry.added, "main", copy)} —{" "}
          {copy.outcomes[entry.main]}
        </span>
        <span>
          {copy.secondScale}: {describeAdded(entry.added, "secondary", copy)} —{" "}
          {copy.outcomes[entry.secondary]}
        </span>
      </>
    )}
  />
);
