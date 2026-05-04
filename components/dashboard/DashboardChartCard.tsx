"use client"

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js"
import { Bar, Doughnut, Line } from "react-chartjs-2"

import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState"
import DashboardInfoHint from "@/components/dashboard/DashboardInfoHint"
import DashboardSectionError from "@/components/dashboard/DashboardSectionError"
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton"
import type { DashboardChartData } from "@/components/dashboard/dashboard-types"
import Badge from "@/components/ui/Badge"
import { cn } from "@/lib/utils"

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
)

interface DashboardChartCardProps {
  chart: DashboardChartData
  isLoading?: boolean
  error?: string
  className?: string
}

function trendVariant(tone: DashboardChartData["trendTone"]) {
  if (tone === "positive") return "success"
  if (tone === "negative") return "danger"
  if (tone === "warning") return "warning"
  return "outline"
}

export default function DashboardChartCard({
  chart,
  isLoading,
  error,
  className,
}: DashboardChartCardProps) {
  const data = {
    labels: chart.labels,
    datasets: chart.datasets,
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          boxWidth: 10,
          usePointStyle: true,
          padding: 18,
        },
      },
      tooltip: {
        backgroundColor: "#0f172a",
        padding: 12,
        titleColor: "#ffffff",
        bodyColor: "#cbd5e1",
        intersect: false,
      },
    },
    scales:
      chart.chartType === "doughnut"
        ? undefined
        : {
            y: {
              beginAtZero: true,
              grid: {
                color: "rgba(148, 163, 184, 0.16)",
              },
              ticks: {
                precision: 0,
                color: "#94a3b8",
              },
            },
            x: {
              grid: {
                display: false,
              },
              ticks: {
                color: "#94a3b8",
              },
            },
          },
  }

  return (
    <article
      className={cn(
        "min-h-[380px] rounded-2xl border border-border bg-card p-4 shadow-sm shadow-slate-900/5",
        className
      )}
    >
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">
                {chart.title}
              </h2>
              <DashboardInfoHint text={chart.description} />
            </div>
          </div>
          <Badge className="self-start" variant={trendVariant(chart.trendTone)}>
            {chart.trendLabel}
          </Badge>
        </div>
      </div>

      {isLoading ? <DashboardSkeleton variant="chart" /> : null}
      {!isLoading && error ? (
        <DashboardSectionError title={chart.errorMessage} description={error} />
      ) : null}
      {!isLoading && !error && chart.datasets.length === 0 ? (
        <DashboardEmptyState
          title={chart.emptyMessage}
          description="This chart will appear after enough register data exists."
        />
      ) : null}
      {!isLoading && !error && chart.datasets.length > 0 ? (
        <div className="space-y-4">
          <div>
            <p className="text-3xl font-bold tracking-normal text-foreground">
              {chart.primaryValue}
            </p>
          </div>
          <div className="h-56 md:h-72" aria-label={chart.summaryText}>
            {chart.chartType === "line" ? (
              <Line data={data} options={options} />
            ) : null}
            {chart.chartType === "bar" ? (
              <Bar data={data} options={options} />
            ) : null}
            {chart.chartType === "doughnut" ? (
              <Doughnut data={data} options={options} />
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  )
}
