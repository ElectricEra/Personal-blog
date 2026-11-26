import { Hint } from "@/components/Hint/Hint";

import styles from "./Scoreboard.module.css";

type ScoreboardProps = {
  note: string;
  largest: string | null;
};

export const Scoreboard = ({ note, largest }: ScoreboardProps) => (
  <div className={styles.board}>
    {largest ? <p className={styles.largest}>{largest}</p> : null}
    <Hint>{note}</Hint>
  </div>
);
