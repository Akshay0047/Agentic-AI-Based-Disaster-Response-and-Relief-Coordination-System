import React, { useCallback, useEffect, useMemo, useState } from "react"
import axios from "axios"
import MaterialSymbol from "./MaterialSymbol"
import { Badge, Card, DataTable, EmptyState, ErrorState, Loading, StatCard } from "./ui"

const loadPct = (s) => (s.capacity ? Math.round((s.current_occupancy / s.capacity) * 1000) / 10 : 0)

const loadBadge = (p) =>
  p >= 90 ? "red" : p >= 70 ? "amber" : "cyan"

export default function SheltersSection() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [medicalOnly, setMedicalOnly] = useState(false)

  const fetchRows = useCallback(async () => {
    try {
      setError("")
      const r = await axios.get("/api/v1/shelters")
      setRows(r.data || [])
    } catch (e) {
      setError("Failed to load shelters. Check that the API service is running.")
      setRows([])
    }
  }, [])

  useEffect(() => { fetchRows() }, [fetchRows])

  const totals = useMemo(() => {
    const list = rows ?? []
    const capacity = list.reduce((a, s) => a + (s.capacity ?? 0), 0)
    const occupied = list.reduce((a, s) => a + (s.current_occupancy ?? 0), 0)
    return {
      capacity,
      occupied,
      available: Math.max(capacity - occupied, 0),
      medical: list.filter((s) => s.has_medical_facility).length,
      count: list.length,
    }
  }, [rows])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (rows ?? []).filter((s) => {
      const p = loadPct(s)
      if (statusFilter === "critical" && p < 90) return false
      if (statusFilter === "amber" && (p >= 90 || p < 70)) return false
      if (statusFilter === "open" && p >= 70) return false
      if (medicalOnly && !s.has_medical_facility) return false
      if (!q) return true
      return [s.name, s.address].filter(Boolean).some((x) => x.toLowerCase().includes(q))
    })
  }, [rows, query, statusFilter, medicalOnly])

  return (
    <div className="flex flex-col gap-xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-lg">
        <div className="flex flex-col gap-2xs">
          <div className="flex items-center gap-xs text-primary font-label text-label-sm uppercase tracking-wider font-semibold">
            <MaterialSymbol name="home_pin" className="text-sm" />
            <span>EOC Tactical Grid — Regional Shelter Mesh</span>
          </div>
          <h1 className="font-headline text-headline-lg text-on-surface tracking-tight">Active Shelter Allocations</h1>
          <p className="font-body text-body-md text-on-surface-variant max-w-2xl">
            Live bed telemetry across all sectors. Automated load-balancing runs via the AI dispatch channel.
          </p>
        </div>
        <button
          onClick={fetchRows}
          className="flex items-center gap-xs px-md py-sm rounded-lg bg-surface-container-highest text-on-surface hover:bg-surface-container-high transition-colors font-label text-label-md shrink-0"
        >
          <MaterialSymbol name="sync" className="text-base" />
          Refresh Telemetry
        </button>
      </div>

      {/* Bento metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        <StatCard label="Total Bed Capacity" value={totals.capacity.toLocaleString()} subvalue="Beds Staged" icon="hotel" iconClass="text-secondary" />
        <StatCard label="Total Occupied" value={totals.occupied.toLocaleString()} subvalue={`${totals.capacity ? Math.round((totals.occupied / totals.capacity) * 100) : 0}% Load`} icon="groups" iconClass="text-error" barPct={totals.capacity ? (totals.occupied / totals.capacity) * 100 : 0} barClass="bg-error" />
        <StatCard label="Available Beds" value={totals.available.toLocaleString()} subvalue="Immediate Slots" icon="bed" iconClass="text-primary" />
        <StatCard label="Medical Facilities" value={`${totals.medical} / ${totals.count}`} subvalue="Equipped Shelters" icon="medical_services" iconClass="text-primary" />
      </section>

      {/* Filter console */}
      <Card className="p-md flex flex-col xl:flex-row items-stretch xl:items-center gap-md">
        <div className="relative flex-1 min-w-[240px]">
          <MaterialSymbol name="search" className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by shelter name or address…"
            className="w-full pl-10 pr-md py-sm rounded-lg bg-surface-container-low text-on-surface placeholder:text-on-surface-variant font-body text-body-md focus:bg-surface-container-lowest outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-sm">
          <div className="flex items-center gap-xs bg-surface-container-low px-md py-sm rounded-lg">
            <MaterialSymbol name="tune" className="text-sm text-on-surface-variant" />
            <label className="font-label text-label-sm text-on-surface-variant uppercase">Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-transparent font-label text-label-md text-on-surface outline-none cursor-pointer">
              <option value="all">All Statuses</option>
              <option value="critical">Critical (&gt;90%)</option>
              <option value="amber">Sub-Critical (70–90%)</option>
              <option value="open">Available (&lt;70%)</option>
            </select>
          </div>
          <button
            onClick={() => setMedicalOnly((v) => !v)}
            className={`flex items-center gap-xs px-md py-sm rounded-lg transition-colors font-label text-label-md ${medicalOnly ? "bg-primary-container text-on-primary" : "bg-surface-container-low text-on-surface hover:bg-surface-container"}`}
          >
            <MaterialSymbol name="emergency" className="text-sm" />
            Medical Only
          </button>
        </div>
      </Card>

      {/* Allocation table */}
      <Card className="overflow-hidden">
        <div className="px-lg py-md bg-surface-container-low flex items-center justify-between">
          <span className="font-headline text-headline-sm text-on-surface">Shelter Allocation Table</span>
          <span className="px-xs py-2xs bg-surface-container-high text-on-surface-variant rounded font-code text-code-sm font-semibold">
            {filtered.length} of {totals.count} shown
          </span>
        </div>
        {rows === null ? (
          <Loading label="Loading shelters…" />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchRows} />
        ) : filtered.length === 0 ? (
          <EmptyState icon="home" title="No shelters match" detail="Adjust filters or register a shelter through the admin API." />
        ) : (
          <DataTable
            columns={[
              { label: "Shelter" },
              { label: "Capacity", align: "right" },
              { label: "Occupied", align: "right" },
              { label: "Available", align: "right" },
              { label: "Load", align: "center" },
              { label: "Medical", align: "center" },
            ]}
          >
            {filtered.map((s) => {
              const p = loadPct(s)
              return (
                <tr key={s.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-md px-md">
                    <div className="font-body text-body-md text-on-surface font-semibold">{s.name}</div>
                    {s.address && <div className="font-label text-label-sm text-on-surface-variant">{s.address}</div>}
                  </td>
                  <td className="py-md px-md text-right font-metric text-metric text-on-surface">{s.capacity}</td>
                  <td className="py-md px-md text-right font-metric text-metric text-on-surface font-semibold">{s.current_occupancy}</td>
                  <td className="py-md px-md text-right font-metric text-metric text-primary font-semibold">{Math.max(s.capacity - s.current_occupancy, 0)}</td>
                  <td className="py-md px-md text-center">
                    <Badge tone={loadBadge(p)}>{p}%</Badge>
                  </td>
                  <td className="py-md px-md text-center">
                    {s.has_medical_facility ? (
                      <MaterialSymbol name="medical_services" fill className="text-primary" />
                    ) : (
                      <span className="text-outline-variant font-body text-body-sm">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </DataTable>
        )}
      </Card>
    </div>
  )
}
