export interface OrderFormData {
  clientName: string
  loadType: string
  origin: string
  destination: string
  truckCount: number
  reportingAt: string
  deliveryDeadline: string
  rateBasis: "per-truck" | "per-trip"
  rateAmount: number
  advancePaid: number
}

interface OrderFormProps {
  onSubmit: (data: OrderFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function OrderForm({
  onSubmit,
  onCancel,
  isLoading = false,
}: OrderFormProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-card-foreground">
        Order Form
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Form fields will capture the required master order details before truck
        assignment.
      </p>
      <div className="mt-4 flex gap-3">
        <button
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
          disabled={isLoading}
          onClick={() =>
            onSubmit({
              clientName: "",
              loadType: "",
              origin: "",
              destination: "",
              truckCount: 0,
              reportingAt: "",
              deliveryDeadline: "",
              rateBasis: "per-trip",
              rateAmount: 0,
              advancePaid: 0,
            })
          }
          type="button"
        >
          Save Draft
        </button>
        <button
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
