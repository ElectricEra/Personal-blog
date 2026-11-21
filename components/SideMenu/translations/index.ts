import type { Language } from "@/utils/i18n";

import { en, type SideMenuTranslation } from "./en";
import { uk } from "./uk";

export const translations = { en, uk } satisfies Record<
  Language,
  SideMenuTranslation
>;

export type { SideMenuTranslation };
