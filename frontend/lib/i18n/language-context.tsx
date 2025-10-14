"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { translations, type Locale } from "./translations"

type LanguageContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en")

  useEffect(() => {
    // Load saved language from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("chainpulse-locale") as Locale
      if (saved && translations[saved]) {
        setLocaleState(saved)
      }
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    if (typeof window !== "undefined") {
      localStorage.setItem("chainpulse-locale", newLocale)
    }
  }

  const t = (key: string): string => {
    const keys = key.split(".")
    let value: any = translations[locale]

    for (const k of keys) {
      value = value?.[k]
    }

    return value || key
  }

  return <LanguageContext.Provider value={{ locale, setLocale, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
