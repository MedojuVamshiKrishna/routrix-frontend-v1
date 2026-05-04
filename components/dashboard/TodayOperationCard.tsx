import Link from "next/link"
import { ArrowRight } from "lucide-react"

import type { TodayOperationItem } from "@/components/dashboard/dashboard-types"
import { toneBadgeVariant } from "@/components/dashboard/dashboard-ui"
import Badge from "@/components/ui/Badge"

interface TodayOperationCardProps {
  item: TodayOperationItem
}

export default function TodayOperationCard({ item }: TodayOperationCardProps) {
  return (
    <Link
      href={item.href}
      className="grid min-h-[112px] gap-3 rounded-xl border border-border bg-background px-4 py-3 transition-colors hover:border-accent/30 hover:bg-muted/70 xl:min-h-[72px] xl:grid-cols-[5.5rem_minmax(0,1fr)_9rem_4.5rem] xl:items-center"
    >
      <div className="flex items-center justify-between gap-2 xl:block">
        <div>
          <p className="text-sm font-semibold text-foreground">{item.timeLabel}</p>
          <p className="text-xs text-muted-foreground">{item.dateLabel}</p>
        </div>
        <Badge variant={toneBadgeVariant(item.statusTone)} className="px-2 py-0 text-[11px] xl:hidden">
          {item.statusLabel}
        </Badge>
      </div>

      <div className="min-w-0 space-y-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {item.clientName}
        </p>
        <p className="truncate text-sm text-muted-foreground">{item.route}</p>
        <p className="text-xs font-medium text-muted-foreground">{item.orderId}</p>
      </div>

      <div className="space-y-1">
        <Badge variant={toneBadgeVariant(item.statusTone)} className="hidden px-2 py-0 text-[11px] xl:inline-flex">
          {item.statusLabel}
        </Badge>
        <p className="text-sm font-semibold text-foreground">{item.truckLabel}</p>
      </div>

      <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
        Open
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  )
}
