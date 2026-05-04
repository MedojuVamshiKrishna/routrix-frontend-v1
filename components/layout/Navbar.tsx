import { Bell, CalendarDays, Plus, Search } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/Button"

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-card px-3 font-medium text-foreground shadow-sm shadow-slate-900/5">
            <CalendarDays className="h-4 w-4 text-accent" aria-hidden="true" />
            03 May 2026
          </span>
          <span className="hidden truncate md:inline">
            Fleet operations, billing, and settlement register
          </span>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex min-h-10 items-center gap-2 rounded-xl border border-input bg-card px-3 text-sm text-muted-foreground shadow-sm shadow-slate-900/5 sm:w-80">
            <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">Search orders, clients, trucks</span>
          </div>
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/orders/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Order
            </Link>
          </Button>
          <Button
            aria-label="Notifications"
            size="icon"
            type="button"
            variant="outline"
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </header>
  )
}
