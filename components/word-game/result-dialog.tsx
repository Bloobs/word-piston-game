"use client"

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
}

export function ResultDialog({
  isOpen,
  onClose,
  word,
  points,
  definition,
}: ResultDialogProps) {
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

          {definition && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-start gap-2 rounded-lg border border-border/50 bg-muted/30 p-4"
            >
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{definition}</p>
            </motion.div>
          )}

          <Button onClick={onClose} className="mt-2 w-full">
            Continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
