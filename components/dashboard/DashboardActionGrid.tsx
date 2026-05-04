import DashboardActionCard from "@/components/dashboard/DashboardActionCard"
import DashboardSectionError from "@/components/dashboard/DashboardSectionError"
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton"
import type { DashboardActionCardData } from "@/components/dashboard/dashboard-types"

interface DashboardActionGridProps {
  cards: DashboardActionCardData[]
  isLoading?: boolean
  error?: string
}

export default function DashboardActionGrid({
  cards,
  isLoading,
  error,
}: DashboardActionGridProps) {
  if (isLoading) {
    return <DashboardSkeleton variant="action-cards" count={cards.length || 4} />
  }

  if (error) {
    return (
      <DashboardSectionError
        title="Priority counts could not load."
        description={error}
      />
    )
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-3 shadow-sm shadow-slate-900/5">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">
            Today&apos;s focus
          </h2>
          <p className="text-sm text-muted-foreground">
            Quick operational counts. Slide across to scan the day.
          </p>
        </div>
      </div>
      <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1 lg:mx-0 lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0 xl:grid-cols-4">
        {cards.map((card) => (
          <DashboardActionCard
            card={card}
            className="w-[min(19rem,calc(100vw-4rem))] shrink-0 snap-start lg:w-auto lg:min-w-0"
            key={card.id}
          />
        ))}
      </div>
    </section>
  )
}
