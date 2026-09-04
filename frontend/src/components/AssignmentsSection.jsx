import React, { useCallback, useEffect, useMemo, useState } from "react"
import axios from "axios"
import MaterialSymbol from "./MaterialSymbol"
import { Badge, Card, DataTable, EmptyState, ErrorState, Loading, StatCard } from "./ui"

const STATUS_META = {
  pending: { tone: "amber", label: "Pending" },
  accepted: { tone: "blue", label: "Accepted" },
  declined: { tone: "red", label: "Declined" },
  in_progress: { tone: "cyan", label: "In Progress" },
  completed: { tone: "green", label: "Completed" },
  cancelled: { tone: "gray", label: "Cancelled" },
}

function timeAgo(iso) {
  if (!iso) return "—"
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  return hrs < 24 ? `${hrs}h ago` : `${Math.floor(hrs / 24)}d ago`
}

export default function AssignmentsSection() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState("")

  const fetchRows = useCallback(async () => {
    try {
      setError("")
      const r = await axios.get("/api/v1/assignments")
      setRows(r.data || [])
    } catch (e) {
      setError("Failed to load assignments. Check that the API service is running.")
      setRows([])
    }
  }, [])

  useEffect(() => { fetchRows() }, [fetchRows])

  const stats = useMemo(() => {
    const list = rows ?? []
    const by = (s) => list.filter((a) => a.status === s).length
    return { total: list.length, inProgress: by("in_progress"), pending: by("pending"), completed: by("completed") }
  }, [rows])

  return (
    <div className="flex flex-col gap-xl">
      <div className="flex flex-col gap-2xs">
        <span className="font-label text-label-sm uppercase tracking-wider text-primary font-bold">Dispatch Ledger</span>
        <h1 className="font-headline text-headline-lg text-on-surface tracking-tight">Active Assignments</h1>
        <p className="font-body text-body-md text-on-surface-variant max-w-2xl">
          Every responder-to-request allocation issued by the autonomous planner.
        </p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-base">
        <StatCard label="Total Assignments" value={stats.total} icon="assignment" iconClass="text-primary" />
        <StatCard label="In Progress" value={stats.inProgress} icon="pending_actions" iconClass="text-secondary" />
        <StatCard label="Awaiting Acceptance" value={stats.pending} icon="hourglass_top" iconClass="text-[#b45309]" />
        <StatCard label="Completed" value={stats.completed} icon="task_alt" iconClass="text-[#16a34a]" />
      </section>

      <Card className="overflow-hidden">
        <div className="px-lg py-md bg-surface-container-low flex items-center justify-between">
          <span className="font-headline text-headline-sm text-on-surface">Assignment Ledger</span>
          <button onClick={fetchRows} className="p-xs rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors" title="Refresh">
            <MaterialSymbol name="sync" className="text-sm" />
          </button>
        </div>
        {rows === null ? (
          <Loading label="Loading assignments…" />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchRows} />
        ) : rows.length === 0 ? (
          <EmptyState icon="assignment" title="No assignments yet" detail="Assignments appear here as the agent planner dispatches responders." />
        ) : (
          <DataTable
            columns={[
              { label: "Assignment" },
              { label: "Request" },
              { label: "Volunteer" },
              { label: "Shelter" },
              { label: "Status", align: "center" },
              { label: "Created", align: "right" },
              { label: "Completed", align: "right" },
            ]}
          >
            {rows.map((a) => {
              const st = STATUS_META[a.status] ?? STATUS_META.pending
              return (
                <tr key={a.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-md px-md font-code text-code-sm font-bold text-primary">{String(a.id).slice(0, 8)}</td>
                  <td className="py-md px-md font-code text-code-sm text-on-surface">{String(a.request_id).slice(0, 8)}</td>
                  <td className="py-md px-md font-code text-code-sm text-on-surface-variant">{a.volunteer_id ? String(a.volunteer_id).slice(0, 8) : "—"}</td>
                  <td className="py-md px-md font-code text-code-sm text-on-surface-variant">{a.shelter_id ? String(a.shelter_id).slice(0, 8) : "—"}</td>
                  <td className="py-md px-md text-center"><Badge tone={st.tone}>{st.label}</Badge></td>
                  <td className="py-md px-md text-right font-code text-code-sm text-on-surface-variant">{timeAgo(a.created_at)}</td>
                  <td className="py-md px-md text-right font-code text-code-sm text-on-surface-variant">{a.completed_at ? timeAgo(a.completed_at) : "—"}</td>
                </tr>
              )
            })}
          </DataTable>
        )}
      </Card>
    </div>
  )
}
