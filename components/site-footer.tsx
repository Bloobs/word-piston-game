"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider"

// Importa tus JSON de traducciones
import es from "@/messages/es.json"
import en from "@/messages/en.json"

export function SiteFooter() {
  const { lang } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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
