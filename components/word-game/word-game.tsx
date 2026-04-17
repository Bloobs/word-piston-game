"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useMemo, useState } from "react"
import { useWordGame } from "@/hooks/use-word-game"
import { INITIAL_RANKING, StartScreen, type RankingEntry } from "./start-screen"
import { ScoreDisplay } from "./score-display"
import { WordZone } from "./word-zone"
import { GameBoard } from "./game-board"
import { GameControls } from "./game-controls"
import { ResultDialog } from "./result-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trophy } from "lucide-react"
import { useTranslations } from "@/hooks/use-translations"

const INITIAL_RANKING_EN: RankingEntry[] = [
  { name: "Olivia W.", country: "US", score: 50 },
  { name: "Noah B.", country: "GB", score: 49 },
  { name: "Amelia T.", country: "CA", score: 48 },
  { name: "Liam K.", country: "AU", score: 47 },
  { name: "Charlotte F.", country: "NZ", score: 46 },
  { name: "James H.", country: "IE", score: 45 },
  { name: "Emily S.", country: "US", score: 44 },
  { name: "Henry L.", country: "GB", score: 43 },
  { name: "Sophia R.", country: "CA", score: 42 },
  { name: "Jack M.", country: "AU", score: 41 },
  { name: "Grace P.", country: "NZ", score: 40 },
  { name: "Lucas C.", country: "IE", score: 39 },
  { name: "Ava N.", country: "US", score: 38 },
  { name: "Benjamin D.", country: "GB", score: 37 },
  { name: "Mia J.", country: "CA", score: 36 },
  { name: "William G.", country: "AU", score: 35 },
  { name: "Ella V.", country: "NZ", score: 34 },
  { name: "Alexander O.", country: "IE", score: 33 },
  { name: "Isla Q.", country: "US", score: 32 },
  { name: "Daniel A.", country: "GB", score: 31 },
  { name: "Sophie X.", country: "CA", score: 30 },
  { name: "Michael Z.", country: "AU", score: 29 },
  { name: "Ruby E.", country: "NZ", score: 28 },
  { name: "Ethan Y.", country: "IE", score: 27 },
  { name: "Lily I.", country: "US", score: 26 },
]

function getCountryFromBrowserLocale(): string {
  if (typeof navigator === "undefined") return "US"

  const localeCandidates = [navigator.language, ...navigator.languages].filter(Boolean)
  for (const locale of localeCandidates) {
    const normalized = locale.replace("_", "-")
    const parts = normalized.split("-")
    if (parts.length >= 2) {
      const region = parts[parts.length - 1].toUpperCase()
      if (/^[A-Z]{2}$/.test(region)) {
        return region
      }
    }
  }

  return "US"
}

type AdBreakBeforeRewardFn = (showAdFn: () => void) => void

type AdBreakOptions = {
  type: "rewarded"
  name?: string
  beforeReward?: AdBreakBeforeRewardFn
  adViewed?: () => void
  adDismissed?: () => void
  adBreakDone?: () => void
  adBreakEmpty?: () => void
}

declare global {
  interface Window {
    adsbygoogle?: unknown[]
    adBreak?: (options: AdBreakOptions) => void
    adConfig?: (options: Record<string, unknown>) => void
  }
}

