import React, { useCallback, useEffect, useState } from "react"
import axios from "axios"
import MaterialSymbol from "./MaterialSymbol"
import { Card, ErrorState, Loading } from "./ui"

const STAGES = [
  { key: "observing", label: "Observe", icon: "search" },
  { key: "analyzing", label: "Analyze", icon: "diagnosis" },
  { key: "planning", label: "Plan", icon: "route" },
  { key: "acting", label: "Act", icon: "bolt" },
  { key: "monitoring", label: "Monitor", icon: "monitoring" },
  { key: "replanning", label: "Replan", icon: "restart_alt" },
]

/** Live view of the autonomous OAP→AMO loop, fed by GET /agent/activity. */
export default function AgentActivitySection() {
  const [activity, setActivity] = useState(null)
  const [error, setError] = useState("")
  const [lastSync, setLastSync] = useState(null)

  const fetchActivity = useCallback(async () => {
    try {
      setError("")
      // NOTE: this route lives at /agent/activity (outside the /api/v1 prefix)
      const r = await axios.get("/agent/activity")
      setActivity(r.data)
      setLastSync(new Date())
    } catch (e) {
      setError("Failed to reach the agent activity endpoint.")
    }
  }, [])

  useEffect(() => {
    fetchActivity()
    const id = setInterval(fetchActivity, 10000)
    return () => clearInterval(id)
  }, [fetchActivity])

  return (
    <div className="flex flex-col gap-xl">
      {/* Command banner */}
      <Card className="p-lg relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-md relative">
          <div className="flex flex-col gap-2xs">
            <span className="font-code text-code-sm uppercase tracking-wider text-primary font-bold">[AUTONOMOUS OPERATIONS]</span>
            <h1 className="font-headline text-headline-lg text-on-surface tracking-tight">Agent Activity Monitor</h1>
            <p className="font-body text-body-md text-on-surface-variant max-w-2xl">
              Real-time state of the triage → plan → dispatch loop. Updates every 10 seconds.
            </p>
          </div>
          <div className="flex items-center gap-sm bg-surface-container-low px-md py-sm rounded-lg shadow-sm shrink-0">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
            </span>
            <div className="flex flex-col">
              <span className="font-label text-label-md text-on-surface font-bold tracking-tight">AGENT STATE: REAL-TIME MONITORING</span>
              <span className="font-code text-code-sm text-primary font-medium">
                {lastSync ? `Synced ${lastSync.toLocaleTimeString()}` : "connecting…"}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {activity === null && !error ? (
        <Loading label="Connecting to agent loop…" />
      ) : error ? (
        <Card><ErrorState message={error} onRetry={fetchActivity} /></Card>
      ) : (
        <>
          {/* Pipeline stages */}
          <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-md">
            {STAGES.map((s, i) => (
              <Card key={s.key} className="p-md flex flex-col gap-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <MaterialSymbol name={s.icon} className="text-lg text-primary" />
                  <span className="font-code text-code-sm text-on-surface-variant">0{i + 1}</span>
                </div>
                <span className="font-headline text-headline-sm text-on-surface">{s.label}</span>
                <p className="font-body text-body-sm text-on-surface-variant">{activity[s.key] ?? "…"}</p>
              </Card>
            ))}
          </section>

          {/* Last plan / tool */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            <Card className="p-lg flex flex-col gap-md">
              <div className="flex items-center gap-sm">
                <MaterialSymbol name="neurology" className="text-primary" />
                <h2 className="font-headline text-headline-sm text-on-surface">Latest Plan Reasoning</h2>
              </div>
              <div className="rounded-lg bg-surface-container-low p-md font-code text-code-sm text-on-surface-variant whitespace-pre-wrap max-h-64 overflow-y-auto">
                {activity.lastPlanReasoning ?? "no plans yet"}
              </div>
            </Card>
            <Card className="p-lg flex flex-col gap-md">
              <div className="flex items-center gap-sm">
                <MaterialSymbol name="settings_suggest" className="text-secondary" />
                <h2 className="font-headline text-headline-sm text-on-surface">Execution Context</h2>
              </div>
              <dl className="flex flex-col gap-sm">
                <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-md py-sm">
                  <dt className="font-label text-label-md text-on-surface-variant uppercase tracking-wider">Last Tool</dt>
                  <dd className="font-metric text-metric text-on-surface font-semibold">{activity.lastTool ?? "none"}</dd>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-md py-sm">
                  <dt className="font-label text-label-md text-on-surface-variant uppercase tracking-wider">Resource Warning</dt>
                  <dd className={`font-label text-label-md font-semibold flex items-center gap-xs ${activity.resourceWarning ? "text-error" : "text-[#16a34a]"}`}>
                    <MaterialSymbol name={activity.resourceWarning ? "warning" : "check_circle"} className="text-base" />
                    {activity.resourceWarning ? "Low stock detected" : "All clear"}
                  </dd>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-md py-sm">
                  <dt className="font-label text-label-md text-on-surface-variant uppercase tracking-wider">Poll Interval</dt>
                  <dd className="font-metric text-metric text-on-surface font-semibold">10s</dd>
                </div>
              </dl>
            </Card>
          </section>
        </>
      )}
    </div>
  )
}
