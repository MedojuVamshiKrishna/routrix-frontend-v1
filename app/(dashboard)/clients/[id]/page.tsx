import PageWrapper from "@/components/layout/PageWrapper"

export default async function ClientDetailPage(
  props: PageProps<"/clients/[id]">
) {
  const { id } = await props.params

  return (
    <PageWrapper
      title="Client Detail"
      description={`Account, orders, invoices, and settlement history for client ${id}.`}
    />
  )
}
