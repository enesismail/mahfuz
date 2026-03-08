import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "tr" | "en";

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "tr";
  return navigator.language.startsWith("tr") ? "tr" : "en";
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      locale: detectLocale(),
      setLocale: (locale) => set({ locale }),
    }),
    { name: "mahfuz-locale" },
  ),
);
