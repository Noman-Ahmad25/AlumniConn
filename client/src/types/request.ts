export type RequestStatus = "pending" | "approved" | "rejected"

export interface CollegeRequestCreate {
  collegeName: string
  domain: string
  location: string
  establishedYear: number
  description?: string
  adminName: string
  adminEmail: string
  adminPassword: string
}

export interface CollegeRequest {
  id: number
  name: string
  domain: string
  location?: string | null
  established_year?: number | null
  description?: string | null
  admin_name: string
  admin_email: string
  requested_by?: number | null
  status: RequestStatus
  reviewed_by?: number | null
  rejection_reason?: string | null
  college_id?: number | null
  created_at: string
  reviewed_at?: string | null
}

export interface AlumniRequest {
  id: number
  user_id: number
  college_id: number
  status: RequestStatus
  reviewed_by?: number | null
  rejection_reason?: string | null
  created_at: string
  reviewed_at?: string | null
}
