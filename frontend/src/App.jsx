import React, { useState, useEffect } from "react"
import axios from "axios"
import RequestsSection from "./components/RequestsSection"
import VolunteersSection from "./components/VolunteersSection"
import SheltersSection from "./components/SheltersSection"
import ResourcesSection from "./components/ResourcesSection"
import AssignmentsSection from "./components/AssignmentsSection"
import AgentActivityPlaceholder from "./components/AgentActivityPlaceholder"
import LoginPage from "./pages/LoginPage"

const sections = {
  requests: "Requests",
  volunteers: "Volunteers",
  shelters: "Shelters",
  resources: "Resources",
  assignments: "Assignments",
  agent: "AI Agent Activity",
}

function App() {
  const [jwt, setJwt] = useState(() => window.localStorage.getItem("jwt"))
  const [role, setRole] = useState(() => {
    try {
      const token = window.localStorage.getItem("jwt")
      if (!token) return null
      const parts = token.split(".")
      if (parts.length !== 3) return null
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
      const payload = JSON.parse(atob(base64))
      return payload.role ?? null
    } catch {
      return null
    }
  })

  // When JWT changes, update axios headers and reload
  useEffect(() => {
    if (jwt) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${jwt}`
    } else {
      delete axios.defaults.headers.common["Authorization"]
    }
  }, [jwt])

  // If no JWT, render login page
  if (!jwt) {
    return <LoginPage onLogin={() => window.location.reload()} />
  }

  // Navigation and content rendering same as before...
  const [currentSection, setCurrentSection] = useState("requests")
  const [data, setData] = useState(null)
  const [formError, setFormError] = useState("")
  const [formSuccess, setFormSuccess] = useState("")

  // load() defined at top scope
  function load() {
    async function _load() {
      try {
        const r = await axios.get(`/api/v1/${currentSection}`)
        setData(r.data)
      } catch (e) {
        setData(null)
      }
    }
    _load()
  }

  // Submit emergency request (citizen only)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError("")
    setFormSuccess("")
    try {
      const body = {
        emergency_type: e.target.emergency_type.value,
        description: e.target.description.value,
        requester_name: e.target.requester_name.value,
        requester_contact: e.target.requester_contact.value,
        number_of_people: Number(e.target.number_of_people.value),
      }
      await axios.post("/api/v1/requests", body)
      setFormSuccess("Request submitted! Refreshing...")
      setTimeout(() => {
        setFormSuccess("")
        load()
      }, 1000)
    } catch (e) {
      setFormError(e.response?.data?.detail || "Submit failed")
    }
  }

  // Navigation
  const navLinks = Object.entries(sections).map(([key, label]) => ({
    key,
    label,
    onClick: () => setCurrentSection(key),
  }))

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
        background: "#fafafa",
        color: "#222",
      }}
    >
      {/* Top nav */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #ddd",
          padding: "0.5rem 1rem",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        {role === "citizen" && (
          <button
            style={{
              marginRight: "1rem",
              padding: "0.4rem 0.8rem",
              fontSize: "0.85rem",
            }}
            onClick={() => setCurrentSection("requests")}
          >
            Requests
          </button>
        )}
        <button
          style={{
            padding: "0.4rem 0.8rem",
            fontSize: "0.85rem",
            border: "1px solid #888",
            borderRadius: "4px",
            background: currentSection === "requests" ? "#e3f2fd" : "transparent",
          }}
          onClick={() => setCurrentSection("requests")}
        >
          {sections.requests}
        </button>
        <button
          style={{
            padding: "0.4rem 0.8rem",
            fontSize: "0.85rem",
            border: "1px solid #888",
            borderRadius: "4px",
            background: currentSection === "volunteers" ? "#e3f2fd" : "transparent",
          }}
          onClick={() => setCurrentSection("volunteers")}
        >
          {sections.volunteers}
        </button>
        <button
          style={{
            padding: "0.4rem 0.8rem",
            fontSize: "0.85rem",
            border: "1px solid #888",
            borderRadius: "4px",
            background: currentSection === "shelters" ? "#e3f2fd" : "transparent",
          }}
          onClick={() => setCurrentSection("shelters")}
        >
          {sections.shelters}
        </button>
        <button
          style={{
            padding: "0.4rem 0.8rem",
            fontSize: "0.85rem",
            border: "1px solid #888",
            borderRadius: "4px",
            background: currentSection === "resources" ? "#e3f2fd" : "transparent",
          }}
          onClick={() => setCurrentSection("resources")}
        >
          {sections.resources}
        </button>
        <button
          style={{
            padding: "0.4rem 0.8rem",
            fontSize: "0.85rem",
            border: "1px solid #888",
            borderRadius: "4px",
            background: currentSection === "assignments" ? "#e3f2fd" : "transparent",
          }}
          onClick={() => setCurrentSection("assignments")}
        >
          {sections.assignments}
        </button>
        <button
          style={{
            padding: "0.4rem 0.8rem",
            fontSize: "0.85rem",
            border: "1px solid #888",
            borderRadius: "4px",
            background: currentSection === "agent" ? "#e3f2fd" : "transparent",
          }}
          onClick={() => setCurrentSection("agent")}
        >
          {sections.agent}
        </button>
      </div>

      {/* Section content */}
      <div style={{ padding: "1rem" }}>
        {currentSection === "requests" && (
          <RequestsSection
            data={data}
            onRefresh={load}
            formError={formError}
            formSuccess={formSuccess}
            onSubmit={handleSubmit}
            role={role}
          />
        )}
        {currentSection === "volunteers" && (
          <VolunteersSection data={data} onRefresh={load} />
        )}
        {currentSection === "shelters" && (
          <SheltersSection data={data} onRefresh={load} />
        )}
        {currentSection === "resources" && (
          <ResourcesSection data={data} onRefresh={load} />
        )}
        {currentSection === "assignments" && (
          <AssignmentsSection data={data} onRefresh={load} />
        )}
        {currentSection === "agent" && (
          <AgentActivityPlaceholder />
        )}
      </div>
    </div>
  )
}

export default App