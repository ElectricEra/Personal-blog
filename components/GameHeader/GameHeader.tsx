import { SectionHeader } from "@/components/SectionHeader/SectionHeader";
import { Text } from "@/components/Text/Text";

import styles from "./GameHeader.module.css";

type GameHeaderProps = {
  title: string;
  intro: string;
};

export const GameHeader = ({ title, intro }: GameHeaderProps) => (
  <>
    <SectionHeader>{title}</SectionHeader>
    <Text className={styles.intro} align="center">
      {intro}
    </Text>
  </>
);
