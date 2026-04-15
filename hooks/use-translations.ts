"use client"

import en from "@/messages/en.json"
import es from "@/messages/es.json"

type Language = "es" | "en"
type Messages = typeof es

const MESSAGES: Record<Language, Messages> = {
  es,
  en,
}

export function useTranslations(language: Language): Messages {
  return MESSAGES[language] ?? MESSAGES.es
}
