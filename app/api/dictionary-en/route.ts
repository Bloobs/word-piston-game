import { NextResponse } from "next/server"

const NOT_FOUND_MESSAGE = "Meaning not found."

type DictionaryEnResponse = Array<{
  meanings?: Array<{
    definitions?: Array<{
      definition?: string
    }>
  }>
}>

export async function GET(request: Request) {
  const url = new URL(request.url)
  const rawWord = url.searchParams.get("word")
  const word = rawWord?.trim().toLowerCase()

  if (!word) {
    return NextResponse.json({ ok: false, error: NOT_FOUND_MESSAGE }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      { cache: "no-store" }
    )

    if (response.status === 404) {
      return NextResponse.json({ ok: false, error: NOT_FOUND_MESSAGE })
    }

    if (!response.ok) {
      return NextResponse.json({ ok: false, error: NOT_FOUND_MESSAGE })
    }

    const payload = (await response.json()) as DictionaryEnResponse
    const definition = payload?.[0]?.meanings?.[0]?.definitions?.[0]?.definition?.trim()

    if (!definition) {
      return NextResponse.json({ ok: false, error: NOT_FOUND_MESSAGE })
    }

    return NextResponse.json({
      ok: true,
      definition,
      source: "Wiktionary",
    })
  } catch {
    return NextResponse.json({ ok: false, error: NOT_FOUND_MESSAGE })
  }
}
