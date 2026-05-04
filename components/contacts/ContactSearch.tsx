interface ContactSearchProps {
  label: string
  placeholder: string
  onCreateContact: () => void
}

export default function ContactSearch({
  label,
  placeholder,
  onCreateContact,
}: ContactSearchProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex gap-2">
        <input
          className="min-h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={placeholder}
          type="search"
        />
        <button
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
          onClick={onCreateContact}
          type="button"
        >
          Add
        </button>
      </div>
    </div>
  )
}
