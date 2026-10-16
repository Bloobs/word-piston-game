"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/components/language-provider"

// Importa tus JSON de traducciones
import es from "@/messages/es.json"
import en from "@/messages/en.json"

export function SiteFooter() {
  const { lang } = useLanguage()
  const pathname = usePathname().replace(/\/+$/, "") || "/"
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Asignamos las traducciones dinámicamente
  const t = lang === "en" ? en.footer : es.footer
  const homeHref = pathname === "/" ? "./" : "../"
  const guideHref = pathname === "/"
    ? "./guia-juego/"
    : pathname === "/guia-juego"
      ? "./"
      : "../guia-juego/"
  const privacyHref = pathname === "/"
    ? "./privacidad/"
    : pathname === "/privacidad"
      ? "./"
      : "../privacidad/"

  // Evitamos problemas de hidratación
  if (!mounted) return null

  return (
    <footer className="bg-background py-8 text-center text-sm text-muted-foreground border-t border-border z-20 relative w-full mt-auto">
      <nav className="flex justify-center gap-6">
        <Link href={homeHref} className="hover:text-primary transition-colors">
          {t.home}
        </Link>
        <Link href={guideHref} className="hover:text-primary transition-colors">
          {t.guide}
        </Link>
        <Link href={privacyHref} className="hover:text-primary transition-colors">
          {t.privacy}
        </Link>
      </nav>
      <p className="mt-4">
        © {new Date().getFullYear()} PalabraMaster - {t.copyright}
      </p>
    </footer>
  )
}
