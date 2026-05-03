import type { ProfileFormValues } from "./profileFormUtils"

type ProfileField = keyof ProfileFormValues

const fields: Array<{
  name: ProfileField
  label: string
  placeholder: string
  multiline?: boolean
}> = [
  {
    name: "full_name",
    label: "Full name",
    placeholder: "Your name",
  },
  {
    name: "profile_picture",
    label: "Profile picture URL",
    placeholder: "https://example.com/photo.jpg",
  },
  {
    name: "bio",
    label: "Bio",
    placeholder: "A short introduction",
    multiline: true,
  },
  {
    name: "company",
    label: "Company",
    placeholder: "Where you work or study",
  },
  {
    name: "job_title",
    label: "Job title",
    placeholder: "Software Engineer, Student, Founder",
  },
  {
    name: "job_industry",
    label: "Industry",
    placeholder: "Technology, Finance, Education",
  },
  {
    name: "job_description",
    label: "Job description",
    placeholder: "What you do",
    multiline: true,
  },
  {
    name: "location",
    label: "Location",
    placeholder: "City, country",
  },
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
  const updateField = (field: ProfileField, value: string) => {
    onChange({
      ...values,
      [field]: value,
    })
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <label
          key={field.name}
          className={field.multiline ? "sm:col-span-2" : undefined}
        >
          <span className="field-label">
            {field.label}
          </span>
          {field.multiline ? (
            <textarea
              value={values[field.name]}
              onChange={(event) => updateField(field.name, event.target.value)}
              placeholder={field.placeholder}
              disabled={disabled}
              rows={field.name === "bio" ? 3 : 4}
              className="form-field"
            />
          ) : (
            <input
              type={field.name === "profile_picture" ? "url" : "text"}
              value={values[field.name]}
              onChange={(event) => updateField(field.name, event.target.value)}
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
