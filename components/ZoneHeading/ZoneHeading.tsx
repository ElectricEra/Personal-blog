import type { ReactNode, Ref } from "react";

import styles from "./ZoneHeading.module.css";

export const Separator = () => <hr className={styles.separator} />;

type ZoneHeadingProps = {
  children: ReactNode;
  ref?: Ref<HTMLHeadingElement>;
};

/** A separator followed by the heading of one zone of the game area. */
export const ZoneHeading = ({ children, ref }: ZoneHeadingProps) => (
  <>
    <Separator />
    <h2 ref={ref} className={styles.heading}>
      {children}
    </h2>
  </>
);
