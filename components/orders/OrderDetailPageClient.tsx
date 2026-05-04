"use client"

import OrderDetailView from "@/components/orders/OrderDetailView"

interface OrderDetailPageClientProps {
  orderId: string
}

export default function OrderDetailPageClient({
  orderId,
}: OrderDetailPageClientProps) {
  return <OrderDetailView orderId={orderId} />
}
