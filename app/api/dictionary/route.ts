import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "dictionaries", "dicc_es_es.txt")
    const content = await readFile(filePath, "utf-8")
    
    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("[v0] Error reading dictionary file:", error)
    return new NextResponse("Dictionary not found", { status: 404 })
  }
}
