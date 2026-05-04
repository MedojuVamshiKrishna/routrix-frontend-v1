"use client"

import { useState } from "react"
import { AlertTriangle, ArrowRight, Copy, Phone, RotateCcw, Truck } from "lucide-react"
import Link from "next/link"

import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState"
import DashboardSectionError from "@/components/dashboard/DashboardSectionError"
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton"
import RiskItemCard from "@/components/dashboard/RiskItemCard"
import type {
  DashboardRiskItem,
  PaymentFollowUpItem,
  ReturnReadyTruck,
} from "@/components/dashboard/dashboard-types"
import { toneBadgeVariant } from "@/components/dashboard/dashboard-ui"
import Badge from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"

interface DashboardRightRailProps {
  risks: DashboardRiskItem[]
  paymentFollowUps: PaymentFollowUpItem[]
  returnReadyTrucks: ReturnReadyTruck[]
  isRisksLoading?: boolean
  risksError?: string
  isPaymentFollowUpsLoading?: boolean
  paymentFollowUpsError?: string
  isReturnReadyLoading?: boolean
  returnReadyError?: string
}

type DashboardRailTab = "risks" | "collections" | "returns"

const railTabs: Array<{
  id: DashboardRailTab
  label: string
  icon: typeof AlertTriangle
}> = [
  { id: "risks", label: "Risks", icon: AlertTriangle },
  { id: "collections", label: "Collections", icon: Phone },
  { id: "returns", label: "Returns", icon: RotateCcw },
]

export default function DashboardRightRail({
  risks,
  paymentFollowUps,
  returnReadyTrucks,
  isRisksLoading,
  risksError,
  isPaymentFollowUpsLoading,
  paymentFollowUpsError,
  isReturnReadyLoading,
  returnReadyError,
}: DashboardRightRailProps) {
  const [activeTab, setActiveTab] = useState<DashboardRailTab>("risks")
  const [copyStates, setCopyStates] = useState<Record<string, "idle" | "success" | "error">>(
    () =>
      paymentFollowUps.reduce<Record<string, "idle" | "success" | "error">>(
        (acc, item) => {
          acc[item.id] = item.initialCopyState ?? "idle"
          return acc
        },
        {}
      )
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
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-slate-900/5">
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">
            Follow-up rail
          </h2>
          <p className="text-sm text-muted-foreground">
            Open one follow-up category at a time.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {railTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                aria-pressed={isActive}
                className={
                  isActive
                    ? "inline-flex items-center gap-2 rounded-full border border-accent bg-accent/10 px-3 py-2 text-sm text-foreground"
                    : "inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                }
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {activeTab === "risks" ? (
          <section className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">Top risks</h3>
              <p className="text-sm text-muted-foreground">
                Only the items that can damage today.
              </p>
            </div>

        {isRisksLoading ? <DashboardSkeleton variant="rows" count={3} /> : null}
        {!isRisksLoading && risksError ? (
          <DashboardSectionError
            title="Risks could not load."
            description={risksError}
          />
        ) : null}
        {!isRisksLoading && !risksError && risks.length === 0 ? (
          <DashboardEmptyState
            title="No urgent follow-ups right now."
            description="Nothing needs immediate attention."
          />
        ) : null}
        {!isRisksLoading && !risksError && risks.length > 0 ? (
          <div className="space-y-3">
            {risks.slice(0, 3).map((item) => (
              <RiskItemCard item={item} key={item.id} />
            ))}
          </div>
        ) : null}
          </section>
        ) : null}

        {activeTab === "collections" ? (
          <section className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">
                Collection calls
              </h3>
              <p className="text-sm text-muted-foreground">
                Top invoice follow-ups only.
              </p>
            </div>

        {isPaymentFollowUpsLoading ? (
          <DashboardSkeleton variant="follow-ups" count={2} />
        ) : null}
        {!isPaymentFollowUpsLoading && paymentFollowUpsError ? (
          <DashboardSectionError
            title="Collection follow-ups could not load."
            description={paymentFollowUpsError}
          />
        ) : null}
        {!isPaymentFollowUpsLoading &&
        !paymentFollowUpsError &&
        paymentFollowUps.length === 0 ? (
          <DashboardEmptyState
            title="No collection calls pending."
            description="Unpaid invoices will appear here."
          />
        ) : null}
        {!isPaymentFollowUpsLoading &&
        !paymentFollowUpsError &&
        paymentFollowUps.length > 0 ? (
          <div className="space-y-3">
            {paymentFollowUps.slice(0, 2).map((item) => (
              <article
                className="rounded-xl border border-border bg-background p-4 shadow-sm shadow-slate-900/5"
                key={item.id}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <p className="truncate text-base font-semibold text-foreground">
                          {item.clientName}
                        </p>
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {item.invoiceId} • {item.monthLabel}
                      </p>
                    </div>
                  <Badge
                    variant={toneBadgeVariant(item.statusTone)}
                    className="px-2 py-0 text-[11px]"
                  >
                    {item.statusLabel}
                  </Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Balance due
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {item.balanceLabel}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Last payment
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {item.lastPaymentLabel}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 border-t border-border pt-3">
                    <Button
                      className="w-full"
                      onClick={() => handleCopy(item)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <Copy className="h-4 w-4" />
                      Copy message
                    </Button>
                    <Button asChild className="w-full" size="sm" variant="secondary">
                      <Link href={item.href}>
                        Open invoice
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  {copyStates[item.id] === "success" ? (
                    <p className="text-sm font-medium text-emerald-700">
                      Message copied
                    </p>
                  ) : null}
                  {copyStates[item.id] === "error" ? (
                    <p className="text-sm font-medium text-red-700">
                      Could not copy. Select and copy manually.
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}
          </section>
        ) : null}

        {activeTab === "returns" ? (
          <section className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">
                Return-ready
              </h3>
              <p className="text-sm text-muted-foreground">
                Trucks that can reduce empty return trips.
              </p>
            </div>

        {isReturnReadyLoading ? <DashboardSkeleton variant="trucks" count={2} /> : null}
        {!isReturnReadyLoading && returnReadyError ? (
          <DashboardSectionError
            title="Return-ready trucks could not load."
            description={returnReadyError}
          />
        ) : null}
        {!isReturnReadyLoading &&
        !returnReadyError &&
        returnReadyTrucks.length === 0 ? (
          <DashboardEmptyState
            title="No return-ready trucks."
            description="Mark a truck return-ready from vehicles when available."
          />
        ) : null}
        {!isReturnReadyLoading &&
        !returnReadyError &&
        returnReadyTrucks.length > 0 ? (
          <div className="space-y-3">
            {returnReadyTrucks.slice(0, 2).map((truck) => (
              <Link
                className="block rounded-xl border border-border bg-background p-4 shadow-sm shadow-slate-900/5 transition-colors hover:border-accent/30 hover:bg-muted"
                href={truck.href}
                key={truck.id}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <p className="truncate text-base font-semibold text-foreground">
                        {truck.truckNumber}
                      </p>
                    </div>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {truck.currentCity} / {truck.ageLabel}
                    </p>
                    </div>
                  <Badge
                    variant={toneBadgeVariant(truck.statusTone)}
                    className="px-2 py-0 text-[11px]"
                  >
                    {truck.statusLabel}
                  </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Suggested route
                    </p>
                    <p className="text-base font-semibold text-foreground">
                      {truck.suggestedRoute}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
          </section>
        ) : null}
      </div>
    </section>
  )
}
