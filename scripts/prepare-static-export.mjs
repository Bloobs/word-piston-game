import { cp, copyFile } from "node:fs/promises"
import path from "node:path"

const exportDirectory = path.resolve("out")
const sharedIcons = [
  "apple-icon.png",
  "icon-dark-32x32.png",
  "icon-light-32x32.png",
  "icon.svg",
]

for (const route of ["guia-juego", "privacidad"]) {
  const routeDirectory = path.join(exportDirectory, route)

  await cp(path.join(exportDirectory, "_next"), path.join(routeDirectory, "_next"), {
    recursive: true,
  })

  for (const icon of sharedIcons) {
    await copyFile(path.join(exportDirectory, icon), path.join(routeDirectory, icon))
  }
}
