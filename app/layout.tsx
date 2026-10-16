import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { CrazyGamesSDKProvider } from "@/components/crazygames-sdk-provider"
import { NetworkMonitor } from "@/components/network-monitor"
import { SeoArticle } from "@/components/seo-article"
import { SiteFooter } from "@/components/site-footer"
import { ScrollToTop } from "@/components/scroll-to-top"
import { LanguageProvider } from "@/components/language-provider"
import { Navigation } from "@/components/navigation"
import { GameStateProvider } from "@/components/game-state-provider"


const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

// Mobile viewport settings for the embedded HTML5 game.
export const viewport: Viewport = {
  themeColor: "#020817",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Evita el zoom pellizcando la pantalla para dar sensación de App nativa
}

export const metadata: Metadata = {
  title: "PalabraMaster - Juego de Palabras",
  description: "Forma palabras con las letras del tablero y acumula puntos",
  formatDetection: {
    telephone: false,
  },
  other: {
    "clckd": "d2f6cb0368e266fe4c75316d8b314161"
  },
  icons: {
    icon: [
      {
        url: "./icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "./icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "./icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "./apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-background" suppressHydrationWarning>
      <body className="bg-background font-sans text-foreground antialiased" suppressHydrationWarning>
        <CrazyGamesSDKProvider>
          <LanguageProvider>
            <GameStateProvider>
              <Navigation />

              <main className="min-h-[100dvh] w-full flex flex-col relative z-10">
                {children}
              </main>

              <ScrollToTop />

              <SeoArticle />

              <SiteFooter />

              <NetworkMonitor />
            </GameStateProvider>
          </LanguageProvider>
        </CrazyGamesSDKProvider>
      </body>
    </html>
  )
}
