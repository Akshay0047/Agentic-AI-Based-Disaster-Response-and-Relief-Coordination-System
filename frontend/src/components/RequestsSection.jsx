import React, { useCallback, useEffect, useMemo, useState } from "react"
import axios from "axios"
import MaterialSymbol from "./MaterialSymbol"
import { Badge, Card, DataTable, EmptyState, ErrorState, Loading } from "./ui"

const TYPE_ICONS = {
  flood: "flood",
  earthquake: "landslide",
  cyclone: "cyclone",
  fire: "local_fire_department",
  landslide: "terrain",
  medical: "medical_services",
  other: "help",
}

const SEVERITY_META = {
  critical: { tone: "red", pulse: true, label: "CRITICAL" },
  high: { tone: "amber", pulse: false, label: "HIGH" },
  medium: { tone: "amber", pulse: false, label: "MEDIUM" },
  low: { tone: "gray", pulse: false, label: "LOW" },
}

const STATUS_META = {
  new: { tone: "red", label: "New" },
  triaged: { tone: "gray", label: "Analyzing" },
  assigned: { tone: "blue", label: "Assigned" },
  in_progress: { tone: "cyan", label: "Monitoring" },
  resolved: { tone: "green", label: "Completed" },
  cancelled: { tone: "gray", label: "Cancelled" },
}

