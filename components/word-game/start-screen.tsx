"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Trophy, Globe } from "lucide-react"
import { useTranslations } from "@/hooks/use-translations"
import { useLanguage } from "@/components/language-provider"

export interface RankingEntry {
  name: string
  country: string
  score: number
}

interface StartScreenProps {
  onStartGame: (language: "es" | "en") => void
  onLanguageChange?: (language: "es" | "en") => void
  isDictionaryLoading?: boolean
  ranking: RankingEntry[]
}

function countryCodeToFlag(code: string): string {
  if (code.length !== 2) return "🏳️"
  return String.fromCodePoint(
    code.charCodeAt(0) + 127397,
    code.charCodeAt(1) + 127397
  )
}

export const DEMO_RANKINGS: Record<"es" | "en", RankingEntry[]> = {
  es: [
    { name: "María G.", country: "ES", score: 20 },
    { name: "Carlos M.", country: "MX", score: 85 },
    { name: "Ana P.", country: "AR", score: 50 },
    { name: "Luis R.", country: "CO", score: 25 },
    { name: "Sofía L.", country: "CL", score: 90 },
    { name: "Diego H.", country: "PE", score: 60 },
    { name: "Valentina C.", country: "UY", score: 35 },
    { name: "Andrés F.", country: "VE", score: 10 },
    { name: "Camila S.", country: "EC", score: 80 },
    { name: "Martín B.", country: "ES", score: 50 },
  ],
  en: [
    { name: "Olivia W.", country: "US", score: 30 },
    { name: "Noah B.", country: "GB", score: 95 },
    { name: "Amelia T.", country: "CA", score: 60 },
    { name: "Liam K.", country: "AU", score: 30 },
    { name: "Charlotte F.", country: "NZ", score: 30 },
    { name: "James H.", country: "IE", score: 70 },
    { name: "Emily S.", country: "US", score: 45 },
    { name: "Henry L.", country: "GB", score: 20 },
    { name: "Sophia R.", country: "CA", score: 90 },
    { name: "Jack M.", country: "AU", score: 60 },
  ],
}

export function StartScreen({
  onStartGame,
  onLanguageChange,
  isDictionaryLoading,
  ranking,
}: StartScreenProps) {
  const { lang, setLang } = useLanguage()
  const t = useTranslations(lang)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [autoScrollComplete, setAutoScrollComplete] = useState(false)

  // Lógica del autoscroll
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    if (ranking.length === 0 || ranking[0].score === 0) return

    container.scrollTop = container.scrollHeight

    let animationId: number
    const scrollSpeed = 2.5

    const autoScroll = () => {
      if (!container) return

      if (container.scrollTop > 0) {
        container.scrollTop -= scrollSpeed
        animationId = requestAnimationFrame(autoScroll)
      } else {
        setAutoScrollComplete(true)
      }
    }

    const timeoutId = setTimeout(() => {
      animationId = requestAnimationFrame(autoScroll)
    }, 500)

    return () => {
      clearTimeout(timeoutId)
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [ranking])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-full flex-col items-center gap-6 px-4 py-6"
    >
      <div className="text-center">
        <motion.h1
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
        >
          {t.startScreen.titleMain}
          <span className="text-primary">{t.startScreen.titleAccent}</span>
        </motion.h1>
        <p className="mt-2 text-muted-foreground">
          {t.startScreen.subtitle}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <Select
            value={lang}
            onValueChange={(val) => {
              const nextLanguage = val as "es" | "en"
              setLang(nextLanguage)
              onLanguageChange?.(nextLanguage)
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder={t.startScreen.languagePlaceholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es">{t.startScreen.languageSpanish}</SelectItem>
              <SelectItem value="en">{t.startScreen.languageEnglish}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        size="lg"
        onClick={() => onStartGame(lang)}
        disabled={Boolean(isDictionaryLoading)}
        className="h-14 px-12 text-lg font-semibold"
      >
        {isDictionaryLoading
          ? t.startScreen.loadingDictionary
          : t.startScreen.newGame}
      </Button>

      <div className="flex w-full max-w-md flex-1 flex-col overflow-hidden pb-4">
        <div className="mb-4 flex shrink-0 items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {t.startScreen.globalTop}
            </h2>
            <p className="text-xs text-muted-foreground">{t.startScreen.demoRankingNote}</p>
          </div>
        </div>

        <div className="flex-1 overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm mb-4">
          <div
            ref={scrollRef}
            className={`h-full overflow-y-auto ${autoScrollComplete ? "" : "pointer-events-none"}`}
            style={{ scrollBehavior: autoScrollComplete ? "smooth" : "auto" }}
          >
            {ranking.map((player, index) => (
              <div
                key={`${player.name}-${player.score}-${index}`}
                className="flex items-center justify-between border-b border-border/30 px-4 py-3 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                      index === 0
                        ? "bg-yellow-500/20 text-yellow-500"
                        : index === 1
                          ? "bg-gray-400/20 text-gray-400"
                          : index === 2
                            ? "bg-amber-600/20 text-amber-600"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {player.name}
                  </span>
                  <span
                    className="text-base leading-none"
                    title={player.country}
                    aria-label={`Country ${player.country}`}
                  >
                    {player.country === "US" && player.score === 0 ? "" : countryCodeToFlag(player.country)}
                  </span>
                </div>
                <span className="font-mono text-sm font-semibold text-primary">
                  {player.score > 0 ? player.score.toLocaleString(lang === "es" ? "es-ES" : "en-US") : ""}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 justify-center w-full z-10 relative">
          <a
            href="https://buymeacoffee.com/palabramaster"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-[#FFDD00] px-6 py-2.5 font-semibold text-black shadow-lg transition-all hover:bg-[#FFEA4D] hover:scale-105 active:scale-95"
          >
            <svg className="h-5 w-5" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.2 13.9C10.2 13.9 11.2 24.3 11.4 25.1C11.5 25.9 12 28.3 14.6 28.3C17.2 28.3 21 28.3 21 28.3C21 28.3 23.3 28.3 23.6 26C23.9 23.7 24.8 13.9 24.8 13.9H10.2Z" fill="currentColor"/>
              <path d="M26.2 15C26.2 15 28.5 15.1 29 17.2C29.4 19.1 28 21.6 24.5 21.9L24.8 13.9C24.8 13.9 26.2 13.9 26.2 15Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M12.6 13.5L13.1 7.2H21.9L22.4 13.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm">{lang === "es" ? "Invítame a un café" : "Buy me a coffee"}</span>
          </a>
        </div>
      </div>
    </motion.div>
  )
}
