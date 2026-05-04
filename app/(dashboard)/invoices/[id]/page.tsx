import PageWrapper from "@/components/layout/PageWrapper"

export default async function InvoiceDetailPage(
  props: PageProps<"/invoices/[id]">
) {
  const { id } = await props.params

  return (
    <PageWrapper
      title="Invoice Detail"
      description={`Invoice ${id} review, payment entries, partial settlement, and export actions.`}
    />
  )
}
