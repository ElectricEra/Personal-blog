import type { ReactNode } from "react";

import styles from "./Text.module.css";

type TextAlign = "left" | "center" | "justify";

type TextProps = {
  children: ReactNode;
  align?: TextAlign;
  className?: string;
  as?: "p" | "span";
};

export const Text = ({
  children,
  align = "left",
  className = "",
  as: Tag = "p",
}: TextProps) => {
  return (
    <Tag
      className={`${styles["text"]} ${styles[`align-${align}`]} ${className}`}
    >
      {children}
    </Tag>
  );
};
