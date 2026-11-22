import { VisuallyHidden } from "@/components/VisuallyHidden/VisuallyHidden";
import { cx } from "@/utils/cx";

import { POSITIONS, type Position, type Star } from "../logic/positions";
import type { GameTranslation } from "../translations";
import styles from "./MiniStar.module.css";

const POINT_LAYOUT: Record<Position, { x: string; y: string }> = {
  A: { x: "50%", y: "11%" },
  B: { x: "84%", y: "38%" },
  C: { x: "70%", y: "84%" },
  D: { x: "30%", y: "84%" },
  E: { x: "16%", y: "38%" },
};

type MiniStarProps = {
  star: Star;
  result: number;
  copy: GameTranslation;
};

export const MiniStar = ({ star, result, copy }: MiniStarProps) => {
  const description = `${POSITIONS.map((position) =>
    copy.historyPoint(
      copy.positions[position],
      star[position] === null ? copy.emptyPoint : String(star[position]),
    ),
  ).join(", ")}. ${copy.historyResult(result)}`;

  return (
    <div className={styles.star}>
      <VisuallyHidden>{description}</VisuallyHidden>
      <svg className={styles.outline} viewBox="0 0 100 100" aria-hidden="true">
        <path d="M50 8 L74.7 84 L10.1 37 L89.9 37 L25.3 84 Z" />
      </svg>
      <span className={styles.center} aria-hidden="true">
        {result}
      </span>
      {POSITIONS.map((position) => {
        const value = star[position];
        const layout = POINT_LAYOUT[position];
        return (
          <span
            key={position}
            className={cx(styles.point, value === null && styles.empty)}
            style={{ left: layout.x, top: layout.y }}
            aria-hidden="true"
          >
            {value === null ? copy.emptyMark : value}
          </span>
        );
      })}
    </div>
  );
};
