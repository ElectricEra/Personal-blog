import type { ReactNode } from "react";

import { Text } from "@/components/Text/Text";

import styles from "./HistoryList.module.css";

type HistoryListProps<T extends { id: number }> = {
  title: string;
  emptyText: string;
  items: readonly T[];
  renderItem: (item: T) => ReactNode;
};

export const HistoryList = <T extends { id: number }>({
  title,
  emptyText,
  items,
  renderItem,
}: HistoryListProps<T>) => (
  <section className={styles.section} aria-label={title}>
    <h2 className={styles.heading}>{title}</h2>
    {items.length === 0 ? (
      <Text>{emptyText}</Text>
    ) : (
      <ol className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            {renderItem(item)}
          </li>
        ))}
      </ol>
    )}
  </section>
);
