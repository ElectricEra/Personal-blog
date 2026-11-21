import { cx } from "@/utils/cx";

import { BOARD_SIZE, letterAt } from "../game";
import type { GameTranslation } from "../translations";
import styles from "./Board.module.css";

type BoardProps = {
  numbers: readonly number[];
  path: readonly number[];
  showNumbers: boolean;
  /** Start, end, and path markers are shown only once the board has flipped. */
  showRoute: boolean;
  interactive: boolean;
  startIndex: number | undefined;
  endIndex: number | undefined;
  highlighted: ReadonlySet<number>;
  copy: GameTranslation;
  onChoose: (index: number) => void;
};

export const Board = ({
  numbers,
  path,
  showNumbers,
  showRoute,
  interactive,
  startIndex,
  endIndex,
  highlighted,
  copy,
  onChoose,
}: BoardProps) => (
  <section className={styles.board} aria-label={copy.boardLabel}>
    {Array.from({ length: BOARD_SIZE }, (_, index) => {
      const order = path.indexOf(index);
      const onPath = showRoute && order >= 0;
      const letter = letterAt(index);
      const number = showNumbers ? numbers[index] : undefined;
      const canStep = highlighted.has(index);
      let label =
        number === undefined
          ? copy.cell(letter)
          : copy.cellWithNumber(letter, number);
      if (onPath) {
        label = copy.cellOnPath(label, order + 1);
      }
      if (canStep) {
        label = copy.cellCanStep(label);
      }
      return (
        <button
          key={letter}
          type="button"
          disabled={!interactive}
          aria-label={label}
          className={cx(
            styles.cell,
            interactive && styles.interactive,
            showRoute && index === startIndex && styles.start,
            showRoute && index === endIndex && styles.end,
            onPath && styles.selected,
            canStep && styles.ready,
          )}
          onClick={() => onChoose(index)}
        >
          {number ?? letter}
          {onPath ? <span className={styles.step}>{order + 1}</span> : null}
        </button>
      );
    })}
  </section>
);
