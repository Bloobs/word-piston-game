"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { useWordGame } from "@/hooks/use-word-game"
import { useGameState } from "@/components/game-state-provider"
import { DEMO_RANKINGS, StartScreen } from "./start-screen"
import { ScoreDisplay } from "./score-display"
import { WordZone } from "./word-zone"
import { GameBoard } from "./game-board"
import { GameControls } from "./game-controls"
import { ResultDialog } from "./result-dialog"
import { Button } from "@/components/ui/button"
import { Trophy } from "lucide-react"
import { useTranslations } from "@/hooks/use-translations"
import { useCrazyGamesSDK } from "@/components/crazygames-sdk-provider"

function getLanguageFromBrowserLocale(): "es" | "en" {
  if (typeof navigator === "undefined") return "es" // Por defecto en servidor/si falla

  const browserLang = navigator.language || (navigator as any).userLanguage
  // Si empieza por "en" (como en-US, en-GB, en), devolvemos "en"
  if (browserLang && browserLang.toLowerCase().startsWith("en")) {
    return "en"
  }
  
  // Por defecto para España, LATAM o cualquier otro idioma no contemplado
  return "es" 
}


export function WordGame() {
  const { state, actions, currentWord, isCurrentWordValid } = useWordGame()
  const { setIsGameActive } = useGameState()
  const { status: crazyGamesSdkStatus } = useCrazyGamesSDK()
  const t = useTranslations(state.language)

  const [isHintModalOpen, setIsHintModalOpen] = useState(false)
  const [isProcessingHintAd, setIsProcessingHintAd] = useState(false)
  const [adErrorMessage, setAdErrorMessage] = useState<string | null>(null)
  const adRequestInFlight = useRef(false)

  // NUEVO: Efecto para detectar y configurar el idioma por defecto al arrancar
  useEffect(() => {
      // Solo queremos hacerlo una vez al cargar la página por primera vez
      // y solo si el idioma inicial que queremos es distinto al que ya tiene el state
    const detectedLanguage = getLanguageFromBrowserLocale()
    if (state.language !== detectedLanguage) {
        actions.setLanguage(detectedLanguage)
    }
  }, []) // Pasamos actions como dependencia (o déjalo vacío [] si tu linter te lo permite)
  

  // Actualizar estado de partida activa para controlar la visibilidad del menú
  useEffect(() => {
    const isGamePlaying = state.gameStarted && !state.gameOver
    setIsGameActive(isGamePlaying)
  }, [state.gameStarted, state.gameOver, setIsGameActive])

  const currentRanking = DEMO_RANKINGS[state.language]

  const handleStartGame = (language: "es" | "en") => {
    setIsHintModalOpen(false)
    setIsProcessingHintAd(false)
    setAdErrorMessage(null)
    adRequestInFlight.current = false
    actions.startNewGame(language)
  }

  const handleHintRequest = () => {
    if (adRequestInFlight.current) return
    setAdErrorMessage(null)
    setIsHintModalOpen(true)
  }

  const handleCloseHintModal = () => {
    if (adRequestInFlight.current) return
    setIsHintModalOpen(false)
    setAdErrorMessage(null)
  }

  const handleWatchAd = () => {
    if (adRequestInFlight.current) return

    const sdk = window.CrazyGames?.SDK
    if (crazyGamesSdkStatus !== "ready" || !sdk?.ad) {
      setAdErrorMessage(t.ads.sdkUnavailable)
      return
    }

    adRequestInFlight.current = true
    setIsProcessingHintAd(true)
    setAdErrorMessage(null)

    const resetFailedRequest = (error: unknown) => {
      if (!adRequestInFlight.current) return
      adRequestInFlight.current = false
      setIsProcessingHintAd(false)
      setAdErrorMessage(t.ads.adError)
      console.error("CrazyGames rewarded ad failed:", error)
    }

    try {
      sdk.ad.requestAd("rewarded", {
        adStarted: () => {
          if (adRequestInFlight.current) setIsProcessingHintAd(true)
        },
        adFinished: () => {
          if (!adRequestInFlight.current) return
          adRequestInFlight.current = false
          setIsProcessingHintAd(false)
          setAdErrorMessage(null)
          setIsHintModalOpen(false)
          actions.useHint()
        },
        adError: resetFailedRequest,
      })
    } catch (error) {
      resetFailedRequest(error)
    }
  }

  if (!state.gameStarted && !state.gameOver) {
    return (
      <StartScreen
        key={state.language} // Forzamos repintado al cambiar idioma para que actualice la tabla al instante
        onStartGame={handleStartGame}
        onLanguageChange={actions.setLanguage}
        isDictionaryLoading={state.dictionaryLoading}
        ranking={currentRanking} // Le pasamos la tabla que toca según el idioma elegido
      />
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 px-4 py-4">
        <ScoreDisplay
          partialScore={state.partialScore}
          totalScore={state.totalScore}
          language={state.language}
        />
      </div>

      <div className="shrink-0 px-4 py-2">
        <WordZone
          letters={state.wordZone}
          onReturnLastLetter={actions.returnLastLetter}
          isValid={isCurrentWordValid}
          language={state.language}
        />
      </div>

      <div className="shrink-0 py-3">
        <GameControls
          canSubmit={isCurrentWordValid} // <-- Corregido: Ahora solo se activa si la palabra existe
          canUseHint={true}
          onSubmit={actions.submitWord}
          onHint={handleHintRequest}
          onGiveUp={actions.giveUp}
          totalScore={state.totalScore}
          language={state.language}
        />
      </div>

      <div className="flex-1 overflow-hidden">
        <GameBoard
          columns={state.columns}
          hintLetters={state.hintLetters}
          onSelectLetter={actions.selectLetter}
        />
      </div>

      <AnimatePresence>
        <ResultDialog
          isOpen={state.showResultDialog}
          onClose={actions.closeResultDialog}
          word={state.lastValidWord}
          points={state.lastWordPoints}
          bonusPoints={state.lastWordBonus}
          definition={state.lastWordDefinition}
          language={state.language}
        />
      </AnimatePresence>

      <AnimatePresence>
        {isHintModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl overflow-hidden"
            >
              <div className="space-y-3 text-center">
                <h3 className="text-xl font-bold text-foreground">
                  {state.language === "es" ? "Desbloquear pista" : "Unlock hint"}
                </h3>

                <p className="text-sm leading-6 text-muted-foreground">
                  {state.language === "es"
                    ? "La pista se concede cuando termina el anuncio recompensado de CrazyGames."
                    : "The hint is granted when the CrazyGames rewarded ad finishes."}
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                {adErrorMessage && (
                  <p role="status" className="text-sm text-destructive">
                    {adErrorMessage}
                  </p>
                )}
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleWatchAd}
                  disabled={isProcessingHintAd}
                >
                  {isProcessingHintAd
                    ? state.language === "es"
                      ? "Cargando anuncio..."
                      : "Loading ad..."
                    : state.language === "es"
                      ? "Ver anuncio"
                      : "Watch ad"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleCloseHintModal}
                  disabled={isProcessingHintAd}
                >
                  {state.language === "es" ? "Cancelar" : "Cancel"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state.gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="mx-4 flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl border border-border bg-card p-8 shadow-2xl"
            >
              <Trophy className="h-16 w-16 text-yellow-500" />
              <h2 className="text-3xl font-bold text-foreground">{t.gameOver.title}</h2>

              <div className="text-center">
                <p className="text-muted-foreground">{t.gameOver.finalScore}</p>
                <p className="text-5xl font-bold text-primary">{state.totalScore}</p>
              </div>

              <Button onClick={actions.goToHome} size="lg">
                {t.gameOver.ok}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
