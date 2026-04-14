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
import { Trophy, Globe, Flag } from "lucide-react"

interface StartScreenProps {
  onStartGame: (language: "es" | "en") => void
  isDictionaryLoading?: boolean
}

const MOCK_RANKING = [
  { rank: 1, name: "María G.", country: "ES", score: 12450 },
  { rank: 2, name: "Carlos M.", country: "MX", score: 11230 },
  { rank: 3, name: "Ana P.", country: "AR", score: 10890 },
  { rank: 4, name: "Luis R.", country: "CO", score: 9870 },
  { rank: 5, name: "Sofia L.", country: "CL", score: 9540 },
  { rank: 6, name: "Diego H.", country: "PE", score: 8920 },
  { rank: 7, name: "Valentina C.", country: "ES", score: 8750 },
  { rank: 8, name: "Andrés F.", country: "VE", score: 8340 },
  { rank: 9, name: "Camila S.", country: "UY", score: 8120 },
  { rank: 10, name: "Martín B.", country: "EC", score: 7890 },
  { rank: 11, name: "Paula R.", country: "ES", score: 7650 },
  { rank: 12, name: "Javier M.", country: "MX", score: 7420 },
  { rank: 13, name: "Laura S.", country: "AR", score: 7180 },
  { rank: 14, name: "Roberto P.", country: "CO", score: 6950 },
  { rank: 15, name: "Elena F.", country: "CL", score: 6720 },
  { rank: 16, name: "Miguel A.", country: "PE", score: 6490 },
  { rank: 17, name: "Carmen L.", country: "ES", score: 6260 },
  { rank: 18, name: "Fernando G.", country: "VE", score: 6030 },
  { rank: 19, name: "Isabel T.", country: "UY", score: 5800 },
  { rank: 20, name: "Ricardo V.", country: "EC", score: 5570 },
  { rank: 21, name: "Patricia N.", country: "ES", score: 5340 },
  { rank: 22, name: "Alejandro C.", country: "MX", score: 5110 },
  { rank: 23, name: "Lucía H.", country: "AR", score: 4880 },
  { rank: 24, name: "Daniel O.", country: "CO", score: 4650 },
  { rank: 25, name: "Teresa M.", country: "CL", score: 4420 },
]

export function StartScreen({ onStartGame, isDictionaryLoading }: StartScreenProps) {
  const [language, setLanguage] = useState<"es" | "en">("es")
  const [country, setCountry] = useState("ES")
  const scrollRef = useRef<HTMLDivElement>(null)
  const [autoScrollComplete, setAutoScrollComplete] = useState(false)

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
          Palabra
          <span className="text-primary">Master</span>
        </motion.h1>
        <p className="mt-2 text-muted-foreground">
          Forma palabras con las letras del tablero
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <Select value={language} onValueChange={(val) => setLanguage(val as "es" | "en")}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Idioma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Flag className="h-4 w-4 text-muted-foreground" />
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="País" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ES">España</SelectItem>
              <SelectItem value="MX">México</SelectItem>
              <SelectItem value="AR">Argentina</SelectItem>
              <SelectItem value="CO">Colombia</SelectItem>
              <SelectItem value="CL">Chile</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        size="lg"
        onClick={() => onStartGame(language)}
        disabled={language === "es" && isDictionaryLoading}
        className="h-14 px-12 text-lg font-semibold"
      >
        {language === "es" && isDictionaryLoading ? "Cargando diccionario..." : "Nueva Partida"}
      </Button>

      <div className="flex w-full max-w-md flex-1 flex-col overflow-hidden">
        <div className="mb-4 flex shrink-0 items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-foreground">
            Top 25 Global
          </h2>
        </div>
        <div className="flex-1 overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
          <div
            ref={scrollRef}
            className={`h-full overflow-y-auto ${autoScrollComplete ? "" : "pointer-events-none"}`}
            style={{ scrollBehavior: autoScrollComplete ? "smooth" : "auto" }}
          >
            {MOCK_RANKING.map((player) => (
              <div
                key={player.rank}
                className="flex items-center justify-between border-b border-border/30 px-4 py-3 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                      player.rank === 1
                        ? "bg-yellow-500/20 text-yellow-500"
                        : player.rank === 2
                          ? "bg-gray-400/20 text-gray-400"
                          : player.rank === 3
                            ? "bg-amber-600/20 text-amber-600"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {player.rank}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {player.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {player.country}
                  </span>
                </div>
                <span className="font-mono text-sm font-semibold text-primary">
                  {player.score.toLocaleString("es-ES")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
