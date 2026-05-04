import InternalPageHeader from "@/components/layout/InternalPageHeader"

interface PageWrapperProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export default function PageWrapper({
  title,
  description,
  children,
}: PageWrapperProps) {
  return (
    <div className="p-6 flex flex-col gap-6">
      <InternalPageHeader description={description} title={title} />
      {children}
    </div>
  )
}
