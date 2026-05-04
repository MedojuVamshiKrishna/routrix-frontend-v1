"use client"

import { useState } from "react"

import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState"
import DashboardSectionError from "@/components/dashboard/DashboardSectionError"
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton"
import PaymentFollowUpCard from "@/components/dashboard/PaymentFollowUpCard"
import type { PaymentFollowUpItem } from "@/components/dashboard/dashboard-types"

interface PaymentFollowUpPanelProps {
  items: PaymentFollowUpItem[]
  isLoading?: boolean
  error?: string
  className?: string
}

export default function PaymentFollowUpPanel({
  items,
  isLoading,
  error,
  className,
}: PaymentFollowUpPanelProps) {
  const [copyStates, setCopyStates] = useState<Record<string, "idle" | "success" | "error">>(
    () =>
      items.reduce<Record<string, "idle" | "success" | "error">>((acc, item) => {
        acc[item.id] = item.initialCopyState ?? "idle"
        return acc
      }, {})
  )

  async function handleCopy(item: PaymentFollowUpItem) {
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard unavailable")
      }

      await navigator.clipboard.writeText(item.message)
      setCopyStates((current) => ({ ...current, [item.id]: "success" }))
    } catch {
      setCopyStates((current) => ({ ...current, [item.id]: "error" }))
    }
  }

  return (
    <section
      className={`rounded-lg border border-border bg-card p-4 shadow-sm ${className ?? ""}`}
    >
      <div className="mb-4 space-y-1">
        <h2 className="text-lg font-semibold text-foreground">
          Payment follow-up
        </h2>
        <p className="text-sm text-muted-foreground">
          Manual collection reminders for unpaid and partially paid invoices.
        </p>
      </div>

      {isLoading ? <DashboardSkeleton variant="follow-ups" count={4} /> : null}
      {!isLoading && error ? (
        <DashboardSectionError
          title="Payment follow-up could not load."
          description={error}
        />
      ) : null}
      {!isLoading && !error && items.length === 0 ? (
        <DashboardEmptyState
          title="No unpaid or partially paid invoices need follow-up."
          description="Collection reminders will appear when an invoice balance is pending."
        />
      ) : null}
      {!isLoading && !error && items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <PaymentFollowUpCard
              copyState={copyStates[item.id] ?? "idle"}
              item={item}
              key={item.id}
              onCopy={handleCopy}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
