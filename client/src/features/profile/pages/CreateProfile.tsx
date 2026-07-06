import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { updateProfile } from "../api/profile"
import ProfileForm from "../components/ProfileForm"
import {
  formToProfilePayload,
  profileToForm,
  type ProfileFormValues,
} from "../components/profileFormUtils"
import { getApiErrorMessage } from "../../../utils/error"

export default function CreateProfile() {
  const navigate = useNavigate()
  const [form, setForm] = useState<ProfileFormValues>(profileToForm())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await updateProfile(formToProfilePayload(form))
      navigate("/profile")
    } catch (err: unknown) {
      console.error("Error creating profile:", err)
      setError(getApiErrorMessage(err, "Failed to save profile. Please try again."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card auth-card-wide">
          <div className="px-7 py-8 text-center">
            <div className="brand-mark mx-auto mb-4" aria-hidden="true">
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 8.5 9-4 9 4-9 4-9-4Z" />
                <path d="M7 11v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V11" />
                <path d="M21 8.5v5" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-950">Complete your profile</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">Add the details people should see when they visit your profile.</p>
          </div>

          <form onSubmit={handleSubmit} className="border-t border-slate-100 px-7 py-6 space-y-5">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                <span>{error}</span>
              </div>
            )}

            <ProfileForm values={form} onChange={setForm} disabled={loading} />

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Creating profile...
                </span>
              ) : (
                "Save Profile"
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/feed")}
              disabled={loading}
              className="w-full rounded-lg py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
            >
              Skip for now
            </button>
          </form>
      </div>
    </div>
  )
}
