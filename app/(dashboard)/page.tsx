import DashboardActionGrid from "@/components/dashboard/DashboardActionGrid"
import DashboardColumnLayout from "@/components/dashboard/DashboardColumnLayout"
import DashboardHeader from "@/components/dashboard/DashboardHeader"
import DashboardMainColumn from "@/components/dashboard/DashboardMainColumn"
import DashboardRightRail from "@/components/dashboard/DashboardRightRail"
import DashboardSectionError from "@/components/dashboard/DashboardSectionError"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import type {
  DashboardActionCardData,
  DashboardChartData,
  DashboardHeaderData,
  DashboardRiskItem,
  DashboardSectionStates,
  MoneyMetric,
  PaymentFollowUpItem,
  ReturnReadyTruck,
  TodayOperationItem,
} from "@/components/dashboard/dashboard-types"

interface DashboardData {
  header: DashboardHeaderData
  actionCards: DashboardActionCardData[]
  todayOperations: TodayOperationItem[]
  risks: DashboardRiskItem[]
  charts: DashboardChartData[]
  moneySummary: MoneyMetric[]
  returnReadyTrucks: ReturnReadyTruck[]
  paymentFollowUps: PaymentFollowUpItem[]
  states: DashboardSectionStates
}

const businessReviewMonths = ["May 2026", "Apr 2026", "Mar 2026"]

