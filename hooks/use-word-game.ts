"use client"

import { useState, useCallback, useMemo, useEffect } from "react"

// Scrabble letter frequencies for Spanish
const LETTER_DISTRIBUTION_ES: Record<string, { count: number; points: number }> = {
  A: { count: 12, points: 1 },
  E: { count: 12, points: 1 },
  O: { count: 9, points: 1 },
  I: { count: 6, points: 1 },
  S: { count: 6, points: 1 },
  N: { count: 5, points: 1 },
  L: { count: 4, points: 1 },
  R: { count: 5, points: 1 },
  U: { count: 5, points: 1 },
  T: { count: 4, points: 1 },
  D: { count: 5, points: 2 },
  G: { count: 2, points: 2 },
  C: { count: 4, points: 3 },
  B: { count: 2, points: 3 },
  M: { count: 2, points: 3 },
  P: { count: 2, points: 3 },
  H: { count: 2, points: 4 },
  F: { count: 1, points: 4 },
  V: { count: 1, points: 4 },
  Y: { count: 1, points: 4 },
  Q: { count: 1, points: 5 },
  J: { count: 1, points: 8 },
  Ñ: { count: 1, points: 8 },
  X: { count: 1, points: 8 },
  Z: { count: 1, points: 10 },
}

// Scrabble letter frequencies for English
const LETTER_DISTRIBUTION_EN: Record<string, { count: number; points: number }> = {
  A: { count: 9, points: 1 },
  B: { count: 2, points: 3 },
  C: { count: 2, points: 3 },
  D: { count: 4, points: 2 },
  E: { count: 12, points: 1 },
  F: { count: 2, points: 4 },
  G: { count: 3, points: 2 },
  H: { count: 2, points: 4 },
  I: { count: 9, points: 1 },
  J: { count: 1, points: 8 },
  K: { count: 1, points: 5 },
  L: { count: 4, points: 1 },
  M: { count: 2, points: 3 },
  N: { count: 6, points: 1 },
  O: { count: 8, points: 1 },
  P: { count: 2, points: 3 },
  Q: { count: 1, points: 10 },
  R: { count: 6, points: 1 },
  S: { count: 4, points: 1 },
  T: { count: 6, points: 1 },
  U: { count: 4, points: 1 },
  V: { count: 2, points: 4 },
  W: { count: 2, points: 4 },
  X: { count: 1, points: 8 },
  Y: { count: 2, points: 4 },
  Z: { count: 1, points: 10 },
}

// Mock valid words for demo (Spanish)
const MOCK_VALID_WORDS_ES = new Set([
  "SOL", "MAR", "CASA", "MESA", "LUNA", "AMOR", "VIDA", "AGUA",
  "CIELO", "TIERRA", "FUEGO", "AIRE", "NOCHE", "DIA", "LUZ",
  "HOLA", "BIEN", "MAL", "FELIZ", "TRISTE", "GRANDE", "ROJO",
  "AZUL", "VERDE", "BLANCO", "NEGRO", "ORO", "PLATA", "PERRO",
  "GATO", "PATO", "RATA", "LEON", "OSO", "LOBO", "ZORRO",
  "TREN", "AUTO", "AVION", "BARCO", "BICI", "MOTO", "BUS",
  "PAN", "SAL", "RON", "TEN", "SON", "SER", "VER", "DAR",
  "ROSA", "FLOR", "ARBOL", "HOJA", "RAMA", "RAIZ", "SOL",
  "MANO", "PIE", "OJO", "NARIZ", "BOCA", "OREJA", "DEDO",
  "COMER", "BEBER", "DORMIR", "SALTAR", "CORRER", "NADAR",
  "JUGAR", "CANTAR", "BAILAR", "REIR", "LLORAR", "SOÑAR",
  "LIBRO", "PAPEL", "LAPIZ", "MESA", "SILLA", "CAMA", "PUERTA",
  "NUEVO", "VIEJO", "ALTO", "BAJO", "LARGO", "CORTO", "ANCHO",
])

