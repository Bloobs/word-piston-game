"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type Language = "es" | "en"

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("es")

  useEffect(() => {
    // Detección inicial del idioma
    const savedLang = localStorage.getItem("palabramaster-lang")
    if (savedLang === "en" || savedLang === "es") {
      setLangState(savedLang)
    } else {
      const browserLang = navigator.language || (navigator as any).userLanguage
      if (browserLang && browserLang.toLowerCase().startsWith("en")) {
        setLangState("en")
      }
    }
  }, [])

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem("palabramaster-lang", newLang)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}