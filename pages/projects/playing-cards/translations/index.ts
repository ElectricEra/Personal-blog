import type { Language } from "@/utils/i18n";

import { type CardsTranslation, en } from "./en";
import { uk } from "./uk";

export const translations = { en, uk } satisfies Record<
  Language,
  CardsTranslation
>;

export type { CardsTranslation };
