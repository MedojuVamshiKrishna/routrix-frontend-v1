import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Copy,
  Inbox,
  IndianRupee,
  Phone,
  ReceiptText,
  RefreshCw,
  TrendingUp,
  Truck,
  Zap,
  type LucideIcon,
} from "lucide-react"

import type { DashboardIconName, DashboardTone } from "@/components/dashboard/dashboard-types"

export const dashboardIcons: Record<DashboardIconName, LucideIcon> = {
  "alert-triangle": AlertTriangle,
  "arrow-right": ArrowRight,
  "clipboard-list": ClipboardList,
  copy: Copy,
  inbox: Inbox,
  "indian-rupee": IndianRupee,
  phone: Phone,
  "receipt-text": ReceiptText,
  "refresh-cw": RefreshCw,
  "trending-up": TrendingUp,
  truck: Truck,
  zap: Zap,
}

export function toneBadgeVariant(tone: DashboardTone) {
  if (tone === "success") return "success"
  if (tone === "warning") return "warning"
  if (tone === "danger") return "danger"
  return "outline"
}

export function toneCardClasses(tone: DashboardTone) {
  if (tone === "success") return "border-emerald-100 bg-card"
  if (tone === "warning") return "border-amber-100 bg-card"
  if (tone === "danger") return "border-red-100 bg-card"
  return "border-border bg-card"
}

export function toneIconClasses(tone: DashboardTone) {
  if (tone === "success") return "bg-emerald-100 text-emerald-700"
  if (tone === "warning") return "bg-amber-100 text-amber-700"
  if (tone === "danger") return "bg-red-100 text-red-700"
  return "bg-accent/10 text-accent"
}
