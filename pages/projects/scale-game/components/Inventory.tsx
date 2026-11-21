import { Pill } from "@/components/Pill/Pill";
import { cx } from "@/utils/cx";

import { type Challenge, COLORS, type Color, type Pan } from "../logic/config";
import type { GameTranslation } from "../translations";
import { colorClassNames } from "./colors";
import styles from "./Inventory.module.css";

type InventoryProps = {
  challenge: Challenge;
  remaining: Pan;
  pendingCount: number;
  minPlace: number;
  interactive: boolean;
  copy: GameTranslation;
  onPlace: (color: Color) => void;
};

export const Inventory = ({
  challenge,
  remaining,
  pendingCount,
  minPlace,
  interactive,
  copy,
  onPlace,
}: InventoryProps) => (
  <div className={styles.row}>
    <section aria-label={copy.inventoryLabel} className={styles.blocks}>
      {COLORS.map((color) => {
        const weightLabel = challenge.revealed.includes(color)
          ? copy.knownWeight(challenge.weights[color])
          : copy.unknownWeight;
        return (
          <button
            key={color}
            type="button"
            className={cx(styles.block, colorClassNames[color])}
            disabled={!interactive || remaining[color] <= 0}
            aria-label={copy.placeBlock(
              copy.colors[color],
              weightLabel,
              remaining[color],
            )}
            onClick={() => onPlace(color)}
          >
            {remaining[color]}
          </button>
        );
      })}
    </section>
    <Pill>{copy.staged(pendingCount, minPlace)}</Pill>
  </div>
);
