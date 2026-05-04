"use client"

import { X } from "lucide-react"
import { useEffect, useRef } from "react"

import { Button } from "@/components/ui/Button"

interface OrderFlyoutProps {
  title: string
  description?: string
  isOpen: boolean
  children: React.ReactNode
  onClose: () => void
}

export default function OrderFlyout({
  title,
  description,
  isOpen,
  children,
  onClose,
}: OrderFlyoutProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/30">
      <button
        aria-label="Close flyout overlay"
        className="hidden flex-1 cursor-default md:block"
        onClick={onClose}
        type="button"
      />
      <aside
        aria-describedby={description ? "order-flyout-description" : undefined}
        aria-modal="true"
        aria-labelledby="order-flyout-title"
        className="flex h-full w-full max-w-xl flex-col border-l border-border bg-background shadow-xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-4">
          <div>
            <h2
              className="text-lg font-semibold text-foreground"
              id="order-flyout-title"
            >
              {title}
            </h2>
            {description ? (
              <p
                className="mt-1 text-sm leading-5 text-muted-foreground"
                id="order-flyout-description"
              >
                {description}
              </p>
            ) : null}
          </div>
          <Button
            aria-label="Close flyout"
            onClick={onClose}
            ref={closeButtonRef}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
      </aside>
    </div>
  )
}
