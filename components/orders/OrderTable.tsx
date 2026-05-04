interface OrderTableProps {
  orders: Array<{
    id: string
    clientName: string
    route: string
    truckCount: number
    status: string
  }>
}

export default function OrderTable({ orders }: OrderTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Order</th>
            <th className="px-4 py-3 font-medium">Client</th>
            <th className="px-4 py-3 font-medium">Route</th>
            <th className="px-4 py-3 font-medium">Trucks</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr className="border-t border-border" key={order.id}>
              <td className="px-4 py-3 font-medium">{order.id}</td>
              <td className="px-4 py-3">{order.clientName}</td>
              <td className="px-4 py-3">{order.route}</td>
              <td className="px-4 py-3">{order.truckCount}</td>
              <td className="px-4 py-3">{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
