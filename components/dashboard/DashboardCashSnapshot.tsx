import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState"
import DashboardSectionError from "@/components/dashboard/DashboardSectionError"
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton"
import MoneyMetricTile from "@/components/dashboard/MoneyMetricTile"
import type { MoneyMetric } from "@/components/dashboard/dashboard-types"

interface DashboardCashSnapshotProps {
  metrics: MoneyMetric[]
  isLoading?: boolean
  error?: string
}

export default function DashboardCashSnapshot({
  metrics,
  isLoading,
  error,
}: DashboardCashSnapshotProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-slate-900/5">
      <div className="mb-4 space-y-1">
        <h2 className="text-lg font-semibold text-foreground">
          Cash snapshot
        </h2>
        <p className="text-sm text-muted-foreground">
          Money that changes today&apos;s calls and payments.
        </p>
      </div>

      {isLoading ? <DashboardSkeleton variant="money" count={3} /> : null}
      {!isLoading && error ? (
        <DashboardSectionError
          title="Cash snapshot could not load."
          description={error}
        />
      ) : null}
      {!isLoading && !error && metrics.length === 0 ? (
        <DashboardEmptyState
          title="No cash snapshot yet."
          description="Outstanding and dues appear after invoices and payments are recorded."
        />
      ) : null}
      {!isLoading && !error && metrics.length > 0 ? (
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1">
          {metrics.map((metric) => (
            <div className="w-[252px] shrink-0" key={metric.id}>
              <MoneyMetricTile metric={metric} variant="summary" />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
