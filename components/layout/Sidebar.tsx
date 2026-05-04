"use client"

import {
  BarChart3,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  CreditCard,
  FileText,
  Home,
  ReceiptText,
  Route,
  Truck,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { cn } from "@/lib/utils"

const navigationItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: Home,
    matches: ["/"],
  },
  {
    label: "Orders",
    href: "/orders",
    icon: ClipboardList,
    matches: ["/orders"],
  },
  {
    label: "Trips",
    href: "/trips",
    icon: Route,
    matches: ["/trips"],
  },
  {
    label: "Vehicles",
    href: "/vehicles",
    icon: Truck,
    matches: ["/vehicles"],
  },
  {
    label: "Clients",
    href: "/clients",
    icon: Users,
    matches: ["/clients"],
  },
  {
    label: "Invoices",
    href: "/invoices",
    icon: ReceiptText,
    matches: ["/invoices"],
  },
  {
    label: "Settlements",
    href: "/settlements",
    icon: CreditCard,
    matches: ["/settlements"],
  },
  {
    label: "Balances",
    href: "/balances",
    icon: BarChart3,
    matches: ["/balances"],
  },
]

const sidebarCollapsedStorageKey = "routrix-sidebar-collapsed"

function isNavigationItemActive(pathname: string, matches: string[]) {
  return matches.some((match) => {
    if (match === "/") {
      return pathname === "/"
    }

    return pathname === match || pathname.startsWith(`${match}/`)
  })
}

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false
    }

    return window.localStorage.getItem(sidebarCollapsedStorageKey) === "true"
  })

  function handleToggleSidebar() {
    setIsCollapsed((current) => {
      const nextValue = !current
      window.localStorage.setItem(sidebarCollapsedStorageKey, String(nextValue))
      return nextValue
    })
  }

  return (
    <aside
      className={cn(
        "border-b border-border bg-secondary/60 transition-[width] duration-200 md:sticky md:top-0 md:h-screen md:shrink-0 md:border-b-0 md:border-r",
        isCollapsed ? "md:w-20" : "md:w-64"
      )}
    >
      <div className="flex h-full flex-col">
        <div
          className={cn(
            "flex items-center gap-3 border-b border-border/80 px-4 py-4 md:py-5",
            isCollapsed ? "md:justify-center md:px-3" : "md:px-5"
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-sm shadow-accent/20">
            <Truck className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className={cn("min-w-0", isCollapsed && "md:hidden")}>
            <p className="truncate text-base font-bold text-foreground">
              Routrix
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Fleet operations
            </p>
          </div>
          <button
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "ml-auto hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-card hover:text-foreground md:inline-flex",
              isCollapsed && "md:ml-0"
            )}
            onClick={handleToggleSidebar}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            type="button"
          >
            {isCollapsed ? (
              <ChevronsRight className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>

        <nav
          aria-label="Primary navigation"
          className={cn(
            "flex gap-2 overflow-x-auto px-4 py-3 md:flex-1 md:flex-col md:overflow-x-visible md:py-5",
            isCollapsed ? "md:px-3" : "md:px-3"
          )}
        >
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = isNavigationItemActive(pathname, item.matches)

            return (
              <Link
                aria-label={isCollapsed ? item.label : undefined}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex w-full min-w-fit items-center justify-start gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors md:min-w-0",
                  isCollapsed && "md:justify-center md:px-0",
                  isActive
                    ? "border border-border bg-card text-foreground shadow-sm shadow-slate-900/5"
                    : "text-muted-foreground hover:bg-card/80 hover:text-foreground"
                )}
                href={item.href}
                key={item.href}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive && "text-accent"
                  )}
                  aria-hidden="true"
                />
                <span className={cn(isCollapsed && "md:hidden")}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="hidden border-t border-border/80 p-4 md:block">
          <div
            className={cn(
              "rounded-xl border border-border bg-card p-3 shadow-sm shadow-slate-900/5",
              isCollapsed && "flex justify-center p-2"
            )}
            title="Today register"
          >
            <div
              className={cn(
                "flex items-center gap-2 text-sm font-semibold text-foreground",
                isCollapsed && "justify-center"
              )}
            >
              <FileText className="h-4 w-4 text-accent" aria-hidden="true" />
              <span className={cn(isCollapsed && "md:hidden")}>
                Today register
              </span>
            </div>
            <p
              className={cn(
                "mt-1 text-xs leading-5 text-muted-foreground",
                isCollapsed && "md:hidden"
              )}
            >
              Review open orders, truck gaps, and money follow-ups first.
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
