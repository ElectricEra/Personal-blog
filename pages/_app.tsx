import type { AppProps } from "next/app";
import { Merriweather } from "next/font/google";
import { useEffect } from "react";

import { useLanguage } from "@/utils/i18n";

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
    <main className={merriweather.className}>
      <Component {...pageProps} />
    </main>
  );
}
