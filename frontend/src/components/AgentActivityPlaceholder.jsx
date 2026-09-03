import React from "react"

function AgentActivityPlaceholder() {
  return (
    <div style={{
      border: "1px dashed #999",
      borderRadius: "6px",
      padding: "1rem",
      color: "#666",
      minHeight: "120px",
    }}>
      <strong>Agent reasoning and replanning timeline — coming in Phase 4–6</strong><br />
      <br />
      <em>This panel will eventually show the plan history, agent reasoning
      excerpts, and superseded_by links as the OBSERVE→ANALYZE→PLAN→ACT→MONITOR→REPLAN
      loop runs. For now it is intentionally blank — no fake data is displayed.</em>
    </div>
  )
}

export default AgentActivityPlaceholder