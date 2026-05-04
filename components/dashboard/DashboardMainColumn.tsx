"use client"

import { useState } from "react"
import { BarChart3, ClipboardList } from "lucide-react"

import DashboardCashSnapshot from "@/components/dashboard/DashboardCashSnapshot"
import DashboardChartCard from "@/components/dashboard/DashboardChartCard"
import MonthlyMoneySummary from "@/components/dashboard/MonthlyMoneySummary"
import TodayOperationsPanel from "@/components/dashboard/TodayOperationsPanel"
import type {
  DashboardChartData,
  MoneyMetric,
  TodayOperationItem,
} from "@/components/dashboard/dashboard-types"
import { cn } from "@/lib/utils"

type DashboardMainTab = "action-board" | "business-review"

interface DashboardMainColumnProps {
  todayOperations: TodayOperationItem[]
  todayOperationsError?: string
  isTodayOperationsLoading?: boolean
  cashSnapshotMetrics: MoneyMetric[]
  cashSnapshotError?: string
  isCashSnapshotLoading?: boolean
  reviewCharts: DashboardChartData[]
  reviewChartsError?: string
  isReviewChartsLoading?: boolean
  monthlyMoneySummaryByMonth: Record<string, MoneyMetric[]>
  availableMonths: string[]
  monthlyMoneySummaryError?: string
  isMonthlyMoneySummaryLoading?: boolean
  profitIncomplete?: boolean
}

const mainTabs: Array<{
  id: DashboardMainTab
  label: string
  helper: string
  icon: typeof ClipboardList
}> = [
  {
    id: "action-board",
    label: "Action Board",
    helper: "Dispatch and money that need action today.",
    icon: ClipboardList,
  },
  {
    id: "business-review",
    label: "Business Review",
    helper: "Open trends and month review only when you need them.",
    icon: BarChart3,
  },
]

export default function DashboardMainColumn({
  todayOperations,
  todayOperationsError,
  isTodayOperationsLoading,
  cashSnapshotMetrics,
  cashSnapshotError,
  isCashSnapshotLoading,
  reviewCharts,
  reviewChartsError,
  isReviewChartsLoading,
  monthlyMoneySummaryByMonth,
  availableMonths,
  monthlyMoneySummaryError,
  isMonthlyMoneySummaryLoading,
  profitIncomplete,
}: DashboardMainColumnProps) {
  const [activeTab, setActiveTab] = useState<DashboardMainTab>("action-board")
  const [selectedReviewMonth, setSelectedReviewMonth] = useState<string>(
    availableMonths[0]
  )
  const selectedMonthlyMoneySummary =
    monthlyMoneySummaryByMonth[selectedReviewMonth] ?? []

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-slate-900/5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">
              Work surface
            </h2>
            <p className="text-sm text-muted-foreground">
              Stay in one mode at a time. Act first, review later.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {mainTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  aria-pressed={isActive}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "border-accent bg-accent/10 text-foreground"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  )}
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
          {mainTabs.find((tab) => tab.id === activeTab)?.helper}
        </div>

        {activeTab === "action-board" ? (
          <div className="flex flex-col gap-4 md:gap-5">
            <DashboardCashSnapshot
              error={cashSnapshotError}
              isLoading={isCashSnapshotLoading}
              metrics={cashSnapshotMetrics}
            />
            <TodayOperationsPanel
              error={todayOperationsError}
              isLoading={isTodayOperationsLoading}
              items={todayOperations}
            />
          </div>
        ) : null}

        {activeTab === "business-review" ? (
          <div className="flex flex-col gap-4 md:gap-5">
            <MonthlyMoneySummary
              availableMonths={availableMonths}
              error={monthlyMoneySummaryError}
              isLoading={isMonthlyMoneySummaryLoading}
              metrics={selectedMonthlyMoneySummary}
              monthLabel={selectedReviewMonth}
              onMonthChange={setSelectedReviewMonth}
              profitIncomplete={profitIncomplete}
              selectedMonth={selectedReviewMonth}
            />
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {reviewCharts.map((chart) => (
                <DashboardChartCard
                  chart={chart}
                  className="min-h-[340px]"
                  error={reviewChartsError}
                  isLoading={isReviewChartsLoading}
                  key={chart.id}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
