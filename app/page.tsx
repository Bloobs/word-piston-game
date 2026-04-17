import { WordGame } from "@/components/word-game/word-game"
import Link from "next/link"

export default function Home() {
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-gradient-to-b from-background via-background to-card">
      <WordGame />
      
      {/* Enlace legal flotante obligatorio para AdSense */}
      <div className="absolute bottom-2 w-full text-center z-50 pointer-events-none">
        <Link 
          href="/privacidad" 
          className="text-[10px] text-muted-foreground/60 hover:text-muted-foreground hover:underline transition-colors pointer-events-auto"
        >
          Política de Privacidad y Cookies
        </Link>
      </div>
    </main>
  )
}
