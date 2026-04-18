"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { WifiOff } from "lucide-react"

export function NetworkMonitor() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    // Comprueba el estado inicial al cargar
    setIsOffline(!navigator.onLine)

    // Funciones para actualizar el estado
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    // Escuchamos los eventos nativos del sistema operativo/navegador
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // Un z-index altísimo (z-[100]) para que tape CUALQUIER otra cosa (incluyendo otros modales)
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="mx-auto flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl border border-border bg-card p-8 text-center shadow-2xl"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <WifiOff className="h-8 w-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Sin conexión</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Palabra Master requiere internet para validar palabras y mostrar la clasificación.
              </p>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
              </span>
              <p className="text-sm font-medium text-red-500">
                Esperando red...
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}