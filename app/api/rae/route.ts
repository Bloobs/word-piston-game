import { NextResponse } from "next/server"

const NOT_FOUND_MESSAGE = "No se encontró el significado."

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

export async function GET(request: Request) {
  const url = new URL(request.url)
  const rawWord = url.searchParams.get("word")
  const word = rawWord?.trim().toLowerCase()

  if (!word) {
    return NextResponse.json({ ok: false, error: NOT_FOUND_MESSAGE }, { status: 400 })
  }

  try {
    const response = await fetch(`https://rae-api.com/api/words/${encodeURIComponent(word)}`, {
      headers: {
        Authorization: `Bearer ${process.env.RAE_API_KEY ?? ""}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json({ ok: false, error: NOT_FOUND_MESSAGE })
    }

    const payload: unknown = await response.json()
    const extractedDefinition = getFirstDefinition(payload, word)

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
