import PageWrapper from "@/components/layout/PageWrapper"
import OrderDetailPageClient from "@/components/orders/OrderDetailPageClient"

export default async function OrderDetailPage(
  props: PageProps<"/orders/[id]">
) {
  const { id } = await props.params

  return (
    <PageWrapper
      title="Order Detail"
      description={`Master order ${id} with linked trips, charges, documents, provider dues, and profitability.`}
    >
      <OrderDetailPageClient orderId={id} />
    </PageWrapper>
  )
}
