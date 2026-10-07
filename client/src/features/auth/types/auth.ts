export type UserRole = "super_admin" | "admin" | "alumni" | "student"

export interface AuthTokenPayload {
  user_id: number
  college_id: number | null
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
  college_slug: string
  role: "student" | "alumni"
}

export interface LoginPayload {
  username_or_email: string
  password: string
  college_slug: string
}

export interface SuperAdminLoginPayload {
  username_or_email: string
  password: string
}

export interface DemoEmailEvent {
  id: string
  to_email: string
  subject: string
  html_body: string
  action_type: string
  action_url: string | null
  created_at: string
}

export interface DemoEmailsResponse {
  emails: DemoEmailEvent[]
  total: number
}

export interface EmailModeResponse {
  email_mode: "demo" | "real"
}

export interface ForgotPasswordPayload {
  username_or_email: string
  college_slug: string
}

export interface ResetPasswordPayload {
  token: string
  new_password: string
}

export interface UserResponse {
  id: number
  username: string
  email: string
  role: UserRole
  is_active: boolean
}
