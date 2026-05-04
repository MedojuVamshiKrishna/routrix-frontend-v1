import { CircleHelp } from "lucide-react"

interface DashboardInfoHintProps {
  text: string
}

export default function DashboardInfoHint({ text }: DashboardInfoHintProps) {
  return (
    <span className="group relative inline-flex shrink-0">
      <span
        aria-label={text}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
        role="img"
        tabIndex={0}
      >
        <CircleHelp className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-52 -translate-x-1/2 rounded-lg border border-border bg-popover px-3 py-2 text-xs leading-5 text-popover-foreground shadow-lg group-hover:block group-focus-within:block">
        {text}
      </span>
    </span>
  )
}
