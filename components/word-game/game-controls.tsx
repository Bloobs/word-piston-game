"use client"

import { Button } from "@/components/ui/button"
import { Lightbulb, Check, Flag } from "lucide-react"
import { useTranslations } from "@/hooks/use-translations"

interface GameControlsProps {
  canSubmit: boolean
  canUseHint: boolean
  onSubmit: () => void
  onHint: () => void
  onGiveUp: () => void
  totalScore: number
  language: "es" | "en"
}

export function GameControls({
  canSubmit,
  canUseHint,
  onSubmit,
  onHint,
  onGiveUp,
  totalScore,
  language,
}: GameControlsProps) {
  const t = useTranslations(language)

  return (
    <div className="flex items-center justify-center gap-3 px-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onGiveUp}
        className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
      >
        <Flag className="h-4 w-4" />
        <span className="hidden sm:inline">{t.controls.giveUp}</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onHint}
        disabled={!canUseHint || totalScore < 25}
        className="gap-2"
      >
        <Lightbulb className="h-4 w-4" />
        <span className="hidden sm:inline">{t.controls.hint}</span>
        <span className="text-xs text-muted-foreground">(-25)</span>
      </Button>

      <Button
        size="sm"
        onClick={onSubmit}
        disabled={!canSubmit}
        className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
      >
        <Check className="h-4 w-4" />
        {t.controls.submit}
      </Button>
    </div>
  )
}
