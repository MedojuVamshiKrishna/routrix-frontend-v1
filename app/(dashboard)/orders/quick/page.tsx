import PageWrapper from "@/components/layout/PageWrapper"
import QuickOrderView from "@/components/orders/QuickOrderView"

export default function QuickOrderPage() {
  return (
    <PageWrapper
      title="Quick Order"
      description="Capture the basics now. Complete and confirm before truck assignment."
    >
      <QuickOrderView />
    </PageWrapper>
  )
}
