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
  definition,
  language,
}: ResultDialogProps) {
  const [isLoadingDefinition, setIsLoadingDefinition] = useState(false)
  const [definitionText, setDefinitionText] = useState<string | null>(null)
  const [definitionError, setDefinitionError] = useState<string | null>(null)

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
