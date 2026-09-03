import React, { useEffect, useState } from "react"
import axios from "axios"

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
    onRefresh()
  }, [onRefresh])

  return (
    <div>
      <h3>Assignments ({tableRows.length})</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ padding: "4px 8px", border: "1px solid #ccc" }}>ID</th>
            <th style={{ padding: "4px 8px", border: "1px solid #ccc" }}>Volunteer</th>
            <th style={{ padding: "4px 8px", border: "1px solid #ccc" }}>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((a) => (
            <tr key={a.id} style={{ borderBottom: "1px solid #fff" }}>
              <td style={{ padding: "4px 8px", border: "1px solid #ccc" }}>
                {a.id}
              </td>
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