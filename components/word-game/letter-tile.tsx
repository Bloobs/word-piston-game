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
        "relative flex items-center justify-center rounded-lg font-sans", // sm:rounded-xl quitado para que cuadren mejor
        
        // --- LA CLAVE ESTÁ AQUÍ ---
        // Para que quepan 9 columnas en un iPhone: 
        // 9.5vw * 9 = 85.5% del ancho de la pantalla (deja 14.5% para los 8 huecos y márgenes)
        // Reducimos max-h y max-w a 10 (40px) en móvil, pero mantenemos grandes (12/14) en tablets/PC
        "h-[9.5vw] w-[9.5vw] max-h-10 max-w-10 min-h-[32px] min-w-[32px] sm:max-h-12 sm:max-w-12 sm:h-12 sm:w-12 md:h-14 md:w-14",
        
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
          "font-extrabold uppercase",
          // Letra adaptada al nuevo tamaño más compacto: text-lg en lugar de text-xl
          "text-lg sm:text-2xl md:text-[28px]"
        )}
        animate={{ 
          color: (isTop || inWordZone) ? "#0f172a" : "rgba(15, 23, 42, 0.8)" 
        }}
        transition={{ duration: 0.2, delay: isTop && !inWordZone ? 0.15 : 0 }}
      >
        {letter.char}
      </motion.span>
      
      <motion.span 
        className={cn(
          "absolute font-bold leading-none",
          // Puntuación pegada a los bordes
          "bottom-[2px] right-[3px] text-[9px] sm:bottom-1 sm:right-1 sm:text-[11px] md:text-xs"
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
