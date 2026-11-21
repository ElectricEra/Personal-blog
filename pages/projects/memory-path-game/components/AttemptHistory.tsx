import { HistoryList } from "@/components/HistoryList/HistoryList";

import type { GameTranslation } from "../translations";
import type { Attempt } from "../useMemoryPath";
import styles from "./AttemptHistory.module.css";

type AttemptHistoryProps = {
  attempts: readonly Attempt[];
  target: number;
  copy: GameTranslation;
};

export const AttemptHistory = ({
  attempts,
  target,
  copy,
}: AttemptHistoryProps) => (
  <HistoryList
    title={copy.historyTitle}
    emptyText={copy.historyEmpty}
    items={attempts}
    renderItem={(attempt) => (
      <>
        <strong>{copy.attemptLabel(attempt.id)}</strong>
        <span>{copy.attemptSummary(attempt.label, attempt.sum, target)}</span>
        <span
          className={attempt.result === "correct" ? styles.good : styles.bad}
        >
          {copy.attemptResults[attempt.result]}
        </span>
      </>
    )}
  />
);
