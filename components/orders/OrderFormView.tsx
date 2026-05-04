"use client"

import {
  AlertTriangle,
  CalendarDays,
  Check,
  Clock3,
  Plus,
  Search,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import type {
  ComponentType,
  FocusEventHandler,
  HTMLAttributes,
  ReactNode,
} from "react"

import OrderConfirmModal from "@/components/orders/OrderConfirmModal"
import OrderFlyout from "@/components/orders/OrderFlyout"
import { formatCurrency } from "@/components/orders/order-utils"
import useRoutrixLocalData from "@/components/orders/useRoutrixLocalData"
import { Button } from "@/components/ui/Button"
import {
  createDirectOrderRecord,
  updateOrderDetail,
} from "@/lib/routrix-local-data"
import { cn } from "@/lib/utils"

interface OrderFormValues {
  clientName: string
  loadType: string
  origin: string
  destination: string
  truckCount: string
  multiPointNote: string
  reportingAt: string
  deliveryDeadline: string
  rateBasis: "per-truck" | "per-trip"
  rateAmount: string
  adjustmentNote: string
  advancePaid: string
  paymentNote: string
  laborCharge: string
  waitingDays: string
  waitingRate: string
  multiPointDiesel: string
  extraDistanceCharge: string
  otherCharge: string
  otherChargeNote: string
}

const initialValues: OrderFormValues = {
  clientName: "",
  loadType: "",
  origin: "",
  destination: "",
  truckCount: "1",
  multiPointNote: "",
  reportingAt: "",
  deliveryDeadline: "",
  rateBasis: "per-trip",
  rateAmount: "",
  adjustmentNote: "",
  advancePaid: "0",
  paymentNote: "",
  laborCharge: "",
  waitingDays: "",
  waitingRate: "",
  multiPointDiesel: "",
  extraDistanceCharge: "",
  otherCharge: "",
  otherChargeNote: "",
}

interface ClientOption {
  id: string
  name: string
  phone: string
  location: string
}

const mockClientOptions: ClientOption[] = [
  {
    id: "client-sri-balaji",
    name: "Sri Balaji Traders",
    phone: "9876543210",
    location: "Hyderabad",
  },
  {
    id: "client-kaveri-foods",
    name: "Kaveri Foods",
    phone: "9849012345",
    location: "Vijayawada",
  },
  {
    id: "client-rama-traders",
    name: "Rama Traders",
    phone: "9988776655",
    location: "Warangal",
  },
  {
    id: "client-metro-cold-chain",
    name: "Metro Cold Chain",
    phone: "9811112233",
    location: "Visakhapatnam",
  },
]

interface OrderFormViewProps {
  orderId?: string
}

export default function OrderFormView({ orderId }: OrderFormViewProps) {
  const router = useRouter()
  const { orders } = useRoutrixLocalData()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showClientFlyout, setShowClientFlyout] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [isClientMenuOpen, setIsClientMenuOpen] = useState(false)
  const clientSearchContainerRef = useRef<HTMLDivElement | null>(null)
  const existingOrder = useMemo(
    () => (orderId ? orders.find((order) => order.id === orderId) : undefined),
    [orderId, orders]
  )
  const hydratedOrderIdRef = useRef<string | null>(null)

  const calculation = useMemo(() => {
    const truckCount = Number(values.truckCount) || 0
    const rateAmount = Number(values.rateAmount) || 0
    const laborCharge = Number(values.laborCharge) || 0
    const waitingAmount =
      (Number(values.waitingDays) || 0) * (Number(values.waitingRate) || 0)
    const extras =
      laborCharge +
      waitingAmount +
      (Number(values.multiPointDiesel) || 0) +
      (Number(values.extraDistanceCharge) || 0) +
      (Number(values.otherCharge) || 0)
    const baseAmount =
      values.rateBasis === "per-truck" ? truckCount * rateAmount : rateAmount
    const advancePaid = Number(values.advancePaid) || 0

    return {
      baseAmount,
      extras,
      advancePaid,
      expectedBalance: baseAmount + extras - advancePaid,
      waitingAmount,
    }
  }, [values])

  const filteredClientOptions = useMemo(() => {
    const query = values.clientName.trim().toLowerCase()

    if (!query) {
      return mockClientOptions
    }

    // Keep local filtering simple for now. Backend can replace this with
    // API-backed search results without changing the combobox contract.
    return mockClientOptions.filter((client) => {
      const haystack = `${client.name} ${client.phone} ${client.location}`.toLowerCase()
      return haystack.includes(query)
    })
  }, [values.clientName])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        clientSearchContainerRef.current &&
        !clientSearchContainerRef.current.contains(event.target as Node)
      ) {
        setIsClientMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [])

  useEffect(() => {
    if (!existingOrder || hydratedOrderIdRef.current === existingOrder.id) {
      return
    }

    hydratedOrderIdRef.current = existingOrder.id

    setValues({
      clientName: existingOrder.clientName,
      loadType: existingOrder.loadType,
      origin: existingOrder.origin,
      destination: existingOrder.destination,
      truckCount: String(existingOrder.truckCount),
      multiPointNote: existingOrder.notes ?? "",
      reportingAt: "",
      deliveryDeadline: "",
      rateBasis: existingOrder.truckCount > 1 ? "per-truck" : "per-trip",
      rateAmount: String(
        existingOrder.truckCount > 1
          ? Math.round(existingOrder.baseAmount / existingOrder.truckCount)
          : existingOrder.baseAmount
      ),
      adjustmentNote: "",
      advancePaid: String(existingOrder.advancePaid),
      paymentNote: "",
      laborCharge: String(Math.round(existingOrder.chargeableExtras * 0.3)),
      waitingDays: "",
      waitingRate: "",
      multiPointDiesel: String(Math.round(existingOrder.chargeableExtras * 0.22)),
      extraDistanceCharge: String(Math.round(existingOrder.chargeableExtras * 0.18)),
      otherCharge: String(
        Math.max(
          existingOrder.chargeableExtras -
            Math.round(existingOrder.chargeableExtras * 0.7),
          0
        )
      ),
      otherChargeNote: "",
    })
  }, [existingOrder])

  function updateValue(name: keyof OrderFormValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => {
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  function validate() {
    const nextErrors: Record<string, string> = {}
    const requiredFields: Array<keyof OrderFormValues> = [
      "clientName",
      "origin",
      "destination",
      "truckCount",
      "reportingAt",
      "rateAmount",
    ]

    requiredFields.forEach((field) => {
      if (!values[field].trim()) {
        nextErrors[field] = "Required for a confirmed master order."
      }
    })

    if ((Number(values.truckCount) || 0) < 1) {
      nextErrors.truckCount = "Truck count must be at least 1."
    }

    if ((Number(values.rateAmount) || 0) <= 0) {
      nextErrors.rateAmount = "Enter the agreed rate before saving."
    }

    if (
      values.reportingAt &&
      values.deliveryDeadline &&
      values.deliveryDeadline < values.reportingAt
    ) {
      nextErrors.deliveryDeadline =
        "Delivery deadline cannot be before reporting time."
    }

    if (
      Number(values.multiPointDiesel) > 0 &&
      values.multiPointNote.trim().length === 0
    ) {
      nextErrors.multiPointNote =
        "Add a multi-point note when billing multi-point diesel."
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSave(target: "detail" | "orders") {
    setSaveMessage("")
    if (!validate()) {
      setSaveMessage("Fix the highlighted fields before saving this order.")
      return
    }

    const noteParts = [
      values.adjustmentNote.trim(),
      values.paymentNote.trim(),
      values.otherChargeNote.trim(),
      values.multiPointNote.trim(),
    ].filter(Boolean)
    if (existingOrder) {
      updateOrderDetail(existingOrder.id, {
        clientName: values.clientName,
        loadType: values.loadType,
        origin: values.origin,
        destination: values.destination,
        truckCount: Math.max(Number(values.truckCount) || 1, 1),
        reportingAt: values.reportingAt || existingOrder.reportingAt,
        deliveryDeadline: values.deliveryDeadline || existingOrder.deliveryDeadline,
        notes: noteParts.join(" | "),
      })

      router.push(target === "detail" ? `/orders/${existingOrder.id}` : "/orders")
      return
    }

    const nextData = createDirectOrderRecord({
      clientName: values.clientName,
      loadType: values.loadType,
      origin: values.origin,
      destination: values.destination,
      truckCount: values.truckCount,
      reportingAt: values.reportingAt,
      deliveryDeadline: values.deliveryDeadline,
      rateAmount: values.rateAmount,
      advancePaid: values.advancePaid,
      notes: noteParts.join(" | "),
      source: "Direct",
      chargeableExtras: calculation.extras,
    })
    const targetOrderId = nextData.orders[0]?.id ?? "ORD-1042"

    router.push(target === "detail" ? `/orders/${targetOrderId}` : "/orders")
  }

  function updateIntegerValue(name: keyof OrderFormValues, value: string) {
    updateValue(name, sanitizeIntegerInput(value))
  }

  function updateCurrencyValue(name: keyof OrderFormValues, value: string) {
    updateValue(name, sanitizeCurrencyInput(value))
  }

  function handleClientSelect(client: ClientOption) {
    updateValue("clientName", client.name)
    setIsClientMenuOpen(false)
  }

  const advanceWarning =
    calculation.advancePaid > calculation.baseAmount + calculation.extras

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="flex flex-col gap-4">
        <FormSection
          description="Search first. If the client is not saved yet, add the client without leaving order entry."
          title="Client"
        >
          <div className="grid items-end gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
            <div ref={clientSearchContainerRef} className="relative">
              <Field
                error={errors.clientName}
                label="Client"
                leadingIcon={Search}
                onChange={(value) => {
                  updateValue("clientName", value)
                  setIsClientMenuOpen(true)
                }}
                onFocus={() => setIsClientMenuOpen(true)}
                placeholder="Search client by name or phone"
                value={values.clientName}
              />
              {isClientMenuOpen ? (
                <div className="absolute z-20 mt-2 w-full rounded-lg border border-border bg-card shadow-lg shadow-slate-900/10">
                  <div className="max-h-64 overflow-y-auto p-2">
                    {filteredClientOptions.length > 0 ? (
                      filteredClientOptions.map((client) => {
                        const isSelected = values.clientName === client.name

                        return (
                          <button
                            className={cn(
                              "flex w-full items-start justify-between rounded-md px-3 py-2 text-left transition-colors hover:bg-accent hover:text-accent-foreground",
                              isSelected && "bg-secondary text-foreground"
                            )}
                            key={client.id}
                            onClick={() => handleClientSelect(client)}
                            type="button"
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium">
                                {client.name}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                {client.phone} • {client.location}
                              </span>
                            </span>
                            {isSelected ? (
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                            ) : null}
                          </button>
                        )
                      })
                    ) : (
                      <div className="rounded-md px-3 py-3 text-sm text-muted-foreground">
                        No matching clients in the local dataset. Backend search
                        can plug into this dropdown later.
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
            <Button
              className="h-11"
              onClick={() => setShowClientFlyout(true)}
              type="button"
              variant="outline"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Client
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Search saved clients first. If there is no match locally, create the
            client and keep this combobox ready for backend search results.
          </p>
        </FormSection>

        <FormSection
          description="Capture the shipment exactly as Srinivas would write it in the register."
          title="Shipment"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <Field
              label="Load type"
              onChange={(value) => updateValue("loadType", value)}
              placeholder="Mangoes, apples, FMCG"
              value={values.loadType}
            />
            <Field
              error={errors.truckCount}
              label="Truck count"
              inputMode="numeric"
              onChange={(value) => updateIntegerValue("truckCount", value)}
              placeholder="10"
              value={values.truckCount}
            />
            <Field
              error={errors.origin}
              label="Origin"
              onChange={(value) => updateValue("origin", value)}
              placeholder="Hyderabad"
              value={values.origin}
            />
            <Field
              error={errors.destination}
              label="Destination"
              onChange={(value) => updateValue("destination", value)}
              placeholder="Visakhapatnam"
              value={values.destination}
            />
          </div>
          <TextAreaField
            error={errors.multiPointNote}
            label="Multi-point delivery note"
            onChange={(value) => updateValue("multiPointNote", value)}
            placeholder="Add stops or diesel billing context when applicable"
            value={values.multiPointNote}
          />
        </FormSection>

        <FormSection
          description="No GPS tracking in V1. Keep reporting and delivery commitment visible."
          title="Timing"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <DateTimeField
              error={errors.reportingAt}
              label="Reporting date and time"
              onChange={(value) => updateValue("reportingAt", value)}
              value={values.reportingAt}
            />
            <DateTimeField
              error={errors.deliveryDeadline}
              label="Delivery deadline"
              onChange={(value) => updateValue("deliveryDeadline", value)}
              value={values.deliveryDeadline}
            />
          </div>
        </FormSection>

        <FormSection
          description="Rates are negotiated, so calculate clearly and keep the note visible."
          title="Pricing and advance"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
              Rate basis
              <select
                className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring"
                onChange={(event) =>
                  updateValue(
                    "rateBasis",
                    event.target.value as OrderFormValues["rateBasis"]
                  )
                }
                value={values.rateBasis}
              >
                <option value="per-trip">Per trip</option>
                <option value="per-truck">Per truck</option>
              </select>
            </label>
            <Field
              error={errors.rateAmount}
              label="Rate amount"
              leadingText="INR"
              inputMode="decimal"
              onChange={(value) => updateCurrencyValue("rateAmount", value)}
              placeholder="140000"
              value={values.rateAmount}
            />
            <Field
              label="Advance paid"
              leadingText="INR"
              inputMode="decimal"
              onChange={(value) => updateCurrencyValue("advancePaid", value)}
              placeholder="0"
              value={values.advancePaid}
            />
            <Field
              label="Payment note"
              onChange={(value) => updateValue("paymentNote", value)}
              placeholder="Cash received, bank transfer pending"
              value={values.paymentNote}
            />
          </div>
          <TextAreaField
            label="Negotiated adjustment note"
            onChange={(value) => updateValue("adjustmentNote", value)}
            placeholder="Explain demand-based pricing or manual adjustment"
            value={values.adjustmentNote}
          />
          {advanceWarning ? (
            <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4" aria-hidden="true" />
              Advance is greater than payable. Keep a note before saving or
              correct the amount.
            </div>
          ) : null}
        </FormSection>

        <FormSection
          description="Labor is invoice-ready by default. Other extras stay explicit so the client can understand the bill."
          title="Chargeable extras"
        >
          <div className="grid gap-3 md:grid-cols-3">
            <Field
              label="Labor charge"
              leadingText="INR"
              inputMode="decimal"
              onChange={(value) => updateCurrencyValue("laborCharge", value)}
              placeholder="5000"
              value={values.laborCharge}
            />
            <Field
              label="Waiting days"
              inputMode="numeric"
              onChange={(value) => updateIntegerValue("waitingDays", value)}
              placeholder="0"
              value={values.waitingDays}
            />
            <Field
              label="Waiting rate per day"
              leadingText="INR"
              inputMode="decimal"
              onChange={(value) => updateCurrencyValue("waitingRate", value)}
              placeholder="0"
              value={values.waitingRate}
            />
            <Field
              label="Multi-point diesel"
              leadingText="INR"
              inputMode="decimal"
              onChange={(value) => updateCurrencyValue("multiPointDiesel", value)}
              placeholder="0"
              value={values.multiPointDiesel}
            />
            <Field
              label="Extra distance charge"
              leadingText="INR"
              inputMode="decimal"
              onChange={(value) =>
                updateCurrencyValue("extraDistanceCharge", value)
              }
              placeholder="0"
              value={values.extraDistanceCharge}
            />
            <Field
              label="Other charge"
              leadingText="INR"
              inputMode="decimal"
              onChange={(value) => updateCurrencyValue("otherCharge", value)}
              placeholder="0"
              value={values.otherCharge}
            />
          </div>
          <TextAreaField
            label="Other charge note"
            onChange={(value) => updateValue("otherChargeNote", value)}
            placeholder="Explain any extra charge that appears on the invoice"
            value={values.otherChargeNote}
          />
        </FormSection>

        {saveMessage ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            {saveMessage}
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
          <Button
            onClick={() => handleSave("orders")}
            type="button"
            variant="outline"
          >
            {existingOrder ? "Save changes" : "Save draft"}
          </Button>
          <Button onClick={() => handleSave("detail")} type="button" variant="accent">
            {existingOrder ? "Update order" : "Save and assign trucks"}
          </Button>
        </div>
      </div>

      <aside className="xl:sticky xl:top-24 xl:self-start">
        <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground">
            Charge summary
          </h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <SummaryRow label="Base amount" value={calculation.baseAmount} />
            <SummaryRow label="Chargeable extras" value={calculation.extras} />
            <SummaryRow label="Advance paid" value={calculation.advancePaid} />
            <div className="flex items-center justify-between border-t border-border pt-3">
              <dt className="font-semibold text-foreground">Expected balance</dt>
              <dd className="font-semibold text-foreground">
                {formatCurrency(calculation.expectedBalance)}
              </dd>
            </div>
          </dl>
          <p className="mt-4 rounded-lg border border-border bg-background p-3 text-xs leading-5 text-muted-foreground">
            Zero advance is allowed and shown separately. If labor is missing,
            the order can be saved but invoice readiness should be reviewed on
            Order Detail.
          </p>
        </section>
      </aside>

      <OrderFlyout
        description="Add a minimal client record and return to the order form."
        isOpen={showClientFlyout}
        onClose={() => setShowClientFlyout(false)}
        title="Add Client"
      >
        <div className="grid gap-4">
          <Field
            label="Client name"
            onChange={() => undefined}
            placeholder="Sri Balaji Traders"
            value=""
          />
          <Field
            label="Phone"
            onChange={() => undefined}
            placeholder="9876543210"
            type="tel"
            value=""
          />
          <TextAreaField
            label="Note"
            onChange={() => undefined}
            placeholder="Optional contact note"
            value=""
          />
          <Button
            onClick={() => {
              updateValue("clientName", "Sri Balaji Traders")
              setShowClientFlyout(false)
            }}
            type="button"
            variant="accent"
          >
            Save client and select
          </Button>
        </div>
      </OrderFlyout>

      <OrderConfirmModal
        confirmLabel="Leave order"
        description="Unsaved order details will stay only in this browser session mock. Return to Orders?"
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => router.push("/orders")}
        title="Cancel new order?"
      />
    </div>
  )
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-card-foreground">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <div className="mt-4 grid gap-4">{children}</div>
    </section>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  inputMode,
  leadingText,
  leadingIcon: LeadingIcon,
  onFocus,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  error?: string
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"]
  leadingText?: string
  leadingIcon?: ComponentType<{ className?: string; "aria-hidden"?: true }>
  onFocus?: FocusEventHandler<HTMLInputElement>
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
      {label}
      <div className="relative">
        {LeadingIcon ? (
          <LeadingIcon
            aria-hidden={true}
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
        ) : null}
        {leadingText ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
            {leadingText}
          </span>
        ) : null}
        <input
          aria-invalid={error ? true : undefined}
          className={cn(
            "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-ring",
            LeadingIcon && "pl-10",
            leadingText && "pl-14"
          )}
          inputMode={inputMode}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocus}
          placeholder={placeholder}
          type={type}
          value={value}
        />
      </div>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </label>
  )
}

function DateTimeField({
  label,
  value,
  onChange,
  error,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
}) {
  const [day, setDay] = useState(() => parseDateTimeValue(value).day)
  const [month, setMonth] = useState(() => parseDateTimeValue(value).month)
  const [year, setYear] = useState(() => parseDateTimeValue(value).year)
  const [time, setTime] = useState(() => parseDateTimeValue(value).time)

  useEffect(() => {
    const nextValue = buildDateTimeValue({ day, month, year, time })

    if (nextValue !== value) {
      onChange(nextValue)
    }
  }, [day, month, onChange, time, value, year])

  return (
    <div className="flex flex-col gap-2 text-sm font-medium text-foreground">
      <span>{label}</span>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_8rem]">
        <div className="grid grid-cols-[4.5rem_4.5rem_minmax(0,1fr)] gap-2">
          <SegmentInput
            icon={CalendarDays}
            label="Day"
            maxLength={2}
            onChange={(nextValue) => setDay(sanitizeFixedDigits(nextValue, 2))}
            placeholder="DD"
            value={day}
          />
          <SegmentInput
            label="Month"
            maxLength={2}
            onChange={(nextValue) => setMonth(sanitizeFixedDigits(nextValue, 2))}
            placeholder="MM"
            value={month}
          />
          <SegmentInput
            label="Year"
            maxLength={4}
            onChange={(nextValue) => setYear(sanitizeFixedDigits(nextValue, 4))}
            placeholder="YYYY"
            value={year}
          />
        </div>
        <SegmentInput
          icon={Clock3}
          label="Time"
          maxLength={5}
          onChange={(nextValue) => setTime(sanitizeTimeInput(nextValue))}
          placeholder="HH:MM"
          value={time}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Use a four-digit year. Example: 03 / 05 / 2026 and 09:30.
      </p>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  )
}

function SegmentInput({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  icon: Icon,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  maxLength: number
  icon?: ComponentType<{ className?: string; "aria-hidden"?: true }>
}) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      {Icon ? (
        <Icon
          aria-hidden={true}
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
      ) : null}
      <input
        className={cn(
          "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-ring",
          Icon && "pl-10"
        )}
        inputMode={label === "Time" ? "numeric" : "numeric"}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  )
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
      {label}
      <textarea
        aria-invalid={error ? true : undefined}
        className="min-h-24 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-ring"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </label>
  )
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{formatCurrency(value)}</dd>
    </div>
  )
}

