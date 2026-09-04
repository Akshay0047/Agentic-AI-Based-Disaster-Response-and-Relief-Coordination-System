import MaterialSymbol from "./MaterialSymbol"

/** Neutral surface card used throughout the app (Stitch: surface-container-lowest, rounded-xl, soft shadow) */
export function Card({ children, className = "", ...rest }) {
  return (
    <div className={`bg-surface-container-lowest rounded-xl shadow-sm ${className}`} {...rest}>
      {children}
    </div>
  )
}

/** KPI tile: label + big metric + optional icon/progress (Stitch bento metrics) */
export function StatCard({ label, value, subvalue, icon, iconClass = "text-primary", barPct = null, barClass = "bg-primary-container", alert = false }) {
  return (
    <Card className={`p-lg flex flex-col justify-between gap-sm hover:shadow-md transition-shadow ${alert ? "ring-1 ring-error/40" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="font-label text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">{label}</span>
        {icon && <MaterialSymbol name={icon} className={`text-xl ${iconClass}`} />}
      </div>
      <div className="flex items-baseline gap-xs">
        <span className={`font-metric text-[28px] leading-9 font-bold tracking-tight ${alert ? "text-error" : "text-on-surface"}`}>{value}</span>
        {subvalue && <span className="font-code text-code-sm text-on-surface-variant">{subvalue}</span>}
      </div>
      {barPct != null && (
        <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
          <div className={`h-full rounded-full ${barClass}`} style={{ width: `${Math.min(100, Math.max(0, barPct))}%` }} />
        </div>
      )}
    </Card>
  )
}

const BADGE_TONES = {
  blue: "bg-primary-fixed text-on-primary-fixed",
  "blue-solid": "bg-primary-container text-on-primary",
  cyan: "bg-secondary-fixed text-on-secondary-fixed",
  red: "bg-error-container text-on-error-container",
  "red-solid": "bg-error text-on-error",
  amber: "bg-tertiary-fixed text-on-tertiary-fixed",
  gray: "bg-surface-container-high text-on-surface-variant",
  green: "bg-[#f0fdf4] text-[#16a34a]",
}

/** Small pill badge. `tone` picks the Stitch surface/error token pair. */
export function Badge({ tone = "gray", pulse = false, dot = false, children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-sm py-[3px] font-label text-label-sm font-semibold uppercase tracking-wider ${BADGE_TONES[tone] ?? BADGE_TONES.gray} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${tone.startsWith("red") ? "bg-error" : tone === "cyan" ? "bg-secondary" : tone === "green" ? "bg-[#16a34a]" : "bg-primary"} ${pulse ? "animate-pulse" : ""}`} />}
      {children}
    </span>
  )
}

/** Loading state (used by every data section) */
export function Loading({ label = "Loading…" }) {
  return (
    <div className="flex items-center justify-center gap-md py-3xl text-on-surface-variant">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
      </span>
      <span className="font-label text-label-md">{label}</span>
    </div>
  )
}

/** Error state with optional retry */
export function ErrorState({ message = "Something went wrong", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-md py-3xl text-center">
      <div className="w-12 h-12 rounded-xl bg-error-container text-on-error-container flex items-center justify-center">
        <MaterialSymbol name="error" fill />
      </div>
      <p className="font-body text-body-md text-on-surface-variant max-w-md">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="px-md py-sm rounded-lg bg-primary-container text-on-primary font-label text-label-md hover:bg-primary transition-colors">
          Retry
        </button>
      )}
    </div>
  )
}

/** Empty state with icon + guidance */
export function EmptyState({ icon = "inbox", title = "Nothing here yet", detail, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-md py-3xl text-center">
      <div className="w-14 h-14 rounded-xl bg-surface-container text-on-surface-variant flex items-center justify-center">
        <MaterialSymbol name={icon} className="text-3xl" />
      </div>
      <p className="font-headline text-headline-sm text-on-surface">{title}</p>
      {detail && <p className="font-body text-body-sm text-on-surface-variant max-w-md">{detail}</p>}
      {action}
    </div>
  )
}

/** Consistent table shell used by all data sections */
export function DataTable({ columns, children, footer }) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse min-w-[640px]">
        <thead>
          <tr className="bg-surface-container-low text-on-surface-variant font-label text-label-sm uppercase tracking-wider select-none">
            {columns.map((c) => (
              <th key={c.label} className={`py-md px-md font-semibold ${c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : ""}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container-low">{children}</tbody>
      </table>
      {footer}
    </div>
  )
}
