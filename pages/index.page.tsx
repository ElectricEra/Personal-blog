import { FaTelegram } from "react-icons/fa";

import { ExternalLink } from "@/components/ExternalLink/ExternalLink";
import PageWrapper from "@/components/PageWrapper/PageWrapper";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";
import { Stack } from "@/components/Stack/Stack";
import { Text } from "@/components/Text/Text";
import { useTranslation } from "@/utils/i18n";

import styles from "./index.module.css";
import { translations } from "./translations";

export default function Home() {
  const copy = useTranslation(translations);

  return (
    <PageWrapper fullScreen>
      <SectionHeader>{copy.title}</SectionHeader>
      <Stack gap={24} className={styles.content}>
        {copy.paragraphs.map((paragraph) => (
          <Text key={paragraph} align="center">
            {paragraph}
          </Text>
        ))}
        <Text align="center">
          <b>{copy.pickGame}</b>
        </Text>
        <ExternalLink
          href="https://t.me/my_games_corner"
          className={styles.socialLink}
        >
          <FaTelegram size={24} aria-label="Telegram" />
        </ExternalLink>
      </Stack>
    </PageWrapper>
  );
}
