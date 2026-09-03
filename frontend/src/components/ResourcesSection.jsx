import React, { useEffect, useState } from "react"
import axios from "axios"

function ResourcesSection({ data, onRefresh }) {
  const [tableRows, setTableRows] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const r = await axios.get("/api/v1/resources")
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
      <h3>Resources ({tableRows.length})</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ padding: "4px 8px", border: "1px solid #ccc" }}>ID</th>
            <th style={{ padding: "4px 8px", border: "1px solid #ccc" }}>&nbsp;</th>
            <th style={{ padding: "4px 8px", border: "1px solid #ccc" }}>Type</th>
            <th style={{ padding: "4px 8px", border: "1px solid #ccc" }}>Quantity</th>
            <th style={{ padding: "4px 8px", border: "1px solid #ccc" }}>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((r) => (
            <tr key={r.id} style={{ borderBottom: "1px solid #fff" }}>
              <td style={{ padding: "4px 8px", border: "1px solid #ccc" }}>
                {r.id}
              </td>
              <td style={{ padding: "4px 8px", border: "1px solid #ccc" }}>
                {r.resource_type}
              </td>
              <td style={{ padding: "4px 8px", border: "1px solid #ccc" }}>
                {r.quantity}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ResourcesSection