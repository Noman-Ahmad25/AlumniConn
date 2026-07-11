import { useState, type ChangeEvent, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { registerUser } from "../api/auth"
import { getApiErrorMessage } from "../../../utils/error"
import { useTenant } from "../../../providers/TenantProvider"

interface RegisterForm {
  username: string
  email: string
  password: string
  role: "student" | "alumni"
}

export default function Register() {
    const navigate = useNavigate();
    const { tenant } = useTenant();
    const [form, setForm] = useState<RegisterForm>({
        username: "",
        email: "",
        password: "",
        role: "student",
    }); 
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!tenant) {
            setError("Invalid tenant");
            setLoading(false);
            return;
        }

        try {
            await registerUser({
              ...form,
              college_slug: tenant.slug,
            });
            // Send user to verify email page
            navigate(`/c/${tenant.slug}/verify-email-pending`);
        } catch (error: unknown) {
            setError(getApiErrorMessage(error, "Registration failed"));
        } finally {
            setLoading(false);
        }
    }

  return (
    <div className="auth-shell">
      <form
        onSubmit={handleSubmit}
        className="auth-card px-7 py-7 space-y-5"
      >
        <div className="text-center">
          {tenant?.branding?.logo_url ? (
             <img src={tenant.branding.logo_url} alt={`${tenant.name} Logo`} className="mx-auto h-12 w-auto mb-4" />
          ) : (
            <div className="brand-mark mx-auto mb-4" aria-hidden="true">
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 8.5 9-4 9 4-9-4Z" />
                <path d="M7 11v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V11" />
                <path d="M21 8.5v5" />
              </svg>
            </div>
          )}
          <h1 className="text-2xl font-bold text-slate-950">Join {tenant?.name || "Campus Network"}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Create an account to connect with alumni and students.</p>
        </div>

        {error && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-medium text-rose-700">{error}</p>
        )}

        <label>
          <span className="field-label">Username</span>
          <input
            type="text"
            name="username"
            placeholder="johndoe123"
            value={form.username}
            onChange={handleChange}
            className="form-field"
            required
          />
        </label>

        <label>
          <span className="field-label">Email</span>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
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

        <label>
          <span className="field-label">Role</span>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="form-field"
            required
          >
            <option value="student">Student</option>
            <option value="alumni">Alumni</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <button
            type="button"
            className="font-bold text-blue-700 transition-colors hover:text-blue-800"
            onClick={() => navigate(`/c/${tenant?.slug}/login`)}
          >
            Login
          </button>
        </p>
      </form>
    </div>
  )
}
