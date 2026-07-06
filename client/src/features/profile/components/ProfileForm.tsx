import type { ProfileFormValues } from "./profileFormUtils"
import {type  ChangeEvent } from "react"

type ProfileField = keyof ProfileFormValues

// Removed profile_picture from the fields array
const textFields: Array<{
  name: ProfileField
  label: string
  placeholder: string
  multiline?: boolean
}> = [
  { name: "full_name", label: "Full name", placeholder: "Your name" },
  { name: "bio", label: "Bio", placeholder: "A short introduction", multiline: true },
  { name: "company", label: "Company", placeholder: "Where you work or study" },
  { name: "job_title", label: "Job title", placeholder: "Software Engineer, Student, Founder" },
  { name: "job_industry", label: "Industry", placeholder: "Technology, Finance, Education" },
  { name: "job_description", label: "Job description", placeholder: "What you do", multiline: true },
  { name: "location", label: "Location", placeholder: "City, country" },
]

export default function ProfileForm({
  values,
  onChange,
  disabled = false,
}: {
  values: ProfileFormValues
  onChange: (values: ProfileFormValues) => void
  disabled?: boolean
}) {
  
  const updateField = (field: ProfileField, value: any) => {
    onChange({ ...values, [field]: value })
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      updateField("image_file", file)
    }
  }

  const getValue = (field: ProfileField): string => {
    const val = values[field]
    return typeof val === "string" ? val : ""
  }

  // Determine which image to show in preview
  const previewSrc = values.image_file 
    ? URL.createObjectURL(values.image_file) 
    : values.profile_picture

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Dedicated Photo Upload Section */}
      <div className="sm:col-span-2 flex items-center gap-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm bg-slate-200">
          {previewSrc ? (
            <img src={previewSrc} className="h-full w-full object-cover" alt="Avatar" />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <span className="block text-sm font-bold text-slate-900">Profile Photo</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled}
            className="text-xs file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Recommended: Square JPG or PNG</p>
        </div>
      </div>

      {/* Render Text Fields */}
      {textFields.map((field) => (
        <label key={field.name} className={field.multiline ? "sm:col-span-2" : undefined}>
          <span className="field-label">{field.label}</span>
          {field.multiline ? (
            <textarea
              value={getValue(field.name)}
              onChange={(e) => updateField(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={disabled}
              rows={field.name === "bio" ? 3 : 4}
              className="form-field"
            />
          ) : (
            <input
              type="text"
              value={getValue(field.name)}
              onChange={(e) => updateField(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={disabled}
              className="form-field"
            />
          )}
        </label>
      ))}
    </div>
  )
}
