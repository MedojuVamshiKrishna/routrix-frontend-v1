"use client"

import { X } from "lucide-react"
import { useEffect, useRef } from "react"

import { Button } from "@/components/ui/Button"

interface OrderConfirmModalProps {
  title: string
  description: string
  confirmLabel: string
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
}

export default function OrderConfirmModal({
  title,
  description,
  confirmLabel,
  isOpen,
  onClose,
  onConfirm,
}: OrderConfirmModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <section
        aria-describedby="order-confirm-description"
        aria-labelledby="order-confirm-title"
        aria-modal="true"
        className="w-full max-w-md rounded-lg border border-border bg-card p-4 shadow-xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              className="text-lg font-semibold text-card-foreground"
              id="order-confirm-title"
            >
              {title}
            </h2>
            <p
              className="mt-2 text-sm leading-6 text-muted-foreground"
              id="order-confirm-description"
            >
              {description}
            </p>
          </div>
          <Button
            aria-label="Close confirmation"
            onClick={onClose}
            ref={closeButtonRef}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm?.()
              onClose()
            }}
            type="button"
            variant="accent"
          >
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  )
}
