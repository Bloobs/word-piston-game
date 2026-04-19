"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

// Importa tus JSON de traducciones
import es from "@/messages/es.json"
import en from "@/messages/en.json"

export function SeoArticle() {
  const [lang, setLang] = useState<"es" | "en">("es")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // 1. Detección inicial al cargar la página
    const savedLang = localStorage.getItem("palabramaster-lang")
    if (savedLang === "en" || savedLang === "es") {
      setLang(savedLang)
    } else {
      // Si no hay idioma guardado, miramos el navegador
      const browserLang = navigator.language || (navigator as any).userLanguage
      if (browserLang && browserLang.toLowerCase().startsWith("en")) {
        setLang("en")
      }
    }
    
    setMounted(true)

    // 2. Escuchar en tiempo real cuando el combo del juego cambia
    const handleGlobalLanguageChange = () => {
      const currentLang = localStorage.getItem("palabramaster-lang")
      if (currentLang === "en" || currentLang === "es") {
        setLang(currentLang)
      }
    }

    // Nos suscribimos al evento personalizado que emitimos desde el combo
    window.addEventListener("languageChanged", handleGlobalLanguageChange)
    
    // Limpieza del evento cuando se desmonta el componente
    return () => window.removeEventListener("languageChanged", handleGlobalLanguageChange)
  }, [])

  // Asignamos las traducciones dinámicamente
  const t = lang === "en" ? en.seo_article : es.seo_article

  // Evitamos problemas de hidratación en Next.js
  if (!mounted) return null

  return (
    <article className="max-w-3xl mx-auto p-6 mt-10 text-muted-foreground text-sm opacity-80 border-t border-border/50 pb-20 relative z-0">
      <header>
        <h1 className="text-xl font-bold mb-4 text-foreground">{t.title}</h1>
        <p className="mb-6">{t.intro}</p>
      </header>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-foreground">{t.how_to_play}</h2>
        <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
          
          <div className="w-full md:w-1/2 flex justify-center">
             <Image 
               // Ruta dinámica según el idioma seleccionado
               src={`/screenshots/gameplay-1-${lang}.png`} 
               priority
               alt="Gameplay de PalabraMaster" 
               width={800} // Cambia esto al ancho real de tu captura
               height={1600} // Cambia esto al alto real de tu captura
               className="w-full h-auto rounded-md shadow-sm border border-border" 
               sizes="(max-width: 768px) 100vw, 50vw"
             />
          </div>
          
          <p className="w-full md:w-1/2">{t.instructions}</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-foreground">{t.scoring_title}</h2>
        <p className="mb-4">{t.scoring_desc}</p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>{t.bonus_6}</li>
          <li>{t.bonus_7}</li>
          <li>{t.bonus_8}</li>
          <li>{t.bonus_9}</li>
          <li>{t.bonus_10}</li>
          <li>{t.bonus_clearfull}</li>
        </ul>
        
        <div className="w-full mt-6 flex justify-center">
             <Image 
               // Ruta dinámica de la segunda imagen
               src={`/screenshots/gameplay-2-${lang}.png`} 
               alt="Sistema de puntuación de PalabraMaster" 
               width={800} // Cambia esto al ancho real de tu captura
               height={1600} // Cambia esto al alto real de tu captura
               className="w-full md:w-3/4 lg:w-1/2 h-auto rounded-md shadow-sm border border-border" 
               sizes="100vw"
             />
        </div>
      </section>

      <footer>
        <p>{t.conclusion}</p>
      </footer>
    </article>
  )
}