// Mock valid words for demo (English)
const MOCK_VALID_WORDS_EN = new Set([
  "SUN", "MOON", "STAR", "HOUSE", "TABLE", "WATER", "FIRE", "AIR",
  "EARTH", "NIGHT", "DAY", "LIGHT", "HELLO", "HAPPY", "GREEN", "BLUE",
  "RED", "BLACK", "WHITE", "GOLD", "SILVER", "DOG", "CAT", "LION",
  "TREE", "FLOWER", "ROOT", "LEAF", "HAND", "EYE", "NOSE", "MOUTH",
  "BOOK", "PAPER", "CHAIR", "BED", "DOOR", "NEW", "OLD", "HIGH",
  "LOW", "LONG", "SHORT", "WIDE", "EAT", "DRINK", "SLEEP", "RUN",
  "SWIM", "PLAY", "SING", "DANCE", "DREAM", "SMILE",
])

// Mock word definitions
const MOCK_DEFINITIONS: Record<string, string> = {
  SOL: "Estrella que ilumina la Tierra durante el día.",
  MAR: "Gran extensión de agua salada.",
  CASA: "Edificio para habitar.",
  LUNA: "Satélite natural de la Tierra.",
  AMOR: "Sentimiento de afecto intenso.",
  VIDA: "Estado de actividad de los seres orgánicos.",
  AGUA: "Sustancia líquida sin olor ni color.",
  CIELO: "Espacio infinito en el que se mueven los astros.",
  TIERRA: "Planeta del sistema solar habitado por el ser humano.",
  FUEGO: "Calor y luz producidos por la combustión.",
  AIRE: "Mezcla gaseosa que forma la atmósfera.",
  NOCHE: "Tiempo en que falta la luz del Sol.",
  DIA: "Tiempo que la Tierra emplea en dar una vuelta.",
  LUZ: "Agente físico que hace visibles los objetos.",
  HOLA: "Expresión de saludo.",
  BIEN: "De manera adecuada o conveniente.",
  FELIZ: "Que tiene felicidad.",
  GRANDE: "Que excede a lo común en tamaño.",
  ROJO: "Color de la sangre.",
  AZUL: "Color del cielo sin nubes.",
  VERDE: "Color de la hierba.",
  ORO: "Metal precioso de color amarillo.",
  PERRO: "Mamífero doméstico canino.",
  GATO: "Mamífero doméstico felino.",
  LEON: "Gran felino africano.",
  PAN: "Alimento hecho con harina y agua.",
  SAL: "Sustancia cristalina de sabor salado.",
  ROSA: "Flor del rosal.",
  FLOR: "Órgano reproductor de las plantas.",
  MANO: "Parte del cuerpo al extremo del brazo.",
  OJO: "Órgano de la visión.",
  LIBRO: "Conjunto de hojas impresas y encuadernadas.",
}

export interface Letter {
  id: string
  char: string
  points: number
  columnIndex: number
  originalColumnIndex: number
}

export interface GameState {
  columns: Letter[][]
  wordZone: Letter[]
  partialScore: number
  totalScore: number
  gameStarted: boolean
  gameOver: boolean
  hintLetters: string[]
  lastValidWord: string | null
  lastWordPoints: number
  lastWordBonus: number
  lastWordDefinition: string | null
  showResultDialog: boolean
  language: "es" | "en"
  dictionaryLoading: boolean
  dictionaryLoaded: boolean
}

// Global dictionary cache
let spanishDictionary: Set<string> | null = null
let dictionaryLoadPromise: Promise<Set<string>> | null = null
let englishDictionary: Set<string> | null = null
let englishDictionaryLoadPromise: Promise<Set<string>> | null = null

async function loadSpanishDictionary(): Promise<Set<string>> {
  if (spanishDictionary) return spanishDictionary
  
  if (dictionaryLoadPromise) return dictionaryLoadPromise
  
  console.log("[v0] Starting to load Spanish dictionary...")
  
  dictionaryLoadPromise = fetch("/api/dictionary")
    .then((response) => {
      console.log("[v0] Dictionary fetch response:", response.status, response.ok)
      if (!response.ok) {
        throw new Error(`Failed to load dictionary: ${response.status}`)
      }
      return response.text()
    })
    .then((text) => {
      console.log("[v0] Dictionary text length:", text.length)
      const words = text
        .split("\n")
        .map((word) => word.trim().toUpperCase())
        .filter((word) => word.length >= 3)
      console.log("[v0] Loaded", words.length, "words from dictionary")
      spanishDictionary = new Set(words)
      return spanishDictionary
    })
    .catch((error) => {
      console.error("[v0] Error loading Spanish dictionary:", error)
      // Fall back to mock words if dictionary fails to load
      spanishDictionary = MOCK_VALID_WORDS_ES
      return spanishDictionary
    })
  
  return dictionaryLoadPromise
}

