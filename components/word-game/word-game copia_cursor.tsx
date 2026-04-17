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
      {/* Header with scores */}
      <div className="shrink-0 px-4 py-4">
        <ScoreDisplay
          partialScore={state.partialScore}
          totalScore={state.totalScore}
          language={state.language}
        />
      </div>

      {/* Word construction zone */}
      <div className="shrink-0 px-4 py-2">
        <WordZone
          letters={state.wordZone}
          onReturnLastLetter={actions.returnLastLetter}
          isValid={isCurrentWordValid}
          language={state.language}
        />
      </div>

      {/* Game controls */}
      <div className="shrink-0 py-3">
        <GameControls
          canSubmit={state.wordZone.length >= 3}
          canUseHint={state.totalScore >= 25}
          onSubmit={actions.submitWord}
          onHint={actions.useHint}
          onGiveUp={actions.giveUp}
          totalScore={state.totalScore}
          language={state.language}
        />
      </div>

      {/* Game board - fills remaining space */}
      <div className="flex-1 overflow-hidden">
        <GameBoard
          columns={state.columns}
          hintLetters={state.hintLetters}
          onSelectLetter={actions.selectLetter}
        />
      </div>

      {/* Result dialog */}
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

      {/* Game Over Overlay */}
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
