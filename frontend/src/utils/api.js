import axios from "axios"

// All API calls go through this instance
// Base URL comes from .env → VITE_API_URL=http://localhost:5000
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Automatically attach the right token to every request
api.interceptors.request.use((config) => {
  // Staff routes: token stored in localStorage after login
  const staffToken = localStorage.getItem("staffToken")

  // Customer routes: token comes from QR URL → ?token=eyJ...
  const params = new URLSearchParams(window.location.search)
  const tableToken = params.get("token")

  if (staffToken) {
    config.headers.Authorization = `Bearer ${staffToken}`
  } else if (tableToken) {
    config.headers.Authorization = `Bearer ${tableToken}`
  }

  return config
})

export default api