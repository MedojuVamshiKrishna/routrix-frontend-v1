export type DashboardTone = "neutral" | "success" | "warning" | "danger"

export type DashboardIconName =
  | "alert-triangle"
  | "arrow-right"
  | "clipboard-list"
  | "copy"
  | "inbox"
  | "indian-rupee"
  | "phone"
  | "receipt-text"
  | "refresh-cw"
  | "trending-up"
  | "truck"
  | "zap"

export interface DashboardHeaderData {
  businessDateLabel: string
  monthLabel: string
  lastUpdatedAt: string
  intakeDraftCount: number
}

export interface DashboardActionCardData {
  id: string
  label: string
  value: string
  secondaryValue: string
  helperText: string
  statusText?: string
  tone: DashboardTone
  icon: DashboardIconName
  ctaLabel: string
  href: string
}

export interface TodayOperationItem {
  id: string
  type: "reporting" | "arrival" | "deadline"
  timeLabel: string
  dateLabel: string
  clientName: string
  route: string
  orderId: string
  truckLabel: string
  statusLabel: string
  statusTone: DashboardTone
  href: string
}

export interface DashboardRiskItem {
  id: string
  severity: "urgent" | "warning" | "info"
  category: string
  title: string
  description: string
  recordLabel: string
  amountLabel?: string
  ctaLabel: string
  href: string
}

export interface DashboardChartDataset {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string
  borderWidth?: number
  fill?: boolean
  tension?: number
}

export interface DashboardChartData {
  id: string
  title: string
  description: string
  primaryValue: string
  trendLabel: string
  trendTone: "positive" | "negative" | "neutral" | "warning"
  summaryText: string
  chartType: "line" | "bar" | "doughnut"
  labels: string[]
  datasets: DashboardChartDataset[]
  emptyMessage: string
  errorMessage: string
}

export interface MoneyMetric {
  id: string
  label: string
  value: string
  helperText: string
  tone: DashboardTone
  href?: string
  badgeText?: string
}

export interface ReturnReadyTruck {
  id: string
  truckNumber: string
  currentCity: string
  lastRoute: string
  suggestedRoute: string
  ageLabel: string
  statusLabel: string
  statusTone: DashboardTone
  href: string
}

export interface PaymentFollowUpItem {
  id: string
  clientName: string
  invoiceId: string
  monthLabel: string
  balanceLabel: string
  lastPaymentLabel: string
  statusLabel: string
  statusTone: DashboardTone
  message: string
  href: string
  initialCopyState?: "idle" | "success" | "error"
}

export interface DashboardSectionStates {
  isPageLoading: boolean
  pageError?: string
  actionCardsLoading?: boolean
  actionCardsError?: string
  todayOperationsLoading?: boolean
  todayOperationsError?: string
  risksLoading?: boolean
  risksError?: string
  chartsLoading?: boolean
  chartsError?: string
  moneySummaryLoading?: boolean
  moneySummaryError?: string
  profitIncomplete?: boolean
  returnReadyLoading?: boolean
  returnReadyError?: string
  paymentFollowUpsLoading?: boolean
  paymentFollowUpsError?: string
}
