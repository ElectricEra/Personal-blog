import type { ReactNode } from "react";

import styles from "./Pill.module.css";

type PillProps = {
  children: ReactNode;
};

export const Pill = ({ children }: PillProps) => (
  <span className={styles.pill}>{children}</span>
);
