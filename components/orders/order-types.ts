export type OrderStatus =
  | "Draft"
  | "Needs truck assignment"
  | "Partially assigned"
  | "Assigned"
  | "Completed"
  | "Invoiced"
  | "Settled"
  | "Cancelled"

export type InvoiceStatus =
  | "Not invoiced"
  | "Ready for invoice"
  | "Draft invoice"
  | "Invoiced"
  | "Settled"

export type AssignmentStatus =
  | "Needs truck assignment"
  | "Partially assigned"
  | "Assigned"

export type TripStatus =
  | "Needs truck"
  | "Assigned"
  | "Arrival planned"
  | "Completed"
  | "Return-ready"

export type TruckType = "Own truck" | "Outsourced truck" | "Unassigned"

export interface OrderTrip {
  id: string
  orderId: string
  truckType: TruckType
  truckNumberOrContact: string
  expectedArrivalAt: string
  expenseStatus: string
  providerDueStatus: string
  returnReadyStatus: string
  tripStatus: TripStatus
}

export interface OrderRecord {
  id: string
  clientName: string
  loadType: string
  origin: string
  destination: string
  truckCount: number
  assignedTruckCount: number
  reportingAt: string
  deliveryDeadline: string
  baseAmount: number
  chargeableExtras: number
  advancePaid: number
  expectedBalance: number
  invoiceStatus: InvoiceStatus
  assignmentStatus: AssignmentStatus
  orderStatus: OrderStatus
  createdAt: string
  source: "Direct" | "Quick Order" | "Google Form" | "CSV"
  trips: OrderTrip[]
  notes?: string
}

export type IntakeDraftStatus =
  | "Needs review"
  | "Missing fields"
  | "Duplicate suspected"
  | "Ready to create order"
  | "Converted"
  | "Rejected"
  | "Sync failed"

export interface IntakeDraft {
  id: string
  source: "Quick Order" | "Google Form" | "Google Sheet" | "CSV"
  receivedAt: string
  clientText: string
  linkedClient: string
  origin: string
  destination: string
  truckCount: number
  rateAndAdvance: string
  missingFields: string[]
  duplicateRisk: string
  status: IntakeDraftStatus
  convertedOrderId?: string
  originalValues: string[]
  cleanedValues: string[]
  notes: string
}
