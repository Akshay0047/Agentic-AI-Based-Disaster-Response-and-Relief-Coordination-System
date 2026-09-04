import React, { useEffect, useState } from "react"
import axios from "axios"
import MaterialSymbol from "../components/MaterialSymbol"

function RequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    axios.get("/api/v1/requests").then(r => setRequests(r.data)).catch(e => setError("Failed to load requests")).finally(() => setLoading(false))
  }, [])

  return (
    <main className="pt-16 bg-surface min-h-screen w-full px-6 py-8">
      {/* Top Operational Banner & Telemetry Bar */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-low p-4 rounded-xl shadow-sm">
        <div className="flex flex-col gap-2">
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Emergency Requests</h1>
          <span className="inline-flex items-center gap-space-xs px-2 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
            142 Active / 8 Critical
          </span>
          <span className="inline-flex items-center gap-space-xs px-2 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-code-sm">
            <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">psychology</MaterialSymbol>
            AI Triage: Active
          </span>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant">Autonomous agent triage and emergency intake pipeline with real-time routing logic.</p>
      </section>

      {/* Quick Stats Sparklines / Summary Counters */}
      <div className="mt-4 flex items-center gap-6 bg-surface-container-lowest px-4 py-3 rounded-lg shadow-sm">
        <div className="flex flex-col">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-code-sm">Median Response</span>
          <span className="font-headline-sm text-headline-sm text-primary font-metric-num">3m 42s</span>
        </div>
        <div className="w-px h-8 bg-surface-container"></div>
        <div className="flex flex-col">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-code-sm">AI Auto-Dispatched</span>
          <span className="font-headline-sm text-headline-sm text-secondary font-metric-num">91.4%</span>
        </div>
        <div className="w-px h-8 bg-surface-container"></div>
        <div className="flex flex-col">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-code-sm">Escalations</span>
          <span className="font-headline-sm text-headline-sm text-error font-metric-num">3</span>
        </div>
      </div>

      {/* Filter & Action Controls Bar */}
      <section className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mt-4">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[260px]">
            <span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-on-surface-variant text-base">search</span>
            <input
              className="w-full pl-10 pr-space-md py-space-sm bg-surface-container-lowest text-on-surface rounded-lg shadow-sm placeholder:text-on-surface-variant text-body-md font-body-md focus:outline-none focus:bg-surface-container-low transition-all"
              id="search-input"
              placeholder="Search by ID, location, keyword, or requester..."
              type="text"
            />
          </div>

          {/* Severity Filter */}
          <div className="relative">
            <select
              className="appearance-none w-full sm:w-auto bg-surface-container-lowest text-on-surface font-body-md text-body-md px-space-md py-space-sm pr-9 rounded-lg shadow-sm focus:outline-none cursor-pointer"
            >
              <option value="all">Severity: All</option>
              <option value="critical">Critical (Red)</option>
              <option value="high">High (Orange)</option>
              <option value="medium">Medium (Amber)</option>
              <option value="low">Low (Gray)</option>
            </select>
            <span className="material-symbols-outlined absolute right-space-sm top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-base">expand_more</span>
          </div>

          {/* Emergency Type Filter */}
          <div className="relative">
            <select
              className="appearance-none w-full sm:w-auto bg-surface-container-lowest text-on-surface font-body-md text-body-md px-space-md py-space-sm pr-9 rounded-lg shadow-sm focus:outline-none cursor-pointer"
            >
              <option value="all">Type: All</option>
              <option value="flood">Flood</option>
              <option value="earthquake">Earthquake</option>
              <option value="cyclone">Cyclone</option>
              <option value="fire">Fire</option>
              <option value="landslide">Landslide</option>
              <option value="medical">Medical</option>
              <option value="other">Other</option>
            </select>
            <span className="material-symbols-outlined absolute right-space-sm top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-base">expand_more</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button className="hidden sm:inline-flex items-center gap-space-xs px-space-md py-space-sm bg-surface-container-high hover:bg-surface-container text-on-surface rounded-lg font-body-md text-body-md font-semibold transition-colors" type="button">
            <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">tune</MaterialSymbol>
            Density: High
          </button>
          <button
            className="bg-error hover:bg-on-error-container text-on-error font-body-md text-body-md font-semibold px-space-lg py-space-sm rounded-lg shadow-md hover:shadow-lg flex items-center justify-center gap-space-xs transition-all active:scale-[0.98]"
            id="open-report-modal"
            type="button"
          >
            <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">emergency</MaterialSymbol>
            + Report Emergency
          </button>
        </div>
      </section>

      {/* Split View Container: Main Grid Table + Side Slide-over Panel */}
      <div className="mt-4 relative grid grid-cols-1 xl:grid-cols-12 gap-space-xl items-start">
        {/* Main Data Table Container (Spans 8 columns when drawer is open, or 12 columns full) */}
        <div className="xl:col-span-7 flex flex-col gap-4">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
            {/* Table Control Subheader */}
            <div className="px-4 py-3 bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm text-on-surface">Queue Feed</span>
                <span className="px-1 py-1.5 bg-surface-container-high text-on-surface-variant rounded font-code-sm text-code-sm font-semibold">6 of 142 shown</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors" title="Export CSV">
                  <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">download</MaterialSymbol>
                </button>
                <button className="p-rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors" title="Refresh Live">
                  <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">sync</MaterialSymbol>
                </button>
              </div>
            </div>

            {/* High-density Data Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider select-none">
                    <th className="py-3 px-4 font-semibold">Request ID</th>
                    <th className="py-3 px-4 font-semibold">Severity</th>
                    <th className="py-3 px-4 font-semibold">Emergency Type</th>
                    <th className="py-3 px-4 font-semibold">Location & Overview</th>
                    <th className="py-3 px-4 font-semibold text-right">Affected</th>
                    <th className="py-3 px-4 font-semibold text-right">Reported</th>
                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req.id} className="hover:bg-surface-container-low transition-colors cursor-pointer">
                      <td className="py-3 px-4 font-code-sm text-code-sm font-bold text-on-surface">
                        {req.id}
                      </td>
                      <td className="py-3 px-4">
                        <span className={req.severity === "critical" ? "inline-flex items-center gap-space-1 px-2 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold" : "inline-flex items-center gap-space-1 px-2 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold"}>
                          <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>{req.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-space-xs text-on-surface">
                          <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName={`font-variation-settings: 'FILL' ${req.type === "flood" ? "1" : req.type === "earthquake" ? "2" : req.type === "cyclone" ? "3" : req.type === "fire" ? "4" : req.type === "landslide" ? "5" : req.type === "medical" ? "6" : "0"}`}>${req.type === "flood" ? "flood" : req.type === "earthquake" ? "landscape" : req.type === "cyclone" ? "golf_course" : req.type === "fire" ? "fire" : req.type === "landslide" ? "terrain" : req.type === "medical" ? "medical_services" : "help"}"></MaterialSymbol>
                          <span className="font-body-md text-body-md font-semibold">{req.type}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-[220px]">
                        <div className="font-body-md text-body-md text-on-surface font-medium truncate">{req.location}</div>
                        <div className="font-label-sm text-label-sm text-on-surface-variant truncate">{refreq.overview || ""}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-metric-num text-metric-num text-on-surface font-semibold">{req.affected}</td>
                      <td className="py-3 px-4 text-right font-code-sm text-code-sm text-on-surface-variant">{req.reported}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={req.status === "assigned" ? "inline-flex px-2 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold" : req.status === "monitoring" ? "inline-flex px-2 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold" : req.status === "completed" ? "inline-flex px-2 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold" : "inline-flex px-2 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold"}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="p-rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors">
                          <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">visibility</MaterialSymbol>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Side Slide-over Panel (collapsible detail view) */}
        <div className="xl:col-span-5 flex flex-col items-center justify-center hidden xl:block">
          {/* Placeholder for slide-over panel content */}
          <div className="w-full max-w-2xl bg-surface-container-lowest rounded-xl p-6 shadow-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Request Details</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Select a request from the table to view detailed information in this panel.</p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default RequestsPage