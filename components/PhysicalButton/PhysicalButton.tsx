import type { ButtonHTMLAttributes, ReactNode } from "react";

import styles from "./PhysicalButton.module.css";

type PhysicalButtonVariant = "primary" | "secondary";

type PhysicalButtonProps = {
  children: ReactNode;
  variant?: PhysicalButtonVariant;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const PhysicalButton = ({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...rest
}: PhysicalButtonProps) => {
  return (
    <button
      type={type}
      className={`${styles["button"]} ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};
