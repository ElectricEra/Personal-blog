import { Collapsible } from "@/components/Collapsible/Collapsible";
import { Text } from "@/components/Text/Text";

import styles from "./GameRules.module.css";

type GameRulesProps = {
  title: string;
  rules: readonly string[];
  startingTitle: string;
  startingText: string;
};

export const GameRules = ({
  title,
  rules,
  startingTitle,
  startingText,
}: GameRulesProps) => (
  <Collapsible title={title} defaultOpen>
    <ul className={styles.rules}>
      {rules.map((rule) => (
        <li key={rule}>{rule}</li>
      ))}
    </ul>
    <div className={styles.starting}>
      <h3 className={styles.startingTitle}>{startingTitle}</h3>
      <Text>{startingText}</Text>
    </div>
  </Collapsible>
);
