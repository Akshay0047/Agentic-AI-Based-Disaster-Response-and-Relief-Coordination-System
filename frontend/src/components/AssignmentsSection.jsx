import React, { useEffect, useState } from "react"
import axios from "axios"
import MaterialSymbol from "../components/MaterialSymbol"

function AssignmentsSection({ data, onRefresh }) {
  const [tableRows, setTableRows] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const r = await axios.get("/api/v1/assignments")
        setTableRows(r.data || [])
      } catch (e) {
        setTableRows([])
      }
    }
    load()
  }, [])

  return (
    <div>
      <h3 className="text-gray-900 mb-3">Assignments ({tableRows.length})</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.5rem" }}>
        <thead>
          <tr className="bg-gray-50">
            <th style={{ padding: "4px 8px", border: "1px solid #ccc" }}>ID</th>
            <th style={{ padding: "4px 8px", border: "1px solid #ccc" }}>Volunteer</th>
            <th style={{ padding: "4px 8px", border: "1px solid #ccc" }}>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((a) => (
            <tr key={a.id} style={{ borderBottom: "1px solid #e2e8f0", transition: "background 0.15s" }}>
              <td style={{ padding: "4px 8px", border: "1px solid #ccc" }}>{a.id}</td>
              <td style={{ padding: "4px 8px", border: "1px solid #ccc" }}>
                {a.volunteer_id ? "vol-" + a.volunteer_id.slice(0, 4) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AssignmentsSection