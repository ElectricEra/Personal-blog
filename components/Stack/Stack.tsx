import type { CSSProperties, ReactNode } from "react";

import styles from "./Stack.module.css";

type StackProps = {
  children: ReactNode;
  gap?: number | string;
  className?: string;
};

export const Stack = ({ children, gap = 16, className = "" }: StackProps) => {
  const style = {
    "--stack-gap": typeof gap === "number" ? `${gap}px` : gap,
  } as CSSProperties;

  return (
    <div className={`${styles["stack"]} ${className}`} style={style}>
      {children}
    </div>
  );
};
