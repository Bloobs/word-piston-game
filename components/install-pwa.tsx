"use client"

import { useState, useEffect } from "react"
import { Download, Share, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "@/hooks/use-translations" // Ajusta la ruta si es distinta
import { useWordGame } from "@/hooks/use-word-game" // Importamos tu hook del juego

export function InstallPWA() {
  // 1. Obtenemos el idioma actual directamente del estado de tu juego
  const { state } = useWordGame()
  
 // 1. AÑADIMOS ESTOS LOGS PARA DEPURAR
 console.log("=== DEBUG PWA BANNER ===")
 console.log("Estado completo del juego:", state)
 console.log("Idioma detectado por la PWA:", state?.language)
 
 // 2. Comprobación de seguridad por si el estado no ha cargado
 const currentLanguage = state?.language || "es"
 console.log("Idioma final usado para traducir:", currentLanguage)
 console.log("========================")


  // 2. Pasamos ese idioma al traductor
  const t = useTranslations(state.language)

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(true) 
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const isApp = window.matchMedia("(display-mode: standalone)").matches || 
                  (window.navigator as any).standalone === true;
    setIsStandalone(isApp);

    if (isApp) return;

    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(isIosDevice)

    // Estrategia de monetización: Retrasamos 3 segundos la aparición en iOS 
    // para no asustar al jugador nada más entrar.
    if (isIosDevice) {
      const timer = setTimeout(() => setShowBanner(true), 3000)
      return () => clearTimeout(timer)
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // En Android/PC también le damos 3 segundos de respiro
      setTimeout(() => setShowBanner(true), 3000)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()

    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setShowBanner(false)
    }
    
    setDeferredPrompt(null)
  }

  if (isStandalone || !showBanner) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm rounded-xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md"
      >
        <button
          onClick={() => setShowBanner(false)}
          className="absolute right-2 top-2 rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            {isIOS ? <Share className="h-5 w-5" /> : <Download className="h-5 w-5" />}
          </div>
          
          <div className="flex-1">
            <h4 className="font-bold text-slate-200">
              {t.pwa.title}
            </h4>
            
            {isIOS ? (
              <p className="mt-1 text-sm leading-relaxed text-slate-400">
                {t.pwa.iosPart1}
                <strong>{t.pwa.iosShare}</strong>
                {t.pwa.iosPart2}
                <strong>{t.pwa.iosAdd}</strong>.
              </p>
            ) : (
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm text-slate-400">{t.pwa.desktopDesc}</p>
                <button
                  onClick={handleInstallClick}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 active:scale-95 transition-all"
                >
                  {t.pwa.installBtn}
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
