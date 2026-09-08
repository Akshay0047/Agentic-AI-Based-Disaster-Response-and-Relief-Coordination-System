import React, { useCallback, useEffect, useState } from "react"
import axios from "axios"
import MaterialSymbol from "./MaterialSymbol"
import { Card, ErrorState, Loading } from "./ui"

/** Live plan/action history backed directly by GET /agent/activity. */
export default function AgentActivitySection() {
  const [activity, setActivity] = useState(null)
  const [error, setError] = useState("")
  const [lastSync, setLastSync] = useState(null)
  const fetchActivity = useCallback(async () => {
    try {
      setError("")
      const r = await axios.get("/agent/activity")
      setActivity(r.data); setLastSync(new Date())
    } catch { setError("Failed to reach the agent activity endpoint.") }
  }, [])
  useEffect(() => { fetchActivity(); const id = setInterval(fetchActivity, 10000); return () => clearInterval(id) }, [fetchActivity])

  return <div className="flex flex-col gap-xl">
    <Card className="p-lg flex flex-wrap items-center justify-between gap-md">
      <div><span className="font-code text-code-sm uppercase tracking-wider text-primary font-bold">[AUTONOMOUS OPERATIONS]</span>
        <h1 className="font-headline text-headline-lg text-on-surface tracking-tight">Agent Activity Monitor</h1>
        <p className="font-body text-body-md text-on-surface-variant">Real plan history and human-oversight decisions. Updates every 10 seconds.</p></div>
      <span className="font-code text-code-sm text-primary">{lastSync ? `Synced ${lastSync.toLocaleTimeString()}` : "connecting..."}</span>
    </Card>
    {activity === null && !error ? <Loading label="Connecting to agent loop..." /> : error ? <Card><ErrorState message={error} onRetry={fetchActivity} /></Card> : <>
      <section className="grid grid-cols-2 md:grid-cols-4 gap-md">
        {Object.entries(activity.action_counts ?? {}).map(([status, count]) => <Card key={status} className="p-md flex flex-col gap-sm">
          <MaterialSymbol name={status === "pending" ? "pending_actions" : "fact_check"} className="text-lg text-primary" />
          <span className="font-headline text-headline-sm text-on-surface capitalize">{status}</span><p className="font-metric text-metric text-on-surface">{count}</p>
        </Card>)}
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <Card className="p-lg flex flex-col gap-md"><h2 className="font-headline text-headline-sm text-on-surface">Latest Plan Reasoning</h2>
          <div className="rounded-lg bg-surface-container-low p-md font-code text-code-sm text-on-surface-variant whitespace-pre-wrap">{activity.plans?.[0]?.reasoning ?? "No plans yet."}</div>
        </Card>
        <Card className="p-lg flex flex-col gap-md"><h2 className="font-headline text-headline-sm text-on-surface">Replanning Status</h2>
          <p className="font-body text-body-md text-on-surface-variant">{activity.has_superseded_plan ? `${activity.supersessions?.length ?? 0} plan(s) were superseded after a state change.` : "No plans have been superseded."}</p>
        </Card>
      </section>
      <Card className="p-lg flex flex-col gap-md"><h2 className="font-headline text-headline-sm text-on-surface">Recent Plan History</h2>
        {(activity.plans ?? []).length === 0 ? <p className="text-on-surface-variant">No plan history yet.</p> : <ul className="flex flex-col gap-sm">{activity.plans.map(plan => <li key={plan.id} className="rounded-lg bg-surface-container-low p-md">
          <span className="font-code text-code-sm text-primary">{plan.status} · {plan.created_at}</span><p className="font-body text-body-sm text-on-surface-variant mt-xs">{plan.reasoning}</p>
          {plan.superseded_by && <p className="font-code text-code-sm text-error mt-xs">Superseded by {plan.superseded_by}</p>}
        </li>)}</ul>}
      </Card>
    </>}
  </div>
}
