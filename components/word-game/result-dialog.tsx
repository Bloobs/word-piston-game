"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Sparkles, BookOpen } from "lucide-react"

interface ResultDialogProps {
  isOpen: boolean
  onClose: () => void
  word: string | null
  points: number
  bonusPoints: number
  definition: string | null
  language: "es" | "en"
}

function isUsableDefinition(value: string | null | undefined): value is string {
  if (!value) return false
  const normalized = value.trim()
  if (normalized.length < 5) return false
  return true
}

export function ResultDialog({
  isOpen,
  onClose,
  word,
  points,
  bonusPoints,
  definition,
  language,
}: ResultDialogProps) {
  const [isLoadingDefinition, setIsLoadingDefinition] = useState(false)
  const [definitionText, setDefinitionText] = useState<string | null>(null)
  const [definitionError, setDefinitionError] = useState<string | null>(null)
  const hasBonusCelebration = bonusPoints > 0
  const isEpicBonus = bonusPoints >= 25
  const starCount = isEpicBonus ? 14 : 9

  useEffect(() => {
    if (!isOpen || !word) {
      setIsLoadingDefinition(false)
      setDefinitionText(null)
      setDefinitionError(null)
      return
    }

    if (language !== "es") {
      setIsLoadingDefinition(false)
      setDefinitionText(definition)
      setDefinitionError(null)
      return
    }

    if (!navigator.onLine) {
      setIsLoadingDefinition(false)
      setDefinitionText(null)
      setDefinitionError("Sin conexión. No se ha podido consultar la definición.")
      return
    }

    let isCancelled = false

    const fetchDefinition = async () => {
      setIsLoadingDefinition(true)
      setDefinitionText(null)
      setDefinitionError(null)

      try {
        const response = await fetch(`/api/rae?word=${encodeURIComponent(word)}`)
        const data: { ok?: boolean; definition?: string; error?: string } = await response.json()

        if (isCancelled) return

        if (data.ok && isUsableDefinition(data.definition)) {
          setDefinitionText(data.definition.trim())
          setDefinitionError(null)
          return
        }

        setDefinitionText(null)
        setDefinitionError(data.error || "No se encontró el significado.")
      } catch {
        if (isCancelled) return
        setDefinitionText(null)
        setDefinitionError("No se encontró el significado.")
      } finally {
        if (!isCancelled) {
          setIsLoadingDefinition(false)
        }
      }
    }

    void fetchDefinition()

    return () => {
      isCancelled = true
    }
  }, [isOpen, word, language, definition])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm border-border/50 bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            <span>Excelente</span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Resultado de la palabra
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="rounded-lg bg-primary/10 px-6 py-3"
          >
            <span className="text-3xl font-bold tracking-wider text-primary">
              {word}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <p className="text-sm text-muted-foreground">Puntos obtenidos</p>
            <p className="text-4xl font-bold text-accent">+{points}</p>
          </motion.div>

          {hasBonusCelebration && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative w-full overflow-hidden rounded-xl border border-yellow-400/40 bg-yellow-400/10 px-4 py-4 text-center"
            >
              {Array.from({ length: starCount }).map((_, index) => {
                const left = (index * 31) % 100
                const duration = 0.9 + (index % 4) * 0.2
                const delay = 0.08 * index
                const sizeClass = isEpicBonus
                  ? index % 3 === 0
                    ? "h-6 w-6"
                    : "h-5 w-5"
                  : index % 3 === 0
                    ? "h-5 w-5"
                    : "h-4 w-4"

                return (
                  <motion.div
                    key={`bonus-star-${index}`}
                    initial={{ opacity: 0, scale: 0.2, y: 14 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.2, 1.2, 0.4], y: [14, -18, -30] }}
                    transition={{
                      duration,
                      delay,
                      ease: "easeOut",
                    }}
                    className="pointer-events-none absolute bottom-3"
                    style={{ left: `${left}%` }}
                  >
                    <Sparkles className={`${sizeClass} text-yellow-500`} />
                  </motion.div>
                )
              })}

              <motion.p
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: [0.85, 1.06, 1] }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="relative z-10 text-2xl font-extrabold text-yellow-500"
              >
                +Bonus +{bonusPoints}
              </motion.p>
            </motion.div>
          )}

          {isLoadingDefinition && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full rounded-lg border border-border/50 bg-muted/30 p-4 text-sm text-muted-foreground"
            >
              Buscando definición...
            </motion.div>
          )}

          {definitionText && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full rounded-lg border border-border/50 bg-muted/30 p-4"
            >
              <div className="flex items-start gap-2">
                <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{definitionText}</p>
              </div>
              {language === "es" && (
                <p className="mt-2 text-xs italic text-muted-foreground">
                  Significado obtenido de la web de la RAE.
                </p>
              )}
            </motion.div>
          )}

          {definitionError && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full rounded-lg border border-border/50 bg-muted/30 p-4 text-sm text-muted-foreground"
            >
              {definitionError}
            </motion.p>
          )}

          <Button onClick={onClose} className="mt-2 w-full">
            Continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
