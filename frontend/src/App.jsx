import React, { useState, useEffect, useCallback } from "react"
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

  // Navigation and content state — declared before any conditional return
  const [currentSection, setCurrentSection] = useState("requests")
  const [data, setData] = useState(null)
  const [formError, setFormError] = useState("")
  const [formSuccess, setFormSuccess] = useState("")

  const load = useCallback(async () => {
    async function _load() {
      try {
        const r = await axios.get(`/api/v1/${currentSection}`)
        setData(r.data)
      } catch (e) {
        setData(null)
      }
    }
    _load()
  }, [currentSection])

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
        background: "#faf8ff",
        color: "#131b2e",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          width: 64,
          background: "#eaedff",
          borderRight: "1px solid #cbd5e0",
          padding: "1rem 0.5rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div className="flex items-center gap-2 py-3">
          <img
            alt="Relief Coordinator Emblem"
            style={{
              width: 32,
              height: 32,
              objectFit: "contain",
            }}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtAmWYMjqa0enddslblIihGmsiqn6_jCx6PfCJZ4-Nhs-nFw3l7kxijWinsgM_BeDQFDfBLZjFPgGtG58LxIw_nRgR1QxNwM2zrmEIewQ_dzf_OSsbgL-mMgGuz79bxKjwaMMpS9a4o0NMDLdsW000CxjHMM2JY0zyNE_RQMyiCxMjjMlIxJhtZ7jJSkClvAHSAJ3bxsDEek3nCbItq95_hUNjl8bNEkbyxNbzjYRkYqM65W7mX90fjw"
          />
          <span className="font-semibold text-xs uppercase tracking-wider text-gray-600">Relief Coordinator</span>
          <span className="font-xxxs text-gray-400 autonomous">Autonomous Operations</span>
        </div>
        <nav className="flex flex-col gap-1">
          {navLinks.map((nav) => (
            <button
              key={nav.key}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                marginBottom: "0.125rem",
                borderRadius: "0.25rem",
                fontSize: "0.7rem",
                fontWeight: 500,
                color: "#4a5568",
                background: currentSection === nav.key ? "#cbd5e0" : "transparent",
                border: "none",
                textAlign: "left",
                "&:hover": {
                  background: "#a0aec0",
                },
              }}
              onClick={nav.onClick}
            >
              {nav.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2 px-2">
          <span className="font-xxxs text-gray-400">AI Engine: Active</span>
          <span className="relative h-1.5 w-1.5 rounded-full bg-blue-500 opacity-75 animate-ping"></span>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ marginLeft: 64, padding: "1rem 1.5rem" }}>
        {/* Top command banner */}
        <div className="bg-white rounded-lg shadow-sm p-3 mb-3 border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-600">warning</span>
            <div>
              <span className="font-semibold text-gray-900 uppercase tracking-wider">Active Incident: Hurricane Aurelia - Sector 4 Command Center</span>
              <span className="font-xxxs text-gray-500">Real-time sync · 12 active requests</span>
            </div>
          </div>
        </div>

        {/* Section content */}
        <div style={{ padding: "0.5rem 0" }}>
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
    </div>
  )
}

export default App