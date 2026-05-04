import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/Button"

interface DashboardSectionErrorProps {
  title: string
  description?: string
  retryLabel?: string
}

export default function DashboardSectionError({
  title,
  description,
  retryLabel = "Retry",
}: DashboardSectionErrorProps) {
  return (
    <div className="flex min-h-[132px] flex-col items-start justify-center gap-3 rounded-lg border border-red-200 bg-red-50/40 p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-red-700">{title}</p>
        {description ? <p className="text-sm text-red-600">{description}</p> : null}
      </div>
      <Button variant="outline" size="sm" type="button">
        <RefreshCw className="h-4 w-4" />
        {retryLabel}
      </Button>
    </div>
  )
}
