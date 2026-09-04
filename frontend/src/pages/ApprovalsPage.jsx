import React, { useEffect, useState } from "react"
import axios from "axios"
import MaterialSymbol from "../components/MaterialSymbol"

function ApprovalsPage() {
  const [approvals, setApprovals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    axios.get("/api/v1/approvals/pending").then(r => setApprovals(r.data)).catch(e => setError("Failed to load approvals")).finally(() => setLoading(false))
  }, [])

  const approve = async (id: string) => {
    try {
      await axios.post(`/api/v1/approvals/${id}/approve`)
      setApprovals(approvals.filter(a => a.id !== id))
    } catch (e) {
      setError("Approval failed")
    }
  }

  const reject = async (id: string) => {
    try {
      await axios.post(`/api/v1/approvals/${id}/reject`)
      setApprovals(approvals.filter(a => a.id !== id))
    } catch (e) {
      setError("Rejection failed")
    }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading approvals…</div>
  if (error) return <div className="p-6 text-error">Error: {error}</div>
  if (approvals.length === 0) return <div className="p-6 text-on-surface-variant">No pending approvals</div>

  return (
    <main className="pt-16 bg-surface min-h-screen w-full px-6 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Approval Queue */}
        <div className="w-full lg:w-3/4 space-y-4">
          <h1 className="font-display text-display text-on-surface tracking-tight">Human Oversight & High-Risk Decision Queue</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Critical actions requiring human authorization before autonomous agent execution. Supervised safety envelope active.</p>

          {/* Critical Protocol Safety Banner */}
          <div className="bg-gradient-to-r from-error-container via-surface-container-low to-surface-container-low rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start md:items-center gap-3 z-10">
              <div className="p-2 rounded-xl bg-error text-on-error flex items-center justify-center shrink-0 shadow-sm">
                <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">shield_locked</MaterialSymbol>
              </div>
              <div>
                <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-error">Restricted Command</p>
                <p className="font-headline-sm text-headline-sm text-on-surface font-semibold">Incident Cmdr</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Supervised safety envelope active</p>
              </div>
            </div>
            <div className="relative flex h-10 w-1.5 rounded-full bg-primary opacity-75 shrink-0"></div>
          </div>

          {/* Approval Items */}
          {approvals.map(app => (
            <div key={app.id} className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 hover:bg-surface-container-high transition-colors">
              <div className="flex flex-col flex-1 min-w-0">
                <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-1">Request ID</p>
                <p className="font-headline-sm text-headline-sm text-on-surface font-medium">{app.id}</p>
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-1">Type</p>
                <p className="font-body-sm text-body-sm text-on-surface">{app.type}</p>
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-1">Initiated</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{app.timestamp}</p>
              </div>
            </div>
          ))}

          {/* No pending approvals */}
        </div>

        {/* Right: Telemetry Badges */}
        <aside className="lg:w-1/4 space-y-4">
          <div className="bg-surface-container-lowest shadow-sm rounded-xl p-4 flex items-center gap-3">
            <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">verified_user</MaterialSymbol>
            <div>
              <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Sign-Off Level</p>
              <p className="font-headline-sm text-headline-sm text-on-surface font-semibold">Incident Cmdr</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest shadow-sm rounded-xl p-4 flex items-center gap-3">
            <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">timer</MaterialSymbol>
            <div>
              <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Auto-Escalation</p>
              <p className="font-metric-num text-metric-num text-on-surface font-semibold leading-none">18m 40s</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest shadow-sm rounded-xl p-4 flex items-center gap-3">
            <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">schedule</MaterialSymbol>
            <div>
              <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Pending Reviews</p>
              <p className="font-metric-num text-metric-num text-on-surface font-semibold leading-none">3</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}

export default ApprovalsPage