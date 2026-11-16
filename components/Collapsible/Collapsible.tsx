import { type ReactNode, useId, useState } from "react";
import { HiChevronDown } from "react-icons/hi";

import styles from "./Collapsible.module.css";

type HeadingLevel = "h2" | "h3" | "h4";

type CollapsibleProps = {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  headingLevel?: HeadingLevel;
  className?: string;
};

export const Collapsible = ({
  title,
  children,
  defaultOpen = false,
  headingLevel: Heading = "h2",
  className = "",
}: CollapsibleProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section
      className={`${styles.collapsible} ${open ? styles.open : ""} ${className}`}
    >
      <Heading className={styles.heading}>
        <button
          type="button"
          className={styles.trigger}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((current) => !current)}
        >
          <span>{title}</span>
          <HiChevronDown aria-hidden className={styles.icon} />
        </button>
      </Heading>
      <div id={panelId} className={styles.panel} hidden={!open}>
        <div className={styles.content}>{children}</div>
      </div>
    </section>
  );
};
