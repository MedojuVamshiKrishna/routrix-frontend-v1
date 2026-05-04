import { cn } from "@/lib/utils"

interface DashboardMetricValueProps {
  value: string
  className?: string
}

function compactIndianCurrency(value: number) {
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(1).replace(/\.0$/, "")}Cr`
  }

  if (value >= 100000) {
    return `${(value / 100000).toFixed(1).replace(/\.0$/, "")}L`
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`
  }

  return value.toLocaleString("en-IN")
}

function getMetricDisplay(value: string) {
  const trimmed = value.trim()
  const currencyMatch = trimmed.match(/^INR\s*([\d,]+)$/i)

  if (currencyMatch) {
    const amount = Number(currencyMatch[1].replaceAll(",", ""))

    if (Number.isNaN(amount)) {
      return { shortValue: trimmed, fullValue: trimmed }
    }

    return {
      shortValue: `INR ${compactIndianCurrency(amount)}`,
      fullValue: `INR ${amount.toLocaleString("en-IN")}`,
    }
  }

  return {
    shortValue: trimmed,
    fullValue: trimmed,
  }
}

export default function DashboardMetricValue({
  value,
  className,
}: DashboardMetricValueProps) {
  const { shortValue, fullValue } = getMetricDisplay(value)

  return (
    <span className="group relative inline-flex max-w-full">
      <span className={cn("truncate", className)}>{shortValue}</span>
      {shortValue !== fullValue ? (
        <span className="pointer-events-none absolute left-0 top-full z-20 mt-2 hidden rounded-lg border border-border bg-popover px-3 py-2 text-xs leading-5 text-popover-foreground shadow-lg group-hover:block group-focus-within:block">
          {fullValue}
        </span>
      ) : null}
    </span>
  )
}
