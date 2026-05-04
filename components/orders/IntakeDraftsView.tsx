"use client"

import { RefreshCw } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import OrderConfirmModal from "@/components/orders/OrderConfirmModal"
import OrderFlyout from "@/components/orders/OrderFlyout"
import MultiSelectFilter from "@/components/orders/MultiSelectFilter"
import OrderStatusBadge from "@/components/orders/OrderStatusBadge"
import type {
  IntakeDraft,
  IntakeDraftStatus,
} from "@/components/orders/order-types"
import { getIntakeStatusTone } from "@/components/orders/order-utils"
import { Button } from "@/components/ui/Button"

interface IntakeDraftsViewProps {
  drafts: IntakeDraft[]
}

const statuses: Array<"All" | IntakeDraftStatus> = [
  "All",
  "Needs review",
  "Missing fields",
  "Duplicate suspected",
  "Ready to create order",
  "Converted",
  "Rejected",
  "Sync failed",
]

export default function IntakeDraftsView({ drafts }: IntakeDraftsViewProps) {
  const [statusFilter, setStatusFilter] = useState<IntakeDraftStatus[]>([])
  const [sourceFilter, setSourceFilter] = useState<string[]>([])
  const [query, setQuery] = useState("")
  const [reviewDraft, setReviewDraft] = useState<IntakeDraft | null>(null)
  const [modal, setModal] = useState<{
    title: string
    description: string
    confirmLabel: string
  } | null>(null)

  const sourceOptions = useMemo(
    () => ["All sources", ...Array.from(new Set(drafts.map((draft) => draft.source)))],
    [drafts]
  )

  const filteredDrafts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return drafts.filter((draft) => {
      const route = `${draft.origin} to ${draft.destination}`
      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(draft.status)
      const matchesSource =
        sourceFilter.length === 0 || sourceFilter.includes(draft.source)
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [draft.id, draft.clientText, draft.linkedClient, route, draft.source]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)

      return matchesStatus && matchesSource && matchesQuery
    })
  }, [drafts, query, sourceFilter, statusFilter])

  const counts = {
    needsReview: drafts.filter((draft) => draft.status === "Needs review").length,
    missingFields: drafts.filter((draft) => draft.status === "Missing fields").length,
    duplicateSuspected: drafts.filter(
      (draft) => draft.status === "Duplicate suspected"
    ).length,
    ready: drafts.filter((draft) => draft.status === "Ready to create order").length,
    syncFailed: drafts.filter((draft) => draft.status === "Sync failed").length,
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Source sync status
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Last checked today at 10:40 AM. Google Sheet imported 4 rows. CSV
            has 1 failed row.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              setModal({
                title: "Retry sync",
                description:
                  "This retries external intake sync. Already imported drafts stay usable while failed rows retry.",
                confirmLabel: "Retry sync",
              })
            }
            type="button"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry sync
          </Button>
          <Button asChild variant="accent">
            <Link href="/orders/quick">Add manual quick draft</Link>
          </Button>
        </div>
      </section>

      <section
        aria-label="Intake draft summary"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5"
      >
        <SummaryCard label="Needs review" value={counts.needsReview} />
        <SummaryCard label="Missing fields" value={counts.missingFields} />
        <SummaryCard
          label="Duplicate suspected"
          value={counts.duplicateSuspected}
        />
        <SummaryCard label="Ready to create order" value={counts.ready} />
        <SummaryCard label="Sync failed" value={counts.syncFailed} />
      </section>

      <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem_14rem]">
          <input
            aria-label="Search intake drafts"
            className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search draft, client, source, route"
            value={query}
          />
          <div className="relative">
            <MultiSelectFilter
              allLabel="All statuses"
              label="Statuses"
              onChange={(nextValues) =>
                setStatusFilter(
                  nextValues.filter(
                    (value): value is IntakeDraftStatus => value !== "All"
                  )
                )
              }
              options={statuses.filter((status) => status !== "All")}
              selectedValues={statusFilter}
            />
          </div>
          <div className="relative">
            <MultiSelectFilter
              allLabel="All sources"
              label="Sources"
              onChange={setSourceFilter}
              options={sourceOptions.filter((source) => source !== "All sources")}
              selectedValues={sourceFilter}
            />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {filteredDrafts.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="font-semibold text-foreground">
              No intake drafts match these filters.
            </p>
            <Button
              onClick={() => {
                setStatusFilter([])
                setSourceFilter([])
                setQuery("")
              }}
              type="button"
              variant="outline"
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium" scope="col">
                    Draft
                  </th>
                  <th className="px-4 py-3 font-medium" scope="col">
                    Client
                  </th>
                  <th className="px-4 py-3 font-medium" scope="col">
                    Route
                  </th>
                  <th className="px-4 py-3 font-medium" scope="col">
                    Trucks
                  </th>
                  <th className="px-4 py-3 font-medium" scope="col">
                    Rate/advance
                  </th>
                  <th className="px-4 py-3 font-medium" scope="col">
                    Missing fields
                  </th>
                  <th className="px-4 py-3 font-medium" scope="col">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium" scope="col">
                    Next action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDrafts.map((draft) => (
                  <tr className="border-t border-border" key={draft.id}>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-foreground">{draft.id}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {draft.source} - {draft.receivedAt}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-foreground">
                        {draft.clientText}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Linked: {draft.linkedClient || "Needs client link"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      {draft.origin} to {draft.destination}
                    </td>
                    <td className="px-4 py-4">{draft.truckCount}</td>
                    <td className="px-4 py-4">{draft.rateAndAdvance}</td>
                    <td className="px-4 py-4">
                      {draft.missingFields.length > 0
                        ? draft.missingFields.join(", ")
                        : "None"}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {draft.duplicateRisk}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <OrderStatusBadge
                        label={draft.status}
                        tone={getIntakeStatusTone(draft.status)}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => setReviewDraft(draft)}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          Review
                        </Button>
                        <Button
                          disabled={
                            draft.status === "Converted" ||
                            draft.status === "Rejected" ||
                            draft.status === "Sync failed"
                          }
                          onClick={() =>
                            setModal({
                              title: `Convert ${draft.id} to order`,
                              description:
                                "This creates a confirmed master order and opens Order Detail for truck assignment.",
                              confirmLabel: "Convert to order",
                            })
                          }
                          size="sm"
                          type="button"
                          variant="accent"
                        >
                          Convert to order
                        </Button>
                        <Button
                          disabled={draft.status === "Converted"}
                          onClick={() =>
                            setModal({
                              title: `Reject ${draft.id}`,
                              description:
                                "Rejected drafts stay out of orders, invoices, balances, and profitability.",
                              confirmLabel: "Reject draft",
                            })
                          }
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          Reject
                        </Button>
                        <Button
                          disabled={draft.status === "Converted"}
                          onClick={() =>
                            setModal({
                              title: `Mark ${draft.id} duplicate`,
                              description:
                                "This keeps the draft visible for audit but prevents accidental conversion.",
                              confirmLabel: "Mark duplicate",
                            })
                          }
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          Mark duplicate
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <OrderFlyout
        description="Compare original submitted values with cleaned Routrix fields before conversion."
        isOpen={reviewDraft !== null}
        onClose={() => setReviewDraft(null)}
        title={reviewDraft ? `Review ${reviewDraft.id}` : "Review draft"}
      >
        {reviewDraft ? <DraftReviewContent draft={reviewDraft} /> : null}
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

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </article>
  )
}

function DraftReviewContent({ draft }: { draft: IntakeDraft }) {
  return (
    <div className="grid gap-4">
      <section className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-semibold text-foreground">Original submitted values</h3>
        <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
          {draft.originalValues.map((value) => (
            <li className="rounded-lg bg-background p-3" key={value}>
              {value}
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-semibold text-foreground">Cleaned Routrix fields</h3>
        <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
          {draft.cleanedValues.map((value) => (
            <li className="rounded-lg bg-background p-3" key={value}>
              {value}
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-semibold text-foreground">Review checks</h3>
        <dl className="mt-3 grid gap-3 text-sm">
          <div>
            <dt className="font-medium text-foreground">Client link</dt>
            <dd className="text-muted-foreground">
              {draft.linkedClient || "Needs manual client selection or quick-create."}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Missing fields</dt>
            <dd className="text-muted-foreground">
              {draft.missingFields.length > 0
                ? draft.missingFields.join(", ")
                : "No blocking fields."}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Duplicate comparison</dt>
            <dd className="text-muted-foreground">{draft.duplicateRisk}</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Notes</dt>
            <dd className="text-muted-foreground">{draft.notes}</dd>
          </div>
        </dl>
      </section>
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={draft.status === "Converted" || draft.status === "Rejected"}
          type="button"
          variant="accent"
        >
          Convert to order
        </Button>
        <Button type="button" variant="outline">
          Link or create client
        </Button>
      </div>
    </div>
  )
}
