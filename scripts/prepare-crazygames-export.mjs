import { access, cp, readFile, readdir, rm, stat } from "node:fs/promises"
import path from "node:path"

const sourceDirectory = path.resolve("out")
const targetDirectory = path.resolve("out-crazygames")

const excludedDirectories = new Map([
  [
    "guia-juego",
    "La guía es una página de la web propia; no está enlazada desde el juego y su copia de _next solo sirve esa ruta.",
  ],
  [
    "privacidad",
    "La política se conserva en out/ para la web propia, pero la portada del juego no enlaza a esa ruta ni la necesita para jugar.",
  ],
  [
    "screenshots",
    "Estas capturas solo las usa SeoArticle en las páginas informativas; no aparecen en las referencias de la portada ni en sus bundles directos.",
  ],
])

const excludedAssets = new Map([
  [
    "icon-192x192.png",
    "No está referenciado por el HTML del juego, sus bundles directos ni el manifiesto de la exportación.",
  ],
  [
    "icon-512x512.png",
    "No está referenciado por el HTML del juego, sus bundles directos ni el manifiesto de la exportación.",
  ],
  [
    "icon-dark-32x32 copia.png",
    "Es una copia duplicada que no aparece en las referencias del juego.",
  ],
  [
    "placeholder-logo.png",
    "Recurso de placeholder sin referencias en el código, HTML o bundles directos del juego.",
  ],
  [
    "placeholder-logo.svg",
    "Recurso de placeholder sin referencias en el código, HTML o bundles directos del juego.",
  ],
  [
    "placeholder-user.jpg",
    "Recurso de placeholder sin referencias en el código, HTML o bundles directos del juego.",
  ],
  [
    "placeholder.jpg",
    "Recurso de placeholder sin referencias en el código, HTML o bundles directos del juego.",
  ],
  [
    "placeholder.svg",
    "Recurso de placeholder sin referencias en el código, HTML o bundles directos del juego.",
  ],
])

function exclusionReason(relativePath) {
  const normalizedPath = relativePath.split(path.sep).join("/")
  const rootEntry = normalizedPath.split("/")[0]

  if (excludedDirectories.has(rootEntry)) {
    return excludedDirectories.get(rootEntry)
  }

  if (excludedAssets.has(normalizedPath)) {
    return excludedAssets.get(normalizedPath)
  }

  if (path.posix.basename(normalizedPath) === ".DS_Store") {
    return "Metadatos de Finder de macOS; no son recursos que el navegador solicite."
  }

  return null
}

async function listFiles(directory, relativeDirectory = "") {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const relativePath = path.join(relativeDirectory, entry.name)
    const absolutePath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...await listFiles(absolutePath, relativePath))
    } else if (entry.isFile()) {
      files.push(relativePath)
    }
  }

  return files
}

async function assertRequiredFile(relativePath) {
  const absolutePath = path.join(sourceDirectory, relativePath)
  try {
    await access(absolutePath)
  } catch {
    throw new Error(`Falta un recurso requerido en out/: ${relativePath}`)
  }
}

