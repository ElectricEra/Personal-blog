import { Text } from "@/components/Text/Text";
import { VisuallyHidden } from "@/components/VisuallyHidden/VisuallyHidden";
import { cx } from "@/utils/cx";

import { type Challenge, COLORS, type Color } from "../logic/config";
import type { Guess } from "../logic/guess";
import { type Order, SLOT_KEYS, slotIsFixed } from "../logic/order";
import type { GameTranslation } from "../translations";
import { ColorChip } from "./ColorChip";
import styles from "./OrderBoard.module.css";
import { WeightField } from "./WeightField";

type OrderBoardProps = {
  challenge: Challenge;
  order: Order;
  picked: Color | null;
  guess: Guess;
  interactive: boolean;
  copy: GameTranslation;
  onPick: (color: Color) => void;
  onPlace: (index: number) => void;
  onWeight: (color: Color, value: string) => void;
};

export const OrderBoard = ({
  challenge,
  order,
  picked,
  guess,
  interactive,
  copy,
  onPick,
  onPlace,
  onWeight,
}: OrderBoardProps) => {
  const unplaced = COLORS.filter((color) => !order.includes(color));

  const weightField = (color: Color) => (
    <WeightField
      color={color}
      challenge={challenge}
      value={guess[color]}
      copy={copy}
      disabled={!interactive}
      onChange={(value) => onWeight(color, value)}
    />
  );

  const chip = (color: Color) => (
    <ColorChip
      color={color}
      copy={copy}
      selected={picked === color}
      disabled={!interactive}
      onClick={() => onPick(color)}
    />
  );

  return (
    <section className={styles.order} aria-label={copy.orderTitle}>
      <h2 className={styles.title}>{copy.orderTitle}</h2>
      <Text>{copy.orderHint}</Text>
      <div className={styles.chain}>
        {SLOT_KEYS.map((slotKey, index) => {
          const color = order[index];
          const fixed = slotIsFixed(challenge, index);
          return (
            <div key={slotKey} className={styles.chainItem}>
              <div
                className={cx(
                  styles.slot,
                  color && styles.slotFilled,
                  fixed && styles.slotFixed,
                  picked && !fixed && styles.slotReady,
                )}
              >
                {color ? (
                  <>
                    {fixed ? (
                      <ColorChip color={color} copy={copy} />
                    ) : (
                      chip(color)
                    )}
                    {weightField(color)}
                    {fixed ? (
                      <VisuallyHidden>{copy.orderMiddle}</VisuallyHidden>
                    ) : null}
                  </>
                ) : (
                  <button
                    type="button"
                    className={styles.emptySlot}
                    disabled={!interactive}
                    aria-label={copy.orderEmpty(index + 1)}
                    onClick={() => onPlace(index)}
                  >
                    _
                  </button>
                )}
              </div>
              {index < SLOT_KEYS.length - 1 ? (
                <span className={styles.relation} aria-hidden="true">
                  &gt;
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      {unplaced.length > 0 ? (
        <div className={styles.tray}>
          <span className={styles.trayLabel}>{copy.orderTray}</span>
          {unplaced.map((color) => (
            <div key={color} className={styles.trayChip}>
              {chip(color)}
              {weightField(color)}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
};
