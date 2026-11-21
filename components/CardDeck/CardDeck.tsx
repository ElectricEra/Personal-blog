import type { CSSProperties } from "react";

import { CardBack } from "@/components/PlayingCard/PlayingCard";
import { cx } from "@/utils/cx";

import styles from "./CardDeck.module.css";

const CARDS_PER_LAYER = 8;
const MAX_LAYERS = 7;

type CardDeckProps = {
  count: number;
  onDraw: () => void;
  label: string;
  disabled?: boolean;
  className?: string;
};

export const CardDeck = ({
  count,
  onDraw,
  label,
  disabled = false,
  className,
}: CardDeckProps) => {
  const layers = Math.min(MAX_LAYERS, Math.ceil(count / CARDS_PER_LAYER));
  const empty = count === 0;

  return (
    <button
      type="button"
      className={cx(styles.deck, empty && styles.empty, className)}
      onClick={onDraw}
      disabled={disabled || empty}
      aria-label={label}
      style={{ "--layers": layers } as CSSProperties}
    >
      {Array.from({ length: layers }, (_, layer) => layer).map((layer) => (
        <span
          key={layer}
          className={styles.layer}
          style={{ "--layer": layer } as CSSProperties}
        >
          <CardBack />
        </span>
      ))}
    </button>
  );
};
