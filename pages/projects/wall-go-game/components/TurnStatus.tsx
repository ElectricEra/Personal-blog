import { useEffect, useRef } from "react";

import { cx } from "@/utils/cx";

import type { Side } from "../logic/board.ts";

import styles from "./TurnStatus.module.css";

type TurnStatusProps = {
  text: string;
  side: Side | null;
  redLabel: string;
  blueLabel: string;
  redScore: number;
  blueScore: number;
  actionLabel?: string;
  onAction?: () => void;
};

export const TurnStatus = ({
  text,
  side,
  redLabel,
  blueLabel,
  redScore,
  blueScore,
  actionLabel,
  onAction,
}: TurnStatusProps) => {
  const actionRef = useRef<HTMLButtonElement>(null);
  const showAction = Boolean(actionLabel && onAction);

  useEffect(() => {
    if (showAction) {
      actionRef.current?.focus();
    }
  }, [showAction]);

  return (
    <div className={styles.row}>
      <div className={styles.scores}>
        <span className={cx(styles.score, styles.scoreRed)}>
          <span className={styles.tag}>{redLabel}:</span>
          <span className={styles.count}>{redScore}</span>
        </span>
        <span className={cx(styles.score, styles.scoreBlue)}>
          <span className={styles.tag}>{blueLabel}:</span>
          <span className={styles.count}>{blueScore}</span>
        </span>
      </div>
      <div
        className={cx(
          styles.status,
          side === "red" && styles.red,
          side === "blue" && styles.blue,
          showAction && styles.withAction,
        )}
        aria-live="polite"
      >
        <span className={styles.message}>{text}</span>
        {showAction ? (
          <button
            ref={actionRef}
            type="button"
            className={styles.action}
            onClick={onAction}
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
};
