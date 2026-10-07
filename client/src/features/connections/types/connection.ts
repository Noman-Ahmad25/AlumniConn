export interface DiscoverUser {
  id: number
  username: string
  full_name?: string | null
  job_title?: string | null
  company?: string | null
  location?: string | null
  profile_picture?: string | null
  connection_status: "none" | "pending_sent" | "pending_received"
}

export interface DiscoverFilterParams {
  skip?: number
  limit?: number
  search?: string | null
  major?: string | null
  grad_year?: number | null
  company?: string | null
  location?: string | null
  skill?: string | null
}

export interface ConnectionUser {
  id: number
  username: string
  profile_pic_url?: string | null
}

export interface Connection {
  id: number
  status: "pending" | "accepted" | "rejected"
  user: ConnectionUser
}
