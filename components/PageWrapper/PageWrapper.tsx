import type { ReactNode } from "react";

import styles from "./PageWrapper.module.css";

type PageWrapperProps = {
  fullScreen?: boolean;
  className?: string;
  children: ReactNode;
};

export const PageWrapper = ({
  fullScreen = false,
  className = "",
  children,
}: PageWrapperProps) => {
  return (
    <div className={styles["page-wrapper"]}>
      <div
        className={`${styles["page"]} ${className} ${fullScreen ? styles["page-full-screen"] : ""}`}
      >
        {children}
      </div>
    </div>
  );
};

export default PageWrapper;
