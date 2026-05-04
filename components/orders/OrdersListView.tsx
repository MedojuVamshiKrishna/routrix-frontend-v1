"use client"

import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  CircleX,
  ClipboardCheck,
  Download,
  ExternalLink,
  FileText,
  FileUp,
  FileWarning,
  FolderKanban,
  MoreVertical,
  PackageCheck,
  PenLine,
  Plus,
  ReceiptText,
  Search,
  Truck,
} from "lucide-react"
import Link from "next/link"
import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react"
import { createPortal } from "react-dom"

import OrderConfirmModal from "@/components/orders/OrderConfirmModal"
import OrderFlyout from "@/components/orders/OrderFlyout"
import MultiSelectFilter from "@/components/orders/MultiSelectFilter"
import OrderStatusBadge from "@/components/orders/OrderStatusBadge"
import OrderSummaryCards from "@/components/orders/OrderSummaryCards"
import InternalPageHeader from "@/components/layout/InternalPageHeader"
import type { OrderRecord, OrderTrip } from "@/components/orders/order-types"
import {
  formatCurrency,
  getInvoiceStatusTone,
  getOrderStatusTone,
  getPendingTruckCount,
  getTripStatusTone,
} from "@/components/orders/order-utils"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

type OrdersTab =
  | "All"
  | "Need trucks"
  | "Partially assigned"
  | "Ready for invoice"
  | "Invoiced"
  | "Settled"

type OrdersViewState = "default" | "loading" | "error"
type ListMode = "trip" | "order"

type MenuAction = {
  label: string
  icon: ReactNode
  href?: string
  onSelect?: () => void
}

type FlyoutState = {
  title: string
  description: string
  orderIds: string[]
}

type ModalState = {
  title: string
  description: string
  confirmLabel: string
}

type TripRow = {
  key: string
  order: OrderRecord
  trip: OrderTrip
}

interface OrdersListViewProps {
  orders: OrderRecord[]
  intakeDraftCount: number
  state?: OrdersViewState
}

const tabs: OrdersTab[] = [
  "All",
  "Need trucks",
  "Partially assigned",
  "Ready for invoice",
  "Invoiced",
  "Settled",
]

const sortOptions = [
  "Newest",
  "Reporting time",
  "Delivery deadline",
  "Pending trucks",
  "Highest balance",
]

