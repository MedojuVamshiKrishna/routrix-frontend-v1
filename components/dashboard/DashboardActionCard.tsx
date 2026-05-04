import Link from "next/link"
import { ArrowRight } from "lucide-react"

import DashboardInfoHint from "@/components/dashboard/DashboardInfoHint"
import DashboardMetricValue from "@/components/dashboard/DashboardMetricValue"
import type { DashboardActionCardData } from "@/components/dashboard/dashboard-types"
import {
  dashboardIcons,
  toneBadgeVariant,
  toneCardClasses,
  toneIconClasses,
} from "@/components/dashboard/dashboard-ui"
import Badge from "@/components/ui/Badge"
import { cn } from "@/lib/utils"

interface DashboardActionCardProps {
  card: DashboardActionCardData
  className?: string
}

export default function DashboardActionCard({
  card,
  className,
}: DashboardActionCardProps) {
  const Icon = dashboardIcons[card.icon]

  return (
    <article
      className={cn(
        "flex min-h-[142px] flex-col gap-3 rounded-xl border p-4 shadow-sm shadow-slate-900/5 transition-colors hover:border-accent/30",
        toneCardClasses(card.tone),
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            toneIconClasses(card.tone)
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        {card.statusText ? (
          <Badge variant={toneBadgeVariant(card.tone)} className="px-2 py-0 text-[11px]">
            {card.statusText}
          </Badge>
        ) : null}
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            {card.label}
          </p>
          <DashboardInfoHint text={card.helperText} />
        </div>
        <DashboardMetricValue
          className="text-2xl font-bold tracking-normal text-foreground"
          value={card.value}
        />
        <p className="text-sm font-semibold leading-5 text-foreground">
          {card.secondaryValue}
        </p>
      </div>

      <div className="mt-auto space-y-2">
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
          href={card.href}
        >
          {card.ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  )
}
