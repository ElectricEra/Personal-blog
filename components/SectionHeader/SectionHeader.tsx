import type { ReactNode } from "react";

import styles from "./SectionHeader.module.css";

type SectionHeaderProps = {
  text?: string;
  children?: ReactNode;
  className?: string;
};

export const SectionHeader = ({
  text,
  children,
  className = "",
}: SectionHeaderProps) => {
  return (
    <h1 className={`${styles["section-header"]} ${className}`}>
      {children ?? text}
    </h1>
  );
};
