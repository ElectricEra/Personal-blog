import { Text } from "@/components/Text/Text";

import type { GameTranslation } from "../translations";
import styles from "./SessionSummary.module.css";

type SessionSummaryProps = {
  score: number;
  total: number;
  tests: number;
  misses: number;
  time: string;
  copy: GameTranslation;
};

export const SessionSummary = ({
  score,
  total,
  tests,
  misses,
  time,
  copy,
}: SessionSummaryProps) => (
  <section className={styles.summary} aria-label={copy.summaryTitle}>
    <h2 className={styles.title}>{copy.summaryTitle}</h2>
    <Text>{copy.summaryScore(score, total)}</Text>
    <Text>{copy.summaryTests(tests)}</Text>
    <Text>{copy.summaryMisses(misses)}</Text>
    <Text>{copy.summaryTime(time)}</Text>
  </section>
);