const dashboardData: DashboardData = {
  header: {
    businessDateLabel: "Today, 03 May 2026",
    monthLabel: "May 2026",
    lastUpdatedAt: "Updated 10:30 AM",
    intakeDraftCount: 3,
  },
  actionCards: [
    {
      id: "intake-drafts",
      label: "Intake drafts",
      value: "3",
      secondaryValue: "2 missing fields, 1 duplicate",
      helperText: "Quick or external orders waiting for confirmation.",
      statusText: "Duplicate risk",
      tone: "warning",
      icon: "inbox",
      ctaLabel: "Review drafts",
      href: "/orders",
    },
    {
      id: "need-trucks",
      label: "Need trucks",
      value: "5",
      secondaryValue: "11 trucks pending",
      helperText: "Orders saved but trucks are not assigned yet.",
      statusText: "Urgent",
      tone: "danger",
      icon: "clipboard-list",
      ctaLabel: "Assign trucks",
      href: "/orders",
    },
    {
      id: "partially-assigned",
      label: "Partially assigned",
      value: "4",
      secondaryValue: "8 of 15 trucks assigned",
      helperText: "Some trucks are still pending.",
      statusText: "Pending",
      tone: "warning",
      icon: "truck",
      ctaLabel: "Review orders",
      href: "/orders",
    },
    {
      id: "unpaid-invoices",
      label: "Unpaid invoices",
      value: "7",
      secondaryValue: "INR 5,82,000 unpaid",
      helperText: "Invoices with no settlement recorded.",
      statusText: "Follow up",
      tone: "danger",
      icon: "receipt-text",
      ctaLabel: "Follow up",
      href: "/settlements",
    },
    {
      id: "partial-payments",
      label: "Partial payments",
      value: "6",
      secondaryValue: "INR 2,14,500 balance",
      helperText: "Clients paid some amount; balance remains.",
      statusText: "Balance due",
      tone: "warning",
      icon: "indian-rupee",
      ctaLabel: "Track balance",
      href: "/settlements",
    },
    {
      id: "provider-dues",
      label: "Provider dues",
      value: "INR 1,76,000",
      secondaryValue: "5 providers pending",
      helperText: "Pending payments for outsourced trucks.",
      statusText: "Due",
      tone: "warning",
      icon: "indian-rupee",
      ctaLabel: "View dues",
      href: "/balances",
    },
    {
      id: "return-ready",
      label: "Return-ready",
      value: "4",
      secondaryValue: "2 in Visakhapatnam",
      helperText: "Trucks available for reverse-route opportunities.",
      statusText: "Available",
      tone: "success",
      icon: "truck",
      ctaLabel: "View trucks",
      href: "/vehicles",
    },
  ],
  todayOperations: [
    {
      id: "op-deadline-1024",
      type: "deadline",
      timeLabel: "Due now",
      dateLabel: "Today",
      clientName: "Sri Balaji Fruits",
      route: "Hyderabad to Vijayawada",
      orderId: "ORD-1024",
      truckLabel: "3 trucks pending",
      statusLabel: "Deadline risk",
      statusTone: "danger",
      href: "/orders/ORD-1024",
    },
    {
      id: "op-reporting-1027",
      type: "reporting",
      timeLabel: "10:30 AM",
      dateLabel: "Today",
      clientName: "Metro Cold Chain",
      route: "Medchal to Guntur",
      orderId: "ORD-1027",
      truckLabel: "2 trucks reporting",
      statusLabel: "Reporting today",
      statusTone: "warning",
      href: "/orders/ORD-1027",
    },
    {
      id: "op-arrival-1018",
      type: "arrival",
      timeLabel: "1:15 PM",
      dateLabel: "Today",
      clientName: "Kaveri Agro Foods",
      route: "Warangal to Hyderabad",
      orderId: "ORD-1018",
      truckLabel: "TS15UC2297",
      statusLabel: "Arrival today",
      statusTone: "neutral",
      href: "/orders/ORD-1018",
    },
    {
      id: "op-reporting-1031",
      type: "reporting",
      timeLabel: "6:00 PM",
      dateLabel: "Today",
      clientName: "Rama Traders",
      route: "Hyderabad to Kakinada",
      orderId: "ORD-1031",
      truckLabel: "Advance pending",
      statusLabel: "Reporting today",
      statusTone: "warning",
      href: "/orders/ORD-1031",
    },
  ],
  risks: [
    {
      id: "risk-duplicate-intake",
      severity: "urgent",
      category: "Duplicate suspected",
      title: "Two intake drafts look like the same order",
      description: "Same client, route, and reporting date entered twice.",
      recordLabel: "INTAKE-18",
      ctaLabel: "Review drafts",
      href: "/orders",
    },
    {
      id: "risk-missing-trucks",
      severity: "urgent",
      category: "Missing trucks",
      title: "Order needs 4 trucks",
      description: "Client reports at 6 PM today.",
      recordLabel: "ORD-1024",
      amountLabel: "INR 72,000 pending",
      ctaLabel: "Assign trucks",
      href: "/orders/ORD-1024",
    },
    {
      id: "risk-missing-advance",
      severity: "warning",
      category: "Missing advance",
      title: "Advance not received before reporting",
      description: "Rama Traders has two trucks planned this evening.",
      recordLabel: "ORD-1031",
      amountLabel: "INR 35,000 advance pending",
      ctaLabel: "Open order",
      href: "/orders/ORD-1031",
    },
    {
      id: "risk-overdue-invoice",
      severity: "warning",
      category: "Overdue invoice",
      title: "Invoice overdue by 8 days",
      description: "Client has not recorded any settlement.",
      recordLabel: "INV-348",
      amountLabel: "INR 1,18,000 outstanding",
      ctaLabel: "Open invoice",
      href: "/invoices/INV-348",
    },
    {
      id: "risk-provider-due",
      severity: "info",
      category: "Provider due",
      title: "Outsourced truck payment pending",
      description: "Client invoice is collected, but provider payment is open.",
      recordLabel: "BAL-77",
      amountLabel: "INR 42,000 due",
      ctaLabel: "View dues",
      href: "/balances",
    },
  ],
  charts: [
    {
      id: "monthly-revenue",
      title: "Monthly revenue trend",
      description: "Billed, received, and outstanding across recent months.",
      primaryValue: "INR 18.4L billed",
      trendLabel: "Collection +9%",
      trendTone: "positive",
      summaryText: "Collection is improving, but May outstanding is still high.",
      chartType: "line",
      labels: ["Jan", "Feb", "Mar", "Apr", "May"],
      datasets: [
        {
          label: "Billed",
          data: [12, 14, 15, 17, 18.4],
          borderColor: "#8B5DFF",
          backgroundColor: "rgba(139, 93, 255, 0.12)",
          fill: true,
          tension: 0.35,
        },
        {
          label: "Received",
          data: [10, 12, 12.6, 14.8, 15.7],
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          fill: true,
          tension: 0.35,
        },
        {
          label: "Outstanding",
          data: [2, 2.2, 2.4, 2.2, 2.7],
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245, 158, 11, 0.12)",
          fill: true,
          tension: 0.35,
        },
      ],
      emptyMessage: "No revenue trend yet.",
      errorMessage: "Revenue chart could not load.",
    },
    {
      id: "profit-trend",
      title: "Profit trend",
      description: "Internal-only profit after provider dues and expenses.",
      primaryValue: "INR 2.1L profit",
      trendLabel: "Internal only",
      trendTone: "warning",
      summaryText: "Profit is positive, but May expenses are not fully closed.",
      chartType: "line",
      labels: ["Jan", "Feb", "Mar", "Apr", "May"],
      datasets: [
        {
          label: "Internal profit",
          data: [1.2, 1.5, 1.4, 1.9, 2.1],
          borderColor: "#8B5DFF",
          backgroundColor: "rgba(139, 93, 255, 0.12)",
          fill: true,
          tension: 0.35,
        },
      ],
      emptyMessage: "No profit trend yet.",
      errorMessage: "Profit chart could not load.",
    },
    {
      id: "order-volume",
      title: "Order volume",
      description: "Orders created compared with trips assigned.",
      primaryValue: "46 orders",
      trendLabel: "Assignment gap",
      trendTone: "warning",
      summaryText: "Assigned trips are behind created orders this month.",
      chartType: "bar",
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      datasets: [
        {
          label: "Orders created",
          data: [9, 12, 11, 14],
          backgroundColor: "#8B5DFF",
        },
        {
          label: "Trips assigned",
          data: [8, 10, 9, 11],
          backgroundColor: "#2dd4bf",
        },
      ],
      emptyMessage: "No order volume yet.",
      errorMessage: "Order volume chart could not load.",
    },
    {
      id: "money-split",
      title: "Money split",
      description: "Where May money is received, stuck, or owed.",
      primaryValue: "INR 20.8L tracked",
      trendLabel: "Review dues",
      trendTone: "warning",
      summaryText: "Outstanding and provider dues need separate follow-up.",
      chartType: "doughnut",
      labels: ["Received", "Outstanding", "Provider dues", "Expenses"],
      datasets: [
        {
          label: "Money split",
          data: [15.7, 2.7, 1.76, 0.64],
          backgroundColor: ["#10b981", "#f59e0b", "#ef4444", "#94a3b8"],
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
      emptyMessage: "No money split yet.",
      errorMessage: "Money split chart could not load.",
    },
    {
      id: "truck-utilization",
      title: "Truck utilization",
      description: "Own, outsourced, pending, and return-ready trucks.",
      primaryValue: "31 trucks planned",
      trendLabel: "4 return-ready",
      trendTone: "positive",
      summaryText: "Most planned trucks are assigned; return-ready stock can reduce empty returns.",
      chartType: "bar",
      labels: ["Own assigned", "Outsourced", "Pending", "Return-ready"],
      datasets: [
        {
          label: "Trucks",
          data: [14, 17, 11, 4],
          backgroundColor: ["#8B5DFF", "#2dd4bf", "#f59e0b", "#10b981"],
        },
      ],
      emptyMessage: "No truck utilization yet.",
      errorMessage: "Truck utilization chart could not load.",
    },
  ],
  moneySummary: [
    {
      id: "client-billed",
      label: "Client billed",
      value: "INR 18,40,000",
      helperText: "Invoices raised in May.",
      tone: "neutral",
      href: "/invoices",
    },
    {
      id: "advance-received",
      label: "Advance received",
      value: "INR 3,25,000",
      helperText: "Advance collected before dispatch.",
      tone: "success",
      href: "/settlements",
    },
    {
      id: "settlement-received",
      label: "Settlement received",
      value: "INR 12,45,000",
      helperText: "Post-trip settlement received.",
      tone: "success",
      href: "/settlements",
    },
    {
      id: "client-outstanding",
      label: "Client outstanding",
      value: "INR 2,70,000",
      helperText: "Balance still due from clients.",
      tone: "warning",
      href: "/balances",
      badgeText: "Follow up",
    },
    {
      id: "provider-dues-metric",
      label: "Provider dues",
      value: "INR 1,76,000",
      helperText: "Outsourced truck payments pending.",
      tone: "warning",
      href: "/balances",
    },
    {
      id: "internal-expenses",
      label: "Internal expenses",
      value: "INR 64,000",
      helperText: "Office and trip expenses entered.",
      tone: "neutral",
      badgeText: "Internal",
    },
    {
      id: "internal-profit",
      label: "Internal profit",
      value: "INR 2,10,000",
      helperText: "Estimated after pending expenses.",
      tone: "warning",
      badgeText: "Internal only",
    },
  ],
  returnReadyTrucks: [
    {
      id: "truck-ts15uc2297",
      truckNumber: "TS15UC2297",
      currentCity: "Visakhapatnam",
      lastRoute: "Hyderabad to Visakhapatnam",
      suggestedRoute: "Visakhapatnam to Hyderabad",
      ageLabel: "Marked 6 hours ago",
      statusLabel: "Available",
      statusTone: "success",
      href: "/vehicles",
    },
    {
      id: "truck-ts09ab4412",
      truckNumber: "TS09AB4412",
      currentCity: "Visakhapatnam",
      lastRoute: "Warangal to Visakhapatnam",
      suggestedRoute: "Visakhapatnam to Vijayawada",
      ageLabel: "Marked yesterday",
      statusLabel: "Available",
      statusTone: "success",
      href: "/vehicles",
    },
    {
      id: "truck-ap28cd8191",
      truckNumber: "AP28CD8191",
      currentCity: "Kakinada",
      lastRoute: "Hyderabad to Kakinada",
      suggestedRoute: "Kakinada to Hyderabad",
      ageLabel: "Marked 2 days ago",
      statusLabel: "Check status",
      statusTone: "warning",
      href: "/vehicles",
    },
  ],
  paymentFollowUps: [
    {
      id: "follow-up-inv-348",
      clientName: "Sri Balaji Fruits",
      invoiceId: "INV-348",
      monthLabel: "April 2026",
      balanceLabel: "INR 1,18,000",
      lastPaymentLabel: "No payment yet",
      statusLabel: "Unpaid",
      statusTone: "danger",
      message:
        "Sri Balaji Fruits, INV-348 has INR 1,18,000 pending for April 2026. Please confirm settlement date.",
      href: "/invoices/INV-348",
    },
    {
      id: "follow-up-inv-352",
      clientName: "Metro Cold Chain",
      invoiceId: "INV-352",
      monthLabel: "May 2026",
      balanceLabel: "INR 64,500",
      lastPaymentLabel: "INR 35,000 on 01 May",
      statusLabel: "Partially paid",
      statusTone: "warning",
      message:
        "Metro Cold Chain, INV-352 has INR 64,500 balance pending for May 2026. Please share payment update.",
      href: "/invoices/INV-352",
      initialCopyState: "success",
    },
    {
      id: "follow-up-inv-355",
      clientName: "Rama Traders",
      invoiceId: "INV-355",
      monthLabel: "May 2026",
      balanceLabel: "INR 32,000",
      lastPaymentLabel: "INR 18,000 on 30 Apr",
      statusLabel: "Balance due",
      statusTone: "warning",
      message:
        "Rama Traders, INV-355 has INR 32,000 balance pending. Please confirm when we can collect it.",
      href: "/invoices/INV-355",
      initialCopyState: "error",
    },
  ],
  states: {
    isPageLoading: false,
    profitIncomplete: true,
  },
}

const monthlyMoneySummaryByMonth: Record<string, MoneyMetric[]> = {
  "May 2026": dashboardData.moneySummary,
  "Apr 2026": [
    {
      id: "apr-client-billed",
      label: "Client billed",
      value: "INR 16,80,000",
      helperText: "Invoices raised in April.",
      tone: "neutral",
      href: "/invoices",
    },
    {
      id: "apr-advance-received",
      label: "Advance received",
      value: "INR 2,90,000",
      helperText: "Advance collected before dispatch.",
      tone: "success",
      href: "/settlements",
    },
    {
      id: "apr-settlement-received",
      label: "Settlement received",
      value: "INR 11,10,000",
      helperText: "Post-trip settlement received.",
      tone: "success",
      href: "/settlements",
    },
    {
      id: "apr-client-outstanding",
      label: "Client outstanding",
      value: "INR 2,15,000",
      helperText: "Balance still due from clients.",
      tone: "warning",
      href: "/balances",
      badgeText: "Follow up",
    },
    {
      id: "apr-provider-dues",
      label: "Provider dues",
      value: "INR 1,42,000",
      helperText: "Outsourced truck payments pending.",
      tone: "warning",
      href: "/balances",
    },
    {
      id: "apr-internal-expenses",
      label: "Internal expenses",
      value: "INR 58,000",
      helperText: "Office and trip expenses entered.",
      tone: "neutral",
      badgeText: "Internal",
    },
    {
      id: "apr-internal-profit",
      label: "Internal profit",
      value: "INR 1,65,000",
      helperText: "Estimated after pending expenses.",
      tone: "warning",
      badgeText: "Internal only",
    },
  ],
  "Mar 2026": [
    {
      id: "mar-client-billed",
      label: "Client billed",
      value: "INR 14,20,000",
      helperText: "Invoices raised in March.",
      tone: "neutral",
      href: "/invoices",
    },
    {
      id: "mar-advance-received",
      label: "Advance received",
      value: "INR 2,35,000",
      helperText: "Advance collected before dispatch.",
      tone: "success",
      href: "/settlements",
    },
    {
      id: "mar-settlement-received",
      label: "Settlement received",
      value: "INR 9,85,000",
      helperText: "Post-trip settlement received.",
      tone: "success",
      href: "/settlements",
    },
    {
      id: "mar-client-outstanding",
      label: "Client outstanding",
      value: "INR 1,76,000",
      helperText: "Balance still due from clients.",
      tone: "warning",
      href: "/balances",
      badgeText: "Follow up",
    },
    {
      id: "mar-provider-dues",
      label: "Provider dues",
      value: "INR 1,18,000",
      helperText: "Outsourced truck payments pending.",
      tone: "warning",
      href: "/balances",
    },
    {
      id: "mar-internal-expenses",
      label: "Internal expenses",
      value: "INR 52,000",
      helperText: "Office and trip expenses entered.",
      tone: "neutral",
      badgeText: "Internal",
    },
    {
      id: "mar-internal-profit",
      label: "Internal profit",
      value: "INR 1,28,000",
      helperText: "Estimated after pending expenses.",
      tone: "warning",
      badgeText: "Internal only",
    },
  ],
}

const priorityActionCardIds = [
  "need-trucks",
  "unpaid-invoices",
  "intake-drafts",
  "provider-dues",
]

const cashSnapshotMetricIds = [
  "client-outstanding",
  "provider-dues-metric",
  "advance-received",
]
const reviewChartIds = [
  "monthly-revenue",
  "order-volume",
  "truck-utilization",
]

function getChart(chartId: string) {
  const chart = dashboardData.charts.find((item) => item.id === chartId)

  if (!chart) {
    throw new Error(`Missing dashboard chart: ${chartId}`)
  }

  return chart
}

export default function DashboardPage() {
  const { states } = dashboardData
  const priorityActionCards = priorityActionCardIds.flatMap((id) =>
    dashboardData.actionCards.filter((card) => card.id === id)
  )
  const cashSnapshotMetrics = cashSnapshotMetricIds.flatMap((id) =>
    dashboardData.moneySummary.filter((metric) => metric.id === id)
  )
  const reviewCharts = reviewChartIds.map(getChart)

  if (states.pageError) {
    return (
      <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <DashboardHeader data={dashboardData.header} />
        <DashboardSectionError
          title="Dashboard could not load. Your records are not changed."
          description={states.pageError}
        />
        <Button asChild variant="accent" className="w-full sm:w-fit">
          <Link href="/orders/new">New Order</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 p-4 md:gap-6 md:p-6">
      <DashboardHeader data={dashboardData.header} />

      <DashboardActionGrid
        cards={priorityActionCards}
        error={states.actionCardsError}
        isLoading={states.isPageLoading || states.actionCardsLoading}
      />

      <DashboardColumnLayout
        mainColumn={
          <DashboardMainColumn
            availableMonths={businessReviewMonths}
            cashSnapshotError={states.moneySummaryError}
            cashSnapshotMetrics={cashSnapshotMetrics}
            isCashSnapshotLoading={
              states.isPageLoading || states.moneySummaryLoading
            }
            isMonthlyMoneySummaryLoading={
              states.isPageLoading || states.moneySummaryLoading
            }
            isReviewChartsLoading={states.isPageLoading || states.chartsLoading}
            isTodayOperationsLoading={
              states.isPageLoading || states.todayOperationsLoading
            }
            monthlyMoneySummaryByMonth={monthlyMoneySummaryByMonth}
            monthlyMoneySummaryError={states.moneySummaryError}
            profitIncomplete={states.profitIncomplete}
            reviewCharts={reviewCharts}
            reviewChartsError={states.chartsError}
            todayOperations={dashboardData.todayOperations}
            todayOperationsError={states.todayOperationsError}
          />
        }
        rightColumn={
          <DashboardRightRail
            isPaymentFollowUpsLoading={
              states.isPageLoading || states.paymentFollowUpsLoading
            }
            isReturnReadyLoading={
              states.isPageLoading || states.returnReadyLoading
            }
            isRisksLoading={states.isPageLoading || states.risksLoading}
            paymentFollowUps={dashboardData.paymentFollowUps}
            paymentFollowUpsError={states.paymentFollowUpsError}
            returnReadyError={states.returnReadyError}
            returnReadyTrucks={dashboardData.returnReadyTrucks}
            risks={dashboardData.risks}
            risksError={states.risksError}
          />
        }
      />
    </div>
  )
}
