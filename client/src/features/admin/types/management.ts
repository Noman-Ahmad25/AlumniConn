export interface PlatformActivityItem {
  id: string
  type: string
  title: string
  description: string
  status?: string
  timestamp: string
}

export interface PlatformOverview {
  total_colleges: number
  active_colleges: number
  pending_requests: number
  total_users: number
  alumni_count: number
  student_count: number
  recent_activity: PlatformActivityItem[]
}

export interface AdminCollegeUser {
  id: number
  username: string
  email: string
  full_name: string | null
}

export interface AdminCollege {
  id: number
  name: string
  slug: string | null
  domain: string
  location: string | null
  established_year: number | null
  description: string | null
  is_approved: boolean
  is_active: boolean
  created_at: string | null
  total_users: number
  alumni_count: number
  student_count: number
  admin_user: AdminCollegeUser | null
}

export interface AdminUser {
  id: number
  username: string
  email: string
  role: string
  is_active: boolean
  email_verified: boolean
  college_id: number | null
  college_name: string | null
  college_slug: string | null
  full_name: string | null
  job_title: string | null
  company: string | null
  major: string | null
  grad_year: number | null
  location: string | null
  created_at: string | null
  profile_picture: string | null
}

export type DemoRole = "super_admin" | "college_admin" | "alumni" | "student"
