import React, { useEffect, useState } from "react"
import axios from "axios"

function AgentActivityPlaceholder() {
  const [activity, setActivity] = useState({
    loopSequence: 48,
    loopLatency: 1.8,
    decisionConfidence: 98.4,
    autonomyTier: "Tier 2 Supervised",
    autonomyLevel: "[AGENT AUTONOMY: LEVEL 2 SUPERVISED]",
    autonomyLatency: "Synthesized 4 candidate trajectories in 27ms",
    replanningOccurrences: 1,
    replanningDynamicReroute: "Dynamic Reroute Active",
    currentStep: "REPLAN",
    steps: [
      { id: 1, name: "OBSERVE", status: "completed", description: "Multi-Source Sensor & Telemetry Intake" },
      { id: 2, name: "ANALYZE", status: "completed", description: "Triage & Hydrological Risk Modeling" },
      { id: 3, name: "PLAN", status: "superseded", description: "Initial Dispatch Plan: Alpha Ground Rescue" },
      { id: 4, name: "REPLAN", status: "active", description: "Dynamic Autonomous Replanning Matrix" },
      { id: 5, name: "ACT", status: "completed", description: "Autonomous Dispatch & Push Notification Execution" },
      { id: 6, name: "MONITOR", status: "active", description: "Continuous Telemetry & Mission Tracking" },
    ],
    lastAction: "Dispatched high-priority alert to Volunteer Chloe Bennett pager & tactical radio (Ch. 14).",
    agentInfo: {
      name: "Chloe Bennett",
      role: "WAVE-3",
      unit: "Boat Unit #4 (Zodiac Swift-Water)",
      distance: "1.2km",
      position: "34.0520° N, 118.2437° W",
      speed: "14.2 knots",
      bearing: "284°",
      eta: "06m 42s",
    },
    resourceInfo: {
      medicalBeds: "14 medical beds on 2nd floor of St. Jude High Shelter",
    },
    comms: [
      { time: "14:04:32", channel: "TACTICAL RADIO (CH 14)", message: '"Automated Agent relay: Boat Unit 4 proceed to north ramp. Ground route submerged."' },
      { time: "14:04:35", channel: "HOSPITAL BED INVENTORY API", message: '"Harbor Pavilion Arena surge bed lock confirmed: 14 units queued."' },
      { time: "14:04:41", channel: "AUTOMATED SMS NOTIFY", message: '"Miller, S.: Rescue Zodiac Unit 4 dispatched to second landing. Stay elevated."' },
    ],
    mapSnapshot: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBH9KR2L3nVR1VGqWukhugIpcxy0eSkEz5fBxKVDMT4lnHAp0UyC0NSm3GdHJKGZUtHR8CfIkBxHY0iIXaraLp5C4KwEKzwXbadKDj4v2sks3yC1ecpw-TkqCuhaUUlSLMj9R0L8OQ5PJsdBMrczGfeSakOPfjbTZwYQjAl3JBOYOHpPzkA0u2R2-3bpTCmz1KpRXj8XZiO5VYu2Mj8cFQXC9MwuFBYhhJYQik8gNlC7hy9nrLMhz3hA",
    droneFeed: "https://lh3.googleusercontent.com/aida-public/AB6AXuDa1_a_8gXlHmHT6sb6aycJr6rULDsxXvKN9CPQT5YlX4nywmo-Ew4oXajoEk1iEI5gdBErzbwmZnY7JeqEt_aR3yZiM_K6MMlafjbMQmYrFqjPfMDMOKXuBno7YIWuF-zNedr54EF30DaEi_trltdUlOW53qwIYFuRVY1Xr3zYXJYr2E4zNkKJ4vtE6fzirldxENnSVYoF7bGLeO-OsaC0jhdFd4f_r7CWHYqWZQhRPMf1SHMV8y9XeQ",
  })

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const r = await axios.get("/api/v1/agent/activity")
        setActivity(r.data)
      } catch (e) {
        // keep current state on error
      }
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-surface font-body-md text-body-md text-on-surface">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between select-none">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center gap-2 px-6 py-4 h-16 bg-surface-container-low/60">
            <img
              alt="Relief Coordinator Emblem"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtAmWYMjqa0enddslblIihGmsiqn6_jCx6PfCJZ4-Nhs-nFw3l7kxijWinsgM_BeDQFDfBLZjFPgGtG58LxIw_nRgR1QxNwM2zrmEIewQ_dzf_OSsbgL-mMgGuz79bxKjwaMMpS9a4o0NMDLdsW000CxjHMM2JY0zyNE_RQMyiCxMjjMlIxJhtZ7jJSkClvAHSAJ3bxsDEek3nCbItq95_hUNjl8bNEkbyxNbzjYRkYqM65W7mX90fjw"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-headline-sm text-headline-sm text-on-surface truncate leading-tight">Relief Coordinator</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant f-sm uppercase tracking-wider">Dashboard</span>
            </div>
          </div>
          <nav className="flex flex-col flex-1 gap-1.5 px-6 py-2">
            <a
              className="flex items-center justify-between px-4 py-2 rounded-lg transition-colors bg-primary-container text-on-primary font-headline-sm active"
              data-path="requests"
              href="#"
            >
              <span className="material-symbols-outlined text-lg">campaign</span>
              <span className="font-body-md text-body-md">Requests</span>
            </a>
            <a
              className="flex items-center justify-between px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
              data-path="volunteers"
              href="#"
            >
              <span className="material-symbols-outlined text-lg">group</span>
              <span className="font-body-md text-body-md">Volunteers</span>
            </a>
            <a
              className="flex items-center justify-between px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
              data-path="shelters"
              href="#"
            >
              <span className="material-symbols-outlined text-lg">home</span>
              <span className="font-body-md text-body-md">Shelters</span>
            </a>
            <a
              className="flex items-center justify-between px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
              data-path="resources"
              href="#"
            >
              <span className="material-symbols-outlined text-lg">inventory_2</span>
              <span className="font-body-md text-body-md">Resources</span>
            </a>
            <a
              className="flex items-center justify-between px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
              data-path="assignments"
              href="#"
            >
              <span className="material-symbols-outlined text-lg">assignment</span>
              <span className="font-body-md text-body-md">Assignments</span>
            </a>
            <a
              className="flex items-center justify-between px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
              data-path="agent-activity"
              href="#"
            >
              <span className="material-symbols-outlined text-lg">psychology</span>
              <span className="font-body-md text-body-md">Agent Activity</span>
              <span className="bg-secondary-fixed text-on-secondary-fixed px-1.5 py-0.5 rounded-full font-code-sm font-label-sm">AI</span>
            </a>
          </nav>
          <div>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-2">Governance & Controls</span>
            <nav className="flex flex-col gap-1.5 px-6">
              <a
                className="flex items-center justify-between px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined text-lg">rotate_90_degrees_ccw</span>
                <span className="font-body-md text-body-md">Approvals</span>
                <span className="bg-error-container text-on-error-container font-code-sm font-bold px-1.5 py-0.5 rounded-full">3</span>
              </a>
              <a
                className="flex items-center justify-between px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined text-lg">verified_user</span>
                <span className="font-body-md text-body-md">Audit Log</span>
              </a>
            </nav>
          </div>
        </div>
        <div className="p-4 bg-surface-container-low/80 m-4 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <div>
              <span className="font-label-md text-label-md text-on-surface font-semibold">AI Engine: Active</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Real-time sync</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="pl-64">
        {/* Top header */}
        <header className="fixed top-0 left-64 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-6 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="hidden xl:flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface">
              {/* Search or quick actions */}
            </div>
            <div className="flex items-center gap-3">
              <button
                className="relative p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-error"></span>
              </button>
              <div className="flex items-center gap-2">
                <img
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1R6zDXL19q3bluruBUITCs8akhPXCo414KMjO9hZdZygOt2A7aR2LEDDML5G-JXnvPZX8bdM06Zi1KfUyjLgmpICKALFpMTz5KjAff2Okfui9S_-FvrBQ1u_AbMgex_-VY26-RhHl97GhO5sHPqTHtRnX4EF7oaA8Ijb88q_0hBv8UIrzH5pAq5L7KILwdAR_3gDcZiqP_BmnvO8wGjHE2PKdIW7F0wRfKdcSt47vtp0dlLc8nMvQ2A"
                />
                <div className="hidden sm:flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold leading-tight">Sarah Jenkins</span>
                  <span className="bg-inverse-surface text-inverse-on-surface text-center rounded-full font-label-sm text-label-sm px-1.5 py-0.5 mt-0.5 uppercase tracking-wider">
                    Admin
                  </span>
                </div>
              </div>
              <button
                className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                title="Sign out"
                type="button"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main section */}
        <main className="relative pt-20 bg-surface min-h-screen w-full px-6 py-6 flex flex-col gap-6">
          {/* Top Command Bar */}
          <section className="bg-surface-container-lowest rounded-xl shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute -right-2 -top-2 w-24 h-24 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[320px]">
              <div className="relative flex-1 max-w-xl group">
                <div className="bg-surface-container-low px-4 py-3 rounded-lg flex items-center justify-between cursor-pointer transition-all hover:bg-surface-container">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-error-container text-on-error-container font-code-sm text-code-sm font-semibold">
                      !
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                        REQ-1092: St. Jude Elderly Care Ground Inundation
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                        Critical - Sector 7B Flood Plain - 14 Occupants
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 text-on-surface-variant">
                    <span className="font-code-sm bg-surface-container-high px-2 py-1.5 rounded text-on-surface">
                      ⌘K
                    </span>
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center p-1.5 bg-surface-container-low rounded-lg shadow-inner">
              <button
                id="mode-active-btn"
                className="flex items-center gap-1.5 px-3 py-1 rounded-md font-headline-sm font-label-md text-primary"
                type="button"
              >
                <span className="material-symbols-outlined text-base">sync</span>
                <span>Active Loop</span>
              </button>
              <button
                id="mode-audit-btn"
                className="flex items-center gap-1.5 px-3 py-1 rounded-md font-body-md font-label-md text-on-surface-variant hover:text-on-surface transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-base">history</span>
                <span>Audit Replay</span>
              </button>
            </div>
          </section>

          {/* Metrics Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div className="bg-surface-container-lowest rounded-xl p-3 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="font-label-sm font-code-sm uppercase tracking-wider font-semibold">Loop Latency</span>
                <span className="material-symbols-outlined text-sm text-primary">timer</span>
              </div>
              <div className="flex items-baseline gap-0.5 mt-0.5">
                <span className="font-display font-headline-lg font-bold text-on-surface">{activity.loopLatency}</span>
                <span className="font-code-sm text-code-sm text-on-surface-variant">seconds / cycle</span>
              </div>
              <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden mt-1">
                <div className="bg-primary h-full rounded-full" style={{ width: "22%" }} />
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-3 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="font-label-sm font-code-sm uppercase tracking-wider font-semibold">Decision Confidence</span>
                <span className="material-symbols-outlined text-sm text-secondary">verified</span>
              </div>
              <div className="flex items-baseline gap-0.5 mt-0.5">
                <span className="font-display font-headline-lg font-bold text-primary">{activity.decisionConfidence}</span>
                <span className="font-code-sm text-code-sm text-on-surface-variant">% certainty</span>
              </div>
              <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden mt-1">
                <div className="bg-primary h-full rounded-full" style={{ width: `${activity.decisionConfidence}%` }} />
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-3 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="font-label-sm font-code-sm uppercase tracking-wider font-semibold">Autonomy Governance</span>
                <span className="material-symbols-outlined text-sm text-tertiary">rotate_90_degrees_ccw</span>
              </div>
              <div className="flex items-baseline gap-0.5 mt-0.5">
                <span className="font-headline-lg font-bold text-on-surface tracking-tight">{activity.autonomyTier}</span>
              </div>
              <div className="flex items-center gap-0.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="font-label-sm text-label-sm text-on-surface font-medium">Safe Override Armed</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-3 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="font-label-sm font-code-sm uppercase tracking-wider font-semibold">Replanning Occurrences</span>
                <span className="material-symbols-outlined text-sm text-error">alt_route</span>
              </div>
              <div className="flex items-baseline gap-0.5 mt-0.5">
                <span className="font-display font-headline-lg font-bold text-error">0{activity.replanningOccurrences}</span>
                <span className="font-code-sm text-code-sm text-on-surface-variant">{activity.replanningDynamicReroute}</span>
              </div>
              <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden mt-1">
                <div className="bg-error h-full rounded-full" style={{ width: "100%" }} />
              </div>
            </div>
          </div>

          {/* Dual Column Layout: Timeline Left, Tactical Context Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="main-workflow-content">
            {/* LEFT: Cognitive Engine Timeline */}
            <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm p-4 flex flex-col gap-4 relative overflow-hidden">
              <div className="flex items-center justify-between bg-surface-container-lowest px-4 py-2 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="font-headline-sm text-headline-sm text-on-surface">Cognitive Loop Execution Trail</span>
                  <span className="bg-primary-container text-on-primary font-code-sm px-1.5 py-0.5 rounded-full font-bold">6 Phases</span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Incident Timeline UTC-0</span>
              </div>

              <div className="relative pl-6 sm:pl-8 space-y-4">
                <div className="absolute left-6 sm:left-8 top-0 bottom-8 w-0.5 -ml-px bg-surface-container-highest" />

                {/* STEP 1: OBSERVE */}
                <div className="relative group">
                  <div className="absolute -left-6 sm:-left-8 top-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-on-primary shadow-sm ring-4 ring-surface">
                    <span className="material-symbols-outlined text-sm">visibility</span>
                  </div>
                  <div className="bg-surface-container-lowest rounded-xl shadow-sm p-4 flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-surface-container px-1.5 py-0.5 rounded font-code-sm text-code-sm text-primary font-bold">STEP 01</span>
                        <span className="font-headline-sm text-headline-sm text-on-surface truncate">OBSERVE: Multi-Source Sensor & Telemetry Intake</span>
                      </div>
                      <span className="font-code-sm text-code-sm text-on-surface-variant">14:02:11 UTC (24m ago)</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      Distress beacon received from <strong className="text-on-surface">St. Jude Elder Care</strong> telemetry link. Riverway automated hydro-sensor (#4) reported rapid surge rate of <span className="text-error font-code-sm font-semibold">+18cm/hr</span>. Verified internal facility roster: 14 occupants on ground floor, including 8 non-ambulatory wheelchair dependents.
                    </p>
                    <div className="flex flex-wrap items-center gap-1 pt-2">
                      <span className="bg-surface-container-low text-on-surface px-1.5 py-0.5 rounded font-code-sm text-code-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-primary">sensors</span> Gauge #4: +18cm/h
                      </span>
                      <span className="bg-surface-container-low text-on-surface px-1.5 py-0.5 rounded font-code-sm text-code-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-secondary">group</span> Occupants: 14 High-Dependency
                      </span>
                      <span className="bg-surface-container-low text-on-surface px-1.5 py-0.5 rounded font-code-sm text-code-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-primary">satellite_alt</span> Satellite Imagery Ref: 88A-Flood
                      </span>
                    </div>
                  </div>
                </div>

                {/* STEP 2: ANALYZE */}
                <div className="relative group">
                  <div className="absolute -left-6 sm:-left-8 top-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-on-secondary shadow-sm ring-4 ring-surface">
                    <span className="material-symbols-outlined text-sm">neurology</span>
                  </div>
                  <div className="bg-surface-container-lowest rounded-xl shadow-sm p-4 flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-surface-container px-1.5 py-0.5 rounded font-code-sm text-code-sm text-secondary font-bold">STEP 02</span>
                        <span className="font-headline-sm text-headline-sm text-on-surface truncate">ANALYZE: Triage & Hydrological Risk Modeling</span>
                      </div>
                      <span className="font-code-sm text-code-sm text-on-surface-variant">14:02:18 UTC (24m ago)</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      Autonomous risk classification: <span className="inline-flex items-center gap-1 font-bold text-error bg-error-container/40 px-2 py-0.5 rounded font-code-sm text-code-sm">CRITICAL SEVERITY (Score: 9.8 / 10)</span>. Ground floor water level elevation exceeds floorboard clearance by 14:45 UTC. Evacuation window estimated at 45 minutes maximum.
                    </p>
                    <div className="bg-surface-container-low rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">Algorithmic Assessment Matrix</span>
                        <span className="font-body-md text-body-md text-on-surface font-medium">Road traversal viability: Disqualified. Amphibious / Boat asset required immediately.</span>
                      </div>
                      <div className="bg-surface-container px-1.5 py-0.5 rounded-lg font-code-sm text-code-sm text-primary font-semibold whitespace-nowrap" style={{ width: "22%" }}>
                        P(Safe Evac) via Truck = 6.2%
                      </div>
                    </div>
                  </div>
                </div>

                {/* STEP 3: PLAN (SUPERSEDED) */}
                <div className="relative group">
                  <div className="absolute -left-6 sm:-left-8 top-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-outline text-on-primary shadow-sm ring-4 ring-surface">
                    <span className="material-symbols-outlined text-sm">cancel</span>
                  </div>
                  <div className="bg-surface-container-low/70 rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden opacity-85 hover:opacity-100 transition-opacity">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <span className="bg-outline/20 px-1 py-0.5 rounded font-code-sm text-code-sm text-on-surface-variant font-bold line-through">STEP 03</span>
                        <span className="font-headline-sm text-headline-sm text-on-surface-variant line-through">Initial Dispatch Plan: Alpha Ground Rescue</span>
                      </div>
                      <span className="font-code-sm text-code-sm text-on-surface-variant">14:03:02 UTC (23m ago)</span>
                    </div>
                    <div className="flex items-center gap-1 bg-error-container text-on-error-container px-2 py-1 rounded-lg font-code-sm text-code-sm font-bold w-fit">
                      <span className="material-symbols-outlined text-sm">cancel</span>
                      <span>SUPERSEDED: Dynamic Incident Failure Detected</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed line-through">
                      Initial plan synthesized: Mobilize Ground Rescue Unit #2 (High-Water Truck) via Riverway Corridor Highway.
                    </p>
                    <div className="bg-surface-container-lowest/80 rounded-lg p-2 flex items-start gap-1 text-error">
                      <span className="material-symbols-outlined text-base shrink-0 mt-0.5">report_problem</span>
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md font-bold">Failure Trigger Telemetry (14:03:45 UTC):</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Riverway Bridge depth sensors marked roadway submerged (+42cm). Unit #2 simultaneously re-assigned to critical electrical sub-station fire emergency in Sector 4.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CONNECTOR HIGHLIGHT */}
                <div className="flex items-center gap-1 -my-2 pl-2">
                  <span className="material-symbols-outlined text-primary text-lg animate-bounce">south</span>
                  <span className="font-code-sm text-primary font-bold tracking-wide uppercase bg-primary-fixed px-1.5 py-0.5 rounded">
                    Replanning Algorithm Triggered • 27ms synthesis
                  </span>
                </div>

                {/* STEP 4: REPLAN */}
                <div className="relative group">
                  <div className="absolute -left-6 sm:-left-8 top-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-primary-container text-on-primary shadow-md ring-4 ring-primary-fixed">
                    <span className="material-symbols-outlined text-sm">auto_fix_high</span>
                  </div>
                  <div className="bg-surface-container-lowest rounded-xl shadow-md p-4 flex flex-col gap-3 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent pointer-events-none" />
                    <div className="flex flex-wrap items-center justify-between gap-1.5 relative z-10">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-primary text-on-primary px-1.5 py-0.5 rounded font-code-sm text-code-sm font-bold">STEP 04</span>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-bold">REPLAN: Dynamic Autonomous Replanning Matrix</span>
                      </div>
                      <span className="font-code-sm text-code-sm text-primary font-bold">14:04:12 UTC (22m ago)</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-1.5 bg-surface-container-high/60 rounded-lg p-1.5 relative z-10">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary">psychology</span>
                        <div className="flex flex-col">
                          <span className="font-code-sm text-code-sm text-primary font-bold tracking-wider">{activity.autonomyLevel}</span>
                          <span className="font-label-sm text-label-sm text-on-surface">{activity.autonomyLatency}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-surface-container-lowest px-2 py-1 rounded-lg shadow-sm">
                        <span className="font-label-sm text-label-sm font-bold text-primary">Confidence: {activity.decisionConfidence}%</span>
                      </div>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface leading-relaxed relative z-10">
                      Agent superseded Riverway route entirely. Auto-selected <strong className="text-primary font-semibold">Boat Unit #4 (Zodiac Swift-Water)</strong> operated by certified Volunteer <strong className="text-on-surface">Chloe Bennett ({activity.agentInfo.role})</strong> staged at Sector 7B Public Launch (1.2km transit distance).
                    </p>
                  </div>
                </div>

                {/* STEP 5: ACT */}
                <div className="relative group">
                  <div className="absolute -left-6 sm:-left-8 top-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-on-primary shadow-sm ring-4 ring-surface">
                    <span className="material-symbols-outlined text-sm">send</span>
                  </div>
                  <div className="bg-surface-container-lowest rounded-xl shadow-sm p-4 flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-surface-container px-1.5 py-0.5 rounded font-code-sm text-code-sm text-primary font-bold">STEP 05</span>
                        <span className="font-headline-sm text-headline-sm text-on-surface truncate">ACT: Autonomous Dispatch & Push Execution</span>
                      </div>
                      <span className="font-code-sm text-code-sm text-on-surface-variant">14:04:30 UTC</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">{activity.lastAction}</p>
                  </div>
                </div>

                {/* STEP 6: MONITOR */}
                <div className="relative group">
                  <div className="absolute -left-6 sm:-left-8 top-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-on-primary shadow-lg ring-4 ring-primary-fixed">
                    <span className="material-symbols-outlined text-sm animate-spin">autorenew</span>
                  </div>
                  <div className="bg-surface-container-lowest rounded-xl shadow-md p-4 flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-primary text-on-primary px-1.5 py-0.5 rounded font-code-sm text-code-sm font-bold">STEP 06</span>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-bold">MONITOR: Continuous Telemetry & Mission Tracking</span>
                      </div>
                      <span className="font-code-sm text-code-sm text-primary font-bold">14:05:00 → Present</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-surface-container-low rounded-lg p-2">
                      <div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Current Vessel Position</span>
                        <span className="font-code-sm text-code-sm font-bold text-on-surface block mt-0.5">{activity.agentInfo.position}</span>
                        <span className="font-label-sm text-label-sm text-primary block mt-0.5">Speed: {activity.agentInfo.speed} • Bearing: {activity.agentInfo.bearing}</span>
                      </div>
                      <div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Estimated Arrival (ETA)</span>
                        <span className="font-display font-headline-lg font-bold text-primary block mt-0.5">{activity.agentInfo.eta}</span>
                      </div>
                      <div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Replan Evaluator</span>
                        <span className="font-code-sm text-code-sm font-bold text-on-surface block mt-0.5">Sensor Drift: Nominal (0.4%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Tactical Feeds & Subsystem Outbox */}
            <div className="lg:col-span-4 flex flex-col space-y-4">
              {/* Map Card */}
              <div className="bg-surface-container-lowest rounded-xl shadow-sm p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">map</span>
                    <span className="font-headline-sm text-headline-sm text-on-surface">Sector 7B Spatial Map</span>
                  </div>
                  <span className="font-code-sm text-code-sm bg-surface-container px-1.5 py-0.5 rounded text-primary font-bold">LIVE TELEMETRY</span>
                </div>
                <div
                  className="w-full h-44 bg-cover bg-center rounded-lg relative overflow-hidden shadow-inner p-2 flex items-end justify-between"
                  style={{ backgroundImage: `url('${activity.mapSnapshot}')` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent pointer-events-none" />
                  <div className="relative z-10 flex items-center justify-between w-full text-surface">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                      <span className="font-code-sm font-semibold">Boat #4 En Route ({activity.agentInfo.distance})</span>
                    </div>
                    <span className="font-code-sm text-code-sm text-inverse-on-surface bg-inverse-surface/60 px-1.5 py-0.5 rounded">Grid S7B-09</span>
                  </div>
                </div>
              </div>

              {/* Subsystem Outbox */}
              <div className="bg-surface-container-lowest rounded-xl shadow-sm p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-secondary text-base">cell_tower</span>
                    <span className="font-headline-sm text-headline-sm text-on-surface">Subsystem Outbox</span>
                  </div>
                  <span className="font-code-sm text-code-sm text-on-surface-variant">Streaming</span>
                </div>
                <div className="space-y-2">
                  {activity.comms.map((comm, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-surface-container-low flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm font-code-sm font-bold text-primary">{comm.channel}</span>
                        <span className="font-code-sm text-code-sm text-on-surface-variant">{comm.time}</span>
                      </div>
                      <p className="font-code-sm text-code-sm text-on-surface">{comm.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Drone Telemetry Feed */}
              <div className="bg-surface-container-lowest rounded-xl shadow-sm p-4 flex flex-col gap-1">
                <span className="font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Autonomous Drone Feed (Sector 7B Bridge)
                </span>
                <div className="w-full h-32 rounded-lg overflow-hidden relative">
                  <img src={activity.droneFeed} alt="Drone Feed" className="w-full h-full object-cover" />
                  <div className="absolute top-1 left-1 bg-inverse-surface/80 text-inverse-on-surface font-code-sm text-code-sm px-1 py-0.5 rounded">
                    DRONE FEED #09 • 14:03 UTC
                  </div>
                </div>
                <span className="font-code-sm text-code-sm text-error font-medium">
                  Telemetry Corroboration: Bridge roadway impassable (Height: +42cm)
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AgentActivityPlaceholder