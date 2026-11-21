import { ButtonRow } from "@/components/ButtonRow/ButtonRow";
import { FeedbackLine } from "@/components/FeedbackLine/FeedbackLine";
import { Modal } from "@/components/Modal/Modal";
import { PhysicalButton } from "@/components/PhysicalButton/PhysicalButton";

import { type Challenge, COLORS, type Color } from "../logic/config";
import type { Guess } from "../logic/guess";
import type { Order } from "../logic/order";
import type { GameTranslation } from "../translations";
import { ColorChip } from "./ColorChip";
import styles from "./GuessDialog.module.css";
import { WeightField } from "./WeightField";

type GuessDialogProps = {
  challenge: Challenge;
  order: Order;
  values: Guess;
  error: string | null;
  copy: GameTranslation;
  onChange: (color: Color, value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
};

/** Rows follow the player's assumed order, then the colors not yet placed. */
export const GuessDialog = ({
  challenge,
  order,
  values,
  error,
  copy,
  onChange,
  onConfirm,
  onClose,
}: GuessDialogProps) => {
  const placed = order.filter((color): color is Color => color !== null);
  const rows = [
    ...placed,
    ...COLORS.filter((color) => !placed.includes(color)),
  ];

  return (
    <Modal
      open
      onClose={onClose}
      title={copy.guessDialogTitle}
      closeLabel={copy.close}
    >
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          onConfirm();
        }}
      >
        <ul className={styles.list}>
          {rows.map((color) => (
            <li key={color} className={styles.row}>
              <ColorChip color={color} copy={copy} />
              <WeightField
                color={color}
                challenge={challenge}
                value={values[color]}
                copy={copy}
                centered
                onChange={(value) => onChange(color, value)}
              />
            </li>
          ))}
        </ul>
        <FeedbackLine feedback={error ? { text: error, good: false } : null} />
        <ButtonRow layout="center">
          <PhysicalButton type="submit">{copy.confirmGuess}</PhysicalButton>
          <PhysicalButton variant="secondary" onClick={onClose}>
            {copy.cancelGuess}
          </PhysicalButton>
        </ButtonRow>
      </form>
    </Modal>
  );
};
