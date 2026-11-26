import { ButtonRow } from "@/components/ButtonRow/ButtonRow";
import { PhysicalButton } from "@/components/PhysicalButton/PhysicalButton";

import styles from "./ResultPanel.module.css";

type ResultPanelProps = {
  title: string;
  detail: string;
  scores: string;
  largest: string;
  playAgain: string;
  changeSettings: string;
  onPlayAgain: () => void;
  onChangeSettings: () => void;
};

export const ResultPanel = ({
  title,
  detail,
  scores,
  largest,
  playAgain,
  changeSettings,
  onPlayAgain,
  onChangeSettings,
}: ResultPanelProps) => (
  <section className={styles.panel} aria-label={title}>
    <h3 className={styles.title}>{title}</h3>
    <p>{detail}</p>
    <p className={styles.scores}>{scores}</p>
    <p>{largest}</p>
    <ButtonRow layout="center">
      <PhysicalButton onClick={onPlayAgain}>{playAgain}</PhysicalButton>
      <PhysicalButton variant="secondary" onClick={onChangeSettings}>
        {changeSettings}
      </PhysicalButton>
    </ButtonRow>
  </section>
);
