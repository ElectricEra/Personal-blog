import { VisuallyHidden } from "@/components/VisuallyHidden/VisuallyHidden";
import { cx } from "@/utils/cx";

import type { Die, Placement } from "../logic/placement";
import { POSITIONS, type Position, type Star } from "../logic/positions";
import type { GameTranslation } from "../translations";
import styles from "./StarBoard.module.css";

const POINT_LAYOUT: Record<Position, { x: string; y: string }> = {
  A: { x: "50%", y: "11%" },
  B: { x: "84%", y: "38%" },
  C: { x: "70%", y: "84%" },
  D: { x: "30%", y: "84%" },
  E: { x: "16%", y: "38%" },
};

type StarBoardProps = {
  title: string;
  star: Star;
  result: string;
  resultLabel: string;
  interactive: boolean;
  selected: Position | null;
  placement: Placement | null;
  dice: readonly Die[];
  copy: GameTranslation;
  onSelect?: (position: Position) => void;
  onRemove?: (dieId: string) => void;
};

const pointValue = (star: Star, position: Position, empty: string): string => {
  const value = star[position];
  return value === null ? empty : String(value);
};

export const StarBoard = ({
  title,
  star,
  result,
  resultLabel,
  interactive,
  selected,
  placement,
  dice,
  copy,
  onSelect,
  onRemove,
}: StarBoardProps) => {
  const faces = new Map(dice.map((die) => [die.id, die.face]));

  return (
    <section className={styles.board} aria-label={title}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.star}>
        <svg
          className={styles.outline}
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <path d="M50 8 L74.7 84 L10.1 37 L89.9 37 L25.3 84 Z" />
        </svg>
        <p className={styles.center}>
          <span aria-hidden="true">{result}</span>
          <VisuallyHidden>{resultLabel}</VisuallyHidden>
        </p>
        {POSITIONS.map((position) => {
          const value = pointValue(star, position, copy.emptyMark);
          const spoken =
            star[position] === null ? copy.emptyPoint : String(star[position]);
          const ids = placement?.[position] ?? [];
          const layout = POINT_LAYOUT[position];
          const pointClass = cx(
            styles.point,
            star[position] === null && styles.empty,
            selected === position && styles.selected,
          );
          const pointStyle = { left: layout.x, top: layout.y };
          const digits =
            ids.length === 0 ? null : (
              <span className={styles.digits}>
                {ids.map((id) => {
                  const face = faces.get(id);
                  if (face === undefined) {
                    return null;
                  }
                  return (
                    <button
                      key={id}
                      type="button"
                      className={styles.die}
                      disabled={!interactive}
                      aria-label={copy.removeDigit(
                        face,
                        copy.positions[position],
                      )}
                      onClick={() => onRemove?.(id)}
                    >
                      {face}
                    </button>
                  );
                })}
              </span>
            );
          if (!interactive) {
            return (
              <fieldset
                key={position}
                className={pointClass}
                style={pointStyle}
                aria-label={copy.pointValue(copy.positions[position], spoken)}
              >
                <span className={styles.pointName} aria-hidden="true">
                  {copy.positions[position]}
                </span>
                <span className={styles.value} aria-hidden="true">
                  {value}
                </span>
                {digits}
              </fieldset>
            );
          }
          return (
            <div key={position} className={pointClass} style={pointStyle}>
              <button
                type="button"
                className={styles.pointButton}
                aria-pressed={selected === position}
                aria-label={copy.selectPoint(copy.positions[position])}
                onClick={() => onSelect?.(position)}
              >
                {copy.positions[position]}
              </button>
              {digits ?? (
                <span className={styles.value} aria-hidden="true">
                  {value}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
