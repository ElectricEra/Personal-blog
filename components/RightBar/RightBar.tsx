import { type ReactNode, useId } from "react";

import styles from "./RightBar.module.css";

type RightBarProps = {
  title: string;
  children: ReactNode;
};

/**
 * Desktop-only side panel. On narrower screens it adds no box of its own,
 * so the children render inline where the bar is placed.
 */
export const RightBar = ({ title, children }: RightBarProps) => {
  const titleId = useId();

  return (
    <aside className={styles.bar} aria-labelledby={titleId} data-right-bar>
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      {children}
    </aside>
  );
};
