import React, { useCallback, useEffect, useState } from "react"
import axios from "axios"
import MaterialSymbol from "../components/MaterialSymbol"
import { Card, DataTable, EmptyState, ErrorState, Loading } from "../components/ui"

export default function AuditLogPage() {
  const [entries, setEntries] = useState(null)
  const [error, setError] = useState("")

  const fetchRows = useCallback(async () => {
    try {
      setError("")
      const r = await axios.get("/api/v1/audit-log")
      setEntries(r.data || [])
    } catch (e) {
      setEntries(null)
      setError(
        e.response?.status
          ? `Audit log request failed (HTTP ${e.response.status}).`
          : "Cannot reach the audit log. Check that the API service is running."
      )
    }
  }, [])

  useEffect(() => { fetchRows() }, [fetchRows])

  return (
    <div className="flex flex-col gap-xl">
      {/* Breadcrumb / integrity bar */}
      <div className="flex flex-wrap items-center justify-between gap-md bg-surface-container-low px-lg py-sm rounded-lg shadow-sm">
        <div className="flex items-center gap-sm min-w-0">
          <span className="font-label text-label-sm uppercase tracking-wider text-on-surface-variant font-medium">
            Governance &amp; Controls
          </span>
          <span className="text-outline-variant font-code text-code-sm">/</span>
          <span className="font-label text-label-sm uppercase tracking-wider text-primary font-bold">
            Audit &amp; Compliance Log
          </span>
        </div>
        <div className="flex items-center gap-xs bg-surface-container-lowest px-md py-2xs rounded-full shadow-sm">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="font-code text-code-sm text-on-surface">Append-only chain</span>
        </div>
      </div>

      <div className="flex flex-col gap-2xs">
        <h1 className="font-headline text-headline-lg text-on-surface tracking-tight">Audit Log</h1>
        <p className="font-body text-body-md text-on-surface-variant max-w-2xl">
          Immutable record of operator actions and autonomous agent decisions across the incident.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="px-lg py-md bg-surface-container-low flex items-center justify-between">
          <span className="font-headline text-headline-sm text-on-surface">Entries</span>
          <button onClick={fetchRows} className="p-xs rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors" title="Refresh">
            <MaterialSymbol name="sync" className="text-sm" />
          </button>
        </div>
        {entries === null && !error ? (
          <Loading label="Loading audit log…" />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchRows} />
        ) : entries.length === 0 ? (
          <EmptyState
            icon="verified_user"
            title="No audit entries yet"
            detail="Actions taken by operators and the autonomous agent will appear here as they occur."
          />
        ) : (
          <DataTable
            columns={[
              { label: "Timestamp" },
              { label: "Actor" },
              { label: "Action" },
              { label: "Resource" },
              { label: "Details" },
            ]}
          >
            {entries.map((e) => (
              <tr key={e.id} className="hover:bg-surface-container-low transition-colors">
                <td className="py-md px-md font-code text-code-sm text-on-surface">{e.timestamp}</td>
                <td className="py-md px-md font-body text-body-md text-on-surface font-semibold">{e.actor}</td>
                <td className="py-md px-md font-body text-body-md text-on-surface">{e.action}</td>
                <td className="py-md px-md font-body text-body-md text-on-surface-variant">{e.resource}</td>
                <td className="py-md px-md font-body text-body-sm text-on-surface-variant">{e.details}</td>
              </tr>
            ))}
          </DataTable>
        )}
      </Card>
    </div>
  )
}
