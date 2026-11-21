import type { ReactNode } from "react";

import styles from "./VisuallyHidden.module.css";

type VisuallyHiddenProps = {
  children: ReactNode;
};

/** Text that screen readers announce but that is not shown on screen. */
export const VisuallyHidden = ({ children }: VisuallyHiddenProps) => (
  <span className={styles.hidden}>{children}</span>
);
