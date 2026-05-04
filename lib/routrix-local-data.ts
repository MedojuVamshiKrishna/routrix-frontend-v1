import { mockIntakeDrafts, mockOrders } from "@/app/(dashboard)/orders/order-mock-data"
import type {
  IntakeDraft,
  IntakeDraftStatus,
  OrderRecord,
  OrderTrip,
  TripStatus,
  TruckType,
} from "@/components/orders/order-types"

const STORAGE_KEY = "routrix-local-data-v1"
const STORAGE_EVENT = "routrix-local-data:changed"

export type InvoiceRecordStatus = "Draft invoice" | "Invoiced"

export interface LocalInvoiceRecord {
  id: string
  orderId: string
  invoiceNumber: string
  status: InvoiceRecordStatus
  issueDate: string
  dueDate: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface LocalDocumentRecord {
  id: string
  orderId: string
  tripId?: string
  name: string
  mimeType: string
  size: number
  uploadedAt: string
  dataUrl: string
}

export interface RoutrixLocalData {
  orders: OrderRecord[]
  drafts: IntakeDraft[]
  invoices: LocalInvoiceRecord[]
  documents: LocalDocumentRecord[]
}

interface QuickOrderInput {
  clientNameOrPhone: string
  origin: string
  destination: string
  truckCount: string
  roughReportingTime: string
  rateOrPricingNote: string
  advancePaid: string
  notes: string
}

interface FullOrderInput {
  clientName: string
  loadType: string
  origin: string
  destination: string
  truckCount: string
  reportingAt: string
  deliveryDeadline: string
  rateAmount: string
  advancePaid: string
  notes: string
  source: OrderRecord["source"]
  chargeableExtras: number
}

interface EditOrderInput {
  clientName: string
  loadType: string
  origin: string
  destination: string
  truckCount: number
  reportingAt: string
  deliveryDeadline: string
  notes: string
}

interface ChargeInput {
  laborCharge: number
  waitingCharge: number
  multiPointDiesel: number
  extraDistanceCharge: number
  otherCharge: number
}

interface AssignTripInput {
  tripId: string
  truckType: TruckType
  truckNumberOrContact: string
  expectedArrivalAt: string
}

interface InvoiceInput {
  id?: string
  invoiceNumber: string
  status: InvoiceRecordStatus
  issueDate: string
  dueDate: string
  notes: string
}

function cloneData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function getDefaultData(): RoutrixLocalData {
  return {
    orders: cloneData(mockOrders),
    drafts: cloneData(mockIntakeDrafts),
    invoices: [],
    documents: [],
  }
}

const serverSnapshot = getDefaultData()
let cachedClientData: RoutrixLocalData | null = null

function ensureShape(value: Partial<RoutrixLocalData> | null | undefined) {
  const defaults = getDefaultData()

  return {
    orders: Array.isArray(value?.orders) ? value.orders : defaults.orders,
    drafts: Array.isArray(value?.drafts) ? value.drafts : defaults.drafts,
    invoices: Array.isArray(value?.invoices) ? value.invoices : [],
    documents: Array.isArray(value?.documents) ? value.documents : [],
  } satisfies RoutrixLocalData
}

export function readRoutrixLocalData(): RoutrixLocalData {
  if (typeof window === "undefined") {
    return serverSnapshot
  }

  if (cachedClientData) {
    return cachedClientData
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY)

  if (!rawValue) {
    const defaults = getDefaultData()
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults))
    cachedClientData = defaults
    return cachedClientData
  }

  try {
    cachedClientData = ensureShape(
      JSON.parse(rawValue) as Partial<RoutrixLocalData>
    )
    return cachedClientData
  } catch {
    const defaults = getDefaultData()
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults))
    cachedClientData = defaults
    return cachedClientData
  }
}

function emitChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(STORAGE_EVENT))
  }
}

export function subscribeRoutrixLocalData(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      if (event.newValue) {
        try {
          cachedClientData = ensureShape(
            JSON.parse(event.newValue) as Partial<RoutrixLocalData>
          )
        } catch {
          cachedClientData = getDefaultData()
        }
      } else {
        cachedClientData = getDefaultData()
      }

      callback()
    }
  }

  window.addEventListener("storage", handleStorage)
  window.addEventListener(STORAGE_EVENT, callback)

  return () => {
    window.removeEventListener("storage", handleStorage)
    window.removeEventListener(STORAGE_EVENT, callback)
  }
}

export function writeRoutrixLocalData(data: RoutrixLocalData) {
  if (typeof window === "undefined") {
    return
  }

  cachedClientData = data
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  emitChange()
}

export function updateRoutrixLocalData(
  updater: (current: RoutrixLocalData) => RoutrixLocalData
) {
  const nextData = updater(readRoutrixLocalData())
  writeRoutrixLocalData(nextData)
  return nextData
}

