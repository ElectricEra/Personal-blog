import type { Language } from "@/utils/i18n";

import { en, type GameTranslation } from "./en";
import { uk } from "./uk";

export const translations = { en, uk } satisfies Record<
  Language,
  GameTranslation
>;

export type { GameTranslation };
