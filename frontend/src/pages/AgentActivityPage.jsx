import React, { useEffect, useState } from "react"
import axios from "axios"
import MaterialSymbol from "../components/MaterialSymbol"

function AgentActivityPage() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get("/api/v1/agents/status").then(r => setAgents(r.data)).catch(() => setAgents([])).finally(() => setLoading(false))
  }, [])

  const toggleMode = (mode: string) => {
    const buttons = {
      audit: "mode-audit-btn",
      preview: "toggle-preview-empty"
    }
    // Just update visual state; real mode switching handled by backend
    const btns = document.querySelectorAll(`button[id^="mode-"], button[id^="toggle-"]`)
    btns.forEach(b => b.classList.remove("bg-primary-container", "text-on-primary", "bg-surface-container", "text-on-surface"))
    const active = document.getElementById(buttons[mode] || "")
    if (active) active.classList.add("bg-primary-container", "text-on-primary")
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading agent activity…</div>

  return (
    <main className="pt-16 bg-surface min-h-screen w-full px-6 py-8">
      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-6 relative overflow-hidden">
        {/* Top Command & Agent Telemetry Controller */}
        <div className="flex flex-col lg:flex-row items-start gap-4">
          {/* Left: Ticket Selector & Quick Search */}
          <div className="flex flex-col lg:flex-1">
            <div className="relative flex-1 max-w-xl group">
              <div className="bg-surface-container-low px-space-md py-space-sm rounded-lg flex items-center justify-between cursor-pointer hover:bg-surface-container transition-all">
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="flex items-center justify-center w-6 h-6 rounded-md bg-error-container text-on-error-container font-code-sm text-code-sm font-semibold">!</div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-headline-sm text-headline-sm text-on-surface truncate">REQ-1092: St. Jude Elderly Care Ground Inundation</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Critical — Sector 7B Flood Plain — 14 Occupants</span>
                  </div>
                </div>
                <div className="p-1 rounded-md bg-surface-container-high hover:text-on-surface transition-colors">
                  <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">info</MaterialSymbol>
                </div>
              </div>
            </div>

            {/* Quick Mode Toggles */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="flex items-center gap-space-xs px-3 py-1.5 rounded-md text-on-surface-variant hover:text-on-surface font-body-md text-label-md transition-colors"
                id="mode-audit-btn"
                type="button"
                onClick={() => toggleMode("audit")}
              >
                <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">history</MaterialSymbol>
                <span>Audit Replay</span>
              </button>
              <button
                className="flex items-center gap-space-xs px-3 py-1.5 rounded-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-code-sm text-code-sm transition-colors"
                id="toggle-preview-empty"
                title="Toggle Empty State Spec"
                type="button"
                onClick={() => toggleMode("preview")}
              >
                <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">visibility</MaterialSymbol>
                <span>Pending View</span>
              </button>
            </div>
          </div>

          {/* Right: Real-Time Agent Engine State */}
          <div className="flex items-center gap-space-md shrink-0 w-48">
            <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-sm rounded-lg shadow-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface font-bold tracking-tight">AGENT STATE: REAL-TIME MONITORING</span>
                <span className="font-code-sm text-code-sm text-primary font-medium">Loop Sequence #48 — Autonomous Phase</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Metric Ribbons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="bg-surface-container-low/60 rounded-lg p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Active Agents</span>
              <span className="font-metric-num text-metric-num text-on-surface font-bold">12</span>
            </div>
          </div>
          <div className="bg-surface-container-low/60 rounded-lg p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Active Loops</span>
              <span className="font-metric-num text-metric-num text-on-surface font-bold">48</span>
            </div>
          </div>
          <div className="bg-surface-container-low/60 rounded-lg p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Errors This Cycle</span>
              <span className="font-body-sm text-body-sm text-error">3</span>
            </div>
          </div>
          <div className="bg-surface-container-low/60 rounded-lg p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Avg. Response</span>
              <span className="font-metric-num text-metric-num text-on-surface font-bold">2.3s</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default AgentActivityPage