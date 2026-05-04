import Link from "next/link"
import { ArrowRight } from "lucide-react"

import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState"
import DashboardSectionError from "@/components/dashboard/DashboardSectionError"
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton"
import TodayOperationCard from "@/components/dashboard/TodayOperationCard"
import type { TodayOperationItem } from "@/components/dashboard/dashboard-types"
import { cn } from "@/lib/utils"

interface TodayOperationsPanelProps {
  items: TodayOperationItem[]
  isLoading?: boolean
  error?: string
  className?: string
}

export default function TodayOperationsPanel({
  items,
  isLoading,
  error,
  className,
}: TodayOperationsPanelProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card p-4 shadow-sm shadow-slate-900/5",
        className
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">
            Today&apos;s operations
          </h2>
          <p className="text-sm text-muted-foreground">
            Reporting, arrivals, and deadline risks.
          </p>
        </div>
        <Link
          className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-accent hover:underline"
          href="/trips"
        >
          View trips
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoading ? <DashboardSkeleton variant="rows" count={4} /> : null}
      {!isLoading && error ? (
        <DashboardSectionError
          title="Today's operations could not load."
          description={error}
        />
      ) : null}
      {!isLoading && !error && items.length === 0 ? (
        <DashboardEmptyState
          title="No reporting or arrival actions for today."
          description="Open trips if you want to review older movements."
          actionLabel="View trips"
          href="/trips"
        />
      ) : null}
      {!isLoading && !error && items.length > 0 ? (
        <div className="space-y-3">
          {items.slice(0, 4).map((item) => (
            <TodayOperationCard item={item} key={item.id} />
          ))}
        </div>
      ) : null}
    </section>
  )
}
