import React, { useEffect, useState } from "react"
import axios from "axios"

function VolunteersSection({ data, onRefresh }) {
  const [tableRows, setTableRows] = useState([])
  const [badgeColors, setBadgeColors] = useState({})

  useEffect(() => {
    async function load() {
      try {
        const r = await axios.get("/api/v1/volunteers")
        setTableRows(r.data || [])
        const colors = {}
        (r.data || []).forEach((v) => {
          colors[v.id] = v.availability_status ?? "available"
        })
        setBadgeColors(colors)
      } catch (e) {
        setTableRows([])
      }
    }
    load()
    onRefresh()
  }, [onRefresh])

  return (
    <div>
      <h3>Volunteers ({tableRows.length})</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ padding: "4px 8px", border: "1px solid #ccc" }}>ID</th>
            <th style={{ padding: "4px 8px", border: "1px solid #ccc" }}>Name</th>
            <th style={{ padding: "4px 8px", border: "1px solid #ccc" }}>Availability</th>
            <th style={{ padding: "4px 8px", border: "1px solid #ccc" }}>Workload</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((v) => (
            <tr key={v.id} style={{ borderBottom: "1px solid #fff" }}>
              <td style={{ padding: "4px 8px", border: "1px solid #ccc" }}>
                {v.id}
              </td>
              <td style={{ padding: "4px 8px", border: "1px solid #ccc" }}>
                {v.user_id ? "user-" + v.user_id.slice(0, 4) : "—"}
              </td>
              <td
                style={{
                  padding: "4px 8px",
                  border: "1px solid #ccc",
                  background:
                    v.availability_status === "available"
                      ? "#d4edda"
                      : v.availability_status === "busy"
                        ? "#fff3cd"
                        : "#f8d7da",
                  color:
                    v.availability_status === "available"
                      ? "#155724"
                      : v.availability_status === "busy"
                        ? "#856404"
                        : "#721c1e",
                }}
              >
                {v.availability_status}
              </td>
              <td style={{ padding: "4px 8px", border: "1px solid #ccc" }}>
                {v.current_workload ?? 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default VolunteersSection