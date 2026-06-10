"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useMemo, useState, useEffect } from "react"
import { useWordGame } from "@/hooks/use-word-game"
import { useGameState } from "@/components/game-state-provider"
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

function getLanguageFromBrowserLocale(): "es" | "en" {
  if (typeof navigator === "undefined") return "es" 

  const browserLang = navigator.language || (navigator as any).userLanguage
  if (browserLang && browserLang.toLowerCase().startsWith("en")) {
    return "en"
  }
  
  return "es" 
}


export function WordGame() {
  const { state, actions, currentWord, isCurrentWordValid } = useWordGame()
  const { setIsGameActive } = useGameState()
  const t = useTranslations(state.language)

  const [selectedCountry, setSelectedCountry] = useState(getCountryFromBrowserLocale)
  
  const [rankingByLanguage, setRankingByLanguage] = useState<Record<"es" | "en", RankingEntry[]>>({
    es: INITIAL_RANKING,
    en: INITIAL_RANKING,
  })
  
  const [nickname, setNickname] = useState("")
  const [recordSaved, setRecordSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [isHintModalOpen, setIsHintModalOpen] = useState(false)
  const [isProcessingHintAd, setIsProcessingHintAd] = useState(false)

  useEffect(() => {
    const detectedLanguage = getLanguageFromBrowserLocale()
    if (state.language !== detectedLanguage) {
        actions.setLanguage(detectedLanguage)
    }
  }, []) 
  
  useEffect(() => {
    async function fetchRankings() {
      try {
        const [resEs, resEn] = await Promise.all([
          fetch('/api/ranking?lang=es'),
          fetch('/api/ranking?lang=en')
        ]);
        
        if (resEs.ok && resEn.ok) {
          const dataEs = await resEs.json();
          const dataEn = await resEn.json();
          
          setRankingByLanguage({
            es: dataEs.ranking || INITIAL_RANKING,
            en: dataEn.ranking || INITIAL_RANKING
          });
        }
      } catch (error) {
        console.error("Error loading rankings:", error)
      }
    }

    fetchRankings()
  }, [])

  useEffect(() => {
    const isGamePlaying = state.gameStarted && !state.gameOver
    setIsGameActive(isGamePlaying)
  }, [state.gameStarted, state.gameOver, setIsGameActive])

  const currentRanking = rankingByLanguage[state.language];

  const qualifyingRank = useMemo(() => {
    if (!state.gameOver) return null
    const index = currentRanking.findIndex((entry) => state.totalScore > entry.score)
    
    if (index === -1 && currentRanking.length < 25 && state.totalScore > 0) {
      return currentRanking.length + 1
    }
    
    return index === -1 ? null : index + 1
  }, [currentRanking, state.gameOver, state.totalScore])

  const qualifiesForTop25 = qualifyingRank !== null && state.totalScore > 0
  const needsRecordSubmission = qualifiesForTop25 && !recordSaved

  const handleStartGame = (language: "es" | "en") => {
    setNickname("")
    setRecordSaved(false)
    setIsHintModalOpen(false)
    setIsProcessingHintAd(false)
    actions.startNewGame(language)
  }

  const handleSaveRecord = async () => {
    const cleanName = nickname.trim()
    if (!cleanName || isSaving) return

    setIsSaving(true)

    console.log(`[PalabraMaster] Guardando récord de ${cleanName} con palabras:`, state.foundWords)

    try {
      const response = await fetch('/api/ranking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          country: selectedCountry,
          score: state.totalScore,
          lang: state.language,
          words: state.foundWords 
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.ranking) {
          setRankingByLanguage(prev => ({
            ...prev,
            [state.language]: data.ranking
          }))
          setRecordSaved(true)
        }
      }
    } catch (error) {
      console.error("Error saving record:", error)
      setRankingByLanguage((prev) => {
        const updated = [...prev[state.language], { 
          name: cleanName, 
          country: selectedCountry, 
          score: state.totalScore,
          words: state.foundWords 
        } as RankingEntry] 
          .sort((a, b) => b.score - a.score)
          .slice(0, 25)
        return { ...prev, [state.language]: updated }
      })
      setRecordSaved(true)
    } finally {
      setIsSaving(false)
    }
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

    let adTimeout: NodeJS.Timeout | null = setTimeout(() => {
      safeGrantHint()
    }, 8000)

    let finished = false

    const safeGrantHint = () => {
      if (finished) return
      finished = true
      if (adTimeout) clearTimeout(adTimeout)
      grantHint()
      setIsProcessingHintAd(false)
    }

    try {
      if (typeof window !== "undefined") {
        const s = document.createElement('script')
        s.dataset.zone = '11126455'
        s.src = 'https://n6wxm.com/vignette.min.js'
        
        const target = [document.documentElement, document.body].filter(Boolean).pop()
        
        if (target) {
          target.appendChild(s)
          
          setTimeout(() => {
             safeGrantHint()
          }, 1500)
        } else {
          safeGrantHint()
        }
      } else {
        safeGrantHint()
      }
    } catch (e) {
      console.error("Error lanzando el anuncio de Monetag:", e)
      safeGrantHint()
    }
  }

  if (!state.gameStarted && !state.gameOver) {
    return (
      <StartScreen
        key={state.language} 
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
          canSubmit={isCurrentWordValid} 
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
                    disabled={isSaving}
                  />

                  <Button
                    onClick={handleSaveRecord}
                    className="w-full"
                    disabled={nickname.trim().length < 2 || isSaving}
                  >
                    {isSaving ? (state.language === 'es' ? "Guardando..." : "Saving...") : t.gameOver.saveRecord}
                  </Button>
                </div>
              )}

              {recordSaved && qualifiesForTop25 && (
                <p className="text-sm text-green-500">{t.gameOver.recordSaved}</p>
              )}

              <Button onClick={actions.goToHome} size="lg" disabled={needsRecordSubmission || isSaving}>
                {t.gameOver.ok}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}