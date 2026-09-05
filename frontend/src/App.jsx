import React, { useCallback, useEffect, useMemo, useState } from "react"
import axios from "axios"
import AppShell from "./components/AppShell"
import RequestsSection from "./components/RequestsSection"
import VolunteersSection from "./components/VolunteersSection"
import SheltersSection from "./components/SheltersSection"
import ResourcesSection from "./components/ResourcesSection"
import AssignmentsSection from "./components/AssignmentsSection"
import AgentActivitySection from "./components/AgentActivitySection"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import ApprovalsPage from "./pages/ApprovalsPage"
import AuditLogPage from "./pages/AuditLogPage"

function decodeRole(token) {
  try {
    if (!token) return null
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    return JSON.parse(atob(base64)).role ?? null
  } catch {
    return null
  }
}

export default function App() {
  const [jwt, setJwt] = useState(() => window.localStorage.getItem("jwt"))
  const [section, setSection] = useState("requests")
  const [authView, setAuthView] = useState("login") // "login" | "register"
  const [registerEmail, setRegisterEmail] = useState("")
  const [topbarStats, setTopbarStats] = useState(null)

  const role = useMemo(() => decodeRole(jwt), [jwt])

  useEffect(() => {
    if (jwt) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${jwt}`
    } else {
      delete axios.defaults.headers.common["Authorization"]
    }
  }, [jwt])

  const handleAuthSuccess = useCallback((token) => {
    window.localStorage.setItem("jwt", token)
    // Set the header synchronously so sections mounting on this render get it
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    setJwt(token)
  }, [])

  const handleSignOut = useCallback(() => {
    window.localStorage.removeItem("jwt")
    delete axios.defaults.headers.common["Authorization"]
    setJwt(null)
    setSection("requests")
    setTopbarStats(null)
  }, [])

  // Lightweight topbar telemetry (active requests / assigned / volunteers)
  const fetchStats = useCallback(async () => {
    if (!jwt) return
    try {
      const [reqs, vols] = await Promise.all([
        axios.get("/api/v1/requests"),
        axios.get("/api/v1/volunteers"),
      ])
      const requests = reqs.data ?? []
      const volunteers = vols.data ?? []
      setTopbarStats({
        activeRequests: requests.filter((r) => !["resolved", "cancelled"].includes(r.status)).length,
        assigned: requests.filter((r) => ["assigned", "in_progress"].includes(r.status)).length,
        volunteers: volunteers.filter((v) => v.availability_status === "available").length,
      })
    } catch {
      // backend unavailable — leave the previous stats in place
    }
  }, [jwt])

  useEffect(() => {
    fetchStats()
    const id = setInterval(fetchStats, 60000)
    return () => clearInterval(id)
  }, [fetchStats])

  if (!jwt) {
    return authView === "login" ? (
      <LoginPage
        initialEmail={registerEmail}
        onLogin={handleAuthSuccess}
        onShowRegister={() => setAuthView("register")}
      />
    ) : (
      <RegisterPage
        onRegistered={(email) => {
          setRegisterEmail(email)
          setAuthView("login")
        }}
        onShowLogin={() => setAuthView("login")}
      />
    )
  }

  return (
    <AppShell current={section} onSelect={setSection} role={role} onSignOut={handleSignOut} stats={topbarStats}>
      {section === "requests" && <RequestsSection role={role} />}
      {section === "volunteers" && <VolunteersSection />}
      {section === "shelters" && <SheltersSection />}
      {section === "resources" && <ResourcesSection />}
      {section === "assignments" && <AssignmentsSection />}
      {section === "agent" && <AgentActivitySection />}
      {section === "approvals" && <ApprovalsPage />}
      {section === "audit" && <AuditLogPage />}
    </AppShell>
  )
}
