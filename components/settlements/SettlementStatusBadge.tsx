interface SettlementStatusBadgeProps {
  status: "unpaid" | "partially-paid" | "paid" | "overdue"
}

const statusLabels: Record<SettlementStatusBadgeProps["status"], string> = {
  unpaid: "Unpaid",
  "partially-paid": "Partially paid",
  paid: "Paid",
  overdue: "Overdue",
}

export default function SettlementStatusBadge({
  status,
}: SettlementStatusBadgeProps) {
  return (
    <span className="inline-flex rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
      {statusLabels[status]}
    </span>
  )
}
