import React, { useCallback, useEffect, useState } from "react"
import axios from "axios"
import MaterialSymbol from "../components/MaterialSymbol"
import { Badge, Card, EmptyState, ErrorState, Loading } from "../components/ui"

/** Human-oversight queue for high-risk autonomous actions awaiting sign-off. */
export default function ApprovalsPage() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState("")
  const [acting, setActing] = useState("") // id currently being decided

  const fetchRows = useCallback(async () => {
    try {
      setError("")
      const r = await axios.get("/api/v1/approvals/pending")
      setRows(r.data || [])
    } catch (e) {
      setRows(null)
      setError(
        e.response?.status
          ? `Approval queue request failed (HTTP ${e.response.status}).`
          : "Cannot reach the approval queue. Check that the API service is running."
      )
    }
  }, [])

  useEffect(() => { fetchRows() }, [fetchRows])

  const decide = async (id, decision) => {
    setActing(id)
    try {
      await axios.post(`/api/v1/approvals/${id}/${decision}`)
      setRows((list) => (list ?? []).filter((a) => a.id !== id))
    } catch {
      setError(`Failed to ${decision} action ${id}.`)
    } finally {
      setActing("")
    }
  }

  return (
    <div className="flex flex-col gap-xl">
      {/* Header */}
      <div className="flex flex-col gap-2xs">
        <span className="font-label text-label-sm uppercase tracking-wider text-primary font-bold">
          Governance &amp; Controls
        </span>
        <h1 className="font-headline text-headline-lg text-on-surface tracking-tight">
          Human Oversight &amp; High-Risk Decision Queue
        </h1>
        <p className="font-body text-body-md text-on-surface-variant max-w-2xl">
          Critical actions requiring human authorization before autonomous agent execution.
        </p>
      </div>

      {/* Safety banner */}
      <Card className="p-lg flex flex-col sm:flex-row sm:items-center justify-between gap-md border-l-4 border-l-error">
        <div className="flex items-center gap-md">
          <div className="p-sm rounded-lg bg-error text-on-error flex items-center justify-center shrink-0">
            <MaterialSymbol name="shield_locked" fill />
          </div>
          <div className="flex flex-col">
            <span className="font-label text-label-sm uppercase tracking-wider text-error font-bold">Restricted Command</span>
            <span className="font-headline text-headline-sm text-on-surface">Incident Commander sign-off required</span>
            <span className="font-body text-body-sm text-on-surface-variant">Supervised safety envelope active</span>
          </div>
        </div>
        <Badge tone="red" dot pulse>Autonomy Level 2 — Supervised</Badge>
      </Card>

      {/* Queue */}
      <Card className="overflow-hidden">
        <div className="px-lg py-md bg-surface-container-low flex items-center justify-between">
          <span className="font-headline text-headline-sm text-on-surface">Pending Decisions</span>
          <button onClick={fetchRows} className="p-xs rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors" title="Refresh">
            <MaterialSymbol name="sync" className="text-sm" />
          </button>
        </div>
        {rows === null && !error ? (
          <Loading label="Loading approval queue…" />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchRows} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon="verified"
            title="No pending approvals"
            detail="All autonomous actions are currently within the unsupervised risk envelope, or already decided."
          />
        ) : (
          <ul className="divide-y divide-surface-container-low">
            {rows.map((a) => (
              <li key={a.id} className="px-lg py-md flex flex-col md:flex-row md:items-center gap-md hover:bg-surface-container-low transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-sm flex-wrap">
                    <span className="font-code text-code-sm font-bold text-primary">{String(a.id ?? "").slice(0, 8)}</span>
                    <Badge tone="amber">{a.risk ?? "high"} risk</Badge>
                  </div>
                  <p className="font-body text-body-md text-on-surface font-semibold mt-xs truncate">{a.action ?? a.tool_name ?? "Agent action"}</p>
                  <p className="font-body text-body-sm text-on-surface-variant truncate">{a.details ?? a.timestamp ?? ""}</p>
                </div>
                <div className="flex items-center gap-sm shrink-0">
                  <button
                    onClick={() => decide(a.id, "reject")}
                    disabled={acting === a.id}
                    className="px-md py-sm rounded-lg font-label text-label-md font-semibold text-error hover:bg-error-container transition-colors disabled:opacity-60"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => decide(a.id, "approve")}
                    disabled={acting === a.id}
                    className="px-md py-sm rounded-lg bg-primary-container text-on-primary font-label text-label-md font-semibold hover:bg-primary transition-colors disabled:opacity-60"
                  >
                    Approve
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
