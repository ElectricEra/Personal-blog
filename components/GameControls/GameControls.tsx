import type { ReactNode } from "react";

import { RightBar } from "@/components/RightBar/RightBar";

import styles from "./GameControls.module.css";

type GameControlsProps = {
  title: string;
  children: ReactNode;
};

/**
 * The controls row of a game page: three equal text columns and one icon
 * column. Inside the desktop right bar it stacks into one column.
 */
export const GameControls = ({ title, children }: GameControlsProps) => (
  <RightBar title={title}>
    <div className={styles.row}>{children}</div>
  </RightBar>
);
