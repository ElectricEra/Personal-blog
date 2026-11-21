import type { ReactNode } from "react";

import { cx } from "@/utils/cx";

import styles from "./Hint.module.css";

type HintProps = {
  children: ReactNode;
  align?: "left" | "center";
};

/** Muted secondary text: a usage tip or a note about what the screen shows. */
export const Hint = ({ children, align = "left" }: HintProps) => (
  <p className={cx(styles.hint, align === "center" && styles.center)}>
    {children}
  </p>
);
