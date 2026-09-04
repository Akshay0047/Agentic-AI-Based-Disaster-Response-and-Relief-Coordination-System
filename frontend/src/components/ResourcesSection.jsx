import React, { useCallback, useEffect, useMemo, useState } from "react"
import axios from "axios"
import MaterialSymbol from "./MaterialSymbol"
import { Card, EmptyState, ErrorState, Loading } from "./ui"

const TYPE_META = {
  food: { icon: "restaurant", color: "text-primary", bar: "bg-primary-container" },
  water: { icon: "water_drop", color: "text-secondary", bar: "bg-secondary" },
  medicine: { icon: "medical_services", color: "text-error", bar: "bg-error" },
  blankets: { icon: "bed", color: "text-primary", bar: "bg-primary-container" },
  rescue_equipment: { icon: "construction", color: "text-secondary", bar: "bg-secondary" },
  medical_team: { icon: "clinical_notes", color: "text-error", bar: "bg-error" },
  transportation: { icon: "local_shipping", color: "text-secondary", bar: "bg-secondary" },
  other: { icon: "inventory_2", color: "text-on-surface-variant", bar: "bg-outline" },
}

/* Low-stock uses the same threshold as the backend agent monitor (< 20 units). */
const LOW_STOCK = 20

export default function ResourcesSection() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState("")
  const [dismissed, setDismissed] = useState(false)

  const fetchRows = useCallback(async () => {
    try {
      setError("")
      const r = await axios.get("/api/v1/resources")
      setRows(r.data || [])
    } catch (e) {
      setError("Failed to load resource inventory. Check that the API service is running.")
      setRows([])
    }
  }, [])

  useEffect(() => { fetchRows() }, [fetchRows])

  const groups = useMemo(() => {
    const byType = new Map()
    for (const r of rows ?? []) {
      const cur = byType.get(r.resource_type) ?? { type: r.resource_type, qty: 0, unit: r.unit, items: 0 }
      cur.qty += r.quantity ?? 0
      cur.items += 1
      byType.set(r.resource_type, cur)
    }
    const list = [...byType.values()]
    const max = Math.max(1, ...list.map((g) => g.qty))
    return list.map((g) => ({ ...g, share: Math.round((g.qty / max) * 100) }))
  }, [rows])

  const lowStock = useMemo(() => (rows ?? []).filter((r) => (r.quantity ?? 0) < LOW_STOCK), [rows])

  return (
    <div className="flex flex-col gap-xl">
      {/* AI logistics advisory (real data, backend-aligned threshold) */}
      {!dismissed && lowStock.length > 0 && (
        <div className="relative overflow-hidden rounded-xl bg-surface-container-low shadow-sm p-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-lg">
          <div className="flex items-start gap-md">
            <div className="p-sm rounded-lg bg-primary-container text-on-primary shrink-0 shadow-sm">
              <MaterialSymbol name="psychology" className="text-xl" />
            </div>
            <div className="flex flex-col gap-2xs">
              <div className="flex items-center gap-sm flex-wrap">
                <span className="font-code text-code-sm uppercase tracking-wider text-primary font-bold">[AGENT LOGISTICS]</span>
                <span className="bg-error-container text-on-error-container font-label text-label-sm px-xs py-2xs rounded-full font-bold flex items-center gap-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
                  Low Stock Alert
                </span>
              </div>
              <p className="font-body text-body-md text-on-surface">
                {lowStock.length} stock item{lowStock.length === 1 ? "" : "s"} below the {LOW_STOCK}-unit safety reserve:{" "}
                {lowStock.slice(0, 4).map((r) => r.resource_type.replaceAll("_", " ")).join(", ")}
                {lowStock.length > 4 ? `, and ${lowStock.length - 4} more` : ""}.
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="px-md py-sm rounded-lg bg-surface-container-lowest text-on-surface font-label text-label-md hover:bg-surface-container-high transition-colors shadow-sm shrink-0"
          >
            Dismiss Advisory
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2xs">
        <span className="font-label text-label-sm uppercase tracking-wider text-primary font-bold">Resource Stock Network</span>
        <h1 className="font-headline text-headline-lg text-on-surface tracking-tight">Inventory &amp; Logistics</h1>
        <p className="font-body text-body-md text-on-surface-variant max-w-2xl">
          Distribution of supplies across shelters. Bars are relative to the largest stock group.
        </p>
      </div>

      {rows === null ? (
        <Loading label="Loading inventory…" />
      ) : error ? (
        <Card><ErrorState message={error} onRetry={fetchRows} /></Card>
      ) : groups.length === 0 ? (
        <Card><EmptyState icon="inventory_2" title="Inventory is empty" detail="Resource stock is added through the admin API." /></Card>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-base">
          {groups.map((g) => {
            const meta = TYPE_META[g.type] ?? TYPE_META.other
            const low = lowStock.some((r) => r.resource_type === g.type)
            return (
              <Card key={g.type} className={`p-lg flex flex-col justify-between gap-md hover:shadow-md transition-shadow ${low ? "ring-1 ring-error/40" : ""}`}>
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-xs">
                      <span className={`font-label text-label-sm uppercase tracking-wider ${low ? "text-error font-bold" : "text-on-surface-variant"}`}>
                        {g.type.replaceAll("_", " ")}
                      </span>
                      {low && <span className="px-xs py-2xs rounded bg-error-container text-on-error-container text-[10px] font-bold uppercase tracking-wider">Low</span>}
                    </div>
                    <span className="font-label text-label-sm text-on-surface-variant">{g.items} stock item{g.items === 1 ? "" : "s"}</span>
                  </div>
                  <MaterialSymbol name={meta.icon} fill={low} className={`text-xl ${low ? "text-error animate-pulse" : meta.color}`} />
                </div>
                <div className="flex items-baseline gap-xs font-metric">
                  <span className={`text-3xl font-bold tracking-tight ${low ? "text-error" : "text-on-surface"}`}>{g.qty.toLocaleString()}</span>
                  <span className="font-body text-body-sm text-on-surface-variant">{g.unit}</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${low ? "bg-error" : meta.bar}`} style={{ width: `${g.share}%` }} />
                </div>
              </Card>
            )
          })}
        </section>
      )}
    </div>
  )
}
