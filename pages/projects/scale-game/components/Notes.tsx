import type { GameTranslation } from "../translations";
import styles from "./Notes.module.css";

type NotesProps = {
  value: string;
  copy: GameTranslation;
  onChange: (value: string) => void;
};

export const Notes = ({ value, copy, onChange }: NotesProps) => (
  <div>
    <label className={styles.label} htmlFor="scale-notes">
      {copy.notesLabel}
    </label>
    <textarea
      id="scale-notes"
      className={styles.notes}
      value={value}
      placeholder={copy.notesPlaceholder}
      onChange={(event) => onChange(event.target.value)}
    />
  </div>
);
