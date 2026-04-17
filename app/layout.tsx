import type { Metadata } from "next"
import Script from "next/script"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PalabraMaster - Juego de Palabras",
  description: "Forma palabras con las letras del tablero y acumula puntos",
  generator: "v0.app",
  other: {
    "google-adsense-account": "ca-pub-8772151413997813"
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <head>
        {/* Aquí NO van los scripts en Next.js */}
      </head>
      <body className="bg-background font-sans text-foreground antialiased" suppressHydrationWarning>
        
        {/* Script principal de AdSense usando next/script antes del contenido */}
        <Script
          id="adsense-main"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8772151413997813"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        
        {/* Configuración H5 Games inyectada correctamente para Next.js */}
        <Script
          id="adsense-h5-config"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.adsbygoogle = window.adsbygoogle || [];
              window.adBreak = window.adConfig = function(o) {adsbygoogle.push(o);}
              window.adConfig({
                preloadAdBreaks: 'on',
                sound: 'on',
              });
            `
          }}
        />

        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
