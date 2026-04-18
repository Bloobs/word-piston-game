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
  // Los colores sin clases de transición CSS para no interferir con Framer Motion
  const activeBg = "bg-white shadow-[0_3px_0_rgba(203,213,225,1)]"
  const inactiveBg = "bg-white/60 border border-white/40"

  return (
    <motion.button
      layoutId={letter.id} // ¡Esto es lo que hace que viaje por la pantalla!
      onClick={onClick}
      disabled={!isTop && !inWordZone}
      className={cn(
        "relative flex items-center justify-center rounded-xl font-sans", // <-- Quitamos transition-all y duration-300
        "h-11 w-11 sm:h-12 sm:w-12 md:h-14 md:w-14", // Nuestro tamaño equilibrado
        isTop || inWordZone
          ? `cursor-pointer ${activeBg} hover:-translate-y-0.5 active:translate-y-1 active:shadow-none`
          : `cursor-not-allowed ${inactiveBg}`,
        inWordZone && "shadow-[0_4px_15px_rgba(100,200,255,0.4)]",
        isHint && "animate-pulse ring-4 ring-yellow-400"
      )}
      // Mantenemos la lógica de colores dentro de Framer Motion para que se anime junto con el movimiento
      animate={{
        scale: isHint ? [1, 1.1, 1] : 1,
        opacity: 1,
        // Cuando sube a inWordZone o pasa a isTop, el fondo se ilumina
        backgroundColor: (isTop || inWordZone) ? "rgb(255, 255, 255)" : "rgba(255, 255, 255, 0.6)",
      }}
      transition={{
        // Recuperamos el stiffness original que tenías para el viaje fluido por pantalla
        layout: { type: "spring", stiffness: 300, damping: 30 },
        // El color cambiará con un pequeño delay cuando la letra se convierta en la nueva "Top"
        backgroundColor: { duration: 0.2, delay: isTop && !inWordZone ? 0.15 : 0 },
        scale: isHint
          ? { repeat: Infinity, duration: 0.5 }
          : { duration: 0.2 },
      }}
    >
      {/* LETRA */}
      <motion.span 
        className={cn(
          "font-extrabold uppercase",
          "text-xl sm:text-2xl md:text-[28px]"
        )}
        // Animamos el color del texto también con Framer Motion
        animate={{ 
          color: (isTop || inWordZone) ? "#0f172a" : "rgba(15, 23, 42, 0.8)" 
        }}
        transition={{ duration: 0.2, delay: isTop && !inWordZone ? 0.15 : 0 }}
      >
        {letter.char}
      </motion.span>
      
      {/* PUNTUACIÓN */}
      <motion.span 
        className={cn(
          "absolute font-bold",
          "bottom-0.5 right-1 text-[11px] sm:bottom-1 sm:right-1.5 sm:text-xs md:text-[14px]"
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
