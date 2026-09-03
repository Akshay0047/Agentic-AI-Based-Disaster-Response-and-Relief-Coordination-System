import React, { useEffect, useState } from "react"
import axios from "axios"

function SheltersSection({ data, onRefresh }) {
  const [tableRows, setTableRows] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const r = await axios.get("/api/v1/shelters")
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
      <h3>Shelters ({tableRows.length})</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ padding: "4px 8px", border: "1px solid #ccc" }}>ID</th>
            <th style={{ padding: "4px 8px", border: "1px solid #ccc" }}>Name</th>
            <th style={{ padding: "4px 8px", border: "1px solid #ccc" }}>Capacity</th>
            <th style={{ padding: "4px 8px", border: "1px solid #ccc" }}>Occupancy</th>
            <th style={{ padding: "4px 8px", border: "1px solid #ccc" }}>Medical</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((s) => (
            <tr key={s.id} style={{ borderBottom: "1px solid #fff" }}>
              <td style={{ padding: "4px 8px", border: "1px solid #ccc" }}>
                {s.id}
              </td>
              <td style={{ padding: "4px 8px", border: "1px solid #ccc" }}>
                {s.name}
              </td>
              <td style={{ padding: "4px 8px", border: "1px solid #ccc" }}>
                {s.capacity}
              </td>
              <td style={{ padding: "4px 8px", border: "1px solid #ccc" }}>
                {s.current_occupancy}
              </td>
              <td style={{ padding: "4px 8px", border: "1px solid #ccc" }}>
                {s.has_medical_facility ? "Yes" : "No"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Capacity bar example: {(tableRows[0]?.current_occupancy ?? 0) /
          (tableRows[0]?.capacity ?? 1) *
        100}% occupied
      </p>
    </div>
  )
}

export default SheltersSection