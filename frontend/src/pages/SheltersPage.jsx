import React, { useEffect, useState } from "react"
import axios from "axios"
import MaterialSymbol from "../components/MaterialSymbol"

function SheltersPage() {
  const [shelters, setShelters] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get("/api/v1/shelters").then(r => setShelters(r.data)).catch(() => setShelters([])).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading shelters…</div>

  return (
    <main className="pt-16 bg-surface min-h-screen w-full px-6 py-8">
      {/* Top Strategic Status Ribbon & Metrics Display */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-primary font-label-sm uppercase tracking-wider font-semibold">
            <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">home_pin</MaterialSymbol>
            <span>EOC Tactical Grid — Regional Shelter Mesh</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Active Shelter Allocations</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Live bed telemetry across Sector 1‑7. Automated load-balancing active via AI dispatch channel to prevent perimeter saturation.
          </p>
        </div>
      </div>

      {/* Rapid Actions / Registration Trigger */}
      <div className="flex items-center gap-2 mb-4">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-highest text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-label-md" type="button">
          <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">file_download</MaterialSymbol>
          <span>Export Manifest</span>
        </button>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-sm font-label-md text-label-md"
          type="button"
        >
          <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">add_business</MaterialSymbol>
          <span>+ Register Emergency Shelter</span>
        </button>
      </div>

      {/* Telemetry Overview Bento Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-xl bg-surface-container-lowest shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-1.5">
            <span className="font-label-sm text-label-sm uppercase tracking-wider">Total Bed Capacity</span>
            <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">hotel</MaterialSymbol>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-display text-on-surface font-metric-num">3,450</span>
            <span className="font-code-sm text-code-sm text-on-surface-variant font-medium">Beds Staged</span>
          </div>
          <div className="mt-1 flex items-center text-on-surface-variant font-body-sm text-body-sm">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary"></span>
            <span>12 facilities actively reporting telemetry</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-1.5">
            <span className="font-label-sm text-label-sm uppercase tracking-wider">Total Occupied</span>
            <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">groups</MaterialSymbol>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-display text-on-surface font-metric-num">2,890</span>
            <span className="px-1.5 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold">84% Load</span>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-error h-full rounded-full" styleName="width: 83.7%"></div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-1.5">
            <span className="font-label-sm text-label-sm uppercase tracking-wider">Available Beds</span>
            <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">bed</MaterialSymbol>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-display text-primary font-metric-num">560</span>
            <span className="font-code-sm text-code-sm text-on-surface-variant">Immediate Slots</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 font-body-sm text-primary">
            <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">trending_down</MaterialSymbol>
            <span>Net inflow: ~42 evacuees / hour</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-1.5">
            <span className="font-label-sm text-label-sm uppercase tracking-wider">Medical Readiness</span>
            <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">medical_services</MaterialSymbol>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-display text-on-surface font-metric-num">3 / 12</span>
            <span className="font-code-sm text-code-sm text-on-surface-variant font-medium">Equipped Level 2+</span>
          </div>
          <div className="mt-1 flex items-center justify-between font-label-sm text-label-sm">
            <span className="text-on-surface-variant">Critical Surge Capacity:</span>
            <span className="font-semibold text-error">91% Used</span>
          </div>
        </div>
      </div>

      {/* Real-time Filter & Sort Command Console */}
      <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm mb-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[280px]">
          <span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">search</span>
          <input
            className="w-full pl-9 pr-space-md py-2 rounded-lg bg-surface-container-low text-on-surface placeholder:text-on-surface-variant font-body-md text-body-md focus:bg-surface-container-lowest outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            id="shelterSearch"
            placeholder="Search by shelter name, neighborhood, or sector code (e.g. Sector 7B)..."
            type="text"
          />
        </div>

        {/* Filter Switches */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-surface-container-low px-3 py-1.5 rounded-lg">
            <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">tune</MaterialSymbol>
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Status:</label>
            <select className="bg-transparent font-label-md text-label-md text-on-surface outline-none cursor-pointer">
              <option value="all">All Statuses</option>
              <option value="critical">Critical (>90%)</option>
              <option value="amber">Sub-Critical (70-90%)</option>
              <option value="open">Available (<70%)</option>
            </select>
          </div>

          {/* Medical Filter */}
          <div className="flex items-center gap-1 bg-surface-container-low px-3 py-1.5 rounded-lg">
            <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">emergency</MaterialSymbol>
            <select className="bg-transparent font-label-md text-label-md text-on-surface outline-none cursor-pointer">
              <option value="all">All Care Types</option>
              <option value="medical_only">Medical Facilities Only</option>
              <option value="general">General Shelters Only</option>
            </select>
          </div>

          {/* Pet Friendly Toggle */}
          <button
            className="flex items-center gap-1.5 bg-surface-container-low text-on-surface px-3 py-1.5 rounded-lg transition-colors font-label-md text-label-md"
            id="petToggle"
            type="button"
          >
            <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">pets</MaterialSymbol>
            <span>Pet Friendly</span>
          </button>
          <div className="hidden sm:block h-1 w-px bg-surface-container-high mx-1"></div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <select className="bg-surface-container-low px-3 py-1.5 rounded-lg font-label-md text-label-md text-on-surface outline-none cursor-pointer">
            <option value="default">Sort: Default</option>
            <option value="load">Sort by Load</option>
            <option name="name">Sort by Name</option>
          </select>
          <button className="p-1.5 rounded-lg bg-surface-container-high hover:text-on-surface transition-colors">
            <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">settings</MaterialSymbol>
          </button>
        </div>
      </div>

      {/* Shelter Allocation Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-surface-container-low flex items-between">
          <span className="font-headline-sm text-headline-sm text-on-surface">Shelter Allocation Table</span>
          <button className="p-1.5 rounded-lg bg-surface-container-high hover:text-on-surface transition-colors text-primary font-body-md text-body-md">View Details</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider select-none">
                <th className="py-3 px-4 font-semibold">Shelter</th>
                <th className="py-3 px-4 font-semibold text-right">Capacity</th>
                <th className="py-3 px-4 font-semibold text-right">Occupied</th>
                <th className="py-3 px-4 font-semibold text-right">Available</th>
                <th className="py-3 px-4 font-semibold text-center">Load</th>
                <th className="py-3 px-4 font-semibold">Care Type</th>
                <th className="py-3 px-4 font-semibold">Location</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {shelters.map(shelter => (
                <tr key={shelter.id} className="border-y bg-surface-container-lowest hover:bg-surface-container-low transition-colors cursor-pointer">
                  <td className="py-3 px-4 font-body-md text-body-md text-on-surface truncate">{shelter.name}</td>
                  <td className="py-3 px-4 text-right font-metric-num text-metric-num text-on-surface font-semibold">{shelter.capacity}</td>
                  <td className="py-3 px-4 text-right font-metric-num text-metric-num text-on-surface font-semibold">{shelter.occupied}</td>
                  <td className="py-3 px-4 text-right font-metric-num text-metric-num text-on-surface font-semibold">{shelter.available}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={shelter.loadPercentage > 90 ? "inline-flex px-1.5 py-0.5 rounded-full bg-error text-on-error font-label-sm text-label-sm font-semibold" : shelter.loadPercentage > 70 ? "inline-flex px-1.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold" : "inline-flex px-1.5 py-0.5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm font-semibold"}>
                      {shelter.loadPercentage}%
                    </span>
                  </td>
                  <td className="py-3 px-4 font-body-sm text-body-sm text-on-surface-variant">{shelter.careType}</td>
                  <td className="py-3 px-4 font-body-sm text-body-sm text-on-surface-variant truncate">{shelter.location}</td>
                  <td className="py-3 px-4 text-right">
                    <button className="p-1 rounded-lg bg-surface-container-high text-on-surface-variant transition-colors">
                      <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">visibility</MaterialSymbol>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

export default SheltersPage