import React, { useState } from "react"
import axios from "axios"

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async e => {
    e.preventDefault()
    setError("")
    try {
      const r = await axios.post("/api/v1/auth/login", { email, password })
      window.localStorage.setItem("jwt", r.data.access_token)
      onLogin()
    } catch (e) {
      setError("Login failed — check email/password")
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa" }}>
      <div style={{ background: "#fff", padding: "2rem 3rem", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", maxWidth: "400px", width: "100%" }}>
        <h2 style={{ marginTop: 0 }} >Sign In</h2>
        {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit">Sign In</button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage