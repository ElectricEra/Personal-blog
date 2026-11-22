import { Hint } from "@/components/Hint/Hint";

import type { Die } from "../logic/placement";
import type { GameTranslation } from "../translations";
import styles from "./DigitTray.module.css";

type DigitTrayProps = {
  dice: readonly Die[];
  point: string;
  interactive: boolean;
  copy: GameTranslation;
  onPlace: (dieId: string) => void;
};

export const DigitTray = ({
  dice,
  point,
  interactive,
  copy,
  onPlace,
}: DigitTrayProps) => (
  <section className={styles.tray} aria-label={copy.trayLabel}>
    {dice.length === 0 ? (
      <Hint align="center">{copy.trayEmpty}</Hint>
    ) : (
      <div className={styles.dice}>
        {dice.map((die) => (
          <button
            key={die.id}
            type="button"
            className={styles.die}
            disabled={!interactive}
            aria-label={copy.addDigit(die.face, point)}
            onClick={() => onPlace(die.id)}
          >
            {die.face}
          </button>
        ))}
      </div>
    )}
  </section>
);
