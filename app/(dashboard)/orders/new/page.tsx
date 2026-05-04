import PageWrapper from "@/components/layout/PageWrapper"
import OrderFormView from "@/components/orders/OrderFormView"

export default async function NewOrderPage(
  props: PageProps<"/orders/new">
) {
  const searchParams = await props.searchParams
  const orderId =
    typeof searchParams.orderId === "string" ? searchParams.orderId : undefined
  const isEditMode = searchParams.mode === "edit" && Boolean(orderId)

  return (
    <PageWrapper
      title={isEditMode ? "Edit Order" : "New Order"}
      description={
        isEditMode
          ? "Update client, route, truck, timing, rate, and charge details on the existing order."
          : "Capture client, route, trucks, timing, rate, advance, and invoice-ready charges while the client is on the call."
      }
    >
      <OrderFormView orderId={orderId} />
    </PageWrapper>
  )
}
