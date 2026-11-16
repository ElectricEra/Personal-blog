import type { ReactNode } from "react";

import styles from "./ExternalLink.module.css";

type ExternalLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

export const ExternalLink = ({
  href,
  children,
  className = "",
}: ExternalLinkProps) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`${styles["link"]} ${className}`}
    >
      {children}
    </a>
  );
};
