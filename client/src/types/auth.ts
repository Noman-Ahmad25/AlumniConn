export type UserRole = "super_admin" | "admin" | "alumni" | "student"

export interface AuthTokenPayload {
  user_id: number
  college_id: number
  role: UserRole
  exp?: number
}

export interface TokenResponse {
  access_token: string
  token_type: "bearer"
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
  college_id: number
}

export interface SuperAdminLoginPayload {
  email: string
  password: string
}

export interface UserResponse {
  id: number
  username: string
  email: string
  role: UserRole
  is_active: boolean
}

export interface ActivationVerifyResponse {
  valid: boolean
  detail: string
}

export interface ActivationPayload {
  token: string
  password: string
}
