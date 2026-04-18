"use client"

import { AnimatePresence, LayoutGroup } from "framer-motion"
import { LetterTile } from "./letter-tile"
import type { Letter } from "@/hooks/use-word-game"

interface GameBoardProps {
  columns: Letter[][]
  hintLetters: string[]
  onSelectLetter: (id: string) => void
}

export function GameBoard({
  columns,
  hintLetters,
  onSelectLetter,
}: GameBoardProps) {
  return (
    <LayoutGroup>
      {/* Hemos quitado los padding laterales grandes y reducido el gap horizontal a casi nada (gap-[2px]) para que entren 9 columnas */}
      <div className="flex flex-1 items-start justify-center gap-[2px] sm:gap-2 px-1 pt-4 w-full max-w-3xl mx-auto">
        {columns.map((column, colIndex) => (
          <div
            key={colIndex}
            // flex-1 hace que cada columna ocupe su fracción exacta (1/9)
            className="flex flex-1 flex-col gap-1 sm:gap-2 max-w-[48px] sm:max-w-[56px]" 
          >
            <AnimatePresence mode="popLayout">
              {column.map((letter, rowIndex) => (
                <LetterTile
                  key={letter.id}
                  letter={letter}
                  onClick={() => onSelectLetter(letter.id)}
                  isTop={rowIndex === 0}
                  isHint={hintLetters.includes(letter.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </LayoutGroup>
  )
}
