import React, { useState } from "react"
import axios from "axios"
import MaterialSymbol from "../components/MaterialSymbol"

function RegisterPage({ onRegister }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async e => {
    e.preventDefault()
    setError("")
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    try {
      const r = await axios.post("/api/v1/auth/register", { email, password, role: "citizen" })
      window.localStorage.setItem("jwt", r.data.access_token)
      onRegister()
    } catch (e) {
      setError("Registration failed — try different email or contact admin")
    }
  }

  return (
    <main className="w-full min-h-screen flex items-center justify-center p-6 bg-surface">
      <div className="flex flex-col w-full items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden relative">
          <div className="h-1.5 w-full bg-surface-container">
            <div className="h-full bg-primary-container transition-all duration-300 w-3/4" id="form-progress"></div>
          </div>
          <div className="p-8 sm:p-10 flex flex-col gap-6">
            {/* Brand & Header */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-16 h-16 rounded-xl bg-surface-container-high flex items-center justify-center p-2 mb-3 shadow-sm">
                <img
                  alt="Relief Coordinator Emblem"
                  className="w-full h-full object-contain rounded-lg"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtAmWYMjqa0enddslblIihGmsiqn6_jCx6PfCJZ4-Nhs-nFw3l7kxijWinsgM_BeDQFDfBLZjFPgGtG58LxIw_nRgR1QxNwM2zrmEIewQ_dzf_OSsbgL-mMgGuz79bxKjwaMMpS9a4o0NMDLdsW000CxjHMM2JY0zyNE_RQMyiCxMjjMlIxJhtZ7jJSkClvAHSAJ3bxsDEek3nCbItq95_hUNjl8bNEkbyxNbzjYRkYqM65W7mX90fjw"
                />
                <span class="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-container"></span>
                </span>
              </div>
              <span class="font-label-sm text-label-sm uppercase tracking-wider text-secondary mb-1">Incident Command Operations</span>
              <h1 className="font-headline-lg text-headline-lg text-on-surface">Relief Coordinator</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Create Emergency Personnel Account</p>
            </div>
            {/* Regulatory Notice Callout */}
            <div className="bg-surface-container-low rounded-xl p-3.5 flex items-start gap-3 shadow-sm">
              <span
                className="material-symbols-outlined text-primary-container text-[20px] shrink-0 mt-0.5"
                styleName="font-variation-settings: 'FILL' 1;"
              >
                shield_with_heart
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                <strong class="text-on-surface font-headline-sm text-label-sm uppercase tracking-wide">Protocol Notice:</strong>
                Admin & Command accounts are provisioned directly by the Incident Commander. Self-registration is restricted to Citizens and Field Volunteers.
              </p>
            </div>
            {/* Form */}
            <form className="mt-6 flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-on-surface flex items-center justify-between" for="email-input">
                  <span>Official Email Address</span>
                </label>
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-on-surface flex items-center justify-between" for="password-input">
                  <span>Password</span>
                </label>
                <input
                  id="password-input"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-on-surface flex items-center justify-between" for="confirm-password-input">
                  <span>Confirm Password</span>
                </label>
                <input
                  id="confirm-password-input"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-primary-container text-on-primary font-headline-sm text-label-md shadow-sm hover:bg-primary transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined">person_add</span>
                Create Account</button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}

export default RegisterPage