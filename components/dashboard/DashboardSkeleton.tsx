import { cn } from "@/lib/utils"

interface DashboardSkeletonProps {
  variant:
    | "action-cards"
    | "rows"
    | "chart"
    | "money"
    | "trucks"
    | "follow-ups"
  count?: number
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />
}

export default function DashboardSkeleton({
  variant,
  count,
}: DashboardSkeletonProps) {
  if (variant === "action-cards") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: count ?? 7 }).map((_, index) => (
          <div
            className="min-h-[148px] rounded-lg border border-border bg-card p-4 shadow-sm xl:min-h-[168px]"
            key={`action-card-skeleton-${index}`}
          >
            <div className="flex items-start justify-between">
              <SkeletonBlock className="h-10 w-10" />
              <SkeletonBlock className="h-5 w-20 rounded-full" />
            </div>
            <SkeletonBlock className="mt-5 h-7 w-20" />
            <SkeletonBlock className="mt-3 h-4 w-32" />
            <SkeletonBlock className="mt-6 h-4 w-24" />
          </div>
        ))}
      </div>
    )
  }

  if (variant === "chart") {
    return (
      <div className="space-y-4">
        <SkeletonBlock className="h-5 w-40" />
        <SkeletonBlock className="h-8 w-28" />
        <SkeletonBlock className="h-52 w-full md:h-64" />
      </div>
    )
  }

  if (variant === "money") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: count ?? 7 }).map((_, index) => (
          <SkeletonBlock className="h-[104px] w-full" key={`money-skeleton-${index}`} />
        ))}
      </div>
    )
  }

  if (variant === "trucks") {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {Array.from({ length: count ?? 3 }).map((_, index) => (
          <SkeletonBlock
            className="h-[164px] min-w-[260px]"
            key={`truck-skeleton-${index}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count ?? 4 }).map((_, index) => (
        <SkeletonBlock
          className="h-[132px] w-full xl:h-16"
          key={`${variant}-skeleton-${index}`}
        />
      ))}
    </div>
  )
}