function getNextId(prefix: string, existingIds: string[], start: number) {
  const maxId = existingIds.reduce((highest, id) => {
    const [, numericPart = "0"] = id.split("-")
    const parsedNumber = Number(numericPart)
    return Number.isFinite(parsedNumber) ? Math.max(highest, parsedNumber) : highest
  }, start - 1)

  return `${prefix}-${String(maxId + 1)}`
}

function getNextIds(
  prefix: string,
  existingIds: string[],
  count: number,
  start: number
) {
  const nextIds: string[] = []
  const seenIds = [...existingIds]

  for (let index = 0; index < count; index += 1) {
    const nextId = getNextId(prefix, seenIds, start)
    nextIds.push(nextId)
    seenIds.push(nextId)
  }

  return nextIds
}

function extractCurrencyNumber(value: string) {
  const digits = value.replace(/,/g, "").match(/\d+(\.\d+)?/)
  return digits ? Number(digits[0]) : 0
}

function formatDisplayDateTime(value: string) {
  if (!value) {
    return "Pending confirmation"
  }

  if (!value.includes("T")) {
    return value
  }

  const parsedValue = new Date(value)

  if (Number.isNaN(parsedValue.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedValue)
}

function createTrip(orderId: string, tripId: string): OrderTrip {
  return {
    id: tripId,
    orderId,
    truckType: "Unassigned",
    truckNumberOrContact: "Needs truck",
    expectedArrivalAt: "Pending assignment",
    expenseStatus: "No expense",
    providerDueStatus: "No provider selected",
    returnReadyStatus: "Not return-ready",
    tripStatus: "Needs truck",
  }
}

function recalculateOrder(order: OrderRecord): OrderRecord {
  const assignedTruckCount = order.trips.filter(
    (trip) =>
      trip.tripStatus !== "Needs truck" &&
      trip.truckType !== "Unassigned" &&
      trip.truckNumberOrContact.trim().length > 0 &&
      trip.truckNumberOrContact !== "Needs truck"
  ).length

  const chargeableExtras = Math.max(order.chargeableExtras, 0)
  const expectedBalance = order.baseAmount + chargeableExtras - order.advancePaid

  let assignmentStatus: OrderRecord["assignmentStatus"] = "Needs truck assignment"

  if (assignedTruckCount >= order.truckCount) {
    assignmentStatus = "Assigned"
  } else if (assignedTruckCount > 0) {
    assignmentStatus = "Partially assigned"
  }

  let orderStatus: OrderRecord["orderStatus"]

  if (order.invoiceStatus === "Settled") {
    orderStatus = "Settled"
  } else if (order.invoiceStatus === "Invoiced") {
    orderStatus = "Invoiced"
  } else {
    orderStatus = assignmentStatus
  }

  return {
    ...order,
    assignedTruckCount,
    chargeableExtras,
    expectedBalance,
    assignmentStatus,
    orderStatus,
  }
}

function syncTripsToTruckCount(
  currentTrips: OrderTrip[],
  orderId: string,
  truckCount: number,
  nextTripIds: string[]
) {
  if (currentTrips.length === truckCount) {
    return currentTrips
  }

  if (currentTrips.length > truckCount) {
    return currentTrips.slice(0, truckCount)
  }

  const nextTrips = [...currentTrips]
  const missingCount = truckCount - currentTrips.length

  for (let index = 0; index < missingCount; index += 1) {
    nextTrips.push(createTrip(orderId, nextTripIds[index]))
  }

  return nextTrips
}

export function createQuickOrderRecord(values: QuickOrderInput) {
  return updateRoutrixLocalData((current) => {
    const orderId = getNextId(
      "ORD",
      current.orders.map((order) => order.id),
      1000
    )
    const draftId = getNextId(
      "DRF",
      current.drafts.map((draft) => draft.id),
      2200
    )
    const truckCount = Math.max(Number(values.truckCount) || 1, 1)
    const nextTripIds = getNextIds(
      "TRP",
      current.orders.flatMap((order) => order.trips.map((trip) => trip.id)),
      truckCount,
      4200
    )
    const advancePaid = Number(values.advancePaid) || 0
    const baseAmount = extractCurrencyNumber(values.rateOrPricingNote)
    const timestamp = new Date().toISOString()
    const missingFields: string[] = []

    if (baseAmount <= 0) {
      missingFields.push("Rate amount")
    }

    const newOrder = recalculateOrder({
      id: orderId,
      clientName: values.clientNameOrPhone.trim(),
      loadType: "Pending confirmation",
      origin: values.origin.trim(),
      destination: values.destination.trim(),
      truckCount,
      assignedTruckCount: 0,
      reportingAt: values.roughReportingTime.trim() || "Timing pending",
      deliveryDeadline: "Pending confirmation",
      baseAmount,
      chargeableExtras: 0,
      advancePaid,
      expectedBalance: baseAmount - advancePaid,
      invoiceStatus: "Not invoiced",
      assignmentStatus: "Needs truck assignment",
      orderStatus: "Needs truck assignment",
      createdAt: timestamp,
      source: "Quick Order",
      notes: values.notes.trim() || values.rateOrPricingNote.trim() || undefined,
      trips: nextTripIds.map((tripId) => createTrip(orderId, tripId)),
    })

    const nextDraftStatus: IntakeDraftStatus =
      missingFields.length > 0 ? "Missing fields" : "Ready to create order"

    const newDraft: IntakeDraft = {
      id: draftId,
      source: "Quick Order",
      receivedAt: formatDisplayDateTime(timestamp),
      clientText: values.clientNameOrPhone.trim(),
      linkedClient: values.clientNameOrPhone.trim(),
      origin: values.origin.trim(),
      destination: values.destination.trim(),
      truckCount,
      rateAndAdvance:
        values.rateOrPricingNote.trim().length > 0
          ? `${values.rateOrPricingNote.trim()} / ${advancePaid > 0 ? `Rs ${advancePaid.toLocaleString("en-IN")}` : "no advance"}`
          : advancePaid > 0
            ? `Rate missing / Rs ${advancePaid.toLocaleString("en-IN")}`
            : "Rate missing / no advance",
      missingFields,
      duplicateRisk: "No automatic duplicate check for local entry",
      status: nextDraftStatus,
      convertedOrderId: orderId,
      originalValues: [
        `Client: ${values.clientNameOrPhone.trim()}`,
        `Route: ${values.origin.trim()} to ${values.destination.trim()}`,
        `Truck count: ${truckCount}`,
      ],
      cleanedValues: [
        `Linked order: ${orderId}`,
        `Reporting: ${values.roughReportingTime.trim() || "Pending confirmation"}`,
        `Advance paid: Rs ${advancePaid.toLocaleString("en-IN")}`,
      ],
      notes: values.notes.trim() || "Created from quick order.",
    }

    return {
      ...current,
      orders: [newOrder, ...current.orders],
      drafts: [newDraft, ...current.drafts],
    }
  })
}

export function createDirectOrderRecord(values: FullOrderInput) {
  return updateRoutrixLocalData((current) => {
    const orderId = getNextId(
      "ORD",
      current.orders.map((order) => order.id),
      1000
    )
    const usedTripIds = current.orders.flatMap((order) =>
      order.trips.map((trip) => trip.id)
    )
    const truckCount = Math.max(Number(values.truckCount) || 1, 1)
    const tripIds = getNextIds("TRP", usedTripIds, truckCount, 4200)
    const baseAmount = Number(values.rateAmount) || 0
    const advancePaid = Number(values.advancePaid) || 0

    const newOrder = recalculateOrder({
      id: orderId,
      clientName: values.clientName.trim(),
      loadType: values.loadType.trim() || "General cargo",
      origin: values.origin.trim(),
      destination: values.destination.trim(),
      truckCount,
      assignedTruckCount: 0,
      reportingAt: formatDisplayDateTime(values.reportingAt),
      deliveryDeadline: formatDisplayDateTime(values.deliveryDeadline),
      baseAmount,
      chargeableExtras: values.chargeableExtras,
      advancePaid,
      expectedBalance: baseAmount + values.chargeableExtras - advancePaid,
      invoiceStatus: "Not invoiced",
      assignmentStatus: "Needs truck assignment",
      orderStatus: "Needs truck assignment",
      createdAt: new Date().toISOString(),
      source: values.source,
      notes: values.notes.trim() || undefined,
      trips: tripIds.map((tripId) => createTrip(orderId, tripId)),
    })

    return {
      ...current,
      orders: [newOrder, ...current.orders],
    }
  })
}

export function updateOrderDetail(orderId: string, values: EditOrderInput) {
  return updateRoutrixLocalData((current) => {
    const existingTripIds = current.orders.flatMap((order) =>
      order.trips.map((trip) => trip.id)
    )
    const nextOrders = current.orders.map((order) => {
      if (order.id !== orderId) {
        return order
      }

      const nextTruckCount = Math.max(values.truckCount, 1)
      const nextTripIds = getNextIds(
        "TRP",
        existingTripIds,
        Math.max(nextTruckCount - order.trips.length, 0),
        4200
      )

      return recalculateOrder({
        ...order,
        clientName: values.clientName.trim(),
        loadType: values.loadType.trim() || "General cargo",
        origin: values.origin.trim(),
        destination: values.destination.trim(),
        truckCount: nextTruckCount,
        reportingAt: values.reportingAt.trim() || order.reportingAt,
        deliveryDeadline: values.deliveryDeadline.trim() || order.deliveryDeadline,
        notes: values.notes.trim() || undefined,
        trips: syncTripsToTruckCount(order.trips, orderId, nextTruckCount, nextTripIds),
      })
    })

    return {
      ...current,
      orders: nextOrders,
    }
  })
}

export function updateOrderCharges(orderId: string, values: ChargeInput) {
  return updateRoutrixLocalData((current) => ({
    ...current,
    orders: current.orders.map((order) =>
      order.id === orderId
        ? recalculateOrder({
            ...order,
            chargeableExtras:
              values.laborCharge +
              values.waitingCharge +
              values.multiPointDiesel +
              values.extraDistanceCharge +
              values.otherCharge,
          })
        : order
    ),
  }))
}

export function assignOrderTrips(orderId: string, assignments: AssignTripInput[]) {
  return updateRoutrixLocalData((current) => ({
    ...current,
    orders: current.orders.map((order) => {
      if (order.id !== orderId) {
        return order
      }

      const assignmentMap = new Map(assignments.map((assignment) => [assignment.tripId, assignment]))

      const nextTrips = order.trips.map((trip) => {
        const nextAssignment = assignmentMap.get(trip.id)

        if (!nextAssignment) {
          return trip
        }

        const tripStatus: TripStatus =
          nextAssignment.truckType === "Unassigned" ||
          nextAssignment.truckNumberOrContact.trim().length === 0
            ? "Needs truck"
            : "Assigned"

        return {
          ...trip,
          truckType: nextAssignment.truckType,
          truckNumberOrContact:
            nextAssignment.truckType === "Unassigned"
              ? "Needs truck"
              : nextAssignment.truckNumberOrContact.trim(),
          expectedArrivalAt:
            nextAssignment.expectedArrivalAt.trim() || "Pending assignment",
          expenseStatus:
            nextAssignment.truckType === "Own truck"
              ? "Expense pending"
              : nextAssignment.truckType === "Outsourced truck"
                ? "Provider payment pending"
                : "No expense",
          providerDueStatus:
            nextAssignment.truckType === "Outsourced truck"
              ? "Provider payment pending"
              : "No provider due",
          tripStatus,
        }
      })

      return recalculateOrder({
        ...order,
        trips: nextTrips,
      })
    }),
  }))
}

export function upsertInvoiceRecord(orderId: string, values: InvoiceInput) {
  return updateRoutrixLocalData((current) => {
    const nextInvoiceId = values.id
      ? values.id
      : getNextId(
          "INV",
          current.invoices.map((invoice) => invoice.id),
          1001
        )
    const invoiceNumber =
      values.invoiceNumber.trim().length > 0
        ? values.invoiceNumber.trim()
        : nextInvoiceId
    const timestamp = new Date().toISOString()
    const nextInvoice: LocalInvoiceRecord = {
      id: nextInvoiceId,
      orderId,
      invoiceNumber,
      status: values.status,
      issueDate: values.issueDate,
      dueDate: values.dueDate,
      notes: values.notes.trim(),
      createdAt:
        current.invoices.find((invoice) => invoice.id === nextInvoiceId)?.createdAt ??
        timestamp,
      updatedAt: timestamp,
    }

    return {
      ...current,
      invoices: current.invoices.some((invoice) => invoice.id === nextInvoiceId)
        ? current.invoices.map((invoice) =>
            invoice.id === nextInvoiceId ? nextInvoice : invoice
          )
        : [nextInvoice, ...current.invoices],
      orders: current.orders.map((order) =>
        order.id === orderId
          ? recalculateOrder({
              ...order,
              invoiceStatus: values.status,
            })
          : order
      ),
    }
  })
}

export async function addLocalDocuments(
  orderId: string,
  files: FileList | File[],
  tripId?: string
) {
  const selectedFiles = Array.from(files)

  const documents = await Promise.all(
    selectedFiles.map(
      (file) =>
        new Promise<LocalDocumentRecord>((resolve, reject) => {
          const reader = new FileReader()

          reader.onload = () => {
            resolve({
              id: "",
              orderId,
              tripId,
              name: file.name,
              mimeType: file.type || "application/octet-stream",
              size: file.size,
              uploadedAt: new Date().toISOString(),
              dataUrl: typeof reader.result === "string" ? reader.result : "",
            })
          }
          reader.onerror = () => reject(reader.error)
          reader.readAsDataURL(file)
        })
    )
  )

  return updateRoutrixLocalData((current) => {
    const nextDocumentIds = getNextIds(
      "DOC",
      current.documents.map((item) => item.id),
      documents.length,
      9001
    )
    const nextDocuments = documents.map((document, index) => ({
      ...document,
      id: nextDocumentIds[index],
    }))

    return {
      ...current,
      documents: [...nextDocuments, ...current.documents],
    }
  })
}