function localReferencePath(relativePath, reference) {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(reference)) return null

  const referencePath = decodeURIComponent(reference.split(/[?#]/, 1)[0])
  if (!referencePath) return null

  if (referencePath.startsWith("/")) {
    throw new Error(`La referencia local no es relativa: ${reference}`)
  }

  const resolvedPath = path.resolve(
    sourceDirectory,
    path.dirname(relativePath),
    referencePath
  )
  const relativeResolvedPath = path.relative(sourceDirectory, resolvedPath)
  if (
    relativeResolvedPath === ".." ||
    relativeResolvedPath.startsWith(`..${path.sep}`)
  ) {
    throw new Error(`La referencia sale de out/: ${reference}`)
  }

  return relativeResolvedPath
}

async function verifyEntryReferences(html) {
  const references = [
    ...html.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi),
  ].map((match) => match[1])
  const entryAssets = new Set()

  for (const reference of references) {
    const relativePath = localReferencePath("index.html", reference)
    if (relativePath === null) continue

    const rootEntry = relativePath.split(path.sep)[0]
    if (excludedDirectories.has(rootEntry)) {
      throw new Error(
        `index.html requiere una ruta que se excluiría: ${reference}`
      )
    }

    const absolutePath = path.join(sourceDirectory, relativePath)
    try {
      await access(absolutePath)
    } catch {
      throw new Error(`index.html referencia un archivo inexistente: ${reference}`)
    }

    if (/\.(?:css|js)$/i.test(relativePath)) {
      entryAssets.add(relativePath)
    }
  }

  const directBundleContents = await Promise.all(
    [...entryAssets].map((relativePath) =>
      readFile(path.join(sourceDirectory, relativePath), "utf8")
    )
  )
  const dependencies = `${html}\n${directBundleContents.join("\n")}`
  const removedAssetNames = [...excludedAssets.keys()]
  const unreferencedWebAssets = [
    "screenshots/",
    "guia-juego/",
    "privacidad/",
    ...removedAssetNames,
  ]

  for (const assetName of unreferencedWebAssets) {
    if (dependencies.includes(assetName)) {
      throw new Error(
        `Un recurso del juego referencia un elemento que se excluiría: ${assetName}`
      )
    }
  }

  for (const cssPath of [...entryAssets].filter((item) => item.endsWith(".css"))) {
    const css = await readFile(path.join(sourceDirectory, cssPath), "utf8")
    const cssReferences = [...css.matchAll(/url\(([^)]+)\)/gi)]

    for (const [, rawReference] of cssReferences) {
      const reference = rawReference.trim().replace(/^["']|["']$/g, "")
      const relativePath = localReferencePath(cssPath, reference)
      if (relativePath === null) continue

      try {
        await access(path.join(sourceDirectory, relativePath))
      } catch {
        throw new Error(
          `${cssPath} referencia un recurso inexistente: ${reference}`
        )
      }
    }
  }
}

for (const requiredPath of [
  "index.html",
  "_next",
  "dictionaries/dicc_es_es.txt",
  "dictionaries/dicc_en_en.txt",
]) {
  await assertRequiredFile(requiredPath)
}

const entryHtml = await readFile(path.join(sourceDirectory, "index.html"), "utf8")
await verifyEntryReferences(entryHtml)

const sourceFiles = await listFiles(sourceDirectory)
const excludedFiles = sourceFiles
  .map((relativePath) => ({
    relativePath,
    reason: exclusionReason(relativePath),
  }))
  .filter((item) => item.reason !== null)

await rm(targetDirectory, { recursive: true, force: true })
await cp(sourceDirectory, targetDirectory, {
  recursive: true,
  filter: (sourcePath) => {
    const relativePath = path.relative(sourceDirectory, sourcePath)
    return relativePath === "" || exclusionReason(relativePath) === null
  },
})

for (const requiredPath of [
  "index.html",
  "_next",
  "dictionaries/dicc_es_es.txt",
  "dictionaries/dicc_en_en.txt",
]) {
  try {
    await access(path.join(targetDirectory, requiredPath))
  } catch {
    throw new Error(`El paquete CrazyGames no contiene ${requiredPath}`)
  }
}

const outputFiles = await listFiles(targetDirectory)
const outputBytes = (
  await Promise.all(
    outputFiles.map(async (relativePath) =>
      (await stat(path.join(targetDirectory, relativePath))).size
    )
  )
).reduce((sum, size) => sum + size, 0)

console.log(`CrazyGames export creado: ${targetDirectory}`)
console.log(`Archivos conservados: ${outputFiles.length}`)
console.log(`Tamaño total: ${(outputBytes / (1024 * 1024)).toFixed(2)} MiB`)
console.log(`Archivos excluidos: ${excludedFiles.length}`)

for (const { relativePath, reason } of excludedFiles) {
  console.log(`- ${relativePath}: ${reason}`)
}
