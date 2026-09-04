import React from "react"
import ReactDOM from "react-dom/client"
import axios from "axios"
import App from "./App.jsx"

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
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const payload = JSON.parse(atob(base64))
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

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    <App jwt={getJwt()} role={getRole()} />
  </React.StrictMode>
)