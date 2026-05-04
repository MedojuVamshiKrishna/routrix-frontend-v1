"use client"

import IntakeDraftsView from "@/components/orders/IntakeDraftsView"
import useRoutrixLocalData from "@/components/orders/useRoutrixLocalData"

export default function IntakeDraftsPageClient() {
  const { drafts } = useRoutrixLocalData()

  return <IntakeDraftsView drafts={drafts} />
}
