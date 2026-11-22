import type { ReactNode } from "react";

import { Text } from "@/components/Text/Text";
import { cx } from "@/utils/cx";

import styles from "./HistoryList.module.css";

type HistoryListProps<T extends { id: number }> = {
  title: string;
  emptyText: string;
  items: readonly T[];
  renderItem: (item: T) => ReactNode;
  /** `list`: one item per row. `grid`: compact items wrap side by side. */
  layout?: "list" | "grid";
};

export const HistoryList = <T extends { id: number }>({
  title,
  emptyText,
  items,
  renderItem,
  layout = "list",
}: HistoryListProps<T>) => (
  <section className={styles.section} aria-label={title}>
    <h2 className={styles.heading}>{title}</h2>
    {items.length === 0 ? (
      <Text>{emptyText}</Text>
    ) : (
      <ol className={cx(styles.list, layout === "grid" && styles.grid)}>
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            {renderItem(item)}
          </li>
        ))}
      </ol>
    )}
  </section>
);
