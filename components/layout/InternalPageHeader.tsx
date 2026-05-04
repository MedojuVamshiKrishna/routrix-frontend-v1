"use client"

import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/Button"

interface InternalPageHeaderProps {
  title: string
  description?: string
  fallbackHref?: string
}

export default function InternalPageHeader({
  title,
  description,
  fallbackHref = "/",
}: InternalPageHeaderProps) {
  const router = useRouter()

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
      return
    }

    router.push(fallbackHref)
  }

  return (
    <div className="flex items-start gap-3">
      <Button
        aria-label="Go back"
        className="mt-0.5 border-border bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground"
        onClick={handleBack}
        size="icon"
        title="Go back"
        type="button"
        variant="secondary"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </Button>
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {description ? (
          <p className="max-w-3xl text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  )
}
