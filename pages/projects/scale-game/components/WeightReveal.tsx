import { FeedbackLine } from "@/components/FeedbackLine/FeedbackLine";
import { cx } from "@/utils/cx";

import { type Challenge, COLORS } from "../logic/config";
import type { GameTranslation } from "../translations";
import { colorClassNames } from "./colors";
import styles from "./WeightReveal.module.css";

type WeightRevealProps = {
  challenge: Challenge;
  won: boolean;
  copy: GameTranslation;
};

/** Every hidden weight, heaviest first, shown when the round ends. */
export const WeightReveal = ({ challenge, won, copy }: WeightRevealProps) => {
  const byWeight = [...COLORS].sort(
    (left, right) => challenge.weights[right] - challenge.weights[left],
  );

  return (
    <section className={styles.reveal} aria-label={copy.revealTitle}>
      {won ? (
        <FeedbackLine feedback={{ text: copy.correctGuess, good: true }} />
      ) : null}
      <h2 className={styles.title}>{copy.revealTitle}</h2>
      <div className={styles.answers}>
        {byWeight.map((color) => (
          <div
            key={color}
            className={cx(styles.answer, colorClassNames[color])}
          >
            <span className={styles.weight}>
              {copy.knownWeight(challenge.weights[color])}
            </span>
            <span className={styles.name}>{copy.colors[color]}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
