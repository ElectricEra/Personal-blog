import type { Language } from "@/utils/i18n";

import { en, type HomeTranslation } from "./en";
import { uk } from "./uk";

export const translations = { en, uk } satisfies Record<
  Language,
  HomeTranslation
>;

export type { HomeTranslation };
