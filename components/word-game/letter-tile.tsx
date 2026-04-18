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
  const activeBg = "bg-white shadow-[0_3px_0_rgba(203,213,225,1)]"
  const inactiveBg = "bg-white/60 border border-white/40"

  return (
    <motion.button
      layoutId={letter.id}
      onClick={onClick}
      disabled={!isTop && !inWordZone}
      className={cn(
        "relative flex items-center justify-center rounded-lg font-sans flex-shrink-0",
        
        // TAMAÑOS EXACTOS (en lugar de porcentajes que rompen el layout)
        // 38px (h-9.5 w-9.5) x 9 = 342px de ancho total. ¡Cabe perfecto en un iPhone de 375/390px!
        "h-[38px] w-[38px] sm:h-12 sm:w-12 md:h-14 md:w-14",
        
        isTop || inWordZone
          ? `cursor-pointer ${activeBg} hover:-translate-y-0.5 active:translate-y-1 active:shadow-none`
          : `cursor-not-allowed ${inactiveBg}`,
        inWordZone && "shadow-[0_4px_15px_rgba(100,200,255,0.4)]",
        isHint && "animate-pulse ring-2 ring-yellow-400"
      )}
      animate={{
        scale: isHint ? [1, 1.1, 1] : 1,
        opacity: 1,
        backgroundColor: (isTop || inWordZone) ? "rgb(255, 255, 255)" : "rgba(255, 255, 255, 0.6)",
      }}
      transition={{
        layout: { type: "spring", stiffness: 300, damping: 30 },
        backgroundColor: { duration: 0.2, delay: isTop && !inWordZone ? 0.15 : 0 },
        scale: isHint
          ? { repeat: Infinity, duration: 0.5 }
          : { duration: 0.2 },
      }}
    >
      <motion.span 
        className={cn(
          "font-bold uppercase tracking-tight",
          // Letra grande (22px en móvil), al límite sin reventar el contenedor
          "text-[22px] sm:text-[26px] md:text-[30px]"
        )}
        animate={{ 
          color: (isTop || inWordZone) ? "#0f172a" : "rgba(15, 23, 42, 0.8)" 
        }}
        transition={{ duration: 0.2, delay: isTop && !inWordZone ? 0.15 : 0 }}
      >
        {letter.char}
      </motion.span>
      
      {/* El numerito super visible que pediste */}
      <motion.span 
        className={cn(
          "absolute font-bold leading-none",
          // Numerito a text-[10px] para que se lea perfecto en el metro
          "bottom-[3px] right-[4px] text-[10px] sm:bottom-1 sm:right-1.5 sm:text-[11px] md:text-xs"
        )}
        animate={{ 
          color: (isTop || inWordZone) ? "#64748b" : "rgba(71, 85, 105, 0.7)" 
        }}
        transition={{ duration: 0.2, delay: isTop && !inWordZone ? 0.15 : 0 }}
      >
        {letter.points}
      </motion.span>
    </motion.button>
  )
}
