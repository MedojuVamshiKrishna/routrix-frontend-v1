import Badge from "@/components/ui/Badge"

interface OrderStatusBadgeProps {
  label: string
  tone?: "outline" | "success" | "warning" | "danger" | "info" | "accent"
}

export default function OrderStatusBadge({
  label,
  tone = "outline",
}: OrderStatusBadgeProps) {
  return (
    <Badge
      className="w-fit max-w-full whitespace-nowrap px-3 py-1.5 text-xs leading-5"
      variant={tone}
    >
      {label}
    </Badge>
  )
}
