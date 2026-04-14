"use client"

import { motion } from "framer-motion"

interface ScoreDisplayProps {
  partialScore: number
  totalScore: number
}

export function ScoreDisplay({ partialScore, totalScore }: ScoreDisplayProps) {
  return (
    <div className="flex items-center justify-center gap-6 sm:gap-8">
      <div className="text-center">
        <p className="text-xs uppercase tracking-wider text-muted-foreground sm:text-sm">
          Parcial
        </p>
        <motion.p
          key={partialScore}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="text-2xl font-bold text-foreground sm:text-3xl"
        >
          {partialScore}
        </motion.p>
      </div>
      <div className="h-10 w-px bg-border" />
      <div className="text-center">
        <p className="text-xs uppercase tracking-wider text-muted-foreground sm:text-sm">
          Total
        </p>
        <motion.p
          key={totalScore}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="text-2xl font-bold text-primary sm:text-3xl"
        >
          {totalScore}
        </motion.p>
      </div>
    </div>
  )
}
