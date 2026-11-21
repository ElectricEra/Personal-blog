import type { ReactNode } from "react";

import { cx } from "@/utils/cx";

import styles from "./ButtonRow.module.css";

type ButtonRowProps = {
  children: ReactNode;
  /** `stretch`: buttons share the width on desktop. `center`: natural width, centered. */
  layout: "stretch" | "center";
};

export const ButtonRow = ({ children, layout }: ButtonRowProps) => (
  <div className={cx(styles.row, styles[layout])}>{children}</div>
);
