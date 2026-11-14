import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./TextLink.module.css";

type TextLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

export const TextLink = ({ href, children, className = "" }: TextLinkProps) => {
  return (
    <Link href={href} className={`${styles["link"]} ${className}`}>
      {children}
    </Link>
  );
};
