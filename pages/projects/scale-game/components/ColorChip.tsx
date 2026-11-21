import { cx } from "@/utils/cx";

import type { Color } from "../logic/config";
import type { GameTranslation } from "../translations";
import styles from "./ColorChip.module.css";
import { colorClassNames } from "./colors";

type ColorChipProps = {
  color: Color;
  copy: GameTranslation;
  /** Renders a toggle button when set, a plain label otherwise. */
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
};

export const ColorChip = ({
  color,
  copy,
  onClick,
  selected = false,
  disabled = false,
}: ColorChipProps) => {
  const label = `${copy.short[color]} ${copy.colors[color]}`;
  if (!onClick) {
    return (
      <span className={cx(styles.chip, colorClassNames[color])}>{label}</span>
    );
  }
  return (
    <button
      type="button"
      className={cx(
        styles.chip,
        styles.button,
        colorClassNames[color],
        selected && styles.selected,
      )}
      aria-pressed={selected}
      aria-label={copy.orderPick(copy.colors[color])}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
