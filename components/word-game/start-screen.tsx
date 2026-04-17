"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Trophy, Globe, Flag } from "lucide-react"
import { useTranslations } from "@/hooks/use-translations"

interface StartScreenProps {
  onStartGame: (language: "es" | "en") => void
  onLanguageChange?: (language: "es" | "en") => void
  isDictionaryLoading?: boolean
  initialLanguage?: "es" | "en"
  initialCountry?: string
  onCountryChange?: (country: string) => void
  ranking?: RankingEntry[]
}

export interface RankingEntry {
  name: string
  country: string
  score: number
}

export const INITIAL_RANKING: RankingEntry[] = [
  { name: "María G.", country: "ES", score: 50 },
  { name: "Carlos M.", country: "MX", score: 49 },
  { name: "Ana P.", country: "AR", score: 48 },
  { name: "Luis R.", country: "CO", score: 47 },
  { name: "Sofia L.", country: "CL", score: 46 },
  { name: "Diego H.", country: "PE", score: 45 },
  { name: "Valentina C.", country: "ES", score: 44 },
  { name: "Andrés F.", country: "VE", score: 43 },
  { name: "Camila S.", country: "UY", score: 42 },
  { name: "Martín B.", country: "EC", score: 41 },
  { name: "Paula R.", country: "ES", score: 40 },
  { name: "Javier M.", country: "MX", score: 39 },
  { name: "Laura S.", country: "AR", score: 38 },
  { name: "Roberto P.", country: "CO", score: 37 },
  { name: "Elena F.", country: "CL", score: 36 },
  { name: "Miguel A.", country: "PE", score: 35 },
  { name: "Carmen L.", country: "ES", score: 34 },
  { name: "Fernando G.", country: "VE", score: 33 },
  { name: "Isabel T.", country: "UY", score: 32 },
  { name: "Ricardo V.", country: "EC", score: 31 },
  { name: "Patricia N.", country: "ES", score: 30 },
  { name: "Alejandro C.", country: "MX", score: 29 },
  { name: "Lucía H.", country: "AR", score: 28 },
  { name: "Daniel O.", country: "CO", score: 27 },
  { name: "Teresa M.", country: "CL", score: 26 },
]

interface CountryOption {
  code: string
  name: string
}

const ALL_COUNTRY_CODES = [
  "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS", "AT", "AU", "AW",
  "AX", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN",
  "BO", "BQ", "BR", "BS", "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG",
  "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ",
  "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "EH", "ER", "ES", "ET", "FI",
  "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL",
  "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM", "HN", "HR",
  "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM",
  "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA",
  "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME",
  "MF", "MG", "MH", "MK", "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU",
  "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP",
  "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR",
  "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD",
  "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV",
  "SX", "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO",
  "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UM", "US", "UY", "UZ", "VA", "VC", "VE",
  "VG", "VI", "VN", "VU", "WF", "WS", "YE", "YT", "ZA", "ZM", "ZW",
] as const

function countryCodeToFlag(code: string): string {
  if (code.length !== 2) return "🏳️"
  return String.fromCodePoint(
    code.charCodeAt(0) + 127397,
    code.charCodeAt(1) + 127397
  )
}

function buildCountryOptions(language: "es" | "en"): CountryOption[] {
  const displayNames = new Intl.DisplayNames([language], { type: "region" })

  return [...ALL_COUNTRY_CODES]
    .map((code) => ({
      code,
      name: displayNames.of(code) ?? code,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function StartScreen({
  onStartGame,
  onLanguageChange,
  isDictionaryLoading,
  initialLanguage = "es",
  initialCountry = "ES",
  onCountryChange,
  ranking = INITIAL_RANKING,
}: StartScreenProps) {
  const [language, setLanguage] = useState<"es" | "en">(initialLanguage)
  const [country, setCountry] = useState(initialCountry)
  const t = useTranslations(language)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [autoScrollComplete, setAutoScrollComplete] = useState(false)
  const countryOptions = useMemo(() => buildCountryOptions(language), [language])

  const safeCountryValue = useMemo(() => {
    const normalized = country.toUpperCase()
    return countryOptions.some((option) => option.code === normalized)
      ? normalized
      : "US"
  }, [country, countryOptions])

  useEffect(() => {
    setLanguage(initialLanguage)
  }, [initialLanguage])

  useEffect(() => {
    setCountry(initialCountry)
  }, [initialCountry])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    // Start at the bottom
    container.scrollTop = container.scrollHeight

    let animationId: number
    const scrollSpeed = 1 // pixels per frame

    const autoScroll = () => {
      if (!container) return

      if (container.scrollTop > 0) {
        container.scrollTop -= scrollSpeed
        animationId = requestAnimationFrame(autoScroll)
      } else {
        // Reached the top, stop auto-scroll
        setAutoScrollComplete(true)
      }
    }

    // Start auto-scroll after a short delay
    const timeoutId = setTimeout(() => {
      animationId = requestAnimationFrame(autoScroll)
    }, 500)

    return () => {
      clearTimeout(timeoutId)
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

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
            value={language}
            onValueChange={(val) => {
              const nextLanguage = val as "es" | "en"
              setLanguage(nextLanguage)
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
        <div className="flex items-center gap-2">
          <Flag className="h-4 w-4 text-muted-foreground" />
          <Select
            value={safeCountryValue}
            onValueChange={(value) => {
              setCountry(value)
              onCountryChange?.(value)
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder={t.startScreen.countryPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {countryOptions.map((option) => (
                <SelectItem key={option.code} value={option.code}>
                  {countryCodeToFlag(option.code)} {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        size="lg"
        onClick={() => onStartGame(language)}
        disabled={Boolean(isDictionaryLoading)}
        className="h-14 px-12 text-lg font-semibold"
      >
        {isDictionaryLoading
          ? t.startScreen.loadingDictionary
          : t.startScreen.newGame}
      </Button>

      {/* Contenedor principal de la tabla y botón (flex-1 para que ocupe el resto) */}
      <div className="flex w-full max-w-md flex-1 flex-col overflow-hidden pb-4">
        
        {/* Título Top 25 */}
        <div className="mb-4 flex shrink-0 items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-foreground">
            {t.startScreen.globalTop}
          </h2>
        </div>

        {/* Tabla de clasificación */}
        <div className="flex-1 overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm mb-4">
          <div
            ref={scrollRef}
            className={`h-full overflow-y-auto ${autoScrollComplete ? "" : "pointer-events-none"}`}
            style={{ scrollBehavior: autoScrollComplete ? "smooth" : "auto" }}
          >
            {ranking.map((player, index) => (
              <div
                key={`${player.name}-${player.country}-${player.score}-${index}`}
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
                    {countryCodeToFlag(player.country)}
                  </span>
                </div>
                <span className="font-mono text-sm font-semibold text-primary">
                  {player.score.toLocaleString(language === "es" ? "es-ES" : "en-US")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Botón de Buy Me a Coffee debajo de la tabla */}
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
            <span className="text-sm">{language === "es" ? "Invítame a un café" : "Buy me a coffee"}</span>
          </a>
        </div>
      </div>
    </motion.div>
  )
}
