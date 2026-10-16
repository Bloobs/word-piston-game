"use client"

import type { ReactNode } from "react"
import { Navigation } from "@/components/navigation"
import { SeoArticle } from "@/components/seo-article"
import { SiteFooter } from "@/components/site-footer"

export function WebsiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <Navigation />
      {children}
      <SeoArticle />
      <SiteFooter />
    </>
  )
}
