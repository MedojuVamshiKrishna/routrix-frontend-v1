"use client"

import {
  AlertTriangle,
  BarChart3,
  FileText,
  FileUp,
  NotebookPen,
  Pencil,
  ReceiptText,
  Save,
  Truck,
  Upload,
} from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import OrderFlyout from "@/components/orders/OrderFlyout"
import OrderStatusBadge from "@/components/orders/OrderStatusBadge"
import useRoutrixLocalData from "@/components/orders/useRoutrixLocalData"
import { Button } from "@/components/ui/Button"
import {
  addLocalDocuments,
  assignOrderTrips,
  type InvoiceRecordStatus,
  type LocalDocumentRecord,
  upsertInvoiceRecord,
  updateOrderCharges,
} from "@/lib/routrix-local-data"
import type { OrderRecord } from "@/components/orders/order-types"
import {
  formatCurrency,
  getOrderStatusTone,
  getPendingTruckCount,
  getTripStatusTone,
} from "@/components/orders/order-utils"

type DetailTab = "Trips" | "Charges" | "Documents" | "Invoice readiness" | "Notes"

type FlyoutState =
  | { type: "assign" }
  | { type: "charges" }
  | { type: "invoice" }
  | { type: "documents" }
  | null

interface OrderDetailViewProps {
  orderId: string
}

const tabs: DetailTab[] = [
  "Trips",
  "Charges",
  "Documents",
  "Invoice readiness",
  "Notes",
]

