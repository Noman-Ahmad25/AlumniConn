export interface Post {
  id: number
  user_id: number
  username: string
  profile_picture?: string | null
  content?: string | null
  image_url?: string | null
  is_opportunity: boolean
  likes_count: number
  liked_by_current_user: boolean
  comments_count: number
  created_at: string
  connection_status?: string
}
