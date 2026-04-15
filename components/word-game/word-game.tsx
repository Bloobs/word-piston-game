"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useWordGame } from "@/hooks/use-word-game"
import { StartScreen } from "./start-screen"
import { ScoreDisplay } from "./score-display"
import { WordZone } from "./word-zone"
import { GameBoard } from "./game-board"
import { GameControls } from "./game-controls"
import { ResultDialog } from "./result-dialog"
import { Button } from "@/components/ui/button"
import { Trophy } from "lucide-react"

export function WordGame() {
  const { state, actions, currentWord, isCurrentWordValid } = useWordGame()

  if (!state.gameStarted && !state.gameOver) {
    return (
      <StartScreen
        onStartGame={actions.startNewGame}
        isDictionaryLoading={state.dictionaryLoading}
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
        />
      </div>

      {/* Word construction zone */}
      <div className="shrink-0 px-4 py-2">
        <WordZone
          letters={state.wordZone}
          onReturnLastLetter={actions.returnLastLetter}
          isValid={isCurrentWordValid}
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
              <h2 className="text-3xl font-bold text-foreground">Fin de Partida</h2>
              <div className="text-center">
                <p className="text-muted-foreground">Puntuación Final</p>
                <p className="text-5xl font-bold text-primary">{state.totalScore}</p>
              </div>
              <Button onClick={actions.goToHome} size="lg">
                OK
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
