import type { InputHTMLAttributes, ReactNode } from "react";

import styles from "./Input.module.css";

type InputProps = {
  label?: ReactNode;
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const Input = ({ label, className = "", id, ...rest }: InputProps) => {
  const input = (
    <input
      id={id}
      className={`${styles["input"]} ${label ? "" : className}`}
      {...rest}
    />
  );

  if (!label) {
    return input;
  }

  return (
    <label className={`${styles["field"]} ${className}`} htmlFor={id}>
      <span className={styles["label"]}>{label}</span>
      {input}
    </label>
  );
};
