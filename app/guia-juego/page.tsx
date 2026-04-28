"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import es from "@/messages/es.json"
import en from "@/messages/en.json"

export default function GuiaJuego() {
  const [lang, setLang] = useState<"es" | "en">("es")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // 1. Detección inicial
    const savedLang = localStorage.getItem("palabramaster-lang")
    if (savedLang === "en" || savedLang === "es") {
      setLang(savedLang)
    } else {
      const browserLang = navigator.language || (navigator as any).userLanguage
      // Corregido: pasamos el string literal "en", no el objeto importado
      if (browserLang && browserLang.toLowerCase().startsWith("en")) {
        setLang("en")
      } else {
        setLang("es")
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

  const t = lang === "en" ? en.guide : es.guide

  if (!mounted) return null

  return (
    <main className="min-h-[100dvh] bg-background text-foreground flex flex-col items-center py-12 px-6">
      <div className="max-w-4xl w-full">
        
        <Link href="/" className="inline-block mb-8 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          &larr; {t.back_button}
        </Link>

        <h1 className="text-4xl font-bold mb-8 text-primary">{t.title}</h1>
        
        {/* Intro */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-accent">{t.intro_title}</h2>
          <p className="text-muted-foreground leading-relaxed">{t.intro_text}</p>
        </section>

        {/* Mecánicas */}
        <section className="mb-10 bg-card p-6 rounded-xl border border-border">
          <h2 className="text-2xl font-semibold mb-4 text-primary">{t.mechanics_title}</h2>
          <p className="text-card-foreground leading-relaxed">{t.mechanics_desc}</p>
        </section>

        {/* Puntuación y Bonus */}
        <section className="mb-10 grid md:grid-cols-2 gap-6">
          <div className="bg-secondary/30 p-6 rounded-xl border border-border">
            <h3 className="text-xl font-bold mb-4 text-accent">{t.scoring_title}</h3>
            <p className="mb-4 text-secondary-foreground">{t.scoring_desc}</p>
            <ul className="list-disc ml-5 space-y-1 text-secondary-foreground">
              {t.bonus_list.map((item: string, i: number) => <li key={i}>{item}</li>)}
            </ul>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-xl font-bold mb-4 text-primary">{t.submit_title}</h3>
            <p className="text-card-foreground leading-relaxed">{t.submit_desc}</p>
          </div>
        </section>

        {/* Pistas y Records */}
        <section className="mb-10 grid md:grid-cols-2 gap-6">
          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-xl font-bold mb-4 text-accent">{t.hints_title}</h3>
            <p className="text-card-foreground leading-relaxed">{t.hints_desc}</p>
          </div>
          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-xl font-bold mb-4 text-primary">{t.leaderboard_title}</h3>
            <p className="text-card-foreground leading-relaxed">{t.leaderboard_desc}</p>
          </div>
        </section>

        {/* Estrategias */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">{t.strategies_title}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[ {t: t.strat_1_title, d: t.strat_1_desc}, {t: t.strat_2_title, d: t.strat_2_desc}, {t: t.strat_3_title, d: t.strat_3_desc} ].map((s, i) => (
              <div key={i} className="bg-card p-5 rounded-lg border border-border">
                <h4 className="font-bold text-primary mb-2">{s.t}</h4>
                <p className="text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  )
}
