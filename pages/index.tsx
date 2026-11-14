import { FaTelegram } from "react-icons/fa";

import { ExternalLink } from "@/components/ExternalLink/ExternalLink";
import { LanguageSwitcher } from "@/components/LanguageSwitcher/LanguageSwitcher";
import PageWrapper from "@/components/PageWrapper/PageWrapper";
import { Stack } from "@/components/Stack/Stack";
import { Text } from "@/components/Text/Text";
import { TextLink } from "@/components/TextLink/TextLink";

import styles from "./index.module.css";

export default function Cover() {
  return (
    <PageWrapper className={styles["cover"]}>
      <LanguageSwitcher className={styles["language-switcher"]} />
      <div className={styles["image-wrapper"]}>
        {/* <Image src="/cropped.jpg" alt="me" width="200" height="200" /> */}
      </div>
      <Stack gap={24} className={styles["content"]}>
        <Text align="center">
          Привіт! Це <b>My Games Corner</b>.
        </Text>
        <Text align="center">
          Якщо придивитись, наше життя, має дуже багато різних ігор в
          надзвичайно різних формах. Головне знайти їх.
        </Text>
        <Text align="center">
          Я тут хочу ділитись своїми спостереженнями і знахідкми, сподіваюсь ти
          знайдеш тут щось цікаве саме для тебе.
        </Text>
        <div className={styles["social-media-links"]}>
          <ExternalLink
            href="https://t.me/my_games_corner"
            className={styles["social-link"]}
          >
            <FaTelegram size={24} aria-label="Telegram" />
          </ExternalLink>
        </div>
        <div className={styles["article-links"]}>
          <TextLink href="/projects">Проекти</TextLink>
        </div>
      </Stack>
    </PageWrapper>
  );
}
