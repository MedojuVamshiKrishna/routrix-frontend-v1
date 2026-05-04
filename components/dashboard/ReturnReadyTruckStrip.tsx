import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState"
import DashboardSectionError from "@/components/dashboard/DashboardSectionError"
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton"
import ReturnReadyTruckCard from "@/components/dashboard/ReturnReadyTruckCard"
import type { ReturnReadyTruck } from "@/components/dashboard/dashboard-types"

interface ReturnReadyTruckStripProps {
  trucks: ReturnReadyTruck[]
  isLoading?: boolean
  error?: string
  className?: string
}

export default function ReturnReadyTruckStrip({
  trucks,
  isLoading,
  error,
  className,
}: ReturnReadyTruckStripProps) {
  return (
    <section
      className={`rounded-lg border border-border bg-card p-4 shadow-sm ${className ?? ""}`}
    >
      <div className="mb-4 space-y-1">
        <h2 className="text-lg font-semibold text-foreground">
          Return-ready trucks
        </h2>
        <p className="text-sm text-muted-foreground">
          Trucks available for reverse-route opportunities.
        </p>
      </div>

      {isLoading ? <DashboardSkeleton variant="trucks" count={3} /> : null}
      {!isLoading && error ? (
        <DashboardSectionError
          title="Return-ready trucks could not load."
          description={error}
        />
      ) : null}
      {!isLoading && !error && trucks.length === 0 ? (
        <DashboardEmptyState
          title="No trucks marked return-ready."
          description="Mark a truck return-ready from vehicles when it is available."
          actionLabel="View vehicles"
          href="/vehicles"
        />
      ) : null}
      {!isLoading && !error && trucks.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {trucks.slice(0, 5).map((truck) => (
            <ReturnReadyTruckCard key={truck.id} truck={truck} />
          ))}
        </div>
      ) : null}
    </section>
  )
}
