import React, { useEffect, useState } from "react"
import axios from "axios"
import MaterialSymbol from "../components/MaterialSymbol"

function VolunteersPage() {
  const [volunteers, setVolunteers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get("/api/v1/volunteers").then(r => setVolunteers(r.data)).catch(() => setVolunteers([])).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading volunteers…</div>

  return (
    <main className="pt-16 bg-surface min-h-screen w-full px-6 py-8">
      {/* Volunteer Command Console Header */}
      <section className="w-full bg-surface-container-lowest rounded-xl p-4 shadow-sm mb-6 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-full blur-sm pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2 min-w-0">
            <img
              className="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-surface-container-high"
              dataAlt="Close up professional portrait of female rescue command volunteer Sarah Jenkins wearing tactical blue high-visibility field vest and radio earpiece inside disaster operation headquarters with soft natural emergency console lighting."
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuADCUYU1jWFqOdQJ32Q049pg8ZYpfPKGI52HlM1j_cnMlA6fN4x6t1BIgVqwut1iiRGDYLV327GXb-uEWudLjzM1I3FMv_XNXYyz5Mkw7C2LfmCkFwURcIovuviW7biKBPaJ4OOXuzItQEAY02ovsIwgFBteMrFct8grsfniuL63R5GIjcz5Jl8PW7UM_3PrP-Kgtaxep9tBwBdCy-WTjYwEBXpw762tHongGfE5mD-iscDnigAFdSVlw"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">My Volunteer Station</span>
              <span className="text-outline text-xs">/</span>
              <span className="font-code-sm text-code-sm px-1 py-0.5 rounded bg-surface-container-high text-on-surface font-semibold">CALLSIGN: ECHO-4</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-headline-md text-headline-md text-on-surface truncate">Sarah Jenkins, Lead Field Responder</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
              <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">location_on</MaterialSymbol>
              <span>Sector 4 Incident Command Hub — Radio Ch. 12 (Direct Tactical)</span>
            </p>
          </div>
        </div>
      </section>

      {/* Volunteer Availability & Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-surface-container-lowest rounded-xl p-3 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-medium">Total Registered</span>
            <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">badge</MaterialSymbol>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-metric-num text-3xl font-bold tracking-tight text-on-surface">340</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Full Roster</span>
          </div>
          <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" styleName="width: 100%"></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-3 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-medium">Active in Field</span>
            <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">person_pin_circle</MaterialSymbol>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-metric-num text-3xl font-bold tracking-tight text-[#b45309]">118</span>
            <span className="font-label-sm text-label-sm text-[#b45309] font-semibold">34.7% Assigned</span>
          </div>
          <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-[#d97706] rounded-full" styleName="width: 34.7%"></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-3 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-medium">Standby Ready</span>
            <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">how_to_reg</MaterialSymbol>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-metric-num text-3xl font-bold tracking-tight text-[#16a34a]">182</span>
            <span className="font-label-sm text-label-sm text-[#16a34a] font-semibold">53.5% Immediate</span>
          </div>
          <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-[#16a34a] rounded-full" styleName="width: 53.5%"></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-3 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-medium">Off-Duty / Resting</span>
            <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">bedtime</MaterialSymbol>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-metric-num text-3xl font-bold tracking-tight text-on-surface-variant">40</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">11.8% Rest Cycle</span>
          </div>
          <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-outline rounded-full" styleName="width: 11.8%"></div>
          </div>
        </div>
      </section>

      {/* Volunteer Filter & Actions */}
      <div className="bg-surface-container-lowest rounded-xl p-3 shadow-sm mb-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">search</span>
          <input
            className="w-full pl-8 pr-space-md py-1.5 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline text-body-md font-body-md outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Search volunteer name, callsign, radio ID, or credentials..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container transition-colors font-label-md text-label-md" type="button">
            <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">broadcast_on_personal</MaterialSymbol>
            <span>+ Dispatch Mobilization Alert</span>
          </button>
          <button className="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant transition-colors" title="Export Roster" type="button">
            <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">download</MaterialSymbol>
          </button>
        </div>
      </div>

      {/* Volunteer Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {volunteers.map((vol, idx) => (
          <div
            key={vol.id}
            className="bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
          >
            <div className="p-3 flex flex-col flex-1">
              <div className="flex items-start justify-between gap-2 mb-2">
                <img
                  className="w-10 h-10 rounded-full object-cover shrink-0 shadow-sm"
                  dataAlt="Emergency medical responder Marcus Vance wearing clinical scrub jacket and blue tactical badge ID against an illuminated command center operations background."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYRU9Q1l1YoaK3yXjMxGIsFEbt8lM4fJU2aWPFQavcjI5osWG6uIwMX_Phonewf3jT4cgPdRBx3zZpHDFIxNwqVfg2pviZ9Fqwm_Kp4f3v3QuKeQZQbcHSzEC7jdTZEilbgrZYPplz9CkZT8cRTyYsKLt5x7fyGVwgMQi32nDj0BqlTYjvJyrEsEnCG7CBMQek1kxM3jHucgeQXU40u4DVIIMHxjbTBghd45bqwtaBMTGBJd6BjitTkQ"
                />
                <div className="flex flex-col min-w-0">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface truncate">{vol.name}</h3>
                  <div className="flex items-center gap-1">
                    <span className="font-code-sm text-code-sm text-primary font-semibold">{vol.callsign}</span>
                    <span className="text-outline text-xs ml-0.5">⎋</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant font-mono text-xs">ID: #{vol.id}</span>
                  </div>
                </div>
              </div>

              <span className="shrink-0 px-2 py-0.5 rounded-full bg-[color] text-[color] font-label-sm text-label-sm font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full"></span>{vol.status}
              </span>
            </div>

            <div className="p-1.5 flex items-center justify-between">
              <MaterialSymbol fontVariationSettings="FILL:wght:GRAD:opsz 20..48" styleName="font-variation-settings: 'FILL' 1;">info</MaterialSymbol>
              <button className="text-primary font-body-sm text-body-sm transition-colors">Details</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

export default VolunteersPage