function timeAgo(iso) {
  if (!iso) return "—"
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`
  return `${Math.floor(hrs / 24)}d ago`
}

/** Request form modal (Stitch "+ Report Emergency" action) */
function ReportModal({ open, onClose, onSubmitted }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [type, setType] = useState("flood")

  if (!open) return null

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    const f = e.target
    try {
      await axios.post("/api/v1/requests", {
        emergency_type: f.emergency_type.value,
        description: f.description.value,
        requester_name: f.requester_name.value,
        requester_contact: f.requester_contact.value,
        number_of_people: Number(f.number_of_people.value),
      })
      onSubmitted()
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || "Submit failed")
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls =
    "w-full px-md py-sm rounded-lg bg-surface-container-low text-on-surface font-body text-body-md outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all"

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-md" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-inverse-surface/50 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative w-full max-w-lg p-lg flex flex-col gap-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <div className="p-sm rounded-lg bg-error text-on-error flex items-center justify-center">
              <MaterialSymbol name="emergency" fill />
            </div>
            <h2 className="font-headline text-headline-md text-on-surface">Report Emergency</h2>
          </div>
          <button onClick={onClose} className="p-xs rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors" aria-label="Close">
            <MaterialSymbol name="close" />
          </button>
        </div>
        {error && (
          <div className="flex items-center gap-sm rounded-lg bg-error-container text-on-error-container px-md py-sm font-body text-body-sm">
            <MaterialSymbol name="error" className="text-base" /> {error}
          </div>
        )}
        <form onSubmit={submit} className="flex flex-col gap-md">
          <label className="flex flex-col gap-xs">
            <span className="font-label text-label-md text-on-surface">Emergency Type</span>
            <div className="grid grid-cols-2 gap-sm">
              <select name="emergency_type" value={type} onChange={(e) => setType(e.target.value)} className={inputCls} required>
                {Object.keys(TYPE_ICONS).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <div className="flex items-center gap-sm px-md rounded-lg bg-surface-container-low text-on-surface-variant">
                <MaterialSymbol name={TYPE_ICONS[type]} className="text-lg" />
                <span className="font-label text-label-md">{type}</span>
              </div>
            </div>
          </label>
          <label className="flex flex-col gap-xs">
            <span className="font-label text-label-md text-on-surface">Description</span>
            <textarea name="description" rows={3} required placeholder="What is happening? Who is affected?" className={inputCls} />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <label className="flex flex-col gap-xs">
              <span className="font-label text-label-md text-on-surface">Requester Name</span>
              <input name="requester_name" required className={inputCls} placeholder="Full name" />
            </label>
            <label className="flex flex-col gap-xs">
              <span className="font-label text-label-md text-on-surface">Contact</span>
              <input name="requester_contact" required placeholder="+91 xxxxx xxxxx" className={inputCls} />
            </label>
          </div>
          <label className="flex flex-col gap-xs">
            <span className="font-label text-label-md text-on-surface">Number of People Affected</span>
            <input type="number" name="number_of_people" defaultValue={1} min={1} required className={inputCls} />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="mt-xs px-md py-sm rounded-lg bg-error text-on-error font-label text-label-md font-semibold hover:bg-on-error-container transition-colors disabled:opacity-60 flex items-center justify-center gap-sm"
          >
            {submitting ? "Submitting…" : "Submit Emergency Request"}
          </button>
        </form>
      </Card>
    </div>
  )
}

export default function RequestsSection({ role }) {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [severity, setSeverity] = useState("all")
  const [status, setStatus] = useState("all")
  const [modalOpen, setModalOpen] = useState(false)

  const fetchRows = useCallback(async () => {
    try {
      setError("")
      const r = await axios.get("/api/v1/requests")
      setRows(r.data || [])
    } catch (e) {
      setError("Failed to load requests. Check that the API service is running.")
      setRows([])
    }
  }, [])

  useEffect(() => { fetchRows() }, [fetchRows])

  const stats = useMemo(() => {
    const list = rows ?? []
    return {
      total: list.length,
      critical: list.filter((r) => r.severity === "critical").length,
      assigned: list.filter((r) => r.status === "assigned" || r.status === "in_progress").length,
    }
  }, [rows])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (rows ?? []).filter((r) => {
      if (severity !== "all" && (r.severity ?? "low") !== severity) return false
      if (status !== "all" && r.status !== status) return false
      if (!q) return true
      return [r.id, r.description, r.requester_name, r.emergency_type]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [rows, query, severity, status])

  const selectCls =
    "appearance-none bg-surface-container-lowest text-on-surface font-body text-body-md pl-md pr-9 py-sm rounded-lg shadow-sm focus:outline-none cursor-pointer"

  return (
    <div className="flex flex-col gap-xl">
      {/* Operational banner + telemetry */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-base bg-surface-container-low p-lg rounded-xl shadow-sm">
        <div className="flex flex-col gap-2xs">
          <div className="flex items-center gap-sm flex-wrap">
            <h1 className="font-headline text-headline-lg text-on-surface tracking-tight">Emergency Requests</h1>
            <Badge tone="red" dot pulse>{stats.total} Active / {stats.critical} Critical</Badge>
            <Badge tone="gray"><MaterialSymbol name="psychology" className="text-sm text-primary" /> AI Triage: Active</Badge>
          </div>
          <p className="font-body text-body-md text-on-surface-variant">
            Autonomous agent triage and emergency intake pipeline with real-time routing logic.
          </p>
        </div>
        <div className="flex items-center gap-base self-start md:self-auto">
          <div className="flex flex-col">
            <span className="font-label text-label-sm text-on-surface-variant uppercase">Open</span>
            <span className="font-headline text-headline-sm text-primary font-metric">{stats.total}</span>
          </div>
          <div className="w-px h-8 bg-surface-container" />
          <div className="flex flex-col">
            <span className="font-label text-label-sm text-on-surface-variant uppercase">Assigned</span>
            <span className="font-headline text-headline-sm text-secondary font-metric">{stats.assigned}</span>
          </div>
          <div className="w-px h-8 bg-surface-container" />
          <div className="flex flex-col">
            <span className="font-label text-label-sm text-on-surface-variant uppercase">Critical</span>
            <span className="font-headline text-headline-sm text-error font-metric">{stats.critical}</span>
          </div>
        </div>
      </section>

      {/* Filter & action bar */}
      <section className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-base">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-sm min-w-0">
          <div className="relative flex-1 min-w-[220px]">
            <MaterialSymbol name="search" className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-base pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ID, description, requester…"
              className="w-full pl-10 pr-md py-sm bg-surface-container-lowest text-on-surface rounded-lg shadow-sm placeholder:text-on-surface-variant font-body text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          {[
            { value: severity, set: setSeverity, options: [["all", "Severity: All"], ["critical", "Critical"], ["high", "High"], ["medium", "Medium"], ["low", "Low"]] },
            { value: status, set: setStatus, options: [["all", "Status: All"], ["new", "New"], ["triaged", "Analyzing"], ["assigned", "Assigned"], ["in_progress", "Monitoring"], ["resolved", "Completed"], ["cancelled", "Cancelled"]] },
          ].map((sel, i) => (
            <div key={i} className="relative">
              <select className={selectCls} value={sel.value} onChange={(e) => sel.set(e.target.value)}>
                {sel.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <MaterialSymbol name="expand_more" className="absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-base" />
            </div>
          ))}
        </div>
        <button
          className="bg-error hover:bg-on-error-container text-on-error font-body text-body-md font-semibold px-lg py-sm rounded-lg shadow-md hover:shadow-lg flex items-center justify-center gap-xs transition-all active:scale-[0.98]"
          onClick={() => setModalOpen(true)}
        >
          <MaterialSymbol name="emergency" className="text-lg" />
          Report Emergency
        </button>
      </section>

      {/* Queue table */}
      <Card className="overflow-hidden">
        <div className="px-lg py-md bg-surface-container-low flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <span className="font-headline text-headline-sm text-on-surface">Queue Feed</span>
            <span className="px-xs py-2xs bg-surface-container-high text-on-surface-variant rounded font-code text-code-sm font-semibold">
              {filtered.length} of {stats.total}
            </span>
          </div>
          <button onClick={fetchRows} className="p-xs rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors" title="Refresh">
            <MaterialSymbol name="sync" className="text-sm" />
          </button>
        </div>
        {rows === null ? (
          <Loading label="Loading requests…" />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchRows} />
        ) : filtered.length === 0 ? (
          <EmptyState icon="campaign" title="No matching requests" detail="Adjust the filters, or report a new emergency with the button above." />
        ) : (
          <DataTable
            columns={[
              { label: "Request" },
              { label: "Severity" },
              { label: "Type" },
              { label: "Location & Overview" },
              { label: "Affected", align: "right" },
              { label: "Reported", align: "right" },
              { label: "Status", align: "center" },
            ]}
          >
            {filtered.map((req) => {
              const sev = SEVERITY_META[req.severity ?? "low"] ?? SEVERITY_META.low
              const st = STATUS_META[req.status] ?? STATUS_META.new
              return (
                <tr key={req.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-md px-md font-code text-code-sm font-bold text-primary">
                    <div className="flex items-center gap-xs">
                      <span className={`w-1.5 h-1.5 rounded-full ${req.status === "new" ? "bg-error animate-pulse" : "bg-primary"}`} />
                      {String(req.id).slice(0, 8)}
                    </div>
                  </td>
                  <td className="py-md px-md"><Badge tone={sev.tone} dot pulse={sev.pulse}>{sev.label}</Badge></td>
                  <td className="py-md px-md">
                    <div className="flex items-center gap-xs text-on-surface">
                      <MaterialSymbol name={TYPE_ICONS[req.emergency_type] ?? "help"} className="text-base text-primary" />
                      <span className="font-body text-body-md font-semibold capitalize">{req.emergency_type}</span>
                    </div>
                  </td>
                  <td className="py-md px-md max-w-[260px]">
                    <div className="font-body text-body-md text-on-surface font-semibold truncate">{req.description}</div>
                    <div className="font-label text-label-sm text-on-surface-variant truncate">{req.requester_name} · {req.requester_contact}</div>
                  </td>
                  <td className="py-md px-md text-right font-metric text-metric text-on-surface font-semibold">{req.number_of_people}</td>
                  <td className="py-md px-md text-right font-code text-code-sm text-on-surface-variant">{timeAgo(req.created_at)}</td>
                  <td className="py-md px-md text-center"><Badge tone={st.tone}>{st.label}</Badge></td>
                </tr>
              )
            })}
          </DataTable>
        )}
      </Card>

      <ReportModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmitted={fetchRows} />
    </div>
  )
}
