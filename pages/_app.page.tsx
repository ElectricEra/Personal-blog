import type { AppProps } from "next/app";
import { Merriweather } from "next/font/google";
import { useEffect } from "react";

import { SideMenu } from "@/components/SideMenu/SideMenu";
import { useLanguage } from "@/utils/i18n";

import styles from "./app.module.css";
import "./global.css";

const merriweather = Merriweather({
  weight: "400",
  subsets: ["latin", "cyrillic"],
});

export default function App({ Component, pageProps }: AppProps) {
  const language = useLanguage();

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <div className={merriweather.className}>
      <SideMenu />
      <main className={styles.content}>
        <div className={styles.page}>
          <Component {...pageProps} />
        </div>
      </main>
    </div>
  );
}
