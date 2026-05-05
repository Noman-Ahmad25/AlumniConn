import axios from "axios"
import { logout } from "../utils/auth"

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
      if (window.location.pathname !== "/login") {
        window.location.assign("/login")
      }
    }

    return Promise.reject(error)
  }
)
