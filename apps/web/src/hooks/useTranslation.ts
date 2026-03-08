import { useI18nStore } from "../stores/useI18nStore";
import { tr } from "../locales/tr";
import { en } from "../locales/en";

const messages = { tr, en } as const;

export function useTranslation() {
  const locale = useI18nStore((s) => s.locale);
  return { t: messages[locale], locale };
}
