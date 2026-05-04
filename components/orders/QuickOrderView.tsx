"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import OrderConfirmModal from "@/components/orders/OrderConfirmModal"
import { Button } from "@/components/ui/Button"
import { createQuickOrderRecord } from "@/lib/routrix-local-data"

interface QuickOrderValues {
  clientNameOrPhone: string
  origin: string
  destination: string
  truckCount: string
  roughReportingTime: string
  rateOrPricingNote: string
  advancePaid: string
  notes: string
}

const initialValues: QuickOrderValues = {
  clientNameOrPhone: "",
  origin: "",
  destination: "",
  truckCount: "",
  roughReportingTime: "",
  rateOrPricingNote: "",
  advancePaid: "",
  notes: "",
}

export default function QuickOrderView() {
  const router = useRouter()
  const [values, setValues] = useState(initialValues)
  const [message, setMessage] = useState("")
  const [showCancelModal, setShowCancelModal] = useState(false)

  function updateValue(name: keyof QuickOrderValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }))
    setMessage("")
  }

  function saveQuickDraft() {
    if (
      !values.clientNameOrPhone.trim() ||
      !values.origin.trim() ||
      !values.destination.trim()
    ) {
      setMessage(
        "Add at least client, origin, and destination before saving a quick draft."
      )
      return
    }

    createQuickOrderRecord(values)
    router.push("/orders/intake")
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-card-foreground">
          Quick capture
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Capture the basics now. Complete and confirm before truck assignment.
        </p>
        <div className="mt-5 grid gap-4">
          <QuickField
            label="Client name or phone"
            onChange={(value) => updateValue("clientNameOrPhone", value)}
            placeholder="Client name or phone"
            value={values.clientNameOrPhone}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <QuickField
              label="Origin"
              onChange={(value) => updateValue("origin", value)}
              placeholder="Hyderabad"
              value={values.origin}
            />
            <QuickField
              label="Destination"
              onChange={(value) => updateValue("destination", value)}
              placeholder="Visakhapatnam"
              value={values.destination}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <QuickField
              label="Truck count"
              onChange={(value) => updateValue("truckCount", value)}
              placeholder="10"
              type="number"
              value={values.truckCount}
            />
            <QuickField
              label="Rough reporting time"
              onChange={(value) => updateValue("roughReportingTime", value)}
              placeholder="Tomorrow morning"
              value={values.roughReportingTime}
            />
          </div>
          <QuickField
            label="Rate or pricing note"
            onChange={(value) => updateValue("rateOrPricingNote", value)}
            placeholder="Rs 1,40,000 total, final rate to confirm"
            value={values.rateOrPricingNote}
          />
          <QuickField
            label="Advance paid"
            onChange={(value) => updateValue("advancePaid", value)}
            placeholder="0"
            type="number"
            value={values.advancePaid}
          />
          <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
            Notes
            <textarea
              className="min-h-28 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring"
              onChange={(event) => updateValue("notes", event.target.value)}
              placeholder="Messy call details, client promise, missing fields"
              value={values.notes}
            />
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-amber-200 bg-card p-4 shadow-sm">
        <h2 className="text-base font-semibold text-foreground">
          What happens after save
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          This saves the quick entry locally right away, adds it to Intake Drafts,
          and also creates a visible master order so dispatch can continue the
          workflow without backend storage.
        </p>
      </section>

      {message ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {message}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow-sm sm:flex-row sm:justify-end">
        <Button
          onClick={() => setShowCancelModal(true)}
          type="button"
          variant="outline"
        >
          Cancel
        </Button>
        <Button asChild variant="outline">
          <Link href="/orders/new">Continue full order</Link>
        </Button>
        <Button onClick={saveQuickDraft} type="button" variant="accent">
          Save quick draft
        </Button>
      </div>

      <OrderConfirmModal
        confirmLabel="Leave quick order"
        description="This quick draft has not been saved. Return to Orders?"
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => router.push("/orders")}
        title="Cancel quick order?"
      />
    </div>
  )
}

function QuickField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
      {label}
      <input
        className="h-12 rounded-lg border border-input bg-background px-3 text-base outline-none focus:border-accent focus:ring-2 focus:ring-ring sm:text-sm"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  )
}
