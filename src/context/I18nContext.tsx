import React, { createContext, useContext, useState, useEffect } from "react";
import th from "../../public/locales/th.json";
import en from "../../public/locales/en.json";

type Locale = "th" | "en";
type Translations = typeof th;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const translations: Record<Locale, any> = { th, en };

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(
    (localStorage.getItem("locale") as Locale) || "th"
  );

  useEffect(() => {
    localStorage.setItem("locale", locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const t = (path: string) => {
    const keys = path.split(".");
    let result = translations[locale];
    for (const key of keys) {
      if (result[key] === undefined) return path;
      result = result[key];
    }
    return result as string;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}
