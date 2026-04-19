"use client"

import { useState, useEffect } from "react"
import { Download, Share, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "@/hooks/use-translations"

export function InstallPWA() {
  // 1. Estado para el idioma, por defecto en español
  const [lang, setLang] = useState<"es" | "en">("es")

  // 2. Efecto para detectar y actualizar el idioma de forma independiente
  useEffect(() => {
    const detectRealLanguage = (): "es" | "en" => {
      // Intentamos leer el localStorage donde tu juego guarda la preferencia
      const storedLang = localStorage.getItem("language") || 
                         localStorage.getItem("word-game-storage") ||
                         localStorage.getItem("game-lang");
      
      if (storedLang && storedLang.includes("en")) {
        return "en";
      }

      // Si no hay nada guardado, detectamos el idioma del navegador (Tier 1)
      const browserLang = navigator.language || (navigator as any).userLanguage;
      if (browserLang && browserLang.toLowerCase().startsWith("en")) {
        return "en";
      }

      return "es";
    }

    // Configuramos el idioma inicial
    setLang(detectRealLanguage());

    // Revisamos cada segundo si el jugador ha cambiado el idioma en el dropdown.
    // Al estar fuera del Provider del juego, esta es la forma más limpia de reaccionar.
    const intervalId = setInterval(() => {
      const currentRealLang = detectRealLanguage();
      setLang((prevLang) => {
        if (prevLang !== currentRealLang) {
          return currentRealLang;
        }
        return prevLang;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [])

  // 3. Obtenemos las traducciones reactivas basadas en el idioma detectado
  const t = useTranslations(lang)

  // 4. Estados de la PWA
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(true) // True por defecto para evitar parpadeos
  const [showBanner, setShowBanner] = useState(false)

  // 5. Efecto para manejar la lógica de instalación PWA
  useEffect(() => {
    // Comprobar si ya está instalada (Standalone)
    const isApp = window.matchMedia("(display-mode: standalone)").matches || 
                  (window.navigator as any).standalone === true;
    setIsStandalone(isApp);

    if (isApp) return;

    // Detectar iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(isIosDevice)

    // Estrategia de monetización: Retrasamos 3 segundos la aparición en iOS 
    // para que el jugador vea el menú antes de pedirle la instalación.
    if (isIosDevice) {
      const timer = setTimeout(() => setShowBanner(true), 3000)
      return () => clearTimeout(timer)
    }

    // Capturar el evento de instalación nativo en Android/PC
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

    // Muestra el aviso nativo de instalación del sistema
    deferredPrompt.prompt()

    // Esperamos a ver qué elige el usuario
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setShowBanner(false)
    }
    
    // Limpiamos el evento
    setDeferredPrompt(null)
  }

  // Si ya está instalada o cerramos el banner, no mostramos nada
  if (isStandalone || !showBanner) return null

  // Protección de seguridad por si las traducciones no han cargado
  if (!t || !t.pwa) return null

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
