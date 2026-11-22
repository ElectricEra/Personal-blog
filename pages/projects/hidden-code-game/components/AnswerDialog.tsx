import { ButtonRow } from "@/components/ButtonRow/ButtonRow";
import { FeedbackLine } from "@/components/FeedbackLine/FeedbackLine";
import { Input } from "@/components/Input/Input";
import { Modal } from "@/components/Modal/Modal";
import { PhysicalButton } from "@/components/PhysicalButton/PhysicalButton";

import type { GameTranslation } from "../translations";
import styles from "./AnswerDialog.module.css";

type AnswerDialogProps = {
  value: string;
  error: string | null;
  copy: GameTranslation;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export const AnswerDialog = ({
  value,
  error,
  copy,
  onChange,
  onConfirm,
  onClose,
}: AnswerDialogProps) => (
  <Modal
    open
    onClose={onClose}
    title={copy.answerTitle}
    closeLabel={copy.close}
  >
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        onConfirm();
      }}
    >
      <Input
        id="hidden-code-answer"
        label={copy.answerLabel}
        inputMode="numeric"
        autoComplete="off"
        value={value}
        onChange={(event) =>
          onChange(event.target.value.replace(/\D/g, "").slice(0, 8))
        }
      />
      <FeedbackLine feedback={error ? { text: error, good: false } : null} />
      <ButtonRow layout="center">
        <PhysicalButton type="submit">{copy.confirmAnswer}</PhysicalButton>
        <PhysicalButton variant="secondary" onClick={onClose}>
          {copy.cancelAnswer}
        </PhysicalButton>
      </ButtonRow>
    </form>
  </Modal>
);
