"use client"

import { motion, AnimatePresence } from "framer-motion"
import { LetterTile } from "./letter-tile"
import type { Letter } from "@/hooks/use-word-game"
import { useTranslations } from "@/hooks/use-translations"

interface WordZoneProps {
  letters: Letter[]
  onReturnLastLetter: () => void
  isValid: boolean
  language: "es" | "en"
}

export function WordZone({ letters, onReturnLastLetter, isValid, language }: WordZoneProps) {
  const t = useTranslations(language)

  return (
    <div
      // 1. AÑADIMOS 'relative' AL CONTENEDOR PRINCIPAL
      className={`relative flex min-h-16 items-center justify-center rounded-xl border px-4 py-3 backdrop-blur-sm transition-all duration-300 sm:min-h-20 ${
        isValid
          ? "border-green-500/70 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
          : "border-border/50 bg-card/50"
      }`}
    >
      {/* 2. AÑADIMOS 'relative' y 'w-full' AL CONTENEDOR DE LA LISTA */}
      <div className="relative flex w-full flex-wrap items-center justify-center gap-2">
        <AnimatePresence mode="popLayout">
          {letters.length === 0 && (
            <motion.span
              key="empty-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="text-sm text-muted-foreground"
            >
              {t.wordZone.emptyHint}
            </motion.span>
          )}

          {letters.map((letter) => (
            <LetterTile
              key={letter.id}
              letter={letter}
              onClick={onReturnLastLetter}
              inWordZone
              isTop
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
