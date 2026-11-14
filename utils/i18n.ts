import { useSyncExternalStore } from "react";

/**
 * Shared language selection for the site.
 *
 * A project keeps its own copy in a `translations` folder (`en.ts`, `uk.ts`,
 * and an `index.ts` that exports `{ en, uk }`). `useTranslation` reads the
 * saved language and returns that copy for the page.
 */
export const LANGUAGES = ["en", "uk"] as const;

export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_CHOICES: Record<
  Language,
  { short: string; name: string }
> = {
  en: { short: "EN", name: "English" },
  uk: { short: "UA", name: "Українська" },
};

const DEFAULT_LANGUAGE: Language = "uk";
const STORAGE_KEY = "language";

const listeners = new Set<() => void>();

export const isLanguage = (value: unknown): value is Language =>
  value === "en" || value === "uk";

const readLanguage = (): Language => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isLanguage(stored) ? stored : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      listener();
    }
  };

  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
};

const emit = () => {
  for (const listener of listeners) {
    listener();
  }
};

const getServerLanguage = (): Language => DEFAULT_LANGUAGE;

export const getLanguage = (): Language => {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  return readLanguage();
};

export const setLanguage = (language: Language) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, language);
  } catch {
    return;
  }

  emit();
};

export const useLanguage = (): Language =>
  useSyncExternalStore(subscribe, getLanguage, getServerLanguage);

export const pickTranslation = <T extends Record<Language, unknown>>(
  translations: T,
  language: Language,
): T[Language] => translations[language];

export const useTranslation = <T extends Record<Language, unknown>>(
  translations: T,
): T[Language] => pickTranslation(translations, useLanguage());
