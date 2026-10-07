import { useState, type ChangeEvent, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { loginSuperAdmin } from "../../auth/api/auth"
import { getApiErrorMessage } from "../../../utils/error"
import { setAuthToken } from "../../auth/utils/auth"
interface SuperAdminLoginForm {
  username_or_email: string
  password: string
}

export default function SuperAdminLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState<SuperAdminLoginForm>({
    username_or_email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await loginSuperAdmin(form)
      setAuthToken(response.access_token)
      navigate("/super-admin/dashboard")
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Invalid super admin credentials"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <form onSubmit={handleSubmit} className="auth-card px-7 py-7 space-y-5">
        <div className="text-center">
          <div className="brand-mark mx-auto mb-4" aria-hidden="true">
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 8.5 9-4 9 4-9 4-9-4Z" />
              <path d="M7 11v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V11" />
              <path d="M21 8.5v5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-950">Super admin login</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Sign in without selecting a college.</p>
        </div>

        {error && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-medium text-rose-700">{error}</p>
        )}

        <label>
          <span className="field-label">Email or Username</span>
          <input
            type="text"
            name="username_or_email"
            placeholder="superadmin or admin@example.com"
            value={form.username_or_email}
            onChange={handleChange}
            className="form-field"
            required
          />
        </label>

        <label>
          <span className="field-label">Password</span>
          <input
            type="password"
            name="password"
            placeholder="Your password"
            value={form.password}
            onChange={handleChange}
            className="form-field"
            required
          />
        </label>

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="pt-2 text-center border-t border-slate-100">
          <button
            type="button"
            className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
            onClick={() => navigate("/#demo")}
          >
            Explore the live demo &rarr;
          </button>
        </div>
      </form>
    </div>
  )
}
