export interface Profile {
  id: number
  user_id: number
  username: string
  connection_status?: "self" | "none" | "pending" | "connected"
  full_name?: string | null
  profile_picture?: string | null
  bio?: string | null
  company?: string | null
  job_title?: string | null
  job_industry?: string | null
  job_description?: string | null
  location?: string | null
}

export type ProfileUpdateInput = Partial<
  Pick<
    Profile,
    | "full_name"
    | "profile_picture"
    | "bio"
    | "company"
    | "job_title"
    | "job_industry"
    | "job_description"
    | "location"
  >
>
