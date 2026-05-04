import Link from "next/link"
import { ArrowRight, Truck } from "lucide-react"

import type { ReturnReadyTruck } from "@/components/dashboard/dashboard-types"
import { toneBadgeVariant } from "@/components/dashboard/dashboard-ui"
import Badge from "@/components/ui/Badge"

interface ReturnReadyTruckCardProps {
  truck: ReturnReadyTruck
}

export default function ReturnReadyTruckCard({ truck }: ReturnReadyTruckCardProps) {
  return (
    <article className="flex min-h-[164px] min-w-[260px] flex-col gap-3 rounded-lg border border-border bg-background/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground">
            <Truck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {truck.truckNumber}
            </p>
            <p className="text-xs text-muted-foreground">{truck.currentCity}</p>
          </div>
        </div>
        <Badge variant={toneBadgeVariant(truck.statusTone)}>
          {truck.statusLabel}
        </Badge>
      </div>

      <div className="space-y-1 text-sm">
        <p className="text-muted-foreground">Last: {truck.lastRoute}</p>
        <p className="font-medium text-foreground">
          Suggested: {truck.suggestedRoute}
        </p>
        <p className="text-xs text-muted-foreground">{truck.ageLabel}</p>
      </div>

      <Link
        className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
        href={truck.href}
      >
        View truck
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  )
}