export function WordGame() {
  const { state, actions, currentWord, isCurrentWordValid } = useWordGame()
  const t = useTranslations(state.language)

  const [selectedCountry, setSelectedCountry] = useState(getCountryFromBrowserLocale)
  const [rankingByLanguage, setRankingByLanguage] = useState<Record<"es" | "en", RankingEntry[]>>({
    es: INITIAL_RANKING,
    en: INITIAL_RANKING_EN,
  })
  const [nickname, setNickname] = useState("")
  const [recordSaved, setRecordSaved] = useState(false)

  const [isHintModalOpen, setIsHintModalOpen] = useState(false)
  const [isProcessingHintAd, setIsProcessingHintAd] = useState(false)

  const currentRanking = rankingByLanguage[state.language]

  const qualifyingRank = useMemo(() => {
    if (!state.gameOver) return null
    const index = currentRanking.findIndex((entry) => state.totalScore > entry.score)
    return index === -1 ? null : index + 1
  }, [currentRanking, state.gameOver, state.totalScore])

  const qualifiesForTop25 = qualifyingRank !== null
  const needsRecordSubmission = qualifiesForTop25 && !recordSaved

  const handleStartGame = (language: "es" | "en") => {
    setNickname("")
    setRecordSaved(false)
    setIsHintModalOpen(false)
    setIsProcessingHintAd(false)
    actions.startNewGame(language)
  }

  const handleSaveRecord = () => {
    const cleanName = nickname.trim()
    if (!cleanName) return

    setRankingByLanguage((prev) => {
      const targetRanking = prev[state.language]
      const updated = [...targetRanking, { name: cleanName, country: selectedCountry, score: state.totalScore }]
        .sort((a, b) => b.score - a.score)
        .slice(0, 25)

      return {
        ...prev,
        [state.language]: updated,
      }
    })

    setRecordSaved(true)
  }

  const handleHintRequest = () => {
    if (isProcessingHintAd) return
    setIsHintModalOpen(true)
  }

  const handleCloseHintModal = () => {
    if (isProcessingHintAd) return
    setIsHintModalOpen(false)
  }

  const grantHint = () => {
    setIsHintModalOpen(false)
    actions.useHint()
  }

  const handleWatchAd = () => {
    if (isProcessingHintAd) return
    setIsProcessingHintAd(true)

    // Nuestro "seguro de vida": si en 2.5 segundos AdSense no ha hecho nada 
    // (ni ha mostrado anuncio ni ha dado error), forzamos la pista.
    // Esto salva los bloqueos en localhost o con AdBlockers muy agresivos.
    let adTimeout: NodeJS.Timeout | null = setTimeout(() => {
      console.warn("AdSense no respondió a tiempo. Entregando pista de emergencia.")
      safeGrantHint()
    }, 2500)

    let finished = false

    const safeGrantHint = () => {
      if (finished) return
      finished = true
      if (adTimeout) clearTimeout(adTimeout)
      grantHint()
      setIsProcessingHintAd(false)
    }

    const safeStopLoading = () => {
      if (finished) return
      if (adTimeout) clearTimeout(adTimeout)
      setIsProcessingHintAd(false)
    }

    try {
      // Si la API no existe directamente en window
      if (typeof window === "undefined" || typeof window.adBreak !== "function") {
        safeGrantHint()
        return
      }

      window.adBreak({
        type: "rewarded",
        name: "hint_reward",
        beforeReward: (showAdFn) => {
          // Google responde que tiene un anuncio. Cancelamos el timeout para 
          // que el usuario pueda verlo tranquilo sin que salte la pista por detrás.
          if (adTimeout) clearTimeout(adTimeout)
          showAdFn()
        },
        adViewed: () => {
          // Vio el anuncio entero
          safeGrantHint()
        },
        adDismissed: () => {
          // Cerró el anuncio a la mitad
          setIsHintModalOpen(false)
          safeStopLoading()
        },
        adBreakEmpty: () => {
          // AdSense dice oficialmente "No tengo anuncios para ti hoy"
          safeGrantHint()
        },
        adBreakDone: () => {
          // Limpieza final de AdSense
          safeStopLoading()
        },
      })
    } catch (e) {
      console.error("Error lanzando adBreak:", e)
      safeGrantHint()
    }
  }

  if (!state.gameStarted && !state.gameOver) {
    return (
      <StartScreen
        onStartGame={handleStartGame}
        onLanguageChange={actions.setLanguage}
        isDictionaryLoading={state.dictionaryLoading}
        initialLanguage={state.language}
        initialCountry={selectedCountry}
        onCountryChange={setSelectedCountry}
        ranking={currentRanking}
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
          canSubmit={state.wordZone.length >= 3}
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
                    ? "La pista se mostrará después de un breve anuncio. Gracias por apoyar el juego."
                    : "The hint will be shown after a short ad. Thanks for supporting the game."}
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3">
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

              {needsRecordSubmission && (
                <div className="w-full space-y-3">
                  <p className="text-center text-sm font-medium text-foreground">
                    {t.gameOver.newRecordMessage} #{qualifyingRank}
                  </p>

                  <Input
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
                    placeholder={t.gameOver.nicknamePlaceholder}
                    maxLength={16}
                  />

                  <Button
                    onClick={handleSaveRecord}
                    className="w-full"
                    disabled={nickname.trim().length < 2}
                  >
                    {t.gameOver.saveRecord}
                  </Button>
                </div>
              )}

              {recordSaved && qualifiesForTop25 && (
                <p className="text-sm text-green-500">{t.gameOver.recordSaved}</p>
              )}

              <Button onClick={actions.goToHome} size="lg" disabled={needsRecordSubmission}>
                {t.gameOver.ok}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
