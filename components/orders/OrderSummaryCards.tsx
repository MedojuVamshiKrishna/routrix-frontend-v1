import {
  ClipboardList,
  FileWarning,
  IndianRupee,
  Layers3,
  Truck,
} from "lucide-react"

import { formatCurrency } from "@/components/orders/order-utils"

interface OrderSummaryCardsProps {
  totalOrders: number
  needTrucks: number
  partiallyAssigned: number
  pendingBalance: number
  intakeDrafts: number
}

const summaryItems = [
  {
    key: "totalOrders",
    label: "Total orders this month",
    helper: "Confirmed master orders",
    icon: ClipboardList,
  },
  {
    key: "needTrucks",
    label: "Need trucks",
    helper: "Orders waiting for assignment",
    icon: Truck,
  },
  {
    key: "partiallyAssigned",
    label: "Partially assigned",
    helper: "Some trucks still pending",
    icon: Layers3,
  },
  {
    key: "pendingBalance",
    label: "Pending balance",
    helper: "Expected client balance",
    icon: IndianRupee,
  },
  {
    key: "intakeDrafts",
    label: "Intake drafts",
    helper: "Need review before confirmation",
    icon: FileWarning,
  },
] as const

export default function OrderSummaryCards({
  totalOrders,
  needTrucks,
  partiallyAssigned,
  pendingBalance,
  intakeDrafts,
}: OrderSummaryCardsProps) {
  const values = {
    totalOrders,
    needTrucks,
    partiallyAssigned,
    pendingBalance: formatCurrency(pendingBalance),
    intakeDrafts,
  }

  return (
    <section
      aria-label="Orders summary"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5"
    >
      {summaryItems.map((item) => {
        const Icon = item.icon

        return (
          <article
            className="rounded-lg border border-border bg-card p-4 shadow-sm"
            key={item.key}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {values[item.key]}
                </p>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-accent">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              {item.helper}
            </p>
          </article>
        )
      })}
    </section>
  )
}
