import React, { useState } from "react"
import axios from "axios"
import MaterialSymbol from "../components/MaterialSymbol"

const inputCls =
  "w-full px-md py-sm rounded-lg bg-surface-container-low text-on-surface font-body text-body-md outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline"

export default function RegisterPage({ onRegistered, onShowLogin }) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [role, setRole] = useState("citizen")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (password !== confirm) {
      setError("Passwords do not match")
      return
    }
    setSubmitting(true)
    try {
      await axios.post("/api/v1/auth/register", {
        email,
        full_name: fullName,
        password,
        role,
      })
      onRegistered(email)
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === "string" ? detail : "Registration failed — the account may already exist.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-md bg-surface">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-xl shadow-[0_20px_25px_-5px_rgba(19,27,46,0.12),0_8px_10px_-6px_rgba(19,27,46,0.08)] overflow-hidden">
        <div className="h-1.5 w-full bg-surface-container">
          <div className="h-full w-1/4 bg-primary-container" />
        </div>
        <div className="p-lg sm:p-2xl flex flex-col gap-lg">
          {/* Brand header */}
          <div className="flex flex-col items-center text-center gap-xs">
            <div className="w-16 h-16 rounded-xl bg-primary-container text-on-primary flex items-center justify-center mb-xs shadow-sm">
              <MaterialSymbol name="crisis_alert" fill className="text-3xl" />
            </div>
            <span className="font-label text-label-sm uppercase tracking-wider text-secondary font-semibold">
              Incident Command Operations
            </span>
            <h1 className="font-headline text-headline-lg text-on-surface tracking-tight">Create Account</h1>
            <p className="font-body text-body-md text-on-surface-variant">Emergency personnel self-registration</p>
          </div>

          {/* Protocol notice */}
          <div className="bg-surface-container-low rounded-lg p-md flex items-start gap-sm">
            <MaterialSymbol name="shield_with_heart" fill className="text-primary text-xl shrink-0" />
            <p className="font-body text-body-sm text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface font-label text-label-sm uppercase tracking-wide">Protocol Notice: </strong>
              Admin &amp; Command accounts are provisioned by the Incident Commander. Self-registration is restricted to
              citizens and field volunteers.
            </p>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center gap-sm rounded-lg bg-error-container text-on-error-container px-md py-sm font-body text-body-sm">
                <MaterialSymbol name="error" className="text-base" /> {error}
              </div>
            )}
            <div className="flex flex-col gap-xs">
              <label htmlFor="reg-name" className="font-label text-label-md text-on-surface font-semibold">
                Full Name
              </label>
              <input id="reg-name" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Jane Doe" className={inputCls} />
            </div>
            <div className="flex flex-col gap-xs">
              <label htmlFor="reg-email" className="font-label text-label-md text-on-surface font-semibold">
                Official Email Address
              </label>
              <input id="reg-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.org" className={inputCls} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <div className="flex flex-col gap-xs">
                <label htmlFor="reg-password" className="font-label text-label-md text-on-surface font-semibold">
                  Password
                </label>
                <input id="reg-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} placeholder="Min. 8 characters" className={inputCls} />
              </div>
              <div className="flex flex-col gap-xs">
                <label htmlFor="reg-confirm" className="font-label text-label-md text-on-surface font-semibold">
                  Confirm Password
                </label>
                <input id="reg-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required placeholder="Repeat password" className={inputCls} />
              </div>
            </div>
            <div className="flex flex-col gap-xs">
              <span className="font-label text-label-md text-on-surface font-semibold">Register As</span>
              <div className="grid grid-cols-2 gap-sm">
                {[
                  { value: "citizen", icon: "person", label: "Citizen" },
                  { value: "volunteer", icon: "volunteer_activism", label: "Field Volunteer" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    className={`flex items-center justify-center gap-sm px-md py-sm rounded-lg font-label text-label-md font-semibold transition-colors ${
                      role === opt.value
                        ? "bg-primary-container text-on-primary shadow-sm"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    <MaterialSymbol name={opt.icon} className="text-lg" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="mt-xs h-[42px] rounded-lg bg-primary-container text-on-primary font-label text-label-md font-semibold hover:bg-primary transition-colors disabled:opacity-60 flex items-center justify-center gap-sm"
            >
              <MaterialSymbol name="person_add" className="text-lg" />
              {submitting ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="text-center font-body text-body-sm text-on-surface-variant">
            Already have an account?{" "}
            <button type="button" onClick={onShowLogin} className="text-primary font-semibold hover:underline">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </main>
  )
}