async function loadEnglishDictionary(): Promise<Set<string>> {
  if (englishDictionary) return englishDictionary

  if (englishDictionaryLoadPromise) return englishDictionaryLoadPromise

  englishDictionaryLoadPromise = fetch("/dictionaries/dicc_en_en.txt")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load dictionary: ${response.status}`)
      }
      return response.text()
    })
    .then((text) => {
      const words = text
        .split("\n")
        .map((word) => word.trim().toUpperCase())
        .filter((word) => word.length >= 3)
      englishDictionary = new Set(words)
      return englishDictionary
    })
    .catch(() => {
      englishDictionary = MOCK_VALID_WORDS_EN
      return englishDictionary
    })

  return englishDictionaryLoadPromise
}

const NUM_COLUMNS = 9
const LETTERS_PER_COLUMN = 6
const VOWELS_ES = new Set(["A", "E", "I", "O", "U"])
const VOWELS_EN = new Set(["A", "E", "I", "O", "U"])
const VOWEL_MULTIPLIER = 1.25
const CONSONANT_MULTIPLIER = 0.92

function getLetterDistribution(language: "es" | "en"): Record<string, { count: number; points: number }> {
  return language === "en" ? LETTER_DISTRIBUTION_EN : LETTER_DISTRIBUTION_ES
}

function generateLetterPool(language: "es" | "en"): string[] {
  const distribution = getLetterDistribution(language)
  const vowels = language === "en" ? VOWELS_EN : VOWELS_ES
  const pool: string[] = []
  for (const [letter, { count }] of Object.entries(distribution)) {
    const multiplier = vowels.has(letter) ? VOWEL_MULTIPLIER : CONSONANT_MULTIPLIER
    const adjustedCount = Math.max(1, Math.round(count * multiplier))
    for (let i = 0; i < adjustedCount; i++) {
      pool.push(letter)
    }
  }
  return pool
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

function generateInitialColumns(language: "es" | "en"): Letter[][] {
  const distribution = getLetterDistribution(language)
  const pool = shuffleArray(generateLetterPool(language))
  const columns: Letter[][] = []
  let letterIndex = 0
  let idCounter = 0

  for (let col = 0; col < NUM_COLUMNS; col++) {
    const column: Letter[] = []
    for (let row = 0; row < LETTERS_PER_COLUMN; row++) {
      const char = pool[letterIndex % pool.length]
      column.push({
        id: `letter-${idCounter++}`,
        char,
        points: distribution[char]?.points || 1,
        columnIndex: col,
        originalColumnIndex: col,
      })
      letterIndex++
    }
    columns.push(column)
  }
  return columns
}

function checkWord(word: string, language: "es" | "en"): boolean {
  if (language === "es" && spanishDictionary) {
    return spanishDictionary.has(word.toUpperCase())
  }
  if (language === "en") {
    if (englishDictionary) {
      return englishDictionary.has(word.toUpperCase())
    }
    return MOCK_VALID_WORDS_EN.has(word.toUpperCase())
  }

  // Fallback to Spanish mock words if dictionary is not loaded
  return MOCK_VALID_WORDS_ES.has(word.toUpperCase())
}

function getDefinition(word: string): string {
  return MOCK_DEFINITIONS[word.toUpperCase()] || "Palabra válida en español."
}

function calculateBonus(wordLength: number): number {
  if (wordLength >= 9) return 25
  if (wordLength >= 8) return 15
  if (wordLength >= 7) return 10
  if (wordLength >= 6) return 5
  return 0
}

function findHintCombination(columns: Letter[][], language: "es" | "en"): { letterIds: string[]; word: string | null } {
  // Get top letters from each non-empty column
  const topLetters: { letter: Letter; colIndex: number }[] = []
  columns.forEach((col, colIndex) => {
    if (col.length > 0) {
      topLetters.push({ letter: col[0], colIndex })
    }
  })

  // Use the appropriate dictionary
  const dictionary = language === "es"
    ? spanishDictionary ?? MOCK_VALID_WORDS_ES
    : englishDictionary ?? MOCK_VALID_WORDS_EN

  // Try to find a valid word from top letters
  for (const word of dictionary) {
    const wordLetters = word.split("")
    const usedIndices: number[] = []
    let found = true

    for (const char of wordLetters) {
      const availableIndex = topLetters.findIndex(
        (tl, idx) => tl.letter.char === char && !usedIndices.includes(idx)
      )
      if (availableIndex === -1) {
        found = false
        break
      }
      usedIndices.push(availableIndex)
    }

    if (found && usedIndices.length >= 3) {
      return {
        letterIds: usedIndices.map((idx) => topLetters[idx].letter.id),
        word,
      }
    }
  }

  return { letterIds: [], word: null }
}

function checkNoMoreMoves(columns: Letter[][], language: "es" | "en"): boolean {
  // Simple check: if all columns are empty
  const totalLetters = columns.reduce((sum, col) => sum + col.length, 0)
  if (totalLetters === 0) return true

  // Check if any 3-letter combo is possible from top letters
  const hintResult = findHintCombination(columns, language)
  if (hintResult.word) {
    console.log(`[word-game] Continuar: palabra disponible encontrada por el algoritmo: ${hintResult.word}`)
  }
  return hintResult.letterIds.length === 0
}

export function useWordGame() {
  const [state, setState] = useState<GameState>({
    columns: [],
    wordZone: [],
    partialScore: 0,
    totalScore: 0,
    gameStarted: false,
    gameOver: false,
    hintLetters: [],
    lastValidWord: null,
    lastWordPoints: 0,
    lastWordBonus: 0,
    lastWordDefinition: null,
    showResultDialog: false,
    language: "es",
    dictionaryLoading: false,
    dictionaryLoaded: spanishDictionary !== null,
  })

  // Load language dictionary on demand
  useEffect(() => {
    const shouldLoadSpanish = state.language === "es" && !spanishDictionary
    const shouldLoadEnglish = state.language === "en" && !englishDictionary

    if (!state.dictionaryLoading && (shouldLoadSpanish || shouldLoadEnglish)) {
      setState((prev) => ({ ...prev, dictionaryLoading: true }))

      const loadDictionary = shouldLoadSpanish
        ? loadSpanishDictionary
        : loadEnglishDictionary

      loadDictionary().then(() => {
        setState((prev) => ({
          ...prev,
          dictionaryLoading: false,
          dictionaryLoaded: true,
        }))
      })
    }
  }, [state.language, state.dictionaryLoading])

  const startNewGame = useCallback((language: "es" | "en" = "es") => {
    setState((prev) => ({
      columns: generateInitialColumns(language),
      wordZone: [],
      partialScore: 0,
      totalScore: 0,
      gameStarted: true,
      gameOver: false,
      hintLetters: [],
      lastValidWord: null,
      lastWordPoints: 0,
      lastWordBonus: 0,
      lastWordDefinition: null,
      showResultDialog: false,
      language,
      dictionaryLoading: prev.dictionaryLoading,
      dictionaryLoaded: prev.dictionaryLoaded,
    }))
  }, [])

  const setLanguage = useCallback((language: "es" | "en") => {
    setState((prev) => ({
      ...prev,
      language,
    }))
  }, [])

  const selectLetter = useCallback((letterId: string) => {
    setState((prev) => {
      if (!prev.gameStarted || prev.gameOver) return prev

      // Find the letter in columns (only top letter can be selected)
      for (let colIndex = 0; colIndex < prev.columns.length; colIndex++) {
        const column = prev.columns[colIndex]
        if (column.length > 0 && column[0].id === letterId) {
          const letter = column[0]
          const newColumns = prev.columns.map((col, idx) =>
            idx === colIndex ? col.slice(1) : col
          )
          return {
            ...prev,
            columns: newColumns,
            wordZone: [...prev.wordZone, letter],
            hintLetters: [],
          }
        }
      }
      return prev
    })
  }, [])

  const returnLetter = useCallback((letterId: string) => {
    setState((prev) => {
      const letterIndex = prev.wordZone.findIndex((l) => l.id === letterId)
      if (letterIndex === -1) return prev

      const letter = prev.wordZone[letterIndex]
      const newWordZone = prev.wordZone.filter((l) => l.id !== letterId)
      const newColumns = prev.columns.map((col, idx) => {
        if (idx === letter.originalColumnIndex) {
          return [letter, ...col]
        }
        return col
      })

      return {
        ...prev,
        columns: newColumns,
        wordZone: newWordZone,
        hintLetters: [],
      }
    })
  }, [])

  // Always return the last letter (LIFO behavior)
  const returnLastLetter = useCallback(() => {
    setState((prev) => {
      if (prev.wordZone.length === 0) return prev

      const letter = prev.wordZone[prev.wordZone.length - 1]
      const newWordZone = prev.wordZone.slice(0, -1)
      const newColumns = prev.columns.map((col, idx) => {
        if (idx === letter.originalColumnIndex) {
          return [letter, ...col]
        }
        return col
      })

      return {
        ...prev,
        columns: newColumns,
        wordZone: newWordZone,
        hintLetters: [],
      }
    })
  }, [])

  const submitWord = useCallback(() => {
    setState((prev) => {
      if (prev.wordZone.length < 3) return prev

      const word = prev.wordZone.map((l) => l.char).join("")
      const isValid = checkWord(word, prev.language)

      if (!isValid) {
        // Return all letters to their columns
        let newColumns = [...prev.columns]
        for (const letter of prev.wordZone) {
          newColumns = newColumns.map((col, idx) => {
            if (idx === letter.originalColumnIndex) {
              return [letter, ...col]
            }
            return col
          })
        }
        return {
          ...prev,
          columns: newColumns,
          wordZone: [],
          hintLetters: [],
        }
      }

      // Calculate points from current word
      const basePoints = prev.wordZone.reduce((sum, l) => sum + l.points, 0)
      const bonus = calculateBonus(prev.wordZone.length)
      const wordPoints = basePoints + bonus
      const definition = getDefinition(word)

      // Check for board cleared bonus
      const boardCleared = prev.columns.every((col) => col.length === 0)
      const clearBonus = boardCleared ? 100 : 0

      // Add word points to total score (partial resets after accumulating)
      const newTotalScore = prev.totalScore + wordPoints + clearBonus

      // Check if game is over
      const noMoreMoves = checkNoMoreMoves(prev.columns, prev.language)

      return {
        ...prev,
        wordZone: [],
        totalScore: newTotalScore,
        lastValidWord: word,
        lastWordPoints: wordPoints,
        lastWordBonus: bonus,
        lastWordDefinition: definition,
        showResultDialog: true,
        gameOver: boardCleared || noMoreMoves,
        hintLetters: [],
      }
    })
  }, [])

  const useHint = useCallback(() => {
    setState((prev) => {
      if (prev.totalScore < 25) return prev

      const hintResult = findHintCombination(prev.columns, prev.language)
      if (hintResult.letterIds.length === 0) return prev
      if (hintResult.word) {
        console.log(`[word-game] Pista: palabra sugerida por el algoritmo: ${hintResult.word}`)
      }

      return {
        ...prev,
        totalScore: prev.totalScore - 25,
        hintLetters: hintResult.letterIds,
      }
    })
  }, [])

  const giveUp = useCallback(() => {
    setState((prev) => ({
      ...prev,
      gameOver: true,
      gameStarted: false,
    }))
  }, [])

  const closeResultDialog = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showResultDialog: false,
    }))
  }, [])

  // Reset game and go back to home screen
  const goToHome = useCallback(() => {
    setState((prev) => ({
      columns: [],
      wordZone: [],
      partialScore: 0,
      totalScore: 0,
      gameStarted: false,
      gameOver: false,
      hintLetters: [],
      lastValidWord: null,
      lastWordPoints: 0,
      lastWordBonus: 0,
      lastWordDefinition: null,
      showResultDialog: false,
      language: prev.language,
      dictionaryLoading: prev.dictionaryLoading,
      dictionaryLoaded: prev.dictionaryLoaded,
    }))
  }, [])

  const currentWord = useMemo(
    () => state.wordZone.map((l) => l.char).join(""),
    [state.wordZone]
  )

  // Calculate partial score dynamically from word zone letters
  const partialScore = useMemo(() => {
    return state.wordZone.reduce((sum, letter) => sum + letter.points, 0)
  }, [state.wordZone])

  // Check if current word is valid (minimum 3 letters)
  const isCurrentWordValid = useMemo(() => {
    if (state.wordZone.length < 3) return false
    return checkWord(currentWord, state.language)
  }, [currentWord, state.wordZone.length, state.language])

  return {
    state: {
      ...state,
      partialScore, // Override with calculated value
    },
    isCurrentWordValid,
    actions: {
      startNewGame,
      setLanguage,
      selectLetter,
      returnLetter,
      returnLastLetter,
      submitWord,
      useHint,
      giveUp,
      closeResultDialog,
      goToHome,
    },
    currentWord,
  }
}
