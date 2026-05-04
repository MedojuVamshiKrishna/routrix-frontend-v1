import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState"
import DashboardSectionError from "@/components/dashboard/DashboardSectionError"
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton"
import RiskItemCard from "@/components/dashboard/RiskItemCard"
import type { DashboardRiskItem } from "@/components/dashboard/dashboard-types"
import { cn } from "@/lib/utils"

interface RiskQueuePanelProps {
  items: DashboardRiskItem[]
  isLoading?: boolean
  error?: string
  className?: string
}

export default function RiskQueuePanel({
  items,
  isLoading,
  error,
  className,
}: RiskQueuePanelProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card p-4 shadow-sm xl:min-h-[360px]",
        className
      )}
    >
      <div className="mb-4 space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Risk queue</h2>
        <p className="text-sm text-muted-foreground">
          Do not forget these orders, invoices, and provider dues.
        </p>
      </div>

      {isLoading ? <DashboardSkeleton variant="rows" count={5} /> : null}
      {!isLoading && error ? (
        <DashboardSectionError
          title="Risk queue could not load."
          description={error}
        />
      ) : null}
      {!isLoading && !error && items.length === 0 ? (
        <DashboardEmptyState
          title="No urgent follow-ups right now."
          description="Nothing needs immediate attention from this queue."
        />
      ) : null}
      {!isLoading && !error && items.length > 0 ? (
        <div className="space-y-3">
          {items.slice(0, 7).map((item) => (
            <RiskItemCard item={item} key={item.id} />
          ))}
        </div>
      ) : null}
    </section>
  )
}