export default function OrderDetailView({ orderId }: OrderDetailViewProps) {
  const { documents, invoices, orders } = useRoutrixLocalData()
  const [activeTab, setActiveTab] = useState<DetailTab>("Trips")
  const [flyout, setFlyout] = useState<FlyoutState>(null)

  const order = orders.find((item) => item.id === orderId)

  const relatedDocuments = useMemo(
    () => documents.filter((document) => document.orderId === orderId),
    [documents, orderId]
  )
  const invoice = useMemo(
    () => invoices.find((item) => item.orderId === orderId) ?? null,
    [invoices, orderId]
  )

  if (!order) {
    return (
      <section className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <p className="text-lg font-semibold text-foreground">Order not found.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          This order is not present in the current local dataset.
        </p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/orders">Back to Orders</Link>
        </Button>
      </section>
    )
  }

  const pendingTruckCount = getPendingTruckCount(order)
  const ownTruckCount = order.trips.filter(
    (trip) => trip.truckType === "Own truck"
  ).length
  const outsourcedTruckCount = order.trips.filter(
    (trip) => trip.truckType === "Outsourced truck"
  ).length
  const providerDues = outsourcedTruckCount * 14000
  const ownTruckExpenses = ownTruckCount * 4500 + Math.round(order.chargeableExtras * 0.12)
  const internalProfit =
    order.baseAmount + order.chargeableExtras - providerDues - ownTruckExpenses
  const operationalSpend = providerDues + ownTruckExpenses
  const invoiceReadinessChecks = [
    pendingTruckCount > 0 ? "All trips are not assigned yet." : "",
    order.baseAmount <= 0 ? "Base amount is missing." : "",
    order.clientName.trim().length === 0 ? "Client name is missing." : "",
    order.reportingAt.trim().length === 0 ? "Reporting time is missing." : "",
  ].filter(Boolean)

  const collectionSegments = [
    {
      label: "Base amount",
      value: Math.max(order.baseAmount, 0),
      color: "bg-sky-500",
    },
    {
      label: "Chargeable extras",
      value: Math.max(order.chargeableExtras, 0),
      color: "bg-amber-500",
    },
    {
      label: "Advance paid",
      value: Math.max(order.advancePaid, 0),
      color: "bg-emerald-500",
    },
  ]
  const spendSegments = [
    {
      label: "Truck expenses",
      value: Math.max(ownTruckExpenses, 0),
      color: "bg-rose-500",
    },
    {
      label: "Provider dues",
      value: Math.max(providerDues, 0),
      color: "bg-orange-500",
    },
    {
      label: "Client advances",
      value: Math.max(order.advancePaid, 0),
      color: "bg-violet-500",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="grid gap-6 border-b border-border bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_45%),linear-gradient(135deg,rgba(15,23,42,0.04),transparent)] p-6 xl:grid-cols-[minmax(0,1.35fr)_22rem]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Master order
              </span>
              <OrderStatusBadge
                label={order.orderStatus}
                tone={getOrderStatusTone(order.orderStatus)}
              />
              <OrderStatusBadge label={order.invoiceStatus} />
            </div>
            <div>
              <div className="flex flex-wrap items-end gap-3">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                  {order.id}
                </h1>
                <p className="pb-1 text-sm font-medium text-muted-foreground">
                  {order.clientName}
                </p>
              </div>
              <p className="mt-3 text-base text-foreground">
                {order.origin} to {order.destination}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {order.loadType} dispatch. Reporting {order.reportingAt}. Delivery
                deadline {order.deliveryDeadline}.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <HeroValueCard
                label="Expected balance"
                value={formatCurrency(order.expectedBalance)}
              />
              <HeroValueCard
                label="Pending trucks"
                value={String(pendingTruckCount)}
              />
              <HeroValueCard
                label="Documents"
                value={String(relatedDocuments.length)}
              />
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-background/80 p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Operational actions
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Update assignment, charges, documents, and invoice work without
                leaving the order.
              </p>
            </div>
            <div className="grid gap-2">
              <Button onClick={() => setFlyout({ type: "assign" })} variant="accent">
                <Truck className="h-4 w-4" aria-hidden="true" />
                Assign truck
              </Button>
              <Button asChild variant="outline">
                <Link href={`/orders/new?mode=edit&orderId=${order.id}`}>
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  Edit order
                </Link>
              </Button>
              <Button
                onClick={() => setFlyout({ type: "documents" })}
                variant="outline"
              >
                <FileUp className="h-4 w-4" aria-hidden="true" />
                Upload document
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
          <section className="space-y-4">
            <SectionHeading
              eyebrow="Visual analytics"
              title="Collections, spend, and dispatch progress"
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <AnalyticsPanel title="Dispatch progress">
                <ProgressBar
                  label="Truck assignment"
                  value={order.assignedTruckCount}
                  total={order.truckCount}
                  tone="bg-accent"
                />
                <ProgressBar
                  label="Invoice readiness"
                  value={Math.max(4 - invoiceReadinessChecks.length, 0)}
                  total={4}
                  tone="bg-accent/85"
                />
                <ProgressBar
                  label="Documentation"
                  value={Math.min(relatedDocuments.length, order.truckCount || 1)}
                  total={Math.max(order.truckCount, 1)}
                  tone="bg-accent/70"
                />
              </AnalyticsPanel>

              <AnalyticsPanel title="Trip mix">
                <MiniBarChart
                  items={[
                    {
                      label: "Own",
                      value: ownTruckCount,
                      color: "bg-accent",
                    },
                    {
                      label: "Outsourced",
                      value: outsourcedTruckCount,
                      color: "bg-accent/75",
                    },
                    {
                      label: "Pending",
                      value: pendingTruckCount,
                      color: "bg-accent/55",
                    },
                  ]}
                />
              </AnalyticsPanel>
            </div>

            <AnalyticsPanel title="Amount distribution">
              <HorizontalSegmentBar
                label="Billing mix"
                segments={collectionSegments}
                totalOverride={Math.max(
                  order.baseAmount + order.chargeableExtras + order.advancePaid,
                  1
                )}
              />
              <HorizontalSegmentBar
                label="Spend vs advances"
                segments={spendSegments}
                totalOverride={Math.max(operationalSpend + order.advancePaid, 1)}
              />
            </AnalyticsPanel>
          </section>

          <section className="space-y-4">
            <SectionHeading
              eyebrow="Structure"
              title="Trip details and charges at a glance"
            />
            <div className="grid gap-4">
              <DetailStatGrid
                items={[
                  { label: "Base amount", value: formatCurrency(order.baseAmount) },
                  {
                    label: "Chargeable extras",
                    value: formatCurrency(order.chargeableExtras),
                  },
                  { label: "Advance paid", value: formatCurrency(order.advancePaid) },
                  {
                    label: "Internal profit",
                    value: formatCurrency(internalProfit),
                  },
                ]}
              />
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-foreground">
                      Charge control
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Keep billable extras clear before invoice issue.
                    </p>
                  </div>
                  <Button
                    className="shadow-sm"
                    onClick={() => setFlyout({ type: "charges" })}
                    variant="accent"
                  >
                    <Save className="h-4 w-4" aria-hidden="true" />
                    Update charges
                  </Button>
                </div>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  <InfoPair label="Required trucks" value={String(order.truckCount)} />
                  <InfoPair
                    label="Assigned trucks"
                    value={String(order.assignedTruckCount)}
                  />
                  <InfoPair label="Provider dues" value={formatCurrency(providerDues)} />
                  <InfoPair
                    label="Own truck expenses"
                    value={formatCurrency(ownTruckExpenses)}
                  />
                </dl>
              </div>
            </div>
          </section>
        </div>
      </section>

      {order.invoiceStatus === "Invoiced" ? (
        <section className="rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" aria-hidden="true" />
            <div>
              <p className="font-semibold text-amber-950">Invoice already issued</p>
              <p className="mt-1 text-sm leading-6 text-amber-900/80">
                Amount or charge edits should be reviewed against the saved invoice
                before finance confirms a revised total.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex gap-2 overflow-x-auto border-b border-border p-4">
          {tabs.map((tab) => (
            <button
              className={
                activeTab === tab
                  ? "rounded-full border border-accent bg-accent/10 px-4 py-2 text-sm font-medium text-foreground"
                  : "rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              }
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === "Trips" ? (
            <TripsTab
              onAssign={() => setFlyout({ type: "assign" })}
              order={order}
            />
          ) : null}
          {activeTab === "Charges" ? (
            <ChargesTab
              onEdit={() => setFlyout({ type: "charges" })}
              order={order}
              ownTruckExpenses={ownTruckExpenses}
              providerDues={providerDues}
            />
          ) : null}
          {activeTab === "Documents" ? (
            <DocumentsTab
              documents={relatedDocuments}
              onUpload={() => setFlyout({ type: "documents" })}
              trips={order.trips}
            />
          ) : null}
          {activeTab === "Invoice readiness" ? (
            <InvoiceReadinessTab
              invoiceStatus={order.invoiceStatus}
              issueCount={invoiceReadinessChecks.length}
              issues={invoiceReadinessChecks}
              invoice={invoice}
              onEditInvoice={() => setFlyout({ type: "invoice" })}
              order={order}
            />
          ) : null}
          {activeTab === "Notes" ? <NotesTab order={order} /> : null}
        </div>
      </section>

      <OrderFlyout
        description={getFlyoutDescription(flyout)}
        isOpen={flyout !== null}
        onClose={() => setFlyout(null)}
        title={getFlyoutTitle(order.id, flyout)}
      >
        {flyout?.type === "assign" ? (
          <AssignTruckFlyout
            onClose={() => setFlyout(null)}
            order={order}
          />
        ) : null}
        {flyout?.type === "charges" ? (
          <ChargeEditorFlyout onClose={() => setFlyout(null)} order={order} />
        ) : null}
        {flyout?.type === "invoice" ? (
          <InvoiceEditorFlyout
            invoice={invoice}
            onClose={() => setFlyout(null)}
            order={order}
          />
        ) : null}
        {flyout?.type === "documents" ? (
          <DocumentUploadFlyout
            documents={relatedDocuments}
            onClose={() => setFlyout(null)}
            order={order}
          />
        ) : null}
      </OrderFlyout>
    </div>
  )
}

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string
  title: string
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-semibold text-foreground">{title}</h2>
    </div>
  )
}

function HeroValueCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/90 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  )
}

function AnalyticsPanel({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border bg-background p-4">
      <p className="text-base font-semibold text-foreground">{title}</p>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  )
}

function ProgressBar({
  label,
  value,
  total,
  tone,
}: {
  label: string
  value: number
  total: number
  tone: string
}) {
  const safeTotal = Math.max(total, 1)
  const percentage = Math.min((value / safeTotal) * 100, 100)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-base font-medium text-foreground">{label}</span>
        <span className="text-base font-medium text-muted-foreground">
          {value}/{safeTotal}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

function MiniBarChart({
  items,
}: {
  items: Array<{ label: string; value: number; color: string }>
}) {
  const maxValue = Math.max(...items.map((item) => item.value), 1)

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <div className="grid grid-cols-[5rem_minmax(0,1fr)_2.5rem] items-center gap-3" key={item.label}>
          <span className="text-base font-medium text-foreground">{item.label}</span>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${item.color}`}
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
          <span className="text-right text-base font-medium text-muted-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

function HorizontalSegmentBar({
  label,
  segments,
  totalOverride,
}: {
  label: string
  segments: Array<{ label: string; value: number; color: string }>
  totalOverride?: number
}) {
  const total = Math.max(
    totalOverride ?? segments.reduce((sum, segment) => sum + segment.value, 0),
    1
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-base font-medium text-foreground">{label}</span>
        <span className="text-base font-medium text-muted-foreground">
          {formatCurrency(total)}
        </span>
      </div>
      <div className="flex h-4 overflow-hidden rounded-full bg-muted">
        {segments.map((segment) => (
          <div
            className={segment.color}
            key={segment.label}
            style={{ width: `${Math.max((segment.value / total) * 100, segment.value > 0 ? 4 : 0)}%` }}
          />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {segments.map((segment) => (
          <div
            className="rounded-xl border border-border/70 bg-background/80 p-3"
            key={segment.label}
          >
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${segment.color}`} />
              <span className="text-sm font-medium text-muted-foreground">
                {segment.label}
              </span>
            </div>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {formatCurrency(segment.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function DetailStatGrid({
  items,
}: {
  items: Array<{ label: string; value: string }>
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div className="rounded-2xl border border-border bg-background p-4" key={item.label}>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {item.label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
        </div>
      ))}
    </div>
  )
}

function InfoPair({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-foreground">{value}</dd>
    </div>
  )
}

function TripsTab({
  order,
  onAssign,
}: {
  order: OrderRecord
  onAssign: () => void
}) {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background p-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Trip details</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep assignment and arrival data readable for quick dispatch actions.
          </p>
        </div>
        <Button onClick={onAssign} variant="accent">
          <Truck className="h-4 w-4" aria-hidden="true" />
          Assign trucks
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Trip</th>
              <th className="px-4 py-3 font-medium">Truck/contact</th>
              <th className="px-4 py-3 font-medium">Arrival</th>
              <th className="px-4 py-3 font-medium">Expense/payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {order.trips.map((trip) => (
              <tr className="border-t border-border" key={trip.id}>
                <td className="px-4 py-4">
                  <p className="font-semibold text-foreground">{trip.id}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{trip.truckType}</p>
                </td>
                <td className="px-4 py-4 font-medium text-foreground">
                  {trip.truckNumberOrContact}
                </td>
                <td className="px-4 py-4 text-muted-foreground">{trip.expectedArrivalAt}</td>
                <td className="px-4 py-4 text-muted-foreground">
                  <p>{trip.expenseStatus}</p>
                  <p className="mt-1">{trip.providerDueStatus}</p>
                </td>
                <td className="px-4 py-4">
                  <OrderStatusBadge
                    label={trip.tripStatus}
                    tone={getTripStatusTone(trip.tripStatus)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ChargesTab({
  order,
  ownTruckExpenses,
  providerDues,
  onEdit,
}: {
  order: OrderRecord
  ownTruckExpenses: number
  providerDues: number
  onEdit: () => void
}) {
  const modeledCharges = [
    { label: "Labor and waiting", value: Math.round(order.chargeableExtras * 0.36) },
    { label: "Multi-point diesel", value: Math.round(order.chargeableExtras * 0.22) },
    { label: "Extra distance", value: Math.round(order.chargeableExtras * 0.18) },
    { label: "Other charge", value: Math.max(order.chargeableExtras - Math.round(order.chargeableExtras * 0.76), 0) },
  ]

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background p-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Charge breakdown</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Base billing, extras, and operating costs stay separated for better
            review.
          </p>
        </div>
        <Button onClick={onEdit} variant="accent">
          <Pencil className="h-4 w-4" aria-hidden="true" />
          Update charges
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-background p-4">
          <p className="text-sm font-semibold text-foreground">Billable charges</p>
          <dl className="mt-4 space-y-3">
            <ChargeRow label="Base amount" value={order.baseAmount} strong />
            {modeledCharges.map((item) => (
              <ChargeRow key={item.label} label={item.label} value={item.value} />
            ))}
            <ChargeRow label="Advance paid" value={order.advancePaid} tone="text-emerald-600" />
            <ChargeRow label="Expected balance" value={order.expectedBalance} strong />
          </dl>
        </div>
        <div className="rounded-2xl border border-border bg-background p-4">
          <p className="text-sm font-semibold text-foreground">Operational spend</p>
          <dl className="mt-4 space-y-3">
            <ChargeRow label="Provider dues" value={providerDues} />
            <ChargeRow label="Own truck expenses" value={ownTruckExpenses} />
            <ChargeRow
              label="Margin after spend"
              value={order.baseAmount + order.chargeableExtras - providerDues - ownTruckExpenses}
              strong
            />
          </dl>
        </div>
      </div>
    </div>
  )
}

function ChargeRow({
  label,
  value,
  strong = false,
  tone,
}: {
  label: string
  value: number
  strong?: boolean
  tone?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className={`text-sm ${strong ? "font-semibold text-foreground" : tone ?? "font-medium text-foreground"}`}>
        {formatCurrency(value)}
      </dd>
    </div>
  )
}

function DocumentsTab({
  documents,
  trips,
  onUpload,
}: {
  documents: LocalDocumentRecord[]
  trips: OrderRecord["trips"]
  onUpload: () => void
}) {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background p-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Document management</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Files are stored locally for now and remain visible on this order.
          </p>
        </div>
        <Button onClick={onUpload} variant="accent">
          <Upload className="h-4 w-4" aria-hidden="true" />
          Upload documents
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-background p-6 text-center">
          <p className="font-semibold text-foreground">No saved documents yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload POD photos, invoices, or trip proof and they will remain
            attached locally.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {documents.map((document) => {
            const tripLabel =
              trips.find((trip) => trip.id === document.tripId)?.id ?? "Order level"

            return (
              <article
                className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                key={document.id}
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{document.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {tripLabel} • {(document.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <Button asChild variant="outline">
                  <a download={document.name} href={document.dataUrl}>
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    Download
                  </a>
                </Button>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

function InvoiceReadinessTab({
  order,
  invoice,
  issues,
  issueCount,
  invoiceStatus,
  onEditInvoice,
}: {
  order: OrderRecord
  invoice: {
    invoiceNumber: string
    issueDate: string
    dueDate: string
    notes: string
    status: InvoiceRecordStatus
  } | null
  issues: string[]
  issueCount: number
  invoiceStatus: OrderRecord["invoiceStatus"]
  onEditInvoice: () => void
}) {
  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-border bg-background p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <BarChart3 className="mt-0.5 h-5 w-5 text-accent" aria-hidden="true" />
            <div>
              <p className="font-semibold text-foreground">
                {issueCount === 0
                  ? "Order is ready for invoice finalization"
                  : "Invoice readiness needs attention"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Use one master invoice row with base amount, extras, advance, and
                final payable.
              </p>
            </div>
          </div>
          <Button onClick={onEditInvoice} variant="accent">
            <ReceiptText className="h-4 w-4" aria-hidden="true" />
            {invoice ? "Edit invoice" : "Create invoice"}
          </Button>
        </div>
      </div>

      {issues.length > 0 ? (
        <div className="grid gap-2">
          {issues.map((issue) => (
            <div className="rounded-2xl border border-border bg-background p-3 text-sm text-muted-foreground" key={issue}>
              {issue}
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-background p-4">
          <p className="text-sm font-semibold text-foreground">Invoice values</p>
          <dl className="mt-4 space-y-3">
            <ChargeRow label="Base amount" value={order.baseAmount} />
            <ChargeRow label="Extras" value={order.chargeableExtras} />
            <ChargeRow label="Advance paid" value={order.advancePaid} />
            <ChargeRow label="Final payable" value={order.expectedBalance} strong />
          </dl>
        </div>
        <div className="rounded-2xl border border-border bg-background p-4">
          <p className="text-sm font-semibold text-foreground">Saved invoice</p>
          {invoice ? (
            <dl className="mt-4 space-y-3">
              <InfoPair label="Invoice number" value={invoice.invoiceNumber} />
              <InfoPair label="Status" value={invoice.status} />
              <InfoPair label="Issue date" value={invoice.issueDate || "Not set"} />
              <InfoPair label="Due date" value={invoice.dueDate || "Not set"} />
            </dl>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No local invoice is saved yet. Status is currently {invoiceStatus}.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function NotesTab({ order }: { order: OrderRecord }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-start gap-3">
        <NotebookPen className="mt-0.5 h-5 w-5 text-accent" aria-hidden="true" />
        <div>
          <p className="font-semibold text-foreground">Internal notes</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {order.notes ?? "No internal notes saved for this order."}
          </p>
        </div>
      </div>
    </div>
  )
}

function AssignTruckFlyout({
  order,
  onClose,
}: {
  order: OrderRecord
  onClose: () => void
}) {
  const [rows, setRows] = useState(
    order.trips.map((trip) => ({
      tripId: trip.id,
      truckType: trip.truckType,
      truckNumberOrContact:
        trip.truckNumberOrContact === "Needs truck" ? "" : trip.truckNumberOrContact,
      expectedArrivalAt:
        trip.expectedArrivalAt === "Pending assignment" ? "" : trip.expectedArrivalAt,
    }))
  )

  function updateRow(
    tripId: string,
    field: "truckType" | "truckNumberOrContact" | "expectedArrivalAt",
    value: string
  ) {
    setRows((current) =>
      current.map((row) =>
        row.tripId === tripId ? { ...row, [field]: value } : row
      )
    )
  }

  return (
    <div className="grid gap-4">
      {rows.map((row) => (
        <section className="rounded-2xl border border-border bg-card p-4" key={row.tripId}>
          <p className="font-semibold text-foreground">{row.tripId}</p>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Truck type
              <select
                className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring"
                onChange={(event) =>
                  updateRow(row.tripId, "truckType", event.target.value)
                }
                value={row.truckType}
              >
                <option value="Unassigned">Unassigned</option>
                <option value="Own truck">Own truck</option>
                <option value="Outsourced truck">Outsourced truck</option>
              </select>
            </label>
            <FlyoutField
              label="Truck number or contact"
              onChange={(value) => updateRow(row.tripId, "truckNumberOrContact", value)}
              placeholder="TS09FD1122 or Ravi Transport - AP29LB9592"
              value={row.truckNumberOrContact}
            />
            <FlyoutField
              label="Expected arrival"
              onChange={(value) => updateRow(row.tripId, "expectedArrivalAt", value)}
              placeholder="May 07, 5:30 PM"
              value={row.expectedArrivalAt}
            />
          </div>
        </section>
      ))}
      <div className="flex justify-end">
        <Button
          onClick={() => {
            assignOrderTrips(order.id, rows)
            onClose()
          }}
          variant="accent"
        >
          Save truck assignment
        </Button>
      </div>
    </div>
  )
}

function ChargeEditorFlyout({
  order,
  onClose,
}: {
  order: OrderRecord
  onClose: () => void
}) {
  const [values, setValues] = useState({
    laborCharge: String(Math.round(order.chargeableExtras * 0.3)),
    waitingCharge: String(Math.round(order.chargeableExtras * 0.18)),
    multiPointDiesel: String(Math.round(order.chargeableExtras * 0.22)),
    extraDistanceCharge: String(Math.round(order.chargeableExtras * 0.18)),
    otherCharge: String(Math.max(order.chargeableExtras - Math.round(order.chargeableExtras * 0.88), 0)),
  })

  return (
    <div className="grid gap-3">
      {(
        [
          ["laborCharge", "Labor charge"],
          ["waitingCharge", "Waiting charge"],
          ["multiPointDiesel", "Multi-point diesel"],
          ["extraDistanceCharge", "Extra distance charge"],
          ["otherCharge", "Other charge"],
        ] as const
      ).map(([key, label]) => (
        <FlyoutField
          key={key}
          label={label}
          onChange={(value) =>
            setValues((current) => ({
              ...current,
              [key]: value.replace(/[^\d.]/g, ""),
            }))
          }
          value={values[key]}
        />
      ))}
      <div className="rounded-2xl border border-border bg-background p-4">
        <p className="text-sm text-muted-foreground">New total extras</p>
        <p className="mt-2 text-2xl font-semibold text-foreground">
          {formatCurrency(
            (Number(values.laborCharge) || 0) +
              (Number(values.waitingCharge) || 0) +
              (Number(values.multiPointDiesel) || 0) +
              (Number(values.extraDistanceCharge) || 0) +
              (Number(values.otherCharge) || 0)
          )}
        </p>
      </div>
      <div className="flex justify-end">
        <Button
          onClick={() => {
            updateOrderCharges(order.id, {
              laborCharge: Number(values.laborCharge) || 0,
              waitingCharge: Number(values.waitingCharge) || 0,
              multiPointDiesel: Number(values.multiPointDiesel) || 0,
              extraDistanceCharge: Number(values.extraDistanceCharge) || 0,
              otherCharge: Number(values.otherCharge) || 0,
            })
            onClose()
          }}
          variant="accent"
        >
          Save charge update
        </Button>
      </div>
    </div>
  )
}

function InvoiceEditorFlyout({
  order,
  invoice,
  onClose,
}: {
  order: OrderRecord
  invoice: {
    id?: string
    invoiceNumber: string
    issueDate: string
    dueDate: string
    notes: string
    status: InvoiceRecordStatus
  } | null
  onClose: () => void
}) {
  const [values, setValues] = useState({
    invoiceNumber: invoice?.invoiceNumber ?? "",
    issueDate: invoice?.issueDate ?? "",
    dueDate: invoice?.dueDate ?? "",
    notes: invoice?.notes ?? "",
    status: invoice?.status ?? ("Draft invoice" satisfies InvoiceRecordStatus),
  })

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-border bg-background p-4">
        <p className="text-sm font-semibold text-foreground">Invoice summary</p>
        <dl className="mt-4 space-y-3">
          <ChargeRow label="Base amount" value={order.baseAmount} />
          <ChargeRow label="Chargeable extras" value={order.chargeableExtras} />
          <ChargeRow label="Advance paid" value={order.advancePaid} />
          <ChargeRow label="Final payable" value={order.expectedBalance} strong />
        </dl>
      </div>
      <FlyoutField
        label="Invoice number"
        onChange={(value) => setValues((current) => ({ ...current, invoiceNumber: value }))}
        placeholder="INV-1009"
        value={values.invoiceNumber}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <FlyoutField
          label="Issue date"
          onChange={(value) => setValues((current) => ({ ...current, issueDate: value }))}
          placeholder="2026-05-04"
          value={values.issueDate}
        />
        <FlyoutField
          label="Due date"
          onChange={(value) => setValues((current) => ({ ...current, dueDate: value }))}
          placeholder="2026-05-11"
          value={values.dueDate}
        />
      </div>
      <label className="grid gap-2 text-sm font-medium text-foreground">
        Invoice status
        <select
          className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring"
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              status: event.target.value as InvoiceRecordStatus,
            }))
          }
          value={values.status}
        >
          <option value="Draft invoice">Draft invoice</option>
          <option value="Invoiced">Invoiced</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-medium text-foreground">
        Notes
        <textarea
          className="min-h-28 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring"
          onChange={(event) =>
            setValues((current) => ({ ...current, notes: event.target.value }))
          }
          value={values.notes}
        />
      </label>
      <div className="flex justify-end">
        <Button
          onClick={() => {
            upsertInvoiceRecord(order.id, {
              id: invoice?.id,
              invoiceNumber: values.invoiceNumber,
              issueDate: values.issueDate,
              dueDate: values.dueDate,
              notes: values.notes,
              status: values.status,
            })
            onClose()
          }}
          variant="accent"
        >
          Save invoice
        </Button>
      </div>
    </div>
  )
}

function DocumentUploadFlyout({
  order,
  documents,
  onClose,
}: {
  order: OrderRecord
  documents: LocalDocumentRecord[]
  onClose: () => void
}) {
  const [tripId, setTripId] = useState("order")
  const [message, setMessage] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  async function handleFileSelection(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      return
    }

    const oversizedFile = Array.from(fileList).find(
      (file) => file.size > 1_500_000
    )

    if (oversizedFile) {
      setMessage(
        `${oversizedFile.name} is too large for local browser storage. Keep files below 1.5 MB each for now.`
      )
      return
    }

    setIsSaving(true)
    setMessage("")

    try {
      await addLocalDocuments(
        order.id,
        fileList,
        tripId === "order" ? undefined : tripId
      )
      setMessage("Documents saved locally and attached to this order.")
    } catch {
      setMessage("Document upload failed in the local browser store.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="grid gap-4">
      <label className="grid gap-2 text-sm font-medium text-foreground">
        Attach to
        <select
          className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring"
          onChange={(event) => setTripId(event.target.value)}
          value={tripId}
        >
          <option value="order">Order level</option>
          {order.trips.map((trip) => (
            <option key={trip.id} value={trip.id}>
              {trip.id}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 rounded-2xl border border-dashed border-border bg-background p-5 text-sm font-medium text-foreground">
        Upload files
        <input
          accept=".pdf,image/*"
          className="text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent-foreground"
          disabled={isSaving}
          multiple
          onChange={(event) => void handleFileSelection(event.target.files)}
          type="file"
        />
        <span className="text-xs text-muted-foreground">
          Files are stored locally in this browser until backend storage is added.
        </span>
      </label>
      {message ? (
        <p className="rounded-2xl border border-border bg-background p-3 text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}
      <div className="rounded-2xl border border-border bg-background p-4">
        <p className="text-sm font-semibold text-foreground">
          Saved documents: {documents.length}
        </p>
      </div>
      <div className="flex justify-end">
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </div>
    </div>
  )
}

function FlyoutField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-foreground">
      {label}
      <input
        className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  )
}

function getFlyoutTitle(orderId: string, flyout: FlyoutState) {
  if (flyout?.type === "assign") return `Assign trucks for ${orderId}`
  if (flyout?.type === "charges") return `Update charges for ${orderId}`
  if (flyout?.type === "invoice") return `Invoice for ${orderId}`
  if (flyout?.type === "documents") return `Documents for ${orderId}`
  return ""
}

function getFlyoutDescription(flyout: FlyoutState) {
  if (flyout?.type === "assign") {
    return "Update truck ownership, assigned contacts, and arrival timing in one place."
  }
  if (flyout?.type === "charges") {
    return "Save invoice-ready extras with a cleaner breakdown than the previous placeholder action."
  }
  if (flyout?.type === "invoice") {
    return "Create or edit the local invoice record from the order detail screen."
  }
  if (flyout?.type === "documents") {
    return "Upload proof, POD, or PDFs and keep them saved locally until backend storage is added."
  }
  return undefined
}
