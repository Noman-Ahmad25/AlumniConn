import type { Profile, ProfileUpdateInput } from "../types/profile"

export interface ProfileFormValues {
  full_name: string
  profile_picture: string
  bio: string
  company: string
  job_title: string
  job_industry: string
  job_description: string
  location: string
}

export function profileToForm(profile?: Profile | null): ProfileFormValues {
  return {
    full_name: profile?.full_name ?? "",
    profile_picture: profile?.profile_picture ?? "",
    bio: profile?.bio ?? "",
    company: profile?.company ?? "",
    job_title: profile?.job_title ?? "",
    job_industry: profile?.job_industry ?? "",
    job_description: profile?.job_description ?? "",
    location: profile?.location ?? "",
  }
}

export function formToProfilePayload(values: ProfileFormValues): ProfileUpdateInput {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      value.trim() || null,
    ])
  ) as ProfileUpdateInput
}
