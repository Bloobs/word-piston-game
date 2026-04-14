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
      <div className="flex flex-1 items-start justify-center gap-1 px-2 pt-4 sm:gap-2 sm:px-4">
        {columns.map((column, colIndex) => (
          <div
            key={colIndex}
            className="flex flex-col gap-1 sm:gap-2"
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
