"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface GameStateContextType {
  isGameActive: boolean
  setIsGameActive: (active: boolean) => void
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined)

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [isGameActive, setIsGameActive] = useState(false)

  return (
    <GameStateContext.Provider value={{ isGameActive, setIsGameActive }}>
      {children}
    </GameStateContext.Provider>
  )
}

export function useGameState() {
  const context = useContext(GameStateContext)
  if (!context) {
    throw new Error("useGameState must be used within GameStateProvider")
  }
  return context
}
