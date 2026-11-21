import { cx } from "@/utils/cx";

import type { Challenge, Color } from "../logic/config";
import type { GameTranslation } from "../translations";
import styles from "./WeightField.module.css";

type WeightFieldProps = {
  color: Color;
  challenge: Challenge;
  value: string;
  copy: GameTranslation;
  onChange: (value: string) => void;
  disabled?: boolean;
  centered?: boolean;
};

/** The known weight as text for a revealed color, a digits-only input otherwise. */
export const WeightField = ({
  color,
  challenge,
  value,
  copy,
  onChange,
  disabled = false,
  centered = false,
}: WeightFieldProps) => {
  if (challenge.revealed.includes(color)) {
    return (
      <span className={cx(styles.known, centered && styles.centered)}>
        {copy.knownWeight(challenge.weights[color])}
      </span>
    );
  }
  return (
    <input
      className={styles.input}
      inputMode="numeric"
      autoComplete="off"
      aria-label={copy.draftWeight(copy.colors[color])}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value.replace(/\D/g, ""))}
    />
  );
};
