import {
  LANGUAGE_CHOICES,
  LANGUAGES,
  setLanguage,
  useLanguage,
} from "@/utils/i18n";

import styles from "./LanguageSwitcher.module.css";

type LanguageSwitcherProps = {
  className?: string;
};

export const LanguageSwitcher = ({ className = "" }: LanguageSwitcherProps) => {
  const language = useLanguage();
  const label = language === "uk" ? "Мова" : "Language";

  return (
    <fieldset className={`${styles.switcher} ${className}`} aria-label={label}>
      <span className={styles.label} aria-hidden="true">
        {label}
      </span>
      <div className={styles.options}>
        {LANGUAGES.map((code) => {
          const choice = LANGUAGE_CHOICES[code];
          const selected = language === code;

          return (
            <button
              key={code}
              type="button"
              className={`${styles.option} ${selected ? styles.active : ""}`}
              aria-pressed={selected}
              aria-label={choice.name}
              onClick={() => {
                if (!selected) {
                  setLanguage(code);
                }
              }}
            >
              {choice.short}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
};
