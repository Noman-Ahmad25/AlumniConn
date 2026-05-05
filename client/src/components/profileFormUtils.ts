import type { Profile, ProfileUpdateInput } from "../types/profile"

export interface ProfileFormValues {
  full_name: string
  profile_picture: string // For existing URL preview
  image_file: File | null     // For the new upload
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
    profile_picture: profile?.profile_picture ?? "", // Show existing
    image_file: null,                                   // Empty on load
    bio: profile?.bio ?? "",
    company: profile?.company ?? "",
    job_title: profile?.job_title ?? "",
    job_industry: profile?.job_industry ?? "",
    job_description: profile?.job_description ?? "",
    location: profile?.location ?? "",
  }
}

export function formToProfilePayload(values: ProfileFormValues): ProfileUpdateInput & { image_file?: File | null } {
  // 1. Destructure to separate the preview URL from the rest
  const { profile_picture, image_file, ...rest } = values; 

  // 2. Clean up text fields (trim and nullify empty strings)
  const textPayload = Object.fromEntries(
    Object.entries(rest).map(([key, value]) => [
      key,
      value.trim() || null,
    ])
  ) as ProfileUpdateInput;

  // 3. Return combined payload with the actual file
  return {
    ...textPayload,
    image_file: image_file 
  };
}
