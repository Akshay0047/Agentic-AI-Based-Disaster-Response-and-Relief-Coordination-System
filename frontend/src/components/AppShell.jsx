import React, { useState } from "react"
import MaterialSymbol from "./MaterialSymbol"

const DISPATCH_LINKS = [
  { key: "requests", label: "Requests", icon: "campaign" },
  { key: "volunteers", label: "Volunteers", icon: "group" },
  { key: "shelters", label: "Shelters", icon: "home" },
  { key: "resources", label: "Resources", icon: "inventory_2" },
  { key: "assignments", label: "Assignments", icon: "assignment" },
  { key: "agent", label: "Agent Activity", icon: "psychology", ai: true },
]

const GOVERNANCE_LINKS = [
  { key: "approvals", label: "Approvals", icon: "rotate_90_degrees_ccw" },
  { key: "audit", label: "Audit Log", icon: "verified_user" },
]

function NavLink({ active, icon, label, ai, onClick }) {
  return (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onClick() }}
      className={`flex items-center justify-between px-md py-sm rounded-lg transition-colors ${
        active
          ? "bg-primary-container text-on-primary font-semibold shadow-sm"
          : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
      }`}
    >
      <span className="flex items-center gap-md">
        <MaterialSymbol name={icon} fill={active} className="text-lg" />
        <span className="font-body text-body-md">{label}</span>
      </span>
      {ai && (
        <span className="bg-secondary-fixed text-on-secondary-fixed px-xs py-2xs rounded-full font-code text-[10px] leading-3">AI</span>
      )}
    </a>
  )
}

function SidebarNav({ current, onSelect }) {
  return (
    <>
      <div className="px-sm pb-xs font-label text-label-sm text-on-surface-variant uppercase tracking-wider">
        Operational Dispatch
      </div>
      <nav className="flex flex-col gap-2xs">
        {DISPATCH_LINKS.map((l) => (
          <NavLink key={l.key} {...l} active={current === l.key} onClick={() => onSelect(l.key)} />
        ))}
      </nav>
      <div className="mt-lg px-sm pb-xs font-label text-label-sm text-on-surface-variant uppercase tracking-wider">
        Governance &amp; Controls
      </div>
      <nav className="flex flex-col gap-2xs">
        {GOVERNANCE_LINKS.map((l) => (
          <NavLink key={l.key} {...l} active={current === l.key} onClick={() => onSelect(l.key)} />
        ))}
      </nav>
    </>
  )
}

/** Fixed left sidebar (Stitch: w-64, surface-container-lowest, brand header, grouped nav, AI engine card) */
export function Sidebar({ current, onSelect, open, onClose }) {
  return (
    <>
      {/* Mobile scrim */}
      {open && <div className="fixed inset-0 bg-inverse-surface/40 z-40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between select-none transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand header */}
          <div className="flex items-center gap-sm px-lg py-md h-16 bg-surface-container-low/60">
            <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
              <MaterialSymbol name="crisis_alert" fill className="text-xl" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-headline text-headline-sm text-on-surface truncate leading-tight">Relief Coordinator</span>
              <span className="font-label text-label-sm text-on-surface-variant font-medium tracking-wider uppercase truncate">
                Autonomous Operations
              </span>
            </div>
          </div>
          {/* Nav */}
          <div className="flex-1 overflow-y-auto px-sm py-md">
            <SidebarNav current={current} onSelect={onSelect} />
          </div>
        </div>
        {/* AI engine status card */}
        <div className="p-md bg-surface-container-low/80 m-sm rounded-xl">
          <div className="flex items-center gap-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <div className="flex flex-col">
              <span className="font-label text-label-md text-on-surface font-semibold">AI Engine: Active</span>
              <span className="font-label text-label-sm text-on-surface-variant">Real-time sync</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

/** Fixed top header (Stitch: blurred bar, incident chip, live metrics, profile, sign out) */
export function Topbar({ role, onSignOut, onMenu, stats }) {
  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-xl flex items-center justify-between gap-lg">
      <div className="flex items-center gap-md flex-1 min-w-0">
        <button
          className="lg:hidden p-xs rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
          onClick={onMenu}
          aria-label="Open navigation"
        >
          <MaterialSymbol name="menu" />
        </button>
        <div className="hidden xl:flex items-center gap-xs px-md py-2xs rounded-full bg-surface-container-high text-on-surface">
          <MaterialSymbol name="warning" className="text-sm text-primary" />
          <span className="font-label text-label-sm text-on-surface font-semibold truncate">
            Active Incident: Hurricane Aurelia — Sector 4 Command Center
          </span>
        </div>
        {stats && (
          <div className="hidden md:flex items-center gap-lg ml-auto px-md font-metric text-metric">
            <div className="flex items-center gap-xs">
              <span className="font-label text-label-sm text-on-surface-variant uppercase">Active Requests:</span>
              <span className="font-semibold text-primary">{stats.activeRequests ?? "—"}</span>
            </div>
            <div className="flex items-center gap-xs">
              <span className="font-label text-label-sm text-on-surface-variant uppercase">Assigned:</span>
              <span className="font-semibold text-secondary">{stats.assigned ?? "—"}</span>
            </div>
            <div className="flex items-center gap-xs">
              <span className="font-label text-label-sm text-on-surface-variant uppercase">Volunteers Field:</span>
              <span className="font-semibold text-on-surface">{stats.volunteers ?? "—"}</span>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-md shrink-0">
        <div className="flex items-center gap-sm pl-xs">
          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
            <MaterialSymbol name="person" fill className="text-base" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-label text-label-md text-on-surface font-semibold leading-tight">Operator</span>
            <span className="bg-inverse-surface text-inverse-on-surface text-center rounded-full font-label text-label-sm px-xs py-2xs mt-2xs uppercase tracking-wider">
              {role ?? "user"}
            </span>
          </div>
        </div>
        <button
          className="p-xs rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
          title="Sign out"
          onClick={onSignOut}
        >
          <MaterialSymbol name="logout" />
        </button>
      </div>
    </header>
  )
}

/** App shell: sidebar + topbar + scrollable main content area */
export default function AppShell({ current, onSelect, role, onSignOut, stats, children }) {
  const [navOpen, setNavOpen] = useState(false)
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar
        current={current}
        onSelect={(key) => { onSelect(key); setNavOpen(false) }}
        open={navOpen}
        onClose={() => setNavOpen(false)}
      />
      <Topbar role={role} onSignOut={onSignOut} onMenu={() => setNavOpen(true)} stats={stats} />
      <main className="pt-16 lg:ml-64 min-h-screen">
        <div className="px-md sm:px-lg lg:px-xl py-xl">{children}</div>
      </main>
    </div>
  )
}
