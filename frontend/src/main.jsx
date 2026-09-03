import React from "react"
import ReactDOM from "react-dom/client"
import axios from "axios"
import App from "./App.jsx"

const root = ReactDOM.createRoot(document.getElementById("root"))

function getJwt() {
  try {
    return window.localStorage.getItem("jwt")
  } catch {
    return null
  }
}

function getRole() {
  try {
    const token = getJwt()
    if (!token) return null
    // JWT payload is the middle segment, base64url encoded
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").decode("utf-8")
    )
    return payload.role ?? null
  } catch {
    return null
  }
}

axios.defaults.baseURL = "http://127.0.0.1:8000"
axios.defaults.withCredentials = false
if (getJwt()) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${getJwt()}`
}

ReactDOM.render(
  <React.StrictMode>
    <App jwt={getJwt()} role={getRole()} />
  </React.StrictMode>,
  root
)