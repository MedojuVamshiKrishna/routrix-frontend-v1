import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState"
import DashboardSectionError from "@/components/dashboard/DashboardSectionError"
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton"
import MoneyMetricTile from "@/components/dashboard/MoneyMetricTile"
import type { MoneyMetric } from "@/components/dashboard/dashboard-types"
import Badge from "@/components/ui/Badge"

interface MonthlyMoneySummaryProps {
  metrics: MoneyMetric[]
  monthLabel: string
  availableMonths?: string[]
  selectedMonth?: string
  onMonthChange?: (month: string) => void
  isLoading?: boolean
  error?: string
  profitIncomplete?: boolean
  className?: string
}

export default function MonthlyMoneySummary({
  metrics,
  monthLabel,
  availableMonths,
  selectedMonth,
  onMonthChange,
  isLoading,
  error,
  profitIncomplete,
  className,
}: MonthlyMoneySummaryProps) {
  return (
    <section
      className={`rounded-2xl border border-border bg-card p-4 shadow-sm shadow-slate-900/5 ${className ?? ""}`}
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">
            Monthly money summary
          </h2>
          <p className="text-sm text-muted-foreground">
            {monthLabel} money separated by billed, received, outstanding, dues,
            expenses, and internal profit.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {availableMonths && selectedMonth && onMonthChange ? (
            <label className="relative">
              <span className="sr-only">Select month</span>
              <select
                className="h-9 rounded-full border border-border bg-background px-4 pr-9 text-sm text-foreground outline-none transition-colors focus:border-accent"
                onChange={(event) => onMonthChange(event.target.value)}
                value={selectedMonth}
              >
                {availableMonths.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <Badge variant="outline">Internal register view</Badge>
        </div>
      </div>

      {profitIncomplete ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-amber-800">
              Profit is incomplete
            </p>
            <Badge variant="warning">Review expenses and provider payments</Badge>
          </div>
          <p className="mt-1 text-sm text-amber-700">
            Some internal expenses or outsourced truck payments are not closed yet,
            so profit should be used only for internal review.
          </p>
        </div>
      ) : null}

      {isLoading ? <DashboardSkeleton variant="money" count={7} /> : null}
      {!isLoading && error ? (
        <DashboardSectionError
          title="Money summary could not load."
          description={error}
        />
      ) : null}
      {!isLoading && !error && metrics.length === 0 ? (
        <DashboardEmptyState
          title="No money summary for this month yet."
          description="Create an order or settlement to start this register."
        />
      ) : null}
      {!isLoading && !error && metrics.length > 0 ? (
        <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1">
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
