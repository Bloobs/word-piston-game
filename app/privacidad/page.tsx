"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import es from "@/messages/es.json"
import en from "@/messages/en.json"

export default function Privacidad() {
  const [lang, setLang] = useState<"es" | "en">("es")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
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

    const handleGlobalLanguageChange = () => {
      const currentLang = localStorage.getItem("palabramaster-lang")
      if (currentLang === "en" || currentLang === "es") {
        setLang(currentLang)
      }
    }

    window.addEventListener("languageChanged", handleGlobalLanguageChange)
    return () => window.removeEventListener("languageChanged", handleGlobalLanguageChange)
  }, [])

  if (!mounted) return null

  const t = lang === "en" ? en.privacy : es.privacy

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/" className="text-primary hover:underline text-sm font-medium">
          &larr; {t.back_button}
        </Link>
        
        <h1 className="text-3xl font-bold tracking-tight mt-6">{t.title}</h1>
        <p className="text-muted-foreground text-sm">{t.last_updated}</p>

        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-2">{t.section1_title}</h2>
            <p>{t.section1_text}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">{t.section2_title}</h2>
            <p>{t.section2_text}</p>
            <p className="mt-2">{t.section2_subtext}</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Vercel Analytics:</strong> {t.section2_list1}</li>
              <li><strong>Google AdSense:</strong> {t.section2_list2}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">{t.section3_title}</h2>
            <p>{t.section3_text}</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>{t.section3_list1}</li>
              <li>{t.section3_list2}</li>
              <li>{t.section3_list3} <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{t.link_text}</a>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">{t.section4_title}</h2>
            <p>{t.section4_text}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">{t.section5_title}</h2>
            <p>{t.section5_text} <strong>bioritualnature@gmail.com</strong>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
