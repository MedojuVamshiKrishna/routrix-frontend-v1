import Link from "next/link"

import DashboardInfoHint from "@/components/dashboard/DashboardInfoHint"
import DashboardMetricValue from "@/components/dashboard/DashboardMetricValue"
import type { MoneyMetric } from "@/components/dashboard/dashboard-types"
import { toneBadgeVariant, toneCardClasses } from "@/components/dashboard/dashboard-ui"
import Badge from "@/components/ui/Badge"
import { cn } from "@/lib/utils"

interface MoneyMetricTileProps {
  metric: MoneyMetric
  variant?: "default" | "summary"
}

export default function MoneyMetricTile({
  metric,
  variant = "default",
}: MoneyMetricTileProps) {
  const content = (
    <div
      className={cn(
        "flex h-[136px] flex-col justify-between rounded-xl border p-4 shadow-sm shadow-slate-900/5 transition-colors",
        variant === "summary"
          ? "border-border bg-card hover:border-accent/20"
          : toneCardClasses(metric.tone)
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate whitespace-nowrap text-sm font-medium leading-5 text-muted-foreground">
            {metric.label}
          </p>
          <DashboardInfoHint text={metric.helperText} />
        </div>
        {metric.badgeText ? (
          <Badge
            className="self-start"
            variant={
              variant === "summary" ? "outline" : toneBadgeVariant(metric.tone)
            }
          >
            {metric.badgeText}
          </Badge>
        ) : null}
      </div>
      <DashboardMetricValue
        className="truncate text-2xl font-bold tracking-normal text-foreground"
        value={metric.value}
      />
    </div>
  )

  if (!metric.href) {
    return content
  }

  return (
    <Link href={metric.href} className="block transition-opacity hover:opacity-90">
      {content}
    </Link>
  )
}
