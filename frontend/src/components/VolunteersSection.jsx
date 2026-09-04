import React, { useCallback, useEffect, useMemo, useState } from "react"
import axios from "axios"
import MaterialSymbol from "./MaterialSymbol"
import { Card, EmptyState, ErrorState, Loading, StatCard } from "./ui"

const AVAILABILITY_META = {
  available: { icon: "how_to_reg", color: "text-[#16a34a]", bar: "bg-[#16a34a]", chip: "bg-[#f0fdf4] text-[#16a34a]", dot: "bg-[#16a34a]" },
  busy: { icon: "person_pin_circle", color: "text-[#b45309]", bar: "bg-[#d97706]", chip: "bg-[#fef3c7] text-[#b45309]", dot: "bg-[#d97706]" },
  unavailable: { icon: "bedtime", color: "text-on-surface-variant", bar: "bg-outline", chip: "bg-surface-container-high text-on-surface-variant", dot: "bg-outline" },
}

export default function VolunteersSection() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [onlyAvailable, setOnlyAvailable] = useState(false)

  const fetchRows = useCallback(async () => {
    try {
      setError("")
      const r = await axios.get("/api/v1/volunteers")
      setRows(r.data || [])
    } catch (e) {
      setError("Failed to load volunteers. Check that the API service is running.")
      setRows([])
    }
  }, [])

  useEffect(() => { fetchRows() }, [fetchRows])

  const stats = useMemo(() => {
    const list = rows ?? []
    const byStatus = (s) => list.filter((v) => v.availability_status === s).length
    return {
      total: list.length,
      available: byStatus("available"),
      busy: byStatus("busy"),
      unavailable: byStatus("unavailable"),
    }
  }, [rows])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (rows ?? []).filter((v) => {
      if (onlyAvailable && v.availability_status !== "available") return false
      if (!q) return true
      return [v.id, v.user_id, ...(v.skills ?? []), ...(v.equipment ?? [])]
        .filter(Boolean)
        .some((x) => String(x).toLowerCase().includes(q))
    })
  }, [rows, query, onlyAvailable])

  const pct = (n) => (stats.total ? Math.round((n / stats.total) * 1000) / 10 : 0)

  return (
    <div className="flex flex-col gap-xl">
      {/* Header */}
      <section className="bg-surface-container-lowest rounded-xl p-lg shadow-sm relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md relative z-10">
          <div className="flex flex-col gap-2xs">
            <span className="font-label text-label-sm uppercase tracking-wider text-primary font-bold">Field Roster</span>
            <h1 className="font-headline text-headline-lg text-on-surface tracking-tight">Volunteer Operations</h1>
            <p className="font-body text-body-md text-on-surface-variant max-w-2xl">
              Live availability of registered responders. Dispatch readiness feeds the autonomous assignment planner.
            </p>
          </div>
          <button
            onClick={fetchRows}
            className="flex items-center gap-xs px-md py-sm rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container transition-colors font-label text-label-md self-start"
          >
            <MaterialSymbol name="sync" className="text-sm text-primary" />
            Refresh Roster
          </button>
        </div>
      </section>

      {/* Availability metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-base">
        <StatCard label="Total Registered" value={stats.total} subvalue="Full Roster" icon="badge" iconClass="text-primary" barPct={100} barClass="bg-primary" />
        <StatCard label="Active in Field" value={stats.busy} subvalue={`${pct(stats.busy)}% Assigned`} icon="person_pin_circle" iconClass={AVAILABILITY_META.busy.color} barPct={pct(stats.busy)} barClass={AVAILABILITY_META.busy.bar} />
        <StatCard label="Standby Ready" value={stats.available} subvalue={`${pct(stats.available)}% Immediate`} icon="how_to_reg" iconClass={AVAILABILITY_META.available.color} barPct={pct(stats.available)} barClass={AVAILABILITY_META.available.bar} />
        <StatCard label="Off-Duty / Resting" value={stats.unavailable} subvalue={`${pct(stats.unavailable)}% Rest Cycle`} icon="bedtime" iconClass={AVAILABILITY_META.unavailable.color} barPct={pct(stats.unavailable)} barClass={AVAILABILITY_META.unavailable.bar} />
      </section>

      {/* Filter bar */}
      <Card className="p-base flex flex-col lg:flex-row items-stretch lg:items-center gap-md">
        <div className="relative flex-1">
          <MaterialSymbol name="search" className="absolute left-md top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search volunteer ID, skill, or equipment…"
            className="w-full pl-10 pr-md py-sm rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body text-body-md outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <label className="flex items-center gap-xs cursor-pointer select-none px-sm py-xs rounded-lg bg-primary-fixed/40 text-on-primary-fixed">
          <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} className="w-4 h-4 rounded accent-primary cursor-pointer" />
          <span className="font-label text-label-sm font-semibold">Show only available ({stats.available})</span>
        </label>
      </Card>

      {/* Roster */}
      {rows === null ? (
        <Loading label="Loading volunteers…" />
      ) : error ? (
        <Card><ErrorState message={error} onRetry={fetchRows} /></Card>
      ) : filtered.length === 0 ? (
        <Card><EmptyState icon="group" title="No volunteers found" detail="Try clearing filters, or register responders through the API." /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-lg">
          {filtered.map((v) => {
            const meta = AVAILABILITY_META[v.availability_status] ?? AVAILABILITY_META.unavailable
            return (
              <Card key={v.id} className="hover:shadow-md transition-shadow">
                <div className="p-lg flex flex-col gap-md">
                  <div className="flex items-start justify-between gap-sm">
                    <div className="flex items-center gap-md min-w-0">
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center">
                          <MaterialSymbol name="person" fill />
                        </div>
                        <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${meta.dot} rounded-full ring-2 ring-surface-container-lowest ${v.availability_status === "available" ? "animate-pulse" : ""}`} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h3 className="font-headline text-headline-sm text-on-surface truncate">Responder {String(v.id).slice(0, 6)}</h3>
                        <span className="font-code text-code-sm text-on-surface-variant">ID: {String(v.id).slice(0, 8)}</span>
                      </div>
                    </div>
                    <span className={`shrink-0 px-2.5 py-1 rounded-full ${meta.chip} font-label text-label-sm font-bold flex items-center gap-1.5 uppercase`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                      {v.availability_status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-xs">
                    {(v.skills?.length ? v.skills : ["general"]).map((s) => (
                      <span key={s} className="px-xs py-2xs rounded bg-surface-container-high text-on-surface-variant font-label text-label-sm capitalize">{s}</span>
                    ))}
                    {(v.equipment ?? []).map((eq) => (
                      <span key={eq} className="px-xs py-2xs rounded bg-secondary-fixed text-on-secondary-fixed font-label text-label-sm capitalize">{eq}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-xs border-t border-surface-container-low">
                    <span className="font-label text-label-sm text-on-surface-variant uppercase tracking-wider">Current Workload</span>
                    <span className="font-metric text-metric text-on-surface font-semibold">{v.current_workload ?? 0}</span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
