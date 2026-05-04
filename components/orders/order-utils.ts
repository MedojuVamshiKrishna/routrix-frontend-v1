import type {
  AssignmentStatus,
  IntakeDraftStatus,
  InvoiceStatus,
  OrderRecord,
  OrderStatus,
  TripStatus,
} from "@/components/orders/order-types"

export function formatCurrency(value: number) {
  return `Rs ${value.toLocaleString("en-IN")}`
}

export function formatShortDateTime(value: string) {
  return value
}

export function getPendingTruckCount(order: OrderRecord) {
  return Math.max(order.truckCount - order.assignedTruckCount, 0)
}

export function getOrderStatusTone(status: OrderStatus | AssignmentStatus) {
  if (status === "Assigned" || status === "Completed" || status === "Settled") {
    return "success"
  }

  if (status === "Needs truck assignment" || status === "Partially assigned") {
    return "warning"
  }

  if (status === "Cancelled") {
    return "danger"
  }

  if (status === "Invoiced") {
    return "info"
  }

  return "outline"
}

export function getTripStatusTone(status: TripStatus) {
  if (status === "Completed" || status === "Return-ready") {
    return "success"
  }

  if (status === "Needs truck") {
    return "warning"
  }

  return "info"
}

export function getInvoiceStatusTone(status: InvoiceStatus) {
  if (status === "Settled") {
    return "success"
  }

  if (status === "Ready for invoice" || status === "Draft invoice") {
    return "warning"
  }

  if (status === "Invoiced") {
    return "info"
  }

  return "outline"
}

export function getIntakeStatusTone(status: IntakeDraftStatus) {
  if (status === "Ready to create order" || status === "Converted") {
    return "success"
  }

  if (status === "Missing fields" || status === "Duplicate suspected") {
    return "warning"
  }

  if (status === "Rejected" || status === "Sync failed") {
    return "danger"
  }

  return "info"
}
