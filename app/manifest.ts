import { MetadataRoute } from 'next'
import { headers } from 'next/headers'

export default function manifest(): MetadataRoute.Manifest {
  const headersList = headers()
  const acceptLanguage = headersList.get('accept-language') || ''
  
  const isEnglish = acceptLanguage.toLowerCase().startsWith('en')

  return {
    name: isEnglish ? "Word Master" : "Palabra Master",
    short_name: isEnglish ? "Word" : "Palabra",
    description: isEnglish ? "The word building game" : "El juego de formar palabras",
    start_url: "/",
    display: "standalone",
    background_color: "#020817",
    theme_color: "#020817",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ]
  }
}
