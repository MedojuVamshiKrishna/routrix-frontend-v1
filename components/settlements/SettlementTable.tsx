interface SettlementTableProps {
  settlements: Array<{
    invoiceId: string
    clientName: string
    amountReceived: number
    balanceDue: number
    status: string
  }>
}

export default function SettlementTable({
  settlements,
}: SettlementTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Invoice</th>
            <th className="px-4 py-3 font-medium">Client</th>
            <th className="px-4 py-3 font-medium">Received</th>
            <th className="px-4 py-3 font-medium">Balance</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {settlements.map((settlement) => (
            <tr className="border-t border-border" key={settlement.invoiceId}>
              <td className="px-4 py-3 font-medium">
                {settlement.invoiceId}
              </td>
              <td className="px-4 py-3">{settlement.clientName}</td>
              <td className="px-4 py-3">
                {settlement.amountReceived.toLocaleString("en-IN")}
              </td>
              <td className="px-4 py-3">
                {settlement.balanceDue.toLocaleString("en-IN")}
              </td>
              <td className="px-4 py-3">{settlement.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
