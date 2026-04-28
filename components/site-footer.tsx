"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

// Importa tus JSON de traducciones
import es from "@/messages/es.json"
import en from "@/messages/en.json"

export function SiteFooter() {
  const [lang, setLang] = useState<"es" | "en">("es")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // 1. Detección inicial
    const savedLang = localStorage.getItem("palabramaster-lang")
    if (savedLang === "en" || savedLang === "es") {
      setLang(savedLang)
    } else {
      const browserLang = navigator.language || (navigator as any).userLanguage
      if (browserLang && browserLang.toLowerCase().startsWith("en")) {
        setLang("en")
      }
    }
    
    setMounted(true)

    // 2. Escuchar cambios de idioma
    const handleGlobalLanguageChange = () => {
      const currentLang = localStorage.getItem("palabramaster-lang")
      if (currentLang === "en" || currentLang === "es") {
        setLang(currentLang)
      }
    }

    window.addEventListener("languageChanged", handleGlobalLanguageChange)
    return () => window.removeEventListener("languageChanged", handleGlobalLanguageChange)
  }, [])

  // Asignamos las traducciones dinámicamente
  const t = lang === "en" ? en.footer : es.footer

  // Evitamos problemas de hidratación
  if (!mounted) return null

  return (
    <footer className="bg-background py-8 text-center text-sm text-muted-foreground border-t border-border z-20 relative w-full mt-auto">
      <nav className="flex justify-center gap-6">
        <Link href="/" className="hover:text-primary transition-colors">
          {t.home}
        </Link>
        <Link href="/guia-juego" className="hover:text-primary transition-colors">
          {t.guide}
        </Link>
        <Link href="/privacidad" className="hover:text-primary transition-colors">
          {t.privacy}
        </Link>
      </nav>
      <p className="mt-4">
        © {new Date().getFullYear()} PalabraMaster - {t.copyright}
      </p>
    </footer>
  )
}
