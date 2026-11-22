import { VisuallyHidden } from "@/components/VisuallyHidden/VisuallyHidden";
import { cx } from "@/utils/cx";

import styles from "./Counter.module.css";

type CounterProps = {
  label: string;
  value: number;
  max?: number | null;
  spent?: boolean;
  /** Full text for screen readers, e.g. "Tests 1 / 6". */
  description: string;
};

export const Counter = ({
  label,
  value,
  max = null,
  spent = false,
  description,
}: CounterProps) => (
  <p className={cx(styles.counter, spent && styles.spent)}>
    <span className={styles.label} aria-hidden="true">
      {label}
    </span>
    <span className={styles.value} aria-hidden="true">
      {value}
      {max === null ? null : <span className={styles.max}>/{max}</span>}
    </span>
    <VisuallyHidden>{description}</VisuallyHidden>
  </p>
);
