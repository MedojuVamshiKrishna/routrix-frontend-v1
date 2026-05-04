import Link from "next/link"
import { AlertTriangle, ArrowRight } from "lucide-react"

import type { DashboardRiskItem } from "@/components/dashboard/dashboard-types"
import Badge from "@/components/ui/Badge"
import { cn } from "@/lib/utils"

interface RiskItemCardProps {
  item: DashboardRiskItem
}

function severityVariant(severity: DashboardRiskItem["severity"]) {
  if (severity === "urgent") return "danger"
  if (severity === "warning") return "warning"
  return "info"
}

function severityLabel(severity: DashboardRiskItem["severity"]) {
  if (severity === "urgent") return "Urgent"
  if (severity === "warning") return "Needs review"
  return "Info"
}

export default function RiskItemCard({ item }: RiskItemCardProps) {
  const isUrgent = item.severity === "urgent"

  return (
    <article
      className={cn(
        "min-h-[152px] rounded-xl border bg-background p-4",
        isUrgent
          ? "border-l-4 border-red-200 border-l-red-400"
          : item.severity === "warning"
            ? "border-l-4 border-amber-200 border-l-amber-400"
            : "border-border"
      )}
    >
      <div className="flex h-full flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={severityVariant(item.severity)}
            className="px-2 py-0 text-[11px]"
          >
            <AlertTriangle className="mr-1 h-3 w-3" />
            {severityLabel(item.severity)}
          </Badge>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {item.category}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {item.recordLabel}
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-base font-semibold leading-6 text-foreground">
            {item.title}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {item.description}
          </p>
          {item.amountLabel ? (
            <p className="text-base font-semibold text-foreground">
              {item.amountLabel}
            </p>
          ) : null}
        </div>

        <Link
          className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
          href={item.href}
        >
          {item.ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  )
}
