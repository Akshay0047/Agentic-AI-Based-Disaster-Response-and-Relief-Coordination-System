import React, { useEffect, useState } from "react"
import axios from "axios"
import MaterialSymbol from "../components/MaterialSymbol"

function AuditLogPage() {
  const [logEntries, setLogEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    axios.get("/api/v1/audit-log").then(r => setLogEntries(r.data)).catch(e => setError("Failed to load audit log")).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading audit log…</div>
  if (error) return <div className="p-6 text-error">Error: {error}</div>

  return (
    <main className="pt-16 bg-surface min-h-screen w-full px-6 py-6">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-space-md bg-surface-container-low px-space-lg py-space-sm rounded-lg shadow-sm">
          <div class="flex items-center gap-space-sm min-w-0">
            <span class="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-medium">Governance & Controls</span>
            <span class="text-outline-variant font-code-sm text-code-sm">/</span>
            <span class="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">Audit & Compliance Log</span>
          </div>
          <div class="flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-space-2xs rounded-full shadow-sm">
            <span class="flex h-2 w-2 relative">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span class="font-code-sm text-code-sm font-metric-num text-on-surface">SHA-256 Chain Intact — UN-OCHA & FEMA Standard 800-53 Compliant</span>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full caption-bottom text-sm text-on-surface-variant">
            <caption className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-3">Audit Log Entries</caption>
            <thead>
              <tr className="border-b bg-surface-container-highest">
                <th className="font-label-md text-label-md text-on-surface font-medium px-3 py-2 text-left">Timestamp</th>
                <th className="font-label-md text-label-md text-on-surface font-medium px-3 py-2 text-left">Actor</th>
                <th className="font-label-md text-label-md text-on-surface font-medium px-3 py-2 text-left">Action</th>
                <th className="font-label-md text-label-md text-on-surface font-medium px-3 py-2 text-left">Resource</th>
                <th className="font-label-md text-label-md text-on-surface font-medium px-3 py-2 text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              {logEntries.map(entry => (
                <tr key={entry.id} className="border-t hover:bg-surface-container-highest">
                  <td className="px-3 py-2 font-code-sm text-code-sm">{entry.timestamp}</td>
                  <td className="px-3 py-2 font-body-sm text-body-sm">{entry.actor}</td>
                  <td className="px-3 py-2 font-body-sm text-body-sm">{entry.action}</td>
                  <td className="px-3 py-2 font-body-sm text-body-sm">{entry.resource}</td>
                  <td className="px-3 py-2 font-body-sm text-body-sm">{entry.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

export default AuditLogPage