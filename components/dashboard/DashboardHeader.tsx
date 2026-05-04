import Link from "next/link"
import { CalendarDays, Inbox, Plus, RefreshCw, Zap } from "lucide-react"

import type { DashboardHeaderData } from "@/components/dashboard/dashboard-types"
import Badge from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"

interface DashboardHeaderProps {
  data: DashboardHeaderData
}

export default function DashboardHeader({ data }: DashboardHeaderProps) {
  return (
    <header className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm shadow-slate-900/5 md:px-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-2">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-normal text-foreground md:text-3xl">
            Dashboard
          </h1>
          <p className="max-w-4xl text-sm text-muted-foreground">
            Today&apos;s priority work: truck assignment, intake review,
            collections, and provider dues.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            {data.businessDateLabel}
          </span>
          <span className="rounded-full border border-border bg-background px-2.5 py-1">
            {data.monthLabel}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1">
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            {data.lastUpdatedAt}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:flex md:items-center">
        <Button asChild variant="accent" className="col-span-2 md:col-span-1">
          <Link href="/orders/new">
            <Plus className="h-4 w-4" />
            New Order
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/orders/new">
            <Zap className="h-4 w-4" />
            Quick Order
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/orders" className="relative">
            <Inbox className="h-4 w-4" />
            Review Intake
            {data.intakeDraftCount > 0 ? (
              <Badge variant="warning" className="ml-1 px-1.5 py-0">
                {data.intakeDraftCount}
              </Badge>
            ) : null}
          </Link>
        </Button>
      </div>
      </div>
    </header>
  )
}
