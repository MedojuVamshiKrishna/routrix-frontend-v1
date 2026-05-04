"use client"

import OrdersListView from "@/components/orders/OrdersListView"
import useRoutrixLocalData from "@/components/orders/useRoutrixLocalData"

export default function OrdersPageClient() {
  const { drafts, orders } = useRoutrixLocalData()

  const activeDraftCount = drafts.filter(
    (draft) => draft.status !== "Converted" && draft.status !== "Rejected"
  ).length

  return (
    <OrdersListView intakeDraftCount={activeDraftCount} orders={orders} />
  )
}
