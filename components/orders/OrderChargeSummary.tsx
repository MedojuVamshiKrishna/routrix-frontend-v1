interface OrderChargeSummaryProps {
  baseAmount: number
  advancePaid: number
  chargeableExtras: number
}

export default function OrderChargeSummary({
  baseAmount,
  advancePaid,
  chargeableExtras,
}: OrderChargeSummaryProps) {
  const finalBalance = baseAmount + chargeableExtras - advancePaid

  return (
    <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-card-foreground">
        Charge Summary
      </h2>
      <dl className="mt-4 grid gap-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Base amount</dt>
          <dd className="font-medium">{baseAmount.toLocaleString("en-IN")}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Chargeable extras</dt>
          <dd className="font-medium">
            {chargeableExtras.toLocaleString("en-IN")}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Advance paid</dt>
          <dd className="font-medium">{advancePaid.toLocaleString("en-IN")}</dd>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <dt className="font-semibold text-card-foreground">Final balance</dt>
          <dd className="font-semibold">
            {finalBalance.toLocaleString("en-IN")}
          </dd>
        </div>
      </dl>
    </div>
  )
}
