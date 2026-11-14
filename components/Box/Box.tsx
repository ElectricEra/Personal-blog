import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./Box.module.css";

type BoxProps = {
  linkUrl: string;
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
};

export const Box = ({
  linkUrl,
  title,
  description,
  children,
  className = "",
}: BoxProps) => {
  return (
    <Link href={linkUrl} className={`${styles["link"]} ${className}`}>
      <div className={styles["box"]}>
        {title ? <p className={styles["title"]}>{title}</p> : null}
        {description ? (
          <p className={styles["description"]}>{description}</p>
        ) : null}
        {children}
      </div>
    </Link>
  );
};
