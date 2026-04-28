import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { InstallPWA } from "@/components/install-pwa"
import { NetworkMonitor } from "@/components/network-monitor"
import { SeoArticle } from "@/components/seo-article"
import { SiteFooter } from "@/components/site-footer"
import { ScrollToTop } from "@/components/scroll-to-top"; // Importa el nuevo componente


const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

// Configuración específica para dispositivos móviles y PWA
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
  manifest: "/manifest.json", // Enlace al manifest para la PWA
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PalabraMaster",
  },
  formatDetection: {
    telephone: false,
  },
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
    <html lang="es" className="bg-background" suppressHydrationWarning>
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

        {/* 1. CONTENEDOR PRINCIPAL DEL JUEGO */}
        {/* Ocupa el 100% de la pantalla para aislar el juego y ocultar el SEO */}
        <main className="min-h-[100dvh] w-full flex flex-col relative z-10">
          {children}
        </main>

        {/* 2. COMPONENTE SEO MULTIDIOMA PARA ADSENSE */}
        {/* Queda oculto debajo del menú de juego */}
        <ScrollToTop /> {/* Añádelo aquí, debajo de la etiqueta body */}

        <SeoArticle />

        <SiteFooter />

        {process.env.NODE_ENV === "production" && <Analytics />}

        {/* COMPONENTES GLOBALES SECUNDARIOS */}
        <InstallPWA />
        <NetworkMonitor />
        
      </body>
    </html>
  )
}
