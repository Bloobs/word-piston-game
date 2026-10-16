import assert from "node:assert/strict"
import { test } from "node:test"
import { getDefinition } from "../hooks/use-word-game.ts"
import {
  createDefinitionLookup,
  getDefinitionFallback,
  isCurrentDefinitionLookup,
} from "../lib/word-definition-lookup.ts"

async function captureTimeouts(callback) {
  const timeouts = []
  const originalSetTimeout = globalThis.setTimeout
  globalThis.setTimeout = (handler, timeout, ...args) => {
    timeouts.push(timeout)
    return originalSetTimeout(handler, timeout, ...args)
  }
  try {
    return { result: await callback(), timeouts }
  } finally {
    globalThis.setTimeout = originalSetTimeout
  }
}

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json" },
  })
}

function wiktionaryResponse(definition) {
  return jsonResponse({
    en: [{ definitions: [{ definition }] }],
  })
}

test("local mock definitions are isolated to Spanish", () => {
  const spanishDemo = getDefinition("SOL", "es")
  assert.match(spanishDemo, /Estrella/)
  assert.equal(getDefinition("SOL", "en"), null)
  assert.equal(getDefinitionFallback("en", spanishDemo), null)
  assert.equal(getDefinitionFallback("es", spanishDemo), spanishDemo)
})

test("English lookup makes one encoded Wiktionary request without a timeout", async () => {
  const requestedUrls = []
  const lookup = createDefinitionLookup(async (input, init) => {
    const url = String(input)
    requestedUrls.push(url)
    assert.equal(init.signal, undefined)
    return wiktionaryResponse(
      [
        '<span class="mention">A new set of hounds</span>',
        ".mw-parser-output .defdate{font-size:smaller}",
        "<style>.mw-parser-output{font-size:smaller}</style>",
        "{{metadata}}",
      ].join(" ")
    )
  })

  const { result, timeouts } = await captureTimeouts(() =>
    lookup.lookup("en", "HELLO /?")
  )
  const expectedUrl =
    "https://en.wiktionary.org/api/rest_v1/page/definition/hello%20%2F%3F"

  assert.deepEqual(result, {
    status: "available",
    definition: "A new set of hounds",
    source: "Wiktionary",
  })
  assert.deepEqual(requestedUrls, [expectedUrl])
  assert.deepEqual(timeouts, [])
  assert.doesNotMatch(
    result.definition,
    /<|>|font-size|mw-parser-output|defdate|\{\{/
  )
})

test("a pending English request remains asynchronous and has no artificial timeout", async () => {
  const timeouts = []
  const originalSetTimeout = globalThis.setTimeout
  let resolveResponse
  globalThis.setTimeout = (handler, timeout, ...args) => {
    timeouts.push(timeout)
    return originalSetTimeout(handler, timeout, ...args)
  }

  try {
    const lookup = createDefinitionLookup(
      async (_input, init) => {
        assert.equal(init.signal, undefined)
        return new Promise((resolve) => {
          resolveResponse = resolve
        })
      }
    )
    const pending = lookup.lookup("en", "pendingword")

    assert.equal(typeof resolveResponse, "function")
    assert.deepEqual(timeouts, [])
    resolveResponse(wiktionaryResponse("A delayed definition."))
    assert.deepEqual(await pending, {
      status: "available",
      definition: "A delayed definition.",
      source: "Wiktionary",
    })
  } finally {
    globalThis.setTimeout = originalSetTimeout
  }
})

test("HTTP, network, and parsing failures are not cached and can be retried", async () => {
  const failedResponses = [
    () => jsonResponse({}, 503),
    () => {
      throw new TypeError("Network failure")
    },
    () => new Response("{invalid json", { status: 200 }),
  ]

  for (const firstResponse of failedResponses) {
    let requestCount = 0
    const lookup = createDefinitionLookup(async () => {
      requestCount += 1
      if (requestCount === 1) return firstResponse()
      return wiktionaryResponse("A definition available on retry.")
    })

    assert.deepEqual(await lookup.lookup("en", "retryword"), {
      status: "unavailable",
    })
    assert.deepEqual(await lookup.lookup("en", "retryword"), {
      status: "available",
      definition: "A definition available on retry.",
      source: "Wiktionary",
    })
    assert.equal(requestCount, 2)
  }
})

test("Spanish lookup still uses only RAE with its existing timeout and extraction", async () => {
  const requestedUrls = []
  const lookup = createDefinitionLookup(async (input) => {
    requestedUrls.push(String(input))
    return jsonResponse({
      data: {
        meanings: [{ senses: [{ description: "Astro que ilumina la Tierra." }] }],
      },
    })
  })

  const { result, timeouts } = await captureTimeouts(() =>
    lookup.lookup("es", "SOL")
  )
  assert.deepEqual(result, {
    status: "available",
    definition: "Astro que ilumina la Tierra.",
    source: "RAE",
  })
  assert.deepEqual(requestedUrls, ["https://rae-api.com/api/words/sol"])
  assert.deepEqual(timeouts, [5_000])
})

test("successful cache entries are isolated by language and word", async () => {
  const requestedUrls = []
  const lookup = createDefinitionLookup(async (input) => {
    const url = String(input)
    requestedUrls.push(url)
    if (url.includes("rae-api.com")) {
      return jsonResponse({
        data: {
          meanings: [{ senses: [{ description: "Definición española." }] }],
        },
      })
    }
    return wiktionaryResponse("An English definition.")
  })

  const englishResult = await lookup.lookup("en", "sol")
  const spanishResult = await lookup.lookup("es", "sol")
  const cachedEnglishResult = await lookup.lookup("en", "SOL")

  assert.deepEqual(englishResult, {
    status: "available",
    definition: "An English definition.",
    source: "Wiktionary",
  })
  assert.deepEqual(spanishResult, {
    status: "available",
    definition: "Definición española.",
    source: "RAE",
  })
  assert.deepEqual(cachedEnglishResult, englishResult)
  assert.deepEqual(requestedUrls, [
    "https://en.wiktionary.org/api/rest_v1/page/definition/sol",
    "https://rae-api.com/api/words/sol",
  ])
})

test("out-of-order responses stay associated with their word and language", async () => {
  const pendingResponses = new Map()
  const lookup = createDefinitionLookup(
    (input) =>
      new Promise((resolve) => {
        pendingResponses.set(String(input), resolve)
      })
  )

  const oldRequest = lookup.lookup("en", "olderword")
  const currentRequest = lookup.lookup("es", "currentword")
  pendingResponses
    .get("https://rae-api.com/api/words/currentword")(
      jsonResponse({
        data: {
          meanings: [{ senses: [{ description: "Definición actual." }] }],
        },
      })
    )
  pendingResponses
    .get("https://en.wiktionary.org/api/rest_v1/page/definition/olderword")(
      wiktionaryResponse("An older English definition.")
    )

  assert.deepEqual(await currentRequest, {
    status: "available",
    definition: "Definición actual.",
    source: "RAE",
  })
  assert.deepEqual(await oldRequest, {
    status: "available",
    definition: "An older English definition.",
    source: "Wiktionary",
  })
  assert.equal(isCurrentDefinitionLookup("en:olderword", "es:currentword"), false)
  assert.equal(
    isCurrentDefinitionLookup("es:currentword", "es:currentword"),
    true
  )
})