function sanitizeIntegerInput(value: string) {
  return value.replace(/\D/g, "")
}

function sanitizeCurrencyInput(value: string) {
  const sanitized = value.replace(/[^\d.]/g, "")
  const [whole, ...decimals] = sanitized.split(".")

  if (decimals.length === 0) {
    return sanitized
  }

  return `${whole}.${decimals.join("").slice(0, 2)}`
}

function sanitizeFixedDigits(value: string, maxLength: number) {
  return value.replace(/\D/g, "").slice(0, maxLength)
}

function sanitizeTimeInput(value: string) {
  const digitsOnly = value.replace(/\D/g, "").slice(0, 4)

  if (digitsOnly.length <= 2) {
    return digitsOnly
  }

  return `${digitsOnly.slice(0, 2)}:${digitsOnly.slice(2)}`
}

function parseDateTimeValue(value: string) {
  if (!value) {
    return { day: "", month: "", year: "", time: "" }
  }

  const [datePart, timePart = ""] = value.split("T")
  const [year = "", month = "", day = ""] = datePart.split("-")

  return {
    day,
    month,
    year,
    time: timePart.slice(0, 5),
  }
}

function buildDateTimeValue({
  day,
  month,
  year,
  time,
}: {
  day: string
  month: string
  year: string
  time: string
}) {
  if (!day && !month && !year && !time) {
    return ""
  }

  if (
    day.length !== 2 ||
    month.length !== 2 ||
    year.length !== 4 ||
    !/^\d{2}:\d{2}$/.test(time)
  ) {
    return ""
  }

  const dayNumber = Number(day)
  const monthNumber = Number(month)
  const yearNumber = Number(year)
  const [hours, minutes] = time.split(":").map(Number)

  if (
    yearNumber < 2000 ||
    monthNumber < 1 ||
    monthNumber > 12 ||
    dayNumber < 1 ||
    dayNumber > 31 ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return ""
  }

  const candidateDate = new Date(
    yearNumber,
    monthNumber - 1,
    dayNumber,
    hours,
    minutes
  )

  if (
    candidateDate.getFullYear() !== yearNumber ||
    candidateDate.getMonth() !== monthNumber - 1 ||
    candidateDate.getDate() !== dayNumber
  ) {
    return ""
  }

  return `${year}-${month}-${day}T${time}`
}
