import { NextResponse } from "next/server"

const NOT_FOUND_MESSAGE = "No se encontró el significado."

function normalizeGameWord(value: string): string {
  const placeholder = "__enie__"
  return value
    .trim()
    .toLowerCase()
    .replace(/ñ/g, placeholder)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(new RegExp(placeholder, "g"), "ñ")
}

function isDefinitionCandidate(value: string, word: string): boolean {
  const normalized = value.trim()
  if (normalized.length < 5) return false
  if (normalized.toLowerCase() === word) return false

  const excludedValues = new Set(["rae", "es", "f.", "m.", "adj.", "adv.", "prep.", "interj."])
  if (excludedValues.has(normalized.toLowerCase())) return false

  return true
}

function getFirstDefinition(value: unknown, word: string): string | null {
  if (typeof value === "string") {
    const normalized = value.trim()
    return isDefinitionCandidate(normalized, word) ? normalized : null
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = getFirstDefinition(item, word)
      if (nested) return nested
    }
    return null
  }

  if (value && typeof value === "object") {
    const objectValue = value as Record<string, unknown>
    const priorityKeys = [
      "definition",
      "definicion",
      "definición",
      "definitions",
      "meaning",
      "meanings",
      "text",
      "texto",
      "description",
      "descripcion",
      "descripción",
      "acepcion",
      "acepción",
      "acepciones",
      "entries",
      "entry",
      "senses",
      "sense",
      "results",
      "result",
      "data",
      "gloss",
      "content",
      "value",
    ]

    for (const key of priorityKeys) {
      if (key in objectValue) {
        const nested = getFirstDefinition(objectValue[key], word)
        if (nested) return nested
      }
    }
  }

  return null
}

async function fetchRaePayload(word: string): Promise<{ ok: boolean; payload: unknown | null }> {
  const response = await fetch(`https://rae-api.com/api/words/${encodeURIComponent(word)}`, {
    headers: {
      Authorization: `Bearer ${process.env.RAE_API_KEY ?? ""}`,
    },
    cache: "no-store",
  })

  try {
    const payload = (await response.json()) as unknown
    return { ok: response.ok, payload }
  } catch {
    return { ok: response.ok, payload: null }
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const rawWord = url.searchParams.get("word")
  const word = rawWord?.trim().toLowerCase()

  if (!word) {
    return NextResponse.json({ ok: false, error: NOT_FOUND_MESSAGE }, { status: 400 })
  }

  try {
    const firstLookup = await fetchRaePayload(word)
    let payload = firstLookup.payload
    let extractedDefinition = getFirstDefinition(payload, word)

    if (!firstLookup.ok || !extractedDefinition) {
      const suggestions = payload && typeof payload === "object" && Array.isArray((payload as Record<string, unknown>).suggestions)
        ? (payload as Record<string, unknown>).suggestions.filter((entry): entry is string => typeof entry === "string")
        : []

      const expectedWord = normalizeGameWord(word)
      const equivalentSuggestion = suggestions.find((suggestion) => {
        return normalizeGameWord(suggestion) === expectedWord
      })

      if (equivalentSuggestion) {
        const suggestionLookup = await fetchRaePayload(equivalentSuggestion)
        payload = suggestionLookup.payload
        extractedDefinition = getFirstDefinition(payload, equivalentSuggestion)
      }
    }

    if (!extractedDefinition) {
      return NextResponse.json({ ok: false, error: NOT_FOUND_MESSAGE })
    }

    return NextResponse.json({
      ok: true,
      definition: extractedDefinition,
      source: "RAE",
    })
  } catch {
    return NextResponse.json({ ok: false, error: NOT_FOUND_MESSAGE })
  }
}
