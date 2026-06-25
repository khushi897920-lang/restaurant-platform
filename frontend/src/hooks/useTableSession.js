import { useNavigate } from "react-router-dom"

export function useTableSession() {
  const navigate = useNavigate()
  const params = new URLSearchParams(window.location.search)
  const token = params.get("token")

  // If no token in URL at all → invalid access
  const isValid = !!token

  // Pass this token in Authorization header (api.js handles it automatically)
  // This hook mainly lets components CHECK if there's a valid session
  // and redirect if not

  const redirectIfInvalid = () => {
    if (!token) {
      navigate("/")  // send them to landing page
    }
  }

  return { token, isValid, redirectIfInvalid }
}