import type { AuthTokenPayload, UserRole } from "../types/auth"

const AUTH_CHANGE_EVENT = "auth-change"

export function getAuthToken() {
  return localStorage.getItem("access_token")
}

export function hasAuthToken() {
  return getTokenPayload() !== null
}

export function setAuthToken(token: string) {
  localStorage.setItem("access_token", token)
  notifyAuthChanged()
}

export function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
}

export function logout() {
  localStorage.removeItem("access_token")
  notifyAuthChanged()
}

export function getTokenPayload(): AuthTokenPayload | null {
  const decoded = decodeTokenPayload()
  if (
    decoded &&
    typeof decoded.user_id === "number" &&
    (typeof decoded.college_id === "number" || decoded.college_id === null) &&
    isUserRole(decoded.role)
  ) {
    const exp = typeof decoded.exp === "number" ? decoded.exp : undefined
    if (exp && exp <= Math.floor(Date.now() / 1000)) return null

    return {
      user_id: decoded.user_id,
      college_id: decoded.college_id,
      role: decoded.role,
      exp,
    }
  }

  return null
}

export function getCurrentUserIdFromToken() {
  const decoded = decodeTokenPayload()
  return typeof decoded?.user_id === "number" ? decoded.user_id : null
}

export function getCurrentUserRoleFromToken() {
  return getTokenPayload()?.role ?? null
}

export function hasRole(roles: UserRole[]) {
  const role = getCurrentUserRoleFromToken()
  return Boolean(role && roles.includes(role))
}

export function getRoleHomePath(role: UserRole | null) {
  if (role === "super_admin") return "/super-admin/college-requests"
  if (role === "admin") return "/admin/alumni-requests"
  return "/feed"
}

function decodeTokenPayload(): Record<string, unknown> | null {
  const token = getAuthToken()
  const payload = token?.split(".")[1]
  if (!payload) return null

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    const normalized = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=")
    const decoded = JSON.parse(window.atob(normalized))
    return decoded && typeof decoded === "object" ? decoded : null
  } catch {
    return null
  }
}

function isUserRole(value: unknown): value is UserRole {
  return value === "super_admin" || value === "admin" || value === "alumni" || value === "student"
}

export { AUTH_CHANGE_EVENT }
