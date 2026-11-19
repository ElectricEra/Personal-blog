import type { ReactNode, SelectHTMLAttributes } from "react";

import styles from "./Select.module.css";

type SelectProps = {
  children: ReactNode;
  className?: string;
} & SelectHTMLAttributes<HTMLSelectElement>;

export const Select = ({
  children,
  className = "",
  ...rest
}: SelectProps) => {
  return (
    <select className={`${styles.select} ${className}`} {...rest}>
      {children}
    </select>
  );
};
