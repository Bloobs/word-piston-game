"use client"

import { useState } from "react"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider"
import { useGameState } from "@/components/game-state-provider"
import { usePathname } from "next/navigation"
import es from "@/messages/es.json"
import en from "@/messages/en.json"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navigation() {
  const { lang } = useLanguage()
  const { isGameActive } = useGameState()
  const pathname = usePathname().replace(/\/+$/, "") || "/"
  const [isOpen, setIsOpen] = useState(false)

  const t = lang === "en" ? en.footer : es.footer
  const homeHref = pathname === "/" ? "./" : "../"
  const guideHref = pathname === "/"
    ? "./guia-juego/"
    : pathname === "/guia-juego"
      ? "./"
      : "../guia-juego/"

  const menuItems = [
    { href: homeHref, label: t.home, icon: "🏠" },
    { href: guideHref, label: t.guide, icon: "📖" },
  ]

  // No mostrar el menú si hay una partida activa
  if (isGameActive) {
    return null
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto w-full">
        {/* Menú móvil (hamburguesa) */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="relative"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>

          {isOpen && (
            <div className="absolute top-14 left-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-3 text-foreground hover:bg-accent/10 transition-colors border-b border-border last:border-b-0"
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon} {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Menú PC (horizontal) */}
        <div className="hidden md:flex items-center gap-8">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-foreground hover:text-primary transition-colors font-medium flex items-center gap-2"
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
