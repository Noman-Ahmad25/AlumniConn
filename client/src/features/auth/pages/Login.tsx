import { useState, type ChangeEvent, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { loginUser } from "../api/auth"
import { getApiErrorMessage } from "../../../utils/error"
import { getCurrentUserRoleFromToken, getRoleHomePath, setAuthToken } from "../utils/auth"
import { useTenant } from "../../../providers/TenantProvider"

interface LoginForm {
  username_or_email: string
  password: string
}

export default function Login() {
    const navigate = useNavigate();
    const { tenant } = useTenant();
    const [form, setForm] = useState<LoginForm>({
        username_or_email: "",
        password: "",
    }); 
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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
            const response = await loginUser({
              ...form,
              college_slug: tenant.slug,
            });
            setAuthToken(response.access_token);
            navigate(`/c/${tenant.slug}` + getRoleHomePath(getCurrentUserRoleFromToken()));
        } catch (error: unknown) {
            const message = getApiErrorMessage(error, "Invalid email or password");
            // Handle specific college approval error
            if (message === "College not approved") {
                setError("Your college is pending approval. Please try again later.");
            } else {
                setError(message);
            }
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
          <h1 className="text-2xl font-bold text-slate-950">Welcome to {tenant?.name || "Campus Network"}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to continue.</p>
        </div>

        {error && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-medium text-rose-700">{error}</p>
        )}

        <label>
          <span className="field-label">Email or Username</span>
          <input
            type="text"
            name="username_or_email"
            placeholder="you@example.com"
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

        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
            onClick={() => navigate(`/c/${tenant?.slug}/forgot-password`)}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm text-slate-600">
          Do not have an account?{" "}
          <button
            type="button"
            className="font-bold text-blue-700 transition-colors hover:text-blue-800"
            onClick={() => navigate(`/c/${tenant?.slug}/register`)}
          >
            Register
          </button>
        </p>
      </form>
    </div>
  )
}
