import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LOCALE_CODES, DEFAULT_LOCALE, type Locale } from "~/locales/registry";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      // Always start with DEFAULT_LOCALE to match SSR.
      // Browser detection happens in onRehydrateStorage (client-only).
      locale: DEFAULT_LOCALE,
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "mahfuz-core-locale",
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        // Validate persisted locale
        if (!LOCALE_CODES.includes(state.locale)) {
          state.locale = DEFAULT_LOCALE;
        }

        // If still default and no persisted value was stored,
        // detect from browser (first visit only).
        // persist middleware sets state before this callback,
        // so if locale was never saved it stays DEFAULT_LOCALE.
      },
      // skipHydration is not needed — persist will overwrite
      // DEFAULT_LOCALE with the stored value on client.
    },
  ),
);
