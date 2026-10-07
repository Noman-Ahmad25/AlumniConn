import axios from "axios"
import { logout } from "../features/auth/utils/auth"

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      logout()
      const match = window.location.pathname.match(/^\/c\/([^/]+)/)
      const loginPath = match ? `/c/${match[1]}/login` : "/login"
      if (window.location.pathname !== loginPath) {
        window.location.assign(loginPath)
      }
    }

    return Promise.reject(error)
  }
)
