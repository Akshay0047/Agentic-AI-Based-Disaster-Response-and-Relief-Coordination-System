import React, { useEffect, useState } from "react"
import axios from "axios"
import MaterialSymbol from "../components/MaterialSymbol"

function ResourcesPage() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get("/api/v1/inventory").then(r => setInventory(r.data)).catch(() => setInventory([])).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading inventory…</div>

  return (
    <main className="pt-16 bg-surface min-h-screen w-full px-6 py-8">
      {/* Autonomous Telemetry & AI Logistics Advisor Banner */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-low shadow-sm p-4 lg:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3 max-w-3xl">
          <div className="p-2 rounded-lg bg-primary-container text-on-primary shrink-0 shadow-sm">
            <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">psychology</MaterialSymbol>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-code-sm text-code-sm uppercase tracking-wider text-primary font-bold">[AGENT LOGISTICS: TIER 2]</span>
            <p className="font-body-md text-body-md text-on-surface">
              Medical inventory is below reserve safety envelope across 3 shelters in Sector 4. Recommended autonomous re-routing: dispatch 40 kits from Central Distribution Base directly to St. Jude Regional.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 justify-end">
          <button className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors shadow-sm" type="button">
            Dismiss Advisory
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-md flex items-center gap-1.5" type="button">
            <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">bolt</MaterialSymbol>
            Authorize Auto-Dispatch
          </button>
        </div>
      </div>

      {/* Operational Stock Metrics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 mt-4">
        {/* Card 1: Food & Rations */}
        <div className="bg-surface-container-lowest rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Stock Group 01</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface mt-1">Food & Rations</h2>
            </div>
            <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">inventory</MaterialSymbol>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1.5 font-metric-num">
              <span className="text-2xl font-bold text-on-surface tracking-tight">14,200</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">Meals</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-label-sm font-label-sm">
              <span className="text-on-surface-variant">Capacity Status</span>
              <span className="font-bold text-primary font-metric-num">82% Adequate</span>
            </div>
          </div>
          <div className="w-full h-2.5 bg-surface-container-highest rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-primary-container rounded-full" styleName="width: 82%"></div>
          </div>
          <div className="flex items-center justify-between font-code-sm text-code-sm text-on-surface-variant pt-1">
            <span>Run-rate: 4.8d</span>
            <span className="flex items-center text-primary"><MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">trending_flat</MaterialSymbol> Stable</span>
          </div>
        </div>

        {/* Card 2: Potable Water */}
        <div className="bg-surface-container-lowest rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Stock Group 02</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface mt-1">Potable Water</h2>
            </div>
            <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">water_drop</MaterialSymbol>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1.5 font-metric-num">
              <span className="text-2xl font-bold text-on-surface tracking-tight">8,400</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">Gallons</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-label-sm font-label-sm">
              <span className="text-on-surface-variant">Capacity Status</span>
              <span className="font-bold text-secondary font-metric-num">61% Moderate</span>
            </div>
          </div>
          <div className="w-full h-2.5 bg-surface-container-highest rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-secondary rounded-full" styleName="width: 61%"></div>
          </div>
          <div className="flex items-center justify-between font-code-sm text-code-sm text-on-surface-variant pt-1">
            <span>Depletion: -320g/h</span>
            <span className="flex items-center text-secondary"><MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">arrow_downward</MaterialSymbol> High burn</span>
          </div>
        </div>

        {/* Card 3: Trauma & Meds (CRITICAL) */}
        <div className="bg-surface-container-lowest rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-error uppercase tracking-wider font-bold">Stock Group 03</span>
              <span className="px-1 py-1.5 rounded bg-error-container text-on-error-container text-[10px] font-bold uppercase tracking-wider">Warning</span>
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface mt-1">Trauma & Meds</h2>
            <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">medical_services</MaterialSymbol>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1.5 font-metric-num">
              <span className="text-2xl font-bold text-error tracking-tight">340</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">Units</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-label-sm font-label-sm">
              <span className="text-error font-semibold">Critical Shortage</span>
              <span className="font-bold text-error font-metric-num">24% Left</span>
            </div>
          </div>
          <div className="w-full h-2.5 bg-error-container rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-error rounded-full" styleName="width: 24%"></div>
          </div>
          <div className="flex items-center justify-between font-code-sm text-code-sm text-error pt-1 font-semibold">
            <span>Depletes in: 6.2h</span>
            <span className="flex items-center text-error"><MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">priority_high</MaterialSymbol> Restock priority</span>
          </div>
        </div>

        {/* Card 4: Blankets & Warmth Gear */}
        <div className="bg-surface-container-lowest rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Stock Group 04</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface mt-1">Blankets & Warmth Gear</h2>
            </div>
            <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">blanket</MaterialSymbol>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1.5 font-metric-num">
              <span className="text-2xl font-bold text-on-surface tracking-tight">2,150</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">Sets</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-label-sm font-label-sm">
              <span className="text-on-surface-variant">Capacity Status</span>
              <span className="font-bold text-on-surface font-metric-num">94% Adequate</span>
            </div>
          </div>
          <div className="w-full h-2.5 bg-surface-container-highest rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-primary-container rounded-full" styleName="width: 94%"></div>
          </div>
          <div className="flex items-center justify-between font-code-sm text-code-sm text-on-surface-variant pt-1">
            <span>Run-rate: 12.1d</span>
            <span className="flex items-center text-primary"><MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">trending_up</MaterialSymbol> Replenishing</span>
          </div>
        </div>

        {/* Card 5: PPE & Sanitation */}
        <div className="bg-surface-container-lowest rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Stock Group 05</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface mt-1">PPE & Sanitation</h2>
            </div>
            <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">shield</MaterialSymbol>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1.5 font-metric-num">
              <span className="text-2xl font-bold text-on-surface tracking-tight">5,800</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">Units</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-label-sm font-label-sm">
              <span className="text-on-surface-variant">Capacity Status</span>
              <span className="font-bold text-secondary font-metric-num">78% Adequate</span>
            </div>
          </div>
          <div className="w-full h-2.5 bg-surface-container-highest rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-secondary rounded-full" styleName="width: 78%"></div>
          </div>
          <div className="flex items-center justify-between font-code-sm text-code-sm text-on-surface-variant pt-1">
            <span>Run-rate: 8.3d</span>
            <span className="flex items-center text-secondary"><MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">trending_flat</MaterialSymbol> Stable</span>
          </div>
        </div>
      </section>
    </main>
  )
}

export default ResourcesPage