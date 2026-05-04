import Link from "next/link"

import { Button } from "@/components/ui/Button"

interface DashboardEmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  href?: string
}

export default function DashboardEmptyState({
  title,
  description,
  actionLabel,
  href,
}: DashboardEmptyStateProps) {
  return (
    <div className="flex min-h-[132px] flex-col items-start justify-center gap-3 rounded-lg border border-dashed border-border bg-background/60 p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actionLabel && href ? (
        <Button asChild variant="outline" size="sm">
          <Link href={href}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  )
}
