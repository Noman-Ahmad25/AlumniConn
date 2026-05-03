export interface DiscoverUser {
  id: number
  username: string
  profile_picture?: string | null
  connection_status: "none" | "pending_sent" | "pending_received"
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
