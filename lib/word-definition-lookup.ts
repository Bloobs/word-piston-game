export type WordDefinitionLanguage = "es" | "en"

export type WordDefinitionLookupResult =
  | {
      status: "available"
      definition: string
      source: "RAE" | "Wiktionary"
    }
  | { status: "unavailable" }

type AvailableWordDefinitionLookupResult = Extract<
  WordDefinitionLookupResult,
  { status: "available" }
>

export function getDefinitionFallback(
  language: WordDefinitionLanguage,
  value: string | null
): string | null {
  if (language !== "es" || !value) return null
  const normalized = value.trim()
  return normalized.length >= 5 ? normalized : null
}

export function isCurrentDefinitionLookup(
  requestKey: string,
  currentKey: string | null
): boolean {
  return requestKey === currentKey
}

type DefinitionLookupTimeouts = {
  rae: number
}

const DEFAULT_REQUEST_TIMEOUTS_MS: Readonly<DefinitionLookupTimeouts> = {
  rae: 5_000,
}

type JsonResponse =
  | { ok: true; value: unknown }
  | { ok: false; reason: "http" | "network" | "timeout" | "invalid-json" }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function decodeHtmlEntities(value: string): string {
  return value.replace(
    /&(#(?:x[0-9a-f]+|\d+)|amp|lt|gt|quot|apos|nbsp);/gi,
    (entity, token: string) => {
      const normalizedToken = token.toLowerCase()
      if (normalizedToken === "amp") return "&"
      if (normalizedToken === "lt") return "<"
      if (normalizedToken === "gt") return ">"
      if (normalizedToken === "quot") return '"'
      if (normalizedToken === "apos" || normalizedToken === "#39") return "'"
      if (normalizedToken === "nbsp") return " "

      const codePoint = normalizedToken.startsWith("#x")
        ? Number.parseInt(normalizedToken.slice(2), 16)
        : Number.parseInt(normalizedToken.slice(1), 10)
      return Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : entity
    }
  )
}

function normalizeDefinition(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

function cleanWiktionaryDefinition(value: string): string | null {
  const definition = normalizeDefinition(
    decodeHtmlEntities(value)
      .replace(/<(style|script|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
      .replace(/\{\{[\s\S]*?\}\}/g, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(
        /(?:^|\s)[.#][\w-]+(?:\s+[.#][\w-]+)*\s*\{[^{}]*\}/gi,
        " "
      )
      .replace(/\b(?:mw-parser-output|defdate)\b/gi, " ")
      .replace(
        /\b(?:font-size|font-family|font-weight|line-height|margin|padding|display|position|color|background(?:-color)?)\s*:\s*[^;\s}]+;?/gi,
        " "
      )
  )

  if (
    !definition ||
    /(?:<\s*\/?\s*[a-z][^>]*>|\{\{|\}\}|(?:^|\s)[.#][\w-]+(?:\s+[.#][\w-]+)*\s*\{|\b(?:mw-parser-output|defdate|font-size|font-family|line-height)\s*:|@(?:media|supports|font-face)\b)/i.test(
      definition
    )
  ) {
    return null
  }

  return definition
}

function extractRaeDefinition(payload: unknown): string | null {
  if (!isRecord(payload) || !isRecord(payload.data)) return null
  const meanings = payload.data.meanings
  if (!Array.isArray(meanings)) return null

  for (const meaning of meanings) {
    if (!isRecord(meaning) || !Array.isArray(meaning.senses)) continue
    for (const sense of meaning.senses) {
      if (!isRecord(sense)) continue
      const description =
        typeof sense.description === "string"
          ? sense.description
          : typeof sense.raw === "string"
            ? sense.raw
            : null
      if (description?.trim()) return description.trim()
    }
  }
  return null
}

function extractWiktionaryDefinition(payload: unknown): string | null {
  if (!isRecord(payload) || !Array.isArray(payload.en)) return null

  for (const entry of payload.en) {
    if (!isRecord(entry) || !Array.isArray(entry.definitions)) continue
    for (const item of entry.definitions) {
      if (isRecord(item) && typeof item.definition === "string") {
        const definition = cleanWiktionaryDefinition(item.definition)
        if (definition) return definition
      }
    }
  }
  return null
}

async function requestJson(
  fetcher: typeof fetch,
  url: string,
  signal?: AbortSignal
): Promise<JsonResponse> {
  try {
    const result = await fetcher(url, {
      headers: { Accept: "application/json" },
      ...(signal ? { signal } : {}),
    })
    if (!result.ok) return { ok: false, reason: "http" }

    try {
      return { ok: true, value: await result.json() }
    } catch {
      return { ok: false, reason: "invalid-json" }
    }
  } catch {
    return { ok: false, reason: "network" }
  }
}

function fetchJson(
  fetcher: typeof fetch,
  url: string,
  timeoutMs?: number
): Promise<JsonResponse> {
  if (timeoutMs === undefined) {
    return requestJson(fetcher, url)
  }

  const controller = new AbortController()
  let timeoutId: ReturnType<typeof setTimeout>
  const timeout = new Promise<JsonResponse>((resolve) => {
    timeoutId = setTimeout(() => {
      controller.abort()
      resolve({ ok: false, reason: "timeout" })
    }, timeoutMs)
  })

  return Promise.race([requestJson(fetcher, url, controller.signal), timeout])
    .finally(() => clearTimeout(timeoutId))
}

export function createDefinitionLookup(
  fetcher: typeof fetch = globalThis.fetch,
  timeoutOverrides: Partial<DefinitionLookupTimeouts> = {}
) {
  const timeouts = { ...DEFAULT_REQUEST_TIMEOUTS_MS, ...timeoutOverrides }
  const successfulResults = new Map<
    string,
    AvailableWordDefinitionLookupResult
  >()
  const inFlightRequests = new Map<
    string,
    Promise<WordDefinitionLookupResult>
  >()

  const lookup = (
    language: WordDefinitionLanguage,
    word: string
  ): Promise<WordDefinitionLookupResult> => {
    const normalizedWord = word.trim().toLowerCase()
    if (!normalizedWord) return Promise.resolve({ status: "unavailable" })

    const cacheKey = `${language}:${normalizedWord}`
    const cachedResult = successfulResults.get(cacheKey)
    if (cachedResult) return Promise.resolve(cachedResult)

    const pendingRequest = inFlightRequests.get(cacheKey)
    if (pendingRequest) return pendingRequest

    const request = (async (): Promise<WordDefinitionLookupResult> => {
      const encodedWord = encodeURIComponent(normalizedWord)

      if (language === "es") {
        const response = await fetchJson(
          fetcher,
          `https://rae-api.com/api/words/${encodedWord}`,
          timeouts.rae
        )
        if (!response.ok) return { status: "unavailable" }
        const definition = extractRaeDefinition(response.value)
        return definition
          ? { status: "available", definition, source: "RAE" }
          : { status: "unavailable" }
      }

      const response = await fetchJson(
        fetcher,
        `https://en.wiktionary.org/api/rest_v1/page/definition/${encodedWord}`
      )
      if (!response.ok) return { status: "unavailable" }

      const definition = extractWiktionaryDefinition(response.value)
      return definition
        ? { status: "available", definition, source: "Wiktionary" }
        : { status: "unavailable" }
    })()
      .then((result) => {
        if (result.status === "available") {
          successfulResults.set(cacheKey, result)
        }
        return result
      })
      .finally(() => {
        if (inFlightRequests.get(cacheKey) === request) {
          inFlightRequests.delete(cacheKey)
        }
      })

    inFlightRequests.set(cacheKey, request)
    return request
  }

  return { lookup }
}
