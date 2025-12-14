import { createContext, useContext, useState, type ReactNode } from "react"
import { en } from "./en"
import { es } from "./es"
import type { Translations } from "./en"

type Language = "en" | "es"

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const translations = { en, es }

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  const value = {
    language,
    setLanguage,
    t: translations[language],
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider")
  }
  return context
}
