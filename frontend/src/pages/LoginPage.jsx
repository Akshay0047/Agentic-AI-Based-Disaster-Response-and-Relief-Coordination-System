import React, { useState } from "react"
import axios from "axios"
import MaterialSymbol from "../components/MaterialSymbol"

const inputCls =
  "w-full px-md py-sm rounded-lg bg-surface-container-low text-on-surface font-body text-body-md outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline"

export default function LoginPage({ onLogin, onShowRegister, initialEmail = "" }) {
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      const r = await axios.post("/api/v1/auth/login", { email, password })
      onLogin(r.data.access_token)
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          (err.code === "ERR_NETWORK" ? "Cannot reach the API service." : "Sign-in failed. Check your credentials.")
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-md bg-surface">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-[0_20px_25px_-5px_rgba(19,27,46,0.12),0_8px_10px_-6px_rgba(19,27,46,0.08)] overflow-hidden">
        <div className="h-1.5 w-full bg-surface-container">
          <div className="h-full w-3/4 bg-primary-container" />
        </div>
        <div className="p-lg sm:p-2xl flex flex-col gap-lg">
          {/* Brand header */}
          <div className="flex flex-col items-center text-center gap-xs">
            <div className="relative w-16 h-16 rounded-xl bg-primary-container text-on-primary flex items-center justify-center mb-xs shadow-sm">
              <MaterialSymbol name="crisis_alert" fill className="text-3xl" />
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 border-2 border-surface-container-lowest bg-primary" />
              </span>
            </div>
            <span className="font-label text-label-sm uppercase tracking-wider text-secondary font-semibold">
              Incident Command Operations
            </span>
            <h1 className="font-headline text-headline-lg text-on-surface tracking-tight">Relief Coordinator</h1>
            <p className="font-body text-body-md text-on-surface-variant">AI-coordinated disaster response</p>
          </div>

          {/* Protocol notice */}
          <div className="bg-surface-container-low rounded-lg p-md flex items-start gap-sm">
            <MaterialSymbol name="shield_with_heart" fill className="text-primary text-xl shrink-0" />
            <p className="font-body text-body-sm text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface font-label text-label-sm uppercase tracking-wide">Protocol Notice: </strong>
              Admin &amp; Command accounts are provisioned by the Incident Commander. Sign in with your issued credentials.
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
              <label htmlFor="login-email" className="font-label text-label-md text-on-surface font-semibold">
                Official Email Address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="operator@relief.example"
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-xs">
              <label htmlFor="login-password" className="font-label text-label-md text-on-surface font-semibold">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className={inputCls}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="mt-xs h-[42px] rounded-lg bg-primary-container text-on-primary font-label text-label-md font-semibold hover:bg-primary transition-colors disabled:opacity-60 flex items-center justify-center gap-sm"
            >
              <MaterialSymbol name="login" className="text-lg" />
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-center font-body text-body-sm text-on-surface-variant">
            Citizen or field volunteer?{" "}
            <button type="button" onClick={onShowRegister} className="text-primary font-semibold hover:underline">
              Create an account
            </button>
          </p>
        </div>
      </div>
    </main>
  )
}
