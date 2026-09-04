import React, { useEffect, useState } from "react"
import axios from "axios"

function RequestsSection({ data, onRefresh, formError, formSuccess, onSubmit, role }) {
  const [tableRows, setTableRows] = useState([])
  const [badgeColors, setBadgeColors] = useState({})

  useEffect(() => {
    async function load() {
      try {
        const r = await axios.get("/api/v1/requests")
        setTableRows(r.data || [])
        // set badge colors per severity
        const colors = {};
        (r.data || []).forEach((req) => {
          const sev = req.severity ?? "low"
          colors[req.id] = sev === "critical" ? "red" : sev === "high" ? "orange" : sev === "medium" ? "yellow" : "gray"
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
      {formSuccess && <p style={{ color: "green" }}>{formSuccess}</p>}
      {formError && <p style={{ color: "red" }}>{formError}</p>}
      {role === "citizen" && (
        <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
          <div>
            <label>Emergency Type</label>
            <select name="emergency_type" required>
              <option value="flood">flood</option>
              <option value="earthquake">earthquake</option>
              <option value="cyclone">cyclone</option>
              <option value="fire">fire</option>
              <option value="landslide">landslide</option>
              <option value="medical">medical</option>
              <option value="other">other</option>
            </select>
          </div>
          <div>
            <label>Description</label>
            <textarea name="description" rows="1" required></textarea>
          </div>
          <div>
            <label>Requester Name</label>
            <input name="requester_name" required />
          </div>
          <div>
            <label>Requester Contact</label>
            <input name="requester_contact" placeholder="+91xxxxxxxxxx" />
          </div>
          <div>
            <label>Number of People</label>
            <input type="number" name="number_of_people" value="1" min="1" required />
          </div>
          <button type="submit">Submit Emergency Request</button>
        </form>
      )}
      <h3>Requests ({tableRows.length})</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ padding: "4px 8px", border: "1px solid #ccc" }}>ID</th>
            <th style={{ padding: "4px 8px", border: "1px solid #ccc" }}>Type</th>
            <th style={{ padding: "4px 8px", border: "1px solid #ccc" }}>Severity</th>
            <th style={{ padding: "4px 8px", border: "1px solid #ccc" }}>Status</th>
            <th style={{ padding: "4px 8px", border: "1px solid #ccc" }}>People</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((req) => (
            <tr key={req.id} style={{ borderBottom: "1px solid #fff" }}>
              <td style={{ padding: "4px 8px", border: "1px solid #ccc" }}>{req.id}</td>
              <td style={{ padding: "4px 8px", border: "1px solid #ccc" }}>
                {req.emergency_type}
              </td>
              <td
                style={{
                  padding: "4px 8px",
                  border: "1px solid #ccc",
                  background: badgeColors[req.id] || "transparent",
                  color: badgeColors[req.id] === "red" ? "white" : badgeColors[req.id] === "orange" ? "#fff" : badgeColors[req.id] === "yellow" ? "#fff" : "#222",
                }}>
                {req.severity}
              </td>
              <td style={{ padding: "4px 8px", border: "1px solid #ccc" }}>{req.status}</td>
              <td style={{ padding: "4px 8px", border: "1px solid #ccc" }}>{req.number_of_people}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default RequestsSection