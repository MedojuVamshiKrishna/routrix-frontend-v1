import PageWrapper from "@/components/layout/PageWrapper"
import IntakeDraftsPageClient from "@/components/orders/IntakeDraftsPageClient"

export default function IntakeDraftsPage() {
  return (
    <PageWrapper
      title="Intake Drafts"
      description="Review quick and external drafts before they become confirmed master orders."
    >
      <IntakeDraftsPageClient />
    </PageWrapper>
  )
}