export default function OrdersListView({
  orders,
  intakeDraftCount,
  state = "default",
}: OrdersListViewProps) {
  const [selectedStatuses, setSelectedStatuses] = useState<OrdersTab[]>([])
  const [query, setQuery] = useState("")
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("Newest")
  const [listMode, setListMode] = useState<ListMode>("trip")
  const [expandedOrderIds, setExpandedOrderIds] = useState<string[]>([
    orders[0]?.id ?? "",
  ])
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([])
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [flyout, setFlyout] = useState<FlyoutState | null>(null)
  const [modal, setModal] = useState<ModalState | null>(null)

  const clientOptions = useMemo(
    () => [
      "All clients",
      ...Array.from(new Set(orders.map((order) => order.clientName))),
    ],
    [orders]
  )

  const routeOptions = useMemo(
    () => [
      "All routes",
      ...Array.from(
        new Set(orders.map((order) => `${order.origin} to ${order.destination}`))
      ),
    ],
    [orders]
  )

  const filteredOrdersBase = useMemo(() => {
    const nextOrders = orders.filter((order) => {
      const route = `${order.origin} to ${order.destination}`
      const matchesTab =
        selectedStatuses.length === 0 ||
        selectedStatuses.some((status) => {
          if (status === "All") {
            return true
          }

          if (status === "Need trucks") {
            return order.assignmentStatus === "Needs truck assignment"
          }

          if (status === "Partially assigned") {
            return order.assignmentStatus === "Partially assigned"
          }

          if (status === "Ready for invoice") {
            return (
              order.invoiceStatus === "Ready for invoice" ||
              order.invoiceStatus === "Draft invoice"
            )
          }

          if (status === "Invoiced") {
            return order.invoiceStatus === "Invoiced"
          }

          if (status === "Settled") {
            return order.invoiceStatus === "Settled"
          }

          return true
        })
      const matchesClient =
        selectedClients.length === 0 || selectedClients.includes(order.clientName)
      const matchesRoute =
        selectedRoutes.length === 0 || selectedRoutes.includes(route)

      return matchesTab && matchesClient && matchesRoute
    })

    return [...nextOrders].sort((a, b) => {
      if (sortBy === "Highest balance") return b.expectedBalance - a.expectedBalance
      if (sortBy === "Pending trucks") {
        return getPendingTruckCount(b) - getPendingTruckCount(a)
      }
      if (sortBy === "Delivery deadline") {
        return a.deliveryDeadline.localeCompare(b.deliveryDeadline)
      }
      if (sortBy === "Reporting time") {
        return a.reportingAt.localeCompare(b.reportingAt)
      }
      return b.createdAt.localeCompare(a.createdAt)
    })
  }, [orders, selectedClients, selectedRoutes, selectedStatuses, sortBy])

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return filteredOrdersBase
    }

    return filteredOrdersBase.filter((order) =>
      [
        order.id,
        order.clientName,
        `${order.origin} to ${order.destination}`,
        order.loadType,
        order.source,
        order.orderStatus,
        order.invoiceStatus,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    )
  }, [filteredOrdersBase, query])

  const filteredTripRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return filteredOrdersBase.flatMap((order) =>
      order.trips
        .filter((trip) => {
          if (!normalizedQuery) {
            return true
          }

          return [
            order.id,
            order.clientName,
            `${order.origin} to ${order.destination}`,
            trip.id,
            trip.truckType,
            trip.truckNumberOrContact,
            trip.expectedArrivalAt,
            trip.expenseStatus,
            trip.providerDueStatus,
            trip.tripStatus,
            trip.returnReadyStatus,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
        })
        .map((trip) => ({
          key: `${order.id}-${trip.id}`,
          order,
          trip,
        }))
    )
  }, [filteredOrdersBase, query])

  const allVisibleSelected =
    listMode === "order" &&
    filteredOrders.length > 0 &&
    filteredOrders.every((order) => selectedOrderIds.includes(order.id))

  function openFlyout(nextFlyout: FlyoutState) {
    setOpenMenuId(null)
    setFlyout(nextFlyout)
  }

  function openModal(nextModal: ModalState) {
    setOpenMenuId(null)
    setModal(nextModal)
  }

  function toggleOrderSelection(orderId: string) {
    setSelectedOrderIds((current) =>
      current.includes(orderId)
        ? current.filter((id) => id !== orderId)
        : [...current, orderId]
    )
  }

  function toggleVisibleSelection() {
    if (allVisibleSelected) {
      setSelectedOrderIds((current) =>
        current.filter((id) => !filteredOrders.some((order) => order.id === id))
      )
      return
    }

    setSelectedOrderIds((current) =>
      Array.from(new Set([...current, ...filteredOrders.map((order) => order.id)]))
    )
  }

  function toggleExpansion(orderId: string) {
    setExpandedOrderIds((current) =>
      current.includes(orderId)
        ? current.filter((id) => id !== orderId)
        : [...current, orderId]
    )
  }

  function clearFilters() {
    setSelectedStatuses([])
    setQuery("")
    setSelectedClients([])
    setSelectedRoutes([])
    setSortBy("Newest")
    setOpenMenuId(null)
  }

  function buildOrderActions(order: OrderRecord): MenuAction[] {
    return [
      {
        label: "Open order",
        icon: <ExternalLink className="h-4 w-4" aria-hidden="true" />,
        href: `/orders/${order.id}`,
      },
      ...(getPendingTruckCount(order) > 0
        ? [
            {
              label: "Assign trucks",
              icon: <Truck className="h-4 w-4" aria-hidden="true" />,
              onSelect: () =>
                openFlyout({
                  title: `Assign trucks for ${order.id}`,
                  description:
                    "Pending trips are listed below. Assignment saves will be wired to backend later.",
                  orderIds: [order.id],
                }),
            },
          ]
        : []),
      {
        label: "Add note",
        icon: <PenLine className="h-4 w-4" aria-hidden="true" />,
        onSelect: () =>
          openFlyout({
            title: `Add note to ${order.id}`,
            description:
              "Use internal notes for follow-up context. Notes are not client-facing.",
            orderIds: [order.id],
          }),
      },
      {
        label: "Upload document",
        icon: <FileUp className="h-4 w-4" aria-hidden="true" />,
        onSelect: () =>
          openFlyout({
            title: `Upload document for ${order.id}`,
            description: "Attach order-level proof or related files.",
            orderIds: [order.id],
          }),
      },
      {
        label: "Mark completed",
        icon: <CircleCheck className="h-4 w-4" aria-hidden="true" />,
        onSelect: () =>
          openModal({
            title: `Mark ${order.id} completed`,
            description: "This marks the order completed in the current UI mock.",
            confirmLabel: "Mark completed",
          }),
      },
      {
        label: "Cancel order",
        icon: <CircleX className="h-4 w-4" aria-hidden="true" />,
        onSelect: () =>
          openModal({
            title: `Cancel ${order.id}`,
            description:
              "Cancellation is mocked for now and does not affect persisted records.",
            confirmLabel: "Cancel order",
          }),
      },
    ]
  }

  function buildTripActions(order: OrderRecord, trip: OrderTrip): MenuAction[] {
    return [
      {
        label: "Open order",
        icon: <ExternalLink className="h-4 w-4" aria-hidden="true" />,
        href: `/orders/${order.id}`,
      },
      ...(trip.tripStatus === "Needs truck"
        ? [
            {
              label: "Assign trip",
              icon: <Truck className="h-4 w-4" aria-hidden="true" />,
              onSelect: () =>
                openFlyout({
                  title: `Assign ${trip.id}`,
                  description:
                    "Select own truck or outsourced contact for this trip.",
                  orderIds: [order.id],
                }),
            },
          ]
        : []),
      ...(trip.truckType === "Own truck"
        ? [
            {
              label: "Add expense",
              icon: <ReceiptText className="h-4 w-4" aria-hidden="true" />,
              onSelect: () =>
                openFlyout({
                  title: `Add expense to ${trip.id}`,
                  description:
                    "Record diesel, tolls, or police permits for this own-truck trip.",
                  orderIds: [order.id],
                }),
            },
          ]
        : []),
      ...(trip.truckType === "Outsourced truck"
        ? [
            {
              label: "Add provider payment",
              icon: <ReceiptText className="h-4 w-4" aria-hidden="true" />,
              onSelect: () =>
                openFlyout({
                  title: `Add provider payment to ${trip.id}`,
                  description:
                    "Record provider amount, paid amount, due amount, and payment note.",
                  orderIds: [order.id],
                }),
            },
          ]
        : []),
      {
        label: "Upload proof",
        icon: <FileUp className="h-4 w-4" aria-hidden="true" />,
        onSelect: () =>
          openFlyout({
            title: `Upload proof for ${trip.id}`,
            description: "Attach photo or PDF proof to this trip.",
            orderIds: [order.id],
          }),
      },
      {
        label: "Mark return-ready",
        icon: <ClipboardCheck className="h-4 w-4" aria-hidden="true" />,
        onSelect: () =>
          openModal({
            title: `Mark ${trip.id} return-ready`,
            description:
              "This marks the truck as available for a reverse-route opportunity.",
            confirmLabel: "Mark return-ready",
          }),
      },
    ]
  }

  const summary = {
    totalOrders: orders.length,
    needTrucks: orders.filter(
      (order) => order.assignmentStatus === "Needs truck assignment"
    ).length,
    partiallyAssigned: orders.filter(
      (order) => order.assignmentStatus === "Partially assigned"
    ).length,
    pendingBalance: orders.reduce(
      (total, order) => total + order.expectedBalance,
      0
    ),
    intakeDrafts: intakeDraftCount,
  }

  const showFilteredEmpty =
    state === "default" &&
    orders.length > 0 &&
    (listMode === "order"
      ? filteredOrders.length === 0
      : filteredTripRows.length === 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <InternalPageHeader
          description="Master orders created from client requests, each with one or many linked truck trips."
          title="Orders"
        />
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="flex items-center gap-2">
            <ActionMenu
              actions={[
                {
                  label: "Open intake drafts",
                  icon: <FolderKanban className="h-4 w-4" aria-hidden="true" />,
                  href: "/orders/intake",
                },
              ]}
              ariaLabel="Review intake drafts"
              icon={<FileWarning className="h-4 w-4" aria-hidden="true" />}
              isOpen={openMenuId === "toolbar-review-drafts"}
              menuId="toolbar-review-drafts"
              onClose={() => setOpenMenuId(null)}
              onToggle={(menuId) =>
                setOpenMenuId((current) => (current === menuId ? null : menuId))
              }
              title="Review intake drafts"
            />
            <IconActionButton
              ariaLabel="Export current view"
              title="Export current view"
              onClick={() =>
                openModal({
                  title: "Export current view",
                  description:
                    "This will export the currently filtered orders. Export is mocked until backend export is connected.",
                  confirmLabel: "Export view",
                })
              }
            >
              <Download className="h-4 w-4" aria-hidden="true" />
            </IconActionButton>
          </div>
          <Button asChild variant="accent">
            <Link href="/orders/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Order
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/orders/quick">Quick Order</Link>
          </Button>
        </div>
      </div>

      <OrderSummaryCards {...summary} />

      {intakeDraftCount > 0 ? (
        <section className="flex flex-col gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-300 bg-amber-100 text-amber-700">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-amber-950">
                Quick or external order drafts need review before they become
                confirmed orders.
              </p>
              <p className="mt-1 text-sm text-amber-900/80">
                {intakeDraftCount} drafts include missing fields, duplicate risks,
                or ready-to-create records.
              </p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href="/orders/intake">Review drafts</Link>
          </Button>
        </section>
      ) : null}

      <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 xl:flex-nowrap xl:gap-3">
              <span className="shrink-0 text-sm font-medium text-foreground">Status</span>
              <div className="relative w-full sm:w-[11rem] xl:w-[12rem]">
                <MultiSelectFilter
                  allLabel="All statuses"
                  label="Status"
                  onChange={(nextValues) =>
                    setSelectedStatuses(
                      nextValues.filter((value): value is OrdersTab => value !== "All")
                    )
                  }
                  options={tabs.filter((tab) => tab !== "All")}
                  selectedValues={selectedStatuses}
                />
              </div>
              <OrderViewToggle
                checked={listMode === "order"}
                onChange={(checked) => {
                  setOpenMenuId(null)
                  setListMode(checked ? "order" : "trip")
                }}
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 xl:flex-nowrap xl:justify-end">
              <div className="relative w-full min-w-0 sm:w-[15rem] xl:w-[16rem]">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  aria-label={`Search ${listMode === "order" ? "orders" : "trips"}`}
                  className="h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-ring"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={
                    listMode === "order"
                      ? "Search orders"
                      : "Search trips, trucks, clients"
                  }
                  value={query}
                />
              </div>
              <div className="relative w-full sm:w-[11rem] xl:w-[12rem]">
                <MultiSelectFilter
                  allLabel="All clients"
                  label="Clients"
                  onChange={setSelectedClients}
                  options={clientOptions.filter((client) => client !== "All clients")}
                  selectedValues={selectedClients}
                />
              </div>
              <div className="relative w-full sm:w-[11rem] xl:w-[12rem]">
                <MultiSelectFilter
                  allLabel="All routes"
                  label="Routes"
                  onChange={setSelectedRoutes}
                  options={routeOptions.filter((route) => route !== "All routes")}
                  selectedValues={selectedRoutes}
                />
              </div>
              <select
                aria-label="Sort orders"
                className="h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm outline-none sm:w-[7.5rem] xl:w-[7.25rem] focus:border-accent focus:ring-2 focus:ring-ring"
                onChange={(event) => setSortBy(event.target.value)}
                value={sortBy}
              >
                {sortOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {listMode === "order" && selectedOrderIds.length > 0 ? (
        <section className="sticky top-4 z-10 flex flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-lg md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setSelectedOrderIds([])}
              size="sm"
              type="button"
              variant="ghost"
            >
              Clear selection
            </Button>
            <p className="flex items-center text-sm font-medium text-foreground">
              {selectedOrderIds.length} orders selected
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() =>
                openFlyout({
                  title: "Assign trucks",
                  description:
                    "Review selected orders with pending truck trips before assignment.",
                  orderIds: selectedOrderIds,
                })
              }
              size="sm"
              type="button"
              variant="accent"
            >
              <Truck className="h-4 w-4" aria-hidden="true" />
              Assign trucks
            </Button>
            <IconActionButton
              ariaLabel="Mark selected orders completed"
              title="Mark selected orders completed"
              onClick={() =>
                openModal({
                  title: "Mark orders completed",
                  description:
                    "Selected orders will be marked completed in this UI mock. Backend status updates will be connected later.",
                  confirmLabel: "Mark completed",
                })
              }
            >
              <PackageCheck className="h-4 w-4" aria-hidden="true" />
            </IconActionButton>
            <IconActionButton
              ariaLabel="Add selected orders to invoice review"
              title="Add selected orders to invoice review"
              onClick={() =>
                openModal({
                  title: "Add to invoice review",
                  description:
                    "Selected orders will be queued for invoice review when invoice workflows are connected.",
                  confirmLabel: "Add to review",
                })
              }
            >
              <ReceiptText className="h-4 w-4" aria-hidden="true" />
            </IconActionButton>
            <IconActionButton
              ariaLabel="Export selected orders"
              title="Export selected orders"
              onClick={() =>
                openModal({
                  title: "Export selected orders",
                  description:
                    "Selected rows will be exported from the current UI view. Export is mocked for now.",
                  confirmLabel: "Export selected",
                })
              }
            >
              <Download className="h-4 w-4" aria-hidden="true" />
            </IconActionButton>
          </div>
        </section>
      ) : null}

      <section className="overflow-visible rounded-lg border border-border bg-card shadow-sm">
        {state === "loading" ? <OrdersLoadingState /> : null}
        {state === "error" ? <OrdersErrorState /> : null}
        {state === "default" && orders.length === 0 ? <OrdersEmptyState /> : null}
        {showFilteredEmpty ? <FilteredEmptyState onClearFilters={clearFilters} /> : null}
        {state === "default" &&
        !showFilteredEmpty &&
        (listMode === "trip" ? filteredTripRows.length > 0 : filteredOrders.length > 0) ? (
          <>
            <div className="hidden xl:block">
              {listMode === "trip" ? (
                <TripRegisterTable
                  onBuildActions={buildTripActions}
                  onCloseMenu={() => setOpenMenuId(null)}
                  onToggleMenu={(menuId) =>
                    setOpenMenuId((current) => (current === menuId ? null : menuId))
                  }
                  openMenuId={openMenuId}
                  rows={filteredTripRows}
                />
              ) : (
                <OrderRegisterTable
                  allVisibleSelected={allVisibleSelected}
                  expandedOrderIds={expandedOrderIds}
                  onBuildOrderActions={buildOrderActions}
                  onBuildTripActions={buildTripActions}
                  onCloseMenu={() => setOpenMenuId(null)}
                  onToggleExpansion={toggleExpansion}
                  onToggleMenu={(menuId) =>
                    setOpenMenuId((current) => (current === menuId ? null : menuId))
                  }
                  onToggleOrderSelection={toggleOrderSelection}
                  onToggleVisibleSelection={toggleVisibleSelection}
                  openMenuId={openMenuId}
                  orders={filteredOrders}
                  selectedOrderIds={selectedOrderIds}
                />
              )}
            </div>

            <div className="grid gap-3 p-3 xl:hidden">
              {filteredOrders.map((order) => (
                <OrderMobileCard
                  isExpanded={expandedOrderIds.includes(order.id)}
                  key={order.id}
                  onConfirm={(title, description, confirmLabel) =>
                    openModal({ title, description, confirmLabel })
                  }
                  onOpenFlyout={(title, description, orderIds) =>
                    openFlyout({ title, description, orderIds })
                  }
                  onToggleExpand={() => toggleExpansion(order.id)}
                  onToggleSelect={() => toggleOrderSelection(order.id)}
                  order={order}
                  selected={selectedOrderIds.includes(order.id)}
                />
              ))}
            </div>
          </>
        ) : null}
      </section>

      <OrderFlyout
        description={flyout?.description}
        isOpen={flyout !== null}
        onClose={() => setFlyout(null)}
        title={flyout?.title ?? ""}
      >
        <FlyoutOrderContent
          orders={orders.filter((order) => flyout?.orderIds.includes(order.id))}
        />
      </OrderFlyout>

      <OrderConfirmModal
        confirmLabel={modal?.confirmLabel ?? ""}
        description={modal?.description ?? ""}
        isOpen={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.title ?? ""}
      />
    </div>
  )
}

function OrderViewToggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <button
      aria-checked={checked}
      className="inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
      onClick={() => onChange(!checked)}
      role="switch"
      type="button"
    >
      <span className="whitespace-nowrap">Order View</span>
      <span
        className={cn(
          "relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-accent" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-[1.125rem]" : "translate-x-0.5"
          )}
        />
      </span>
    </button>
  )
}

function OrderRegisterTable({
  orders,
  expandedOrderIds,
  selectedOrderIds,
  allVisibleSelected,
  openMenuId,
  onToggleExpansion,
  onToggleOrderSelection,
  onToggleVisibleSelection,
  onBuildOrderActions,
  onBuildTripActions,
  onToggleMenu,
  onCloseMenu,
}: {
  orders: OrderRecord[]
  expandedOrderIds: string[]
  selectedOrderIds: string[]
  allVisibleSelected: boolean
  openMenuId: string | null
  onToggleExpansion: (orderId: string) => void
  onToggleOrderSelection: (orderId: string) => void
  onToggleVisibleSelection: () => void
  onBuildOrderActions: (order: OrderRecord) => MenuAction[]
  onBuildTripActions: (order: OrderRecord, trip: OrderTrip) => MenuAction[]
  onToggleMenu: (menuId: string) => void
  onCloseMenu: () => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1660px] text-left text-sm">
        <thead className="sticky top-0 z-10 bg-muted text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="w-12 px-4 py-3" scope="col">
              <input
                aria-label="Select all visible orders"
                checked={allVisibleSelected}
                className="h-4 w-4 rounded border-border accent-accent focus:ring-ring"
                onChange={onToggleVisibleSelection}
                type="checkbox"
              />
            </th>
            <th className="w-10 px-2 py-3" scope="col">
              Trips
            </th>
            <th className="w-[11rem] px-4 py-3 font-medium" scope="col">
              Order
            </th>
            <th className="w-[18rem] px-4 py-3 font-medium" scope="col">
              Client and route
            </th>
            <th className="w-[10rem] px-4 py-3 font-medium" scope="col">
              Trucks
            </th>
            <th className="w-[12rem] px-4 py-3 font-medium" scope="col">
              Reporting
            </th>
            <th className="w-[22rem] px-4 py-3 font-medium" scope="col">
              Financial progress
            </th>
            <th className="w-[18rem] px-4 py-3 font-medium" scope="col">
              Status
            </th>
            <th className="w-20 px-4 py-3 text-center font-medium" scope="col">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const isExpanded = expandedOrderIds.includes(order.id)
            const orderMenuId = `order-menu-${order.id}`

            return (
              <Fragment key={order.id}>
                <tr className="border-t border-border bg-card align-top">
                  <td className="px-4 py-4">
                    <input
                      aria-label={`Select order ${order.id}`}
                      checked={selectedOrderIds.includes(order.id)}
                      className="h-4 w-4 rounded border-border accent-accent focus:ring-ring"
                      onChange={() => onToggleOrderSelection(order.id)}
                      type="checkbox"
                    />
                  </td>
                  <td className="px-2 py-3">
                    <button
                      aria-controls={`trips-${order.id}`}
                      aria-expanded={isExpanded}
                      aria-label={`${isExpanded ? "Collapse" : "Expand"} trips for ${order.id}`}
                      className="text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      onClick={() => onToggleExpansion(order.id)}
                      title={isExpanded ? "Collapse trips" : "Expand trips"}
                      type="button"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <Link
                      className="font-semibold text-foreground hover:text-accent"
                      href={`/orders/${order.id}`}
                    >
                      {order.id}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {order.loadType} from {order.source}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-foreground">{order.clientName}</p>
                    <p className="mt-1 whitespace-nowrap text-sm text-muted-foreground">
                      {order.origin} to {order.destination}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <p className="font-medium text-foreground">
                      {order.assignedTruckCount}/{order.truckCount} assigned
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {getPendingTruckCount(order)} pending
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <p className="font-medium text-foreground">{order.reportingAt}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Deadline {order.deliveryDeadline}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <MoneyProgressCell
                      advance={order.advancePaid}
                      balance={order.expectedBalance}
                      total={order.baseAmount + order.chargeableExtras}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadgeRow>
                      <OrderStatusBadge
                        label={order.orderStatus}
                        tone={getOrderStatusTone(order.orderStatus)}
                      />
                      <OrderStatusBadge
                        label={order.invoiceStatus}
                        tone={getInvoiceStatusTone(order.invoiceStatus)}
                      />
                    </StatusBadgeRow>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <ActionMenu
                      actions={onBuildOrderActions(order)}
                      ariaLabel={`Open actions for ${order.id}`}
                      icon={<MoreVertical className="h-4 w-4" aria-hidden="true" />}
                      isOpen={openMenuId === orderMenuId}
                      menuId={orderMenuId}
                      onClose={onCloseMenu}
                      onToggle={onToggleMenu}
                      title={`Open actions for ${order.id}`}
                    />
                  </td>
                </tr>
                {isExpanded ? (
                  <tr className="border-t border-border bg-muted/40" id={`trips-${order.id}`}>
                    <td className="max-w-0 px-4 py-4" colSpan={9}>
                      <NestedTripsTable
                        onBuildActions={(trip) => onBuildTripActions(order, trip)}
                        onCloseMenu={onCloseMenu}
                        onToggleMenu={onToggleMenu}
                        openMenuId={openMenuId}
                        orderId={order.id}
                        trips={order.trips}
                      />
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function TripRegisterTable({
  rows,
  openMenuId,
  onBuildActions,
  onToggleMenu,
  onCloseMenu,
}: {
  rows: TripRow[]
  openMenuId: string | null
  onBuildActions: (order: OrderRecord, trip: OrderTrip) => MenuAction[]
  onToggleMenu: (menuId: string) => void
  onCloseMenu: () => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1540px] text-left text-sm">
        <thead className="sticky top-0 z-10 bg-muted text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="w-[12rem] px-4 py-3 font-medium" scope="col">
              Trip
            </th>
            <th className="w-[20rem] px-4 py-3 font-medium" scope="col">
              Order and route
            </th>
            <th className="w-[18rem] px-4 py-3 font-medium" scope="col">
              Truck/contact
            </th>
            <th className="w-[12rem] px-4 py-3 font-medium" scope="col">
              Arrival
            </th>
            <th className="w-[18rem] px-4 py-3 font-medium" scope="col">
              Expense/payment
            </th>
            <th className="w-[18rem] px-4 py-3 font-medium" scope="col">
              Status
            </th>
            <th className="w-20 px-4 py-3 text-center font-medium" scope="col">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ key, order, trip }) => {
            const tripMenuId = `trip-menu-${trip.id}`

            return (
              <tr className="border-t border-border bg-card align-top" key={key}>
                <td className="whitespace-nowrap px-4 py-4 font-medium text-foreground">
                  {trip.id}
                  <p className="mt-1 text-xs font-normal text-muted-foreground">
                    {trip.truckType}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <Link
                    className="font-semibold text-foreground hover:text-accent"
                    href={`/orders/${order.id}`}
                  >
                    {order.id}
                  </Link>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {order.clientName}
                  </p>
                  <p className="mt-1 whitespace-nowrap text-sm text-muted-foreground">
                    {order.origin} to {order.destination}
                  </p>
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  {trip.truckNumberOrContact}
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  {trip.expectedArrivalAt}
                </td>
                <td className="px-4 py-4 text-muted-foreground">
                  <p className="whitespace-nowrap">{trip.expenseStatus}</p>
                  <p className="mt-1 whitespace-nowrap">{trip.providerDueStatus}</p>
                </td>
                <td className="px-4 py-4">
                  <StatusBadgeRow>
                    <OrderStatusBadge
                      label={trip.tripStatus}
                      tone={getTripStatusTone(trip.tripStatus)}
                    />
                    <OrderStatusBadge label={trip.returnReadyStatus} />
                  </StatusBadgeRow>
                </td>
                <td className="px-4 py-4 text-center">
                  <ActionMenu
                    actions={onBuildActions(order, trip)}
                    ariaLabel={`Open actions for ${trip.id}`}
                    icon={<MoreVertical className="h-4 w-4" aria-hidden="true" />}
                    isOpen={openMenuId === tripMenuId}
                    menuId={tripMenuId}
                    onClose={onCloseMenu}
                    onToggle={onToggleMenu}
                    title={`Open actions for ${trip.id}`}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function StatusBadgeRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-w-[16rem] flex-nowrap items-center gap-2 overflow-x-auto pb-1">
      {children}
    </div>
  )
}

function IconActionButton({
  children,
  ariaLabel,
  title,
  onClick,
}: {
  children: ReactNode
  ariaLabel: string
  title: string
  onClick: (event: MouseEvent<HTMLButtonElement>) => void
}) {
  return (
    <Button
      aria-label={ariaLabel}
      className="border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
      onClick={onClick}
      size="icon"
      title={title}
      type="button"
      variant="outline"
    >
      {children}
    </Button>
  )
}

function ActionMenu({
  title,
  ariaLabel,
  icon,
  actions,
  menuId,
  isOpen,
  onToggle,
  onClose,
}: {
  title: string
  ariaLabel: string
  icon: ReactNode
  actions: MenuAction[]
  menuId: string
  isOpen: boolean
  onToggle: (menuId: string) => void
  onClose: () => void
}) {
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function updatePosition() {
      if (!buttonRef.current) {
        return
      }

      const rect = buttonRef.current.getBoundingClientRect()
      const menuWidth = 320
      const menuHeightEstimate = 320
      const horizontalPadding = 16
      const verticalPadding = 12
      const left = Math.max(
        horizontalPadding,
        Math.min(
          rect.right - menuWidth,
          window.innerWidth - menuWidth - horizontalPadding
        )
      )
      const enoughSpaceBelow =
        rect.bottom + verticalPadding + menuHeightEstimate <= window.innerHeight
      const top = enoughSpaceBelow
        ? rect.bottom + 8
        : Math.max(verticalPadding, rect.top - menuHeightEstimate - 8)

      setPosition({ top, left })
    }

    function handlePointerDown(event: MouseEvent | globalThis.MouseEvent) {
      const target = event.target as Node

      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return
      }

      onClose()
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, true)
    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition, true)
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  return (
    <>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={ariaLabel}
        className="rounded-md border border-border bg-background p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        onClick={() => onToggle(menuId)}
        ref={buttonRef}
        title={title}
        type="button"
      >
        <span className="flex h-5 w-5 items-center justify-center">{icon}</span>
      </button>

      {isOpen
        ? createPortal(
            <div
              className="pointer-events-none fixed inset-0 z-[90]"
              aria-hidden={false}
            >
              <div
                className="pointer-events-auto fixed w-80 rounded-lg border border-border bg-card p-2 shadow-2xl"
                ref={menuRef}
                style={{ left: position.left, top: position.top }}
              >
                <div className="mb-2 px-2 py-1">
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                </div>
                <div className="grid gap-2">
                  {actions.map((action) =>
                    action.href ? (
                      <Button
                        asChild
                        className="justify-start"
                        key={action.label}
                        variant="outline"
                      >
                        <Link href={action.href} onClick={onClose}>
                          {action.icon}
                          {action.label}
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        className="justify-start"
                        key={action.label}
                        onClick={() => {
                          onClose()
                          action.onSelect?.()
                        }}
                        type="button"
                        variant="outline"
                      >
                        {action.icon}
                        {action.label}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  )
}

function MoneyProgressCell({
  advance,
  balance,
  total,
}: {
  advance: number
  balance: number
  total: number
}) {
  const safeTotal = total > 0 ? total : 1
  const advancePercentage = Math.max(
    0,
    Math.min((advance / safeTotal) * 100, 100)
  )
  const completionPercentage = Math.round(advancePercentage)
  const tooltipText = `Total: ${formatCurrency(total)}
Advance: ${formatCurrency(advance)}
Balance: ${formatCurrency(balance)}`

  return (
    <div className="flex min-w-[20rem] items-center gap-3" title={tooltipText}>
      <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full bg-accent ${getProgressWidthClass(advancePercentage)}`}
        />
      </div>
      <OrderStatusBadge label={`${completionPercentage}%`} tone="info" />
      <p className="whitespace-nowrap text-xs font-medium text-foreground">
        {formatCurrency(balance)} / {formatCurrency(total)}
      </p>
    </div>
  )
}

function getProgressWidthClass(percentage: number) {
  if (percentage >= 100) return "w-full"
  if (percentage >= 90) return "w-[90%]"
  if (percentage >= 80) return "w-[80%]"
  if (percentage >= 70) return "w-[70%]"
  if (percentage >= 60) return "w-[60%]"
  if (percentage >= 50) return "w-1/2"
  if (percentage >= 40) return "w-[40%]"
  if (percentage >= 30) return "w-[30%]"
  if (percentage >= 20) return "w-[20%]"
  if (percentage >= 10) return "w-[10%]"
  if (percentage > 0) return "w-[6%]"
  return "w-0"
}

function NestedTripsTable({
  orderId,
  trips,
  openMenuId,
  onBuildActions,
  onToggleMenu,
  onCloseMenu,
}: {
  orderId: string
  trips: OrderTrip[]
  openMenuId: string | null
  onBuildActions: (trip: OrderTrip) => MenuAction[]
  onToggleMenu: (menuId: string) => void
  onCloseMenu: () => void
}) {
  if (trips.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background p-4">
        <p className="font-medium text-foreground">
          Create truck trips for this order.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          No linked trips exist yet. Create trips from truck count before
          assignment.
        </p>
        <Button className="mt-3" size="sm" type="button" variant="accent">
          Create trips from truck count
        </Button>
      </div>
    )
  }

  return (
    <SyncedHorizontalScrollArea minWidthClass="min-w-[1220px]">
      <table className="w-full min-w-[1220px] text-left text-sm">
        <thead className="bg-background text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="w-[12rem] px-3 py-3 font-medium" scope="col">
              Trip
            </th>
            <th className="w-[18rem] px-3 py-3 font-medium" scope="col">
              Truck/contact
            </th>
            <th className="w-[12rem] px-3 py-3 font-medium" scope="col">
              Arrival
            </th>
            <th className="w-[18rem] px-3 py-3 font-medium" scope="col">
              Expense/payment
            </th>
            <th className="w-[18rem] px-3 py-3 font-medium" scope="col">
              Status
            </th>
            <th className="w-20 px-3 py-3 text-center font-medium" scope="col">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {trips.map((trip) => {
            const tripMenuId = `nested-trip-menu-${orderId}-${trip.id}`

            return (
              <tr className="border-t border-border" key={trip.id}>
                <td className="whitespace-nowrap px-3 py-3 font-medium text-foreground">
                  {trip.id}
                  <p className="mt-1 text-xs font-normal text-muted-foreground">
                    {trip.truckType}
                  </p>
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  {trip.truckNumberOrContact}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  {trip.expectedArrivalAt}
                </td>
                <td className="px-3 py-3 text-muted-foreground">
                  <p className="whitespace-nowrap">{trip.expenseStatus}</p>
                  <p className="mt-1 whitespace-nowrap">{trip.providerDueStatus}</p>
                </td>
                <td className="px-3 py-3">
                  <StatusBadgeRow>
                    <OrderStatusBadge
                      label={trip.tripStatus}
                      tone={getTripStatusTone(trip.tripStatus)}
                    />
                    <OrderStatusBadge label={trip.returnReadyStatus} />
                  </StatusBadgeRow>
                </td>
                <td className="px-3 py-3 text-center">
                  <ActionMenu
                    actions={onBuildActions(trip)}
                    ariaLabel={`Open actions for ${trip.id}`}
                    icon={<MoreVertical className="h-4 w-4" aria-hidden="true" />}
                    isOpen={openMenuId === tripMenuId}
                    menuId={tripMenuId}
                    onClose={onCloseMenu}
                    onToggle={onToggleMenu}
                    title={`Open actions for ${trip.id}`}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </SyncedHorizontalScrollArea>
  )
}

function SyncedHorizontalScrollArea({
  children,
  minWidthClass,
}: {
  children: ReactNode
  minWidthClass: string
}) {
  const contentScrollRef = useRef<HTMLDivElement | null>(null)
  const [scrollWidth, setScrollWidth] = useState(0)
  const [clientWidth, setClientWidth] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  useLayoutEffect(() => {
    function updateMeasurements() {
      if (!contentScrollRef.current) {
        return
      }

      setScrollWidth(contentScrollRef.current.scrollWidth)
      setClientWidth(contentScrollRef.current.clientWidth)
      setScrollLeft(contentScrollRef.current.scrollLeft)
    }

    updateMeasurements()
    window.addEventListener("resize", updateMeasurements)

    return () => window.removeEventListener("resize", updateMeasurements)
  }, [])

  useEffect(() => {
    const contentNode = contentScrollRef.current

    if (!contentNode) {
      return
    }

    function syncFromContent() {
      if (!contentNode) {
        return
      }

      setScrollLeft(contentNode.scrollLeft)
    }

    contentNode.addEventListener("scroll", syncFromContent)

    return () => {
      contentNode.removeEventListener("scroll", syncFromContent)
    }
  }, [])

  const showBottomScrollbar = scrollWidth > clientWidth
  const maxScrollLeft = Math.max(scrollWidth - clientWidth, 0)

  return (
    <div className="w-full max-w-full rounded-lg border border-border bg-card">
      <div className="w-full max-w-full overflow-x-auto" ref={contentScrollRef}>
        <div className={cn("w-full", minWidthClass)}>{children}</div>
      </div>
      {showBottomScrollbar ? (
        <div className="border-t border-border bg-background/80 px-3 py-3">
          <div className="flex items-center gap-3">
            <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Scroll
            </span>
            <input
              aria-label="Scroll child table horizontally"
              className="h-2 w-full cursor-pointer accent-accent"
              max={maxScrollLeft}
              min={0}
              onChange={(event) => {
                const nextScrollLeft = Number(event.target.value)
                setScrollLeft(nextScrollLeft)

                if (contentScrollRef.current) {
                  contentScrollRef.current.scrollLeft = nextScrollLeft
                }
              }}
              type="range"
              value={Math.min(scrollLeft, maxScrollLeft)}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}

function OrderMobileCard({
  order,
  selected,
  isExpanded,
  onToggleSelect,
  onToggleExpand,
  onOpenFlyout,
  onConfirm,
}: {
  order: OrderRecord
  selected: boolean
  isExpanded: boolean
  onToggleSelect: () => void
  onToggleExpand: () => void
  onOpenFlyout: (title: string, description: string, orderIds: string[]) => void
  onConfirm: (title: string, description: string, confirmLabel: string) => void
}) {
  return (
    <article className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <input
            aria-label={`Select order ${order.id}`}
            checked={selected}
            className="mt-1 h-4 w-4 rounded border-border accent-accent focus:ring-ring"
            onChange={onToggleSelect}
            type="checkbox"
          />
          <div>
            <Link
              className="font-semibold text-foreground hover:text-accent"
              href={`/orders/${order.id}`}
            >
              {order.id}
            </Link>
            <p className="mt-1 text-sm font-medium text-foreground">
              {order.clientName}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.origin} to {order.destination}
            </p>
          </div>
        </div>
        <OrderStatusBadge
          label={order.orderStatus}
          tone={getOrderStatusTone(order.orderStatus)}
        />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-muted-foreground">Trucks</dt>
          <dd className="font-medium">
            {order.assignedTruckCount}/{order.truckCount} assigned
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Balance</dt>
          <dd className="font-medium">{formatCurrency(order.expectedBalance)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Reporting</dt>
          <dd className="font-medium">{order.reportingAt}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Advance</dt>
          <dd className="font-medium">{formatCurrency(order.advancePaid)}</dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href={`/orders/${order.id}`}>Open</Link>
        </Button>
        {getPendingTruckCount(order) > 0 ? (
          <Button
            onClick={() =>
              onOpenFlyout(
                `Assign trucks for ${order.id}`,
                "Pending trips are listed below. Assignment saves will be wired to backend later.",
                [order.id]
              )
            }
            size="sm"
            type="button"
            variant="accent"
          >
            Assign trucks
          </Button>
        ) : null}
        <Button onClick={onToggleExpand} size="sm" type="button" variant="ghost">
          {isExpanded ? "Hide trips" : "Show trips"}
        </Button>
        <IconActionButton
          ariaLabel={`Open more actions for ${order.id}`}
          title={`Open more actions for ${order.id}`}
          onClick={() =>
            onConfirm(
              `Order actions for ${order.id}`,
              "Use the three-dot action entry for non-primary actions on mobile as well.",
              "Close"
            )
          }
        >
          <MoreVertical className="h-4 w-4" aria-hidden="true" />
        </IconActionButton>
      </div>
      {isExpanded ? (
        <div className="mt-4 grid gap-3">
          {order.trips.map((trip) => (
            <div
              className="rounded-lg border border-border bg-card p-3"
              key={trip.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{trip.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {trip.truckNumberOrContact}
                  </p>
                </div>
                <OrderStatusBadge
                  label={trip.tripStatus}
                  tone={getTripStatusTone(trip.tripStatus)}
                />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Arrival {trip.expectedArrivalAt}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <IconActionButton
                  ariaLabel={`Open actions for ${trip.id}`}
                  title={`Open actions for ${trip.id}`}
                  onClick={() =>
                    onConfirm(
                      `Trip actions for ${trip.id}`,
                      "Trip assignment, expense, provider payment, upload proof, and return-ready updates are grouped behind this compact menu on mobile.",
                      "Close"
                    )
                  }
                >
                  <MoreVertical className="h-4 w-4" aria-hidden="true" />
                </IconActionButton>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  )
}

function FlyoutOrderContent({ orders }: { orders: OrderRecord[] }) {
  if (orders.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No orders selected for this action.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <article
          className="rounded-lg border border-border bg-card p-4"
          key={order.id}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-foreground">{order.id}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {order.clientName} - {order.origin} to {order.destination}
              </p>
            </div>
            <OrderStatusBadge
              label={`${getPendingTruckCount(order)} pending`}
              tone={getPendingTruckCount(order) > 0 ? "warning" : "success"}
            />
          </div>
          <div className="mt-4 grid gap-2">
            {order.trips
              .filter((trip) => trip.tripStatus === "Needs truck")
              .map((trip) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3 text-sm"
                  key={trip.id}
                >
                  <div>
                    <p className="font-medium text-foreground">{trip.id}</p>
                    <p className="text-muted-foreground">
                      Expected arrival {trip.expectedArrivalAt}
                    </p>
                  </div>
                  <Button size="sm" type="button" variant="outline">
                    Assign
                  </Button>
                </div>
              ))}
            {order.trips.every((trip) => trip.tripStatus !== "Needs truck") ? (
              <p className="rounded-lg border border-border bg-background p-3 text-sm text-muted-foreground">
                No pending trips for this order.
              </p>
            ) : null}
          </div>
        </article>
      ))}
      <div className="rounded-lg border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
        Action save is mocked for UI implementation. Backend wiring can later
        reuse these order IDs and trip IDs.
      </div>
    </div>
  )
}

function OrdersLoadingState() {
  return (
    <div className="grid gap-3 p-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          className="h-16 animate-pulse rounded-lg bg-muted"
          key={`order-loading-${index}`}
        />
      ))}
    </div>
  )
}

function OrdersEmptyState() {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 p-6 text-center">
      <FileText className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <div>
        <p className="font-semibold text-foreground">
          No orders created yet. Create the first master order when a client
          calls.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Saved orders will appear here with linked trips below each order.
        </p>
      </div>
      <Button asChild variant="accent">
        <Link href="/orders/new">New Order</Link>
      </Button>
    </div>
  )
}

function FilteredEmptyState({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="font-semibold text-foreground">
        No rows match these filters.
      </p>
      <p className="max-w-md text-sm text-muted-foreground">
        Try clearing search, status, client, route, or sort filters to return to
        the full register.
      </p>
      <Button onClick={onClearFilters} type="button" variant="outline">
        Clear filters
      </Button>
    </div>
  )
}

function OrdersErrorState() {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 p-6 text-center">
      <PackageCheck className="h-8 w-8 text-destructive" aria-hidden="true" />
      <p className="font-semibold text-foreground">
        Orders could not load. Your records are not changed.
      </p>
      <Button type="button" variant="outline">
        Retry
      </Button>
    </div>
  )
}
