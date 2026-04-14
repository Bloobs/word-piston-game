"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { Letter } from "@/hooks/use-word-game"

interface LetterTileProps {
  letter: Letter
  onClick: () => void
  isTop?: boolean
  isHint?: boolean
  inWordZone?: boolean
}

export function LetterTile({
  letter,
  onClick,
  isTop = false,
  isHint = false,
  inWordZone = false,
}: LetterTileProps) {
  return (
    <motion.button
      layoutId={letter.id}
      onClick={onClick}
      disabled={!isTop && !inWordZone}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-lg font-mono text-lg font-bold transition-colors sm:h-12 sm:w-12 sm:text-xl",
        isTop || inWordZone
          ? "cursor-pointer bg-secondary hover:bg-secondary/80"
          : "cursor-not-allowed bg-muted/50 opacity-60",
        inWordZone && "shadow-[0_0_20px_rgba(100,200,255,0.5)]",
        isHint && "animate-pulse ring-2 ring-accent"
      )}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: isHint ? [1, 1.1, 1] : 1,
        opacity: 1,
      }}
      transition={{
        layout: { type: "spring", stiffness: 300, damping: 30 },
        scale: isHint
          ? { repeat: Infinity, duration: 0.5 }
          : { duration: 0.2 },
      }}
      whileHover={isTop || inWordZone ? { scale: 1.05 } : {}}
      whileTap={isTop || inWordZone ? { scale: 0.95 } : {}}
    >
      <span className="text-foreground">{letter.char}</span>
      <span className="absolute bottom-0.5 right-1 text-[10px] text-muted-foreground sm:text-xs">
        {letter.points}
      </span>
    </motion.button>
  )
}
