import type { CSSProperties } from "react";

import { cx } from "@/utils/cx";

import { type Card, cardName, isRed, type Rank, SUIT_SYMBOLS } from "./cards";
import styles from "./PlayingCard.module.css";

type Pip = readonly [x: number, y: number];

const L = 0;
const C = 50;
const R = 100;

const PAIRS_THREE_ROWS: Pip[] = [
  [L, 0],
  [R, 0],
  [L, 50],
  [R, 50],
  [L, 100],
  [R, 100],
];

const PAIRS_FOUR_ROWS: Pip[] = [
  [L, 0],
  [R, 0],
  [L, 100 / 3],
  [R, 100 / 3],
  [L, 200 / 3],
  [R, 200 / 3],
  [L, 100],
  [R, 100],
];

const PIP_LAYOUTS: Partial<Record<Rank, Pip[]>> = {
  "2": [
    [C, 0],
    [C, 100],
  ],
  "3": [
    [C, 0],
    [C, 50],
    [C, 100],
  ],
  "4": [
    [L, 0],
    [R, 0],
    [L, 100],
    [R, 100],
  ],
  "5": [
    [L, 0],
    [R, 0],
    [C, 50],
    [L, 100],
    [R, 100],
  ],
  "6": PAIRS_THREE_ROWS,
  "7": [...PAIRS_THREE_ROWS, [C, 25]],
  "8": [...PAIRS_THREE_ROWS, [C, 25], [C, 75]],
  "9": [...PAIRS_FOUR_ROWS, [C, 50]],
  "10": [...PAIRS_FOUR_ROWS, [C, 100 / 6], [C, 500 / 6]],
};

const FACE_FIGURES: Partial<Record<Rank, string>> = {
  J: "\u265E\uFE0E",
  Q: "\u265B\uFE0E",
  K: "\u265A\uFE0E",
};

type PlayingCardProps = Card & {
  faceDown?: boolean;
  label?: string;
  className?: string;
};

export const PlayingCard = ({
  suit,
  rank,
  faceDown = false,
  label,
  className,
}: PlayingCardProps) => {
  const symbol = SUIT_SYMBOLS[suit];
  const pips = PIP_LAYOUTS[rank];
  const figure = FACE_FIGURES[rank];

  const corner = (
    <>
      <span className={styles.cornerRank}>{rank}</span>
      <span className={styles.cornerSuit}>{symbol}</span>
    </>
  );

  return (
    <div
      className={cx(
        styles.card,
        isRed(suit) ? styles.red : styles.black,
        faceDown && styles.faceDown,
        className,
      )}
      role="img"
      aria-label={faceDown ? undefined : (label ?? cardName({ suit, rank }))}
      aria-hidden={faceDown || undefined}
    >
      <div className={styles.inner}>
        <div className={cx(styles.side, styles.front)}>
          <span className={cx(styles.corner, styles.cornerTop)}>{corner}</span>
          <span className={cx(styles.corner, styles.cornerBottom)}>
            {corner}
          </span>
          {pips ? (
            <div className={styles.pips}>
              {pips.map(([x, y]) => (
                <span
                  key={`${x}-${y}`}
                  className={cx(styles.pip, y > 50 && styles.flipped)}
                  style={{ "--x": `${x}%`, "--y": `${y}%` } as CSSProperties}
                >
                  {symbol}
                </span>
              ))}
            </div>
          ) : null}
          {rank === "A" ? (
            <span
              className={cx(styles.ace, suit === "spades" && styles.aceSpades)}
            >
              {symbol}
            </span>
          ) : null}
          {figure ? (
            <div className={styles.face}>
              {[styles.faceTop, styles.faceBottom].map((half) => (
                <div key={half} className={cx(styles.faceHalf, half)}>
                  <span className={styles.faceFigure}>{figure}</span>
                  <span className={styles.faceSuit}>{symbol}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className={cx(styles.side, styles.back)} />
      </div>
    </div>
  );
};

export const CardBack = ({ className }: { className?: string }) => (
  <div className={cx(styles.card, styles.faceDown, className)} aria-hidden>
    <div className={styles.inner}>
      <div className={cx(styles.side, styles.back)} />
    </div>
  </div>
);
