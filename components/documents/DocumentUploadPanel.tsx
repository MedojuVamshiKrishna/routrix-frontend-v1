interface DocumentUploadPanelProps {
  acceptedFormats: string[]
}

export default function DocumentUploadPanel({
  acceptedFormats,
}: DocumentUploadPanelProps) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card p-4">
      <h2 className="text-lg font-semibold text-card-foreground">
        Documents
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Attach photos or PDFs to an order or trip when proof is available.
      </p>
      <p className="mt-3 text-xs text-muted-foreground">
        Accepted formats: {acceptedFormats.join(", ")}
      </p>
    </div>
  )
}
