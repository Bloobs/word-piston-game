"use client"

import { createContext, useCallback, useContext, useState } from "react"
import Script from "next/script"

type CrazyGamesAdCallbacks = {
  adStarted: () => void
  adFinished: () => void
  adError: (error: unknown) => void
}

type CrazyGamesSDK = {
  init: () => Promise<void>
  ad: {
    requestAd: (type: "rewarded", callbacks: CrazyGamesAdCallbacks) => void
  }
}

declare global {
  interface Window {
    CrazyGames?: {
      SDK?: CrazyGamesSDK
    }
  }
}

type SDKStatus = "loading" | "ready" | "unavailable"

const CrazyGamesSDKContext = createContext<SDKStatus>("loading")
let initializationPromise: Promise<void> | null = null

export function CrazyGamesSDKProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SDKStatus>("loading")

  const handleSDKReady = useCallback(() => {
    const sdk = window.CrazyGames?.SDK
    if (!sdk) {
      console.error("CrazyGames SDK script loaded without exposing its SDK.")
      setStatus("unavailable")
      return
    }

    try {
      initializationPromise ??= sdk.init()
      void initializationPromise
        .then(() => setStatus("ready"))
        .catch((error: unknown) => {
          initializationPromise = null
          console.error("CrazyGames SDK initialization failed:", error)
          setStatus("unavailable")
        })
    } catch (error) {
      initializationPromise = null
      console.error("CrazyGames SDK initialization failed:", error)
      setStatus("unavailable")
    }
  }, [])

  const handleSDKError = useCallback((error: Error) => {
    console.error("Failed to load the CrazyGames SDK script:", error)
    setStatus("unavailable")
  }, [])

  return (
    <CrazyGamesSDKContext.Provider value={status}>
      {children}
      <Script
        id="crazygames-sdk"
        src="https://sdk.crazygames.com/crazygames-sdk-v3.js"
        strategy="afterInteractive"
        onReady={handleSDKReady}
        onError={handleSDKError}
      />
    </CrazyGamesSDKContext.Provider>
  )
}

export function useCrazyGamesSDK(): { status: SDKStatus } {
  return { status: useContext(CrazyGamesSDKContext) }
}
