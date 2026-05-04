"use client"

import Link from "next/link"
import { ArrowRight, Copy, Phone } from "lucide-react"

import type { PaymentFollowUpItem } from "@/components/dashboard/dashboard-types"
import { toneBadgeVariant } from "@/components/dashboard/dashboard-ui"
import Badge from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"

interface PaymentFollowUpCardProps {
  item: PaymentFollowUpItem
  copyState: "idle" | "success" | "error"
  onCopy: (item: PaymentFollowUpItem) => void
}

export default function PaymentFollowUpCard({
  item,
  copyState,
  onCopy,
}: PaymentFollowUpCardProps) {
  return (
    <article className="grid min-h-[148px] gap-3 rounded-lg border border-border bg-background/70 p-4 xl:min-h-16 xl:grid-cols-[minmax(0,1fr)_10rem_10rem_12rem] xl:items-center">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <p className="truncate text-sm font-semibold text-foreground">
            {item.clientName}
          </p>
          <Badge variant={toneBadgeVariant(item.statusTone)}>
            {item.statusLabel}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {item.invoiceId} / {item.monthLabel}
        </p>
      </div>

      <div>
        <p className="text-sm font-bold text-foreground">{item.balanceLabel}</p>
        <p className="text-xs text-muted-foreground">Balance due</p>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground">
          {item.lastPaymentLabel}
        </p>
        <p className="text-xs text-muted-foreground">Last payment</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row xl:justify-end">
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => onCopy(item)}
        >
          <Copy className="h-4 w-4" />
          Copy message
        </Button>
        <Button asChild variant="secondary" size="sm">
          <Link href={item.href}>
            Open
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {copyState === "success" ? (
        <p className="text-sm font-medium text-emerald-700 xl:col-span-4">
          Message copied
        </p>
      ) : null}
      {copyState === "error" ? (
        <p className="text-sm font-medium text-red-700 xl:col-span-4">
          Could not copy. Select and copy manually.
        </p>
      ) : null}
    </article>
  )
}
