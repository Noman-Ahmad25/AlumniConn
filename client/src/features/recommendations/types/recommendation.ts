export interface RecommendationItem {
  id: number
  user_id: number
  username: string
  full_name?: string | null
  profile_picture?: string | null
  bio?: string | null
  company?: string | null
  job_title?: string | null
  job_industry?: string | null
  job_description?: string | null
  location?: string | null
  skills?: string[] | null
  interests?: string[] | null
  grad_year?: number | null
  major?: string | null
  connection_status?: string | null
  match_score: number
  explanation: string
}

export interface PaginatedRecommendations {
  items: RecommendationItem[]
  next_cursor?: number | null
}
