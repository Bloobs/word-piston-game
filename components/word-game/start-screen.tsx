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
  country?: string
  score: number
}

interface StartScreenProps {
  onStartGame: (language: "es" | "en") => void
  onLanguageChange?: (language: "es" | "en") => void
  isDictionaryLoading?: boolean
  ranking: RankingEntry[]
  personalBest: { score: number; language: "es" | "en" } | null
  personalBestStatus: "loading" | "ready" | "session" | "unavailable" | "error"
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
    { name: "Sofía L.", country: "CL", score: 90 },
    { name: "Carlos M.", country: "MX", score: 85 },
    { name: "Camila S.", country: "EC", score: 80 },
    { name: "Diego H.", country: "PE", score: 60 },
    { name: "Ana P.", country: "AR", score: 50 },
    { name: "Martín B.", country: "ES", score: 50 },
    { name: "Valentina C.", country: "UY", score: 35 },
    { name: "Luis R.", country: "CO", score: 25 },
    { name: "María G.", country: "ES", score: 20 },
    { name: "Andrés F.", country: "VE", score: 10 },
  ],
  en: [
    { name: "Noah B.", country: "GB", score: 95 },
    { name: "Sophia R.", country: "CA", score: 90 },
    { name: "James H.", country: "IE", score: 70 },
    { name: "Amelia T.", country: "CA", score: 60 },
    { name: "Jack M.", country: "AU", score: 60 },
    { name: "Emily S.", country: "US", score: 45 },
    { name: "Olivia W.", country: "US", score: 30 },
    { name: "Liam K.", country: "AU", score: 30 },
    { name: "Charlotte F.", country: "NZ", score: 30 },
    { name: "Henry L.", country: "GB", score: 20 },
  ],
}

export function StartScreen({
  onStartGame,
  onLanguageChange,
  isDictionaryLoading,
  ranking,
  personalBest,
  personalBestStatus,
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
      className="flex h-full min-h-0 flex-col items-center gap-2 px-3 py-2 sm:gap-4 sm:px-4 sm:py-4 lg:gap-6 lg:py-6"
    >
      <div className="shrink-0 text-center">
        <motion.h1
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="whitespace-nowrap text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl"
        >
          {t.startScreen.titleMain}
          {lang === "en" ? " " : ""}
          <span className="text-primary">{t.startScreen.titleAccent}</span>
        </motion.h1>
        <p className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-base">
          {t.startScreen.subtitle}
        </p>
      </div>

      <div className="shrink-0">
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
        className="h-12 shrink-0 px-8 text-base font-semibold sm:h-14 sm:px-12 sm:text-lg"
      >
        {isDictionaryLoading
          ? t.startScreen.loadingDictionary
          : t.startScreen.newGame}
      </Button>

      {personalBest && (
        <div className="w-full max-w-md shrink-0 rounded-lg border border-border/50 bg-card/50 px-4 py-2 text-center sm:py-3">
          <p className="font-semibold text-foreground">
            {t.startScreen.personalBest}:{" "}
            {personalBest.score.toLocaleString(lang === "es" ? "es-ES" : "en-US")}
          </p>
          <p className="text-xs text-muted-foreground">
            {personalBest.language === "es"
              ? t.startScreen.personalBestSpanish
              : t.startScreen.personalBestEnglish}
          </p>
          {(personalBestStatus === "session" ||
            personalBestStatus === "unavailable") && (
            <p className="mt-1 text-xs text-muted-foreground">
              {t.startScreen.personalBestSessionOnly}
            </p>
          )}
          {personalBestStatus === "error" && (
            <p className="mt-1 text-xs text-destructive">
              {t.startScreen.personalBestError}
            </p>
          )}
        </div>
      )}

      <div className="flex min-h-0 w-full max-w-md flex-1 flex-col overflow-hidden pb-1 sm:pb-4">
        <div className="mb-2 flex shrink-0 items-center gap-2 sm:mb-4">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {t.startScreen.globalTop}
            </h2>
            <p className="text-xs text-muted-foreground">{t.startScreen.demoRankingNote}</p>
          </div>
        </div>

        <div className="mb-2 flex min-h-0 flex-1 overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm sm:mb-4">
          <div
            ref={scrollRef}
            className={`h-full overflow-y-auto ${autoScrollComplete ? "" : "pointer-events-none"}`}
            style={{ scrollBehavior: autoScrollComplete ? "smooth" : "auto" }}
          >
            {ranking.map((player, index) => (
              <div
                key={`${player.name}-${player.score}-${index}`}
                className="flex items-center justify-between border-b border-border/30 px-4 py-2.5 last:border-b-0 sm:py-3"
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
                  {player.country && (
                    <span
                      className="text-base leading-none"
                      title={player.country}
                      aria-label={`Country ${player.country}`}
                    >
                      {player.country === "US" && player.score === 0
                        ? ""
                        : countryCodeToFlag(player.country)}
                    </span>
                  )}
                </div>
                <span className="font-mono text-sm font-semibold text-primary">
                  {player.score > 0 ? player.score.toLocaleString(lang === "es" ? "es-ES" : "en-US") : ""}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  )
}
