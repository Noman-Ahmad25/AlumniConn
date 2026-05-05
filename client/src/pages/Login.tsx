import { useState, useEffect, type ChangeEvent, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { loginUser } from "../api/auth"
import { getColleges, type College } from "../api/college"
import { getApiErrorMessage } from "../utils/error"
import { getCurrentUserRoleFromToken, getRoleHomePath, setAuthToken } from "../utils/auth"

interface LoginForm {
  email: string
  password: string
  college_id: string
}

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState<LoginForm>({
        email: "",
        password: "",
        college_id: "",
    }); 
    const [colleges, setColleges] = useState<College[]>([])
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

  useEffect(() => {
        const fetchColleges = async () => {
            try {
                const response = await getColleges()
                setColleges(response)
            } catch (error) {
                console.error('Error fetching colleges:', error)
            }
        }

        fetchColleges()
    }, [])

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setForm({
        ...form,
        [name]: value
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await loginUser({
              ...form,
              college_id: Number(form.college_id),
            });
            setAuthToken(response.access_token);
            navigate(getRoleHomePath(getCurrentUserRoleFromToken()));
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
          <div className="brand-mark mx-auto mb-4" aria-hidden="true">
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 8.5 9-4 9 4-9 4-9-4Z" />
              <path d="M7 11v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V11" />
              <path d="M21 8.5v5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-950">Welcome back</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to continue your campus network.</p>
        </div>

        {error && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-medium text-rose-700">{error}</p>
        )}

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
          <span className="field-label">College</span>
          <select
            name="college_id"
            value={form.college_id}
            onChange={handleChange}
            className="form-field"
            required
          >
            <option value="">Select college</option>
            {colleges.map((college) => (
              <option key={college.id} value={college.id}>
                {college.name}
              </option>
            ))}
          </select>
        </label>

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
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </p>

        <button
          type="button"
          className="w-full text-center text-sm font-bold text-blue-700 transition-colors hover:text-blue-800"
          onClick={() => navigate("/request-college")}
        >
          Request college onboarding
        </button>
      </form>
    </div>
  )
}
