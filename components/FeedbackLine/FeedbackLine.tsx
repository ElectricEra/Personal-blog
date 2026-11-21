import { cx } from "@/utils/cx";

import styles from "./FeedbackLine.module.css";

export type Feedback = {
  text: string;
  good: boolean;
};

type FeedbackLineProps = {
  feedback: Feedback | null;
};

export const FeedbackLine = ({ feedback }: FeedbackLineProps) => (
  <p
    className={cx(
      styles.feedback,
      feedback?.good && styles.good,
      feedback && !feedback.good && styles.bad,
    )}
    aria-live="polite"
    hidden={!feedback}
  >
    {feedback?.text ?? ""}
  </p>
);